import configCom from './configCom'
import pako from 'pako'
import {logger} from './logger'
// const webSocketReconnectTimeInterval = configCom.webSocketReconnectTimeInterval || 20000
function WebSocketClient (wsKey, { checkConnectTime } = {}) {
  this.webSocket = null
  this.connected = false
  // 是否需要重连, 默认需要
  this.isNeedReconnect = true
  // 重连时间间隔
  this.reconnectTimeInterval = -1
  // 已重连次数
  this.hasReconnectCount = 0
  // 连接关闭时的回调
  this.onClose = null
  // 连接建立后的回调
  this.onConnect = null
  // 连接出错的回调
  this.onError = null
  // 推送消息的外部回调函数 onMsgReceive(topic,data)
  this.onMsgReceive = null
  this.wsKey = wsKey
  // 超过一定时间没响应，则重连
  this.checkConnectTime = checkConnectTime || 3000
}

/**
 * 连接
 * @returns {boolean}
 */
WebSocketClient.prototype.connect = function (wsProtocolDomain) {
  if (!configCom || !wsProtocolDomain) {
    throw new Error('no configCom found.')
  }
  try {
    if ('WebSocket' in window) {
      this.webSocket = new WebSocket(wsProtocolDomain)
    } else if ('MozWebSocket' in window) {
      /* eslint-disable */
      this.webSocket = new MozWebSocket(wsProtocolDomain)
    } else {
      logger.w('browser not support web socket, please use update version!')
      return false
    }
  } catch (e) {
    return false
  }

  var self = this
  /**
   * web socket 打开
   * @param event 回调参数
   */
  this.webSocket.onopen = function (event) {
    self.connected = true
    // if (self.hasReconnectCount > 0) {
    //   logger.i('web socket reconnect success!')
    // } else {
    //   logger.i('web socket connect success!')
    // }
    self.hasReconnectCount = 0
    if (self.onConnect != null) {
      self.onConnect(event)
    }
  }

  /**
   * web socket 错误
   * @param event 回调参数
   */
  this.webSocket.onerror = function (event) {
    if (self.hasReconnectCount > 0) {
      logger.e(`${self.wsKey} web socket reconnect error(${self.hasReconnectCount}/${configCom.webSocketMaxReconnectCount}): ` + JSON.stringify(event))
    } else {
      logger.e(`${self.wsKey} web socket connect error: ${JSON.stringify(event)}`)
    }
    if (self.onError != null) {
      self.onError(event)
    }
    self.disconnect(event)
    // 重连
    // if ((self.isNeedReconnect === null && configCom.isWebSocketNeedReconnect) ||
    //   self.isNeedReconnect) {
    //   if (self.hasReconnectCount < configCom.webSocketMaxReconnectCount) {
    //     let reconnectTimeInterval = this.reconnectTimeInterval ||
    //       webSocketReconnectTimeInterval
    //     setTimeout(function () {
    //       self.hasReconnectCount++
    //       logger.i('web socket start reconnect...')
    //       self.connect(wsProtocolDomain)
    //     }, reconnectTimeInterval)
    //   }
    // }
  }

  /**
   * web socket 关闭
   * @param event 回调参数
   */
  this.webSocket.onclose = function (event) {
    //------------- 关掉当前ws
    if (self.onClose != null) {
      logger.i(`${self.wsKey} web socket is closed!`)
      self.onClose(event)
    }
    //------------- 断线重连逻辑
    const reConnect = function () {
      clearInterval(self.checkConnectTimer)
      self.disconnect(event)
      // 重连
      setTimeout(function () {
        logger.i(`${self.wsKey} web socket start reconnect...`)
        self.connect(wsProtocolDomain)
      }, self.checkConnectTime)
    }
    // reConnect是断线重连的逻辑，若不需要断线重连，不执行reConnect就可以
    self.isNeedReconnect && reConnect()
  }

  // 前端websock心跳重连，保证掉线后再次连接时间可控（浏览器自身重连chrome要等15秒没有响应才会判断为ws断线）
  this.webSocket.checkConnect = function () {
    // 修复断线重连的时候，防止在连接中和关闭中进行心跳检测
    // 5秒是判断在连接中，有5秒未收到ws信息，就判断为断线，前端进行嗅探处理，主动让浏览器判断出是否断线
    // 因为交易页ws推送比较频繁，5秒的ws推送延迟，基本可认定为断线（即便没断线，心跳推送在连接中也无影响）
    // chrome浏览器本身15秒判定是因为ws推送时浏览器处于被动接受信息状态，而5秒心跳属于主动嗅探
    if (Date.now() - self.lastMessageTime > 5000 &&
        self.webSocket &&
        self.webSocket.readyState !== 0 &&
        self.webSocket.readyState !== 2) {
      // 前端客户端浏览器主动嗅探后端ws是否已断开
      // 这一步的执行能让浏览器识别ws已经断开，然后自动执行onclose事件。
      self.webSocket.send('heartBeat')
    }
  }

  // 技术背景：1、浏览器不能主动识别当前ws连接已断(小概率，但也会出现)  2、浏览器识别当前ws已断太慢（大概断开后15左右才能识别到）
  // 需求：弱网情况下，ws容易断线，要求断线后前端能很快知道并进行重连，以避免用户以为ws服务挂了，提高用户的体验。
  self.checkConnectTimer = setInterval(this.webSocket.checkConnect, self.checkConnectTime)

  /**
   * web socket 消息
   * @param event 回调参数
   */
  this.webSocket.onmessage = function (event) {
    self.lastMessageTime = Date.now()
    try {
      let msg = JSON.parse(event.data)
      if (msg.ping) {
        self.touch(msg.ping)
      } else {
        if (process.env.NODE_ENV === 'development') {
          // console.log(msg)
        }
        self.onMsgReceive(msg)
      }
    } catch (err) {
      if (typeof event.data !== 'string') {
        try {
          let reader = new FileReader()
          reader.readAsArrayBuffer(event.data)
          reader.onload = () => {
            let text = pako.inflate(reader.result, {to: 'string'})
            let msg = JSON.parse(text)
            if (msg.ping) {
              self.touch(msg.ping)
            } else {
              if (process.env.NODE_ENV === 'development') {
                // console.log(msg)
              }
              self.onMsgReceive(msg)
            }
          }
        } catch (e) {
          logger.e(`${self.wsKey} ${e} : ${event.data}`)
        }
      }
    }
  }
}

