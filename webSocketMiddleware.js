/**
 * webSocket 中间件
 */
import { compose } from 'redux'
import partial from 'lodash/fp/partial'
import WebSocketClient from '@/utils/webSocketClient'
import { logger } from '@/utils/logger'
import {
  wsOpen,
  wsClosed,
  wsMessage,
} from '../reducers/wsSlice'
import wsConfig, {bnSwapWsKey, bnOptionWsKey, drWsKey, avenirWeb3WsKey} from '@/utils/wsConfig'

const createWebSocketMiddleware = () => {
  let webSocketClient = {}
  // 像deribit和自己后端的ws 传过去的id 需要很小才能发送成功
  let id = 0
  /**
   * 连接webSocket
   * @param dispatch
   * @param wsProtocolDomain ws 完整链接（包括域名协议）
   * @param wsKey 不同的ws url的标识
   */
  const connectWebSocket = ({ dispatch, wsKey, wsUrl }) => {
    const dispatchAction = partial(compose, [dispatch])
    // checkConnectTime: 设置多久尝试一次重连操作
    webSocketClient[wsKey] = new WebSocketClient(wsKey, wsKey === avenirWeb3WsKey ? { checkConnectTime: 1000 } : {})
    webSocketClient[wsKey].connect(wsUrl)
    webSocketClient[wsKey].setOnClose((event, isConnected) => dispatchAction(wsClosed)({wsKey, isConnected}))
    webSocketClient[wsKey].setOnConnect((event, isConnected) => {
      dispatchAction(wsOpen)({wsKey, isConnected})
    })
    webSocketClient[wsKey].register((data) => {
      dispatchAction(wsMessage)({data, wsKey})
    })
    webSocketClient[wsKey].setNeedReconnect(true)
  }

  /**
   * 关闭webSocket
   * @param wsKeyArray 交割、永续ws标识数组
   */
  const closeWebSocket = (wsKeyArray) => {
    wsKeyArray && wsKeyArray.forEach((wsKey) => {
      if (webSocketClient[wsKey]) {
        // 主动关掉的ws，不需要重连
        webSocketClient[wsKey].setNeedReconnect(false)
        // 断开连接
        webSocketClient[wsKey].disconnect()
        webSocketClient[wsKey] = null
      }
    })
  }

  const nextId = () => {
    return ++id
  }

  return store => next => action => {
    if (action) {
      switch (action.type) {
        case 'wsSlice/connectWs': {
          const wsKeyArray = action && action.payload
          wsKeyArray && wsKeyArray.forEach((wsKey) => {
            if (!webSocketClient[wsKey] || !webSocketClient[wsKey].isConnected()) {
              const wsUrl = wsConfig[wsKey]
              store['wsKey'] = wsKey
              store['wsUrl'] = wsUrl
              // 连接ws之前先断连
              closeWebSocket([wsKey])
              // 连接ws
              connectWebSocket(store)
            }
          })
          next(action)
          break
        }
        case 'wsSlice/disconnectWs': {
          const wsKeyArray = action && action.payload
          closeWebSocket(wsKeyArray)
          next(action)
          break
        }
        // ws request 请求
        case 'wsSlice/requestWs': {
          const payload = action && action.payload
          const wsKey =  payload && payload.wsKey
          const idPrefix = payload?.idPrefix ? `${payload.idPrefix}_` : '';
          if (webSocketClient[wsKey]) {
            const message = {
              ...(wsKey === avenirWeb3WsKey ? (payload.params || {}) : {}),
              method: payload.method,
              params: payload.params,
              jsonrpc: "2.0",
              id: wsKey === avenirWeb3WsKey ? null : idPrefix + nextId(),
            }
            webSocketClient[wsKey].sendData(message)
          } else {
            logger.e('Request: web socket is closed, ignoring. Trigger a WEB_SOCKET_CONNECT first')
          }
          next(action) 
          break
        }
        // ws sub 订阅
        case 'wsSlice/subWs': {
          const payload = action && action.payload
          const wsKey = payload && payload.wsKey || ''
          if (webSocketClient[wsKey]) {
            const subChannels = payload?.subChannels || []
            if (!subChannels.length) {
              logger.e(`${wsKey} sub parameters cannot be an empty array`)
              return
            }
            let message = {id: nextId()}
            if ([bnSwapWsKey, bnOptionWsKey].includes(wsKey)) {
              // 币安 订阅
              message = Object.assign({}, {
                method: "SUBSCRIBE",
                params: subChannels
              }, message)
            } else if (wsKey === drWsKey) {
              // deribit 订阅
              const type = payload.type
              message = Object.assign({}, {
                method: `${type}/subscribe`,
                params: {
                  channels: subChannels,
                },
                jsonrpc: "2.0",
              }, message)
            } else if (wsKey === avenirWeb3WsKey) {
              const { token } = action.payload
              // 内部后台 订阅
              message = Object.assign({}, {
                method: "subscribe",
                channels: subChannels,
                token,
              }, message)
            }
            webSocketClient[wsKey].sendData(message)
          } else {
            logger.e('Subscribe: web socket is closed, ignoring. Trigger a WEB_SOCKET_CONNECT first')
          }
          next(action)
          break
        }
        // ws unsub 请求
        case 'wsSlice/unsubWs': {
          const payload = action && action.payload
          const wsKey = payload?.wsKey || ''
          if (webSocketClient[wsKey]) {
            const subChannels = payload?.subChannels || []
            let message = {id: nextId()}
            if ([bnSwapWsKey, bnOptionWsKey].includes(wsKey)) {
              message = Object.assign({}, {
                method: "UNSUBSCRIBE",
                params: subChannels
              }, message)
            } else if (wsKey === drWsKey) {
              // deribit 订阅
              const type = payload.type
              message = Object.assign({}, {
                method: `${type}/unsubscribe`,
                params: {
                  channels: subChannels,
                },
                jsonrpc: "2.0",
              }, message)
            } else if (wsKey === avenirWeb3WsKey) {
              message = Object.assign({}, {
                method: "unsubscribe",
                channels: subChannels
              }, message)
            }
            webSocketClient[wsKey].sendData(message)
          } else {
            logger.e('Unsubscribe: web socket is closed, ignoring. Trigger a WEB_SOCKET_CONNECT first')
          }
          next(action)
          break
        }
        default: next(action)
      }
    }
  }
}

export default createWebSocketMiddleware()
