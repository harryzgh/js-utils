/**
 * 大文件上传
 */
function submitUpload() {
  var chunkSize = 210241024 // 2M
  var file = document.getElementById("f1").files[0]
  var chunks = [], // 保存分片数据
    token = +new Date(), // 时间戳
    name = file.name,
    chunkCount = 0,
    sendChunkCount = 0

  if (file.size > chunkSize) {
    var start = 0,
      end = 0
    while (true) {
      end += chunkSize
      var blob = file.slice(start, end)
      start += chunkSize
      // 截取的数据为空则结束
      if (!blob.size) {
        break
      }
      chunks.push(blob) // 保存分片数据
    }
  } else {
    chunks.push(file.slice(0))
  }
  // 分片的个数
  // 没有做并发限制，较大文件可能导致并发过多， tcp链接被占光，需要做下并发控制，比如只有4个请求在发送
  chunkCount = chunks.length
  var uploadedInfo = getUploadedFromStorage()
  for (var i = 0; i < chunkCount; i++) {
    console.log("index", i, uploadedInfo[i] ? "" : " ")
    if (uploadedInfo[i]) {
      //
      sendChunkCount = i + 1 //
      continue // 如果已上传则跳过
    }
    // 构造FormData对象
    var fd = new FormData()
    fd.append("token", token)
    fd.append("f1", chunks[i])
    fd.append("index", i)
    xhrSend(fd, function () {
      setUploadedToStorage(index)
      sendChunkCount += 1 // 将成功信息保存在本地
      if (sendChunkCount === chunkCount) {
        console.log("上传完成，发送合并请求")
        var formD = new FormData()
        formD.append("type", "merge")
        formD.append("token", token)
        formD.append("chunkCount", chunkCount)
        formD.append("filename", name)
        xhrSend(formD)
      }
    })
  }
}

function xhrSend(fd, cb) {
  var xhr = new XMLHttpRequest() //
  xhr.open("POST", "http://localhost:8100/", true)
  xhr.onreadystatechange = function () {
    console.log("state change", xhr.readyState)
    if (xhr.readyState == 4) {
      console.log(xhr.responseText)
      cb && cb()
    }
  }
  xhr.send(fd) //
}

function getUploadedFromStorage() {
  return JSON.parse(localforage.getItem(saveChunkKey) || "{}")
}
function setUploadedToStorage(index) {
  var obj = getUploadedFromStorage()
  obj[index] = true
  localforage.setItem(saveChunkKey, JSON.stringify(obj))
}

// 绑定提交事件
document.getElementById("btn-submit").addEventListener("click", submitUpload)