/**
 * 设置关闭回调方法
 * @param func 关闭回调方法
 */
WebSocketClient.prototype.setOnClose = function (func) {
  if (func) {
    this.onClose = func
  }
}

/**
 * 设置连接成功回调方法
 * @param func 连接成功回调方法
 */
WebSocketClient.prototype.setOnConnect = function (func) {
  if (func) {
    this.onConnect = func
  }
}

/**
 * 设置连接错误回调方法
 * @param func 连接错误回调方法
 */
WebSocketClient.prototype.setOnError = function (func) {
  if (func) {
    this.onError = func
  }
}

/**
 * 发送请求
 * @param data 数据
 */
WebSocketClient.prototype.send = function (data) {
  this.webSocket && this.webSocket.send(JSON.stringify(data))
}

/**
 * 消息接收回调
 * @param callback 消息接收回调方法
 */
WebSocketClient.prototype.register = function (callback) {
  this.onMsgReceive = callback
}

/**
 * 设置是否需要重连
 * 如果调用此方法且参数值不为null和undefined config配置将会无效
 * @param isNeedReconnect 是否需要重连
 */
WebSocketClient.prototype.setNeedReconnect = function (isNeedReconnect) {
  if (isNeedReconnect !== null && isNeedReconnect !== undefined) {
    this.isNeedReconnect = isNeedReconnect
  }
}

/**
 * 设置重连时间间隔
 * 如果调用此方法且参数值是大于0的整数 config配置将会无效
 * @param reconnectTimeInterval 时间间隔
 */
WebSocketClient.prototype.setReconnectTimeInterval = function (reconnectTimeInterval) {
  let reg = /^\d+$/
  if (reg.test(reconnectTimeInterval)) {
    this.reconnectTimeInterval = reconnectTimeInterval
  }
}

/**
 * 订阅
 * @param data 发送数据
 */
WebSocketClient.prototype.sendData = function (data) {
  if (this.connected) {
    this.webSocket && this.webSocket.send(JSON.stringify(data))
  }
}

/**
 * 断开连接
 */
WebSocketClient.prototype.disconnect = function () {
  if (this.webSocket != null) {
    this.webSocket.close(1000, '关闭连接')
    this.webSocket = null
    // this.onClose = null
    // this.onConnect = null
    // this.onError = null
    this.connected = false
  }
}

/**
 * 判断是否连接
 * @returns {boolean|*}
 */
WebSocketClient.prototype.isConnected = function () {
  return this.connected
}

/**
 * 保持连接 心跳
 * @param timeStamp 时间戳
 */
WebSocketClient.prototype.touch = function (timeStamp) {
  if (this.connected) {
    let data = {pong: timeStamp}
    this.webSocket && this.webSocket.send(JSON.stringify(data))
  }
}

export default WebSocketClient
