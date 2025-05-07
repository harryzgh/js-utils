//
const Koa = require("koa")
const app = new Koa()
app.use((ctx) => {
  var body = ctx.request.body
  // 上传文件数组
  var files = ctx.request.files ? ctx.request.files.f1 : []
  // 上传文件数组
  var result = []
  // 文件标识
  var fileToken = ctx.request.body.token
  // 文件顺序
  var fileIndex = ctx.request.body.index
  // 单文件兼容处理
  if (files && !Array.isArray(files)) {
    files = [files]
  }
  files &&
    files.forEach((item) => {
      var path = item.path
      // 源文件名称
      var fname = item.name //
      var nextPath =
        path.slice(0, path.lastIndexOf("/") + 1) + fileIndex + fileToken
      if (item.size > 0 && path) {
        var extArr = fname.split(".")
        // 文件扩展名
        var ext = extArr[extArr.length - 1] //
        var nextPath = path + "." + ext //
        // 重命名文件
        fs.renameSync(path, nextPath)
        result.push(uploadHost + nextPath.slice(nextPath.lastIndexOf("/") + 1))
      }
    })
  // 合并分片文件
  if (body.type === "merge") {
    var filename = body.filename,
      chunkCount = body.chunkCount,
      folder = path.resolve(__dirname, "../static/uploads") + "/"
    var writeStream = fs.createWriteStream(`${folder}${filename}`)
    var cindex = 0
    // 合并文件
    function fnMergeFile() {
      var fname = `${folder}${cindex}-${fileToken}`
      var readStream = fs.createReadStream(fname)
      readStream.pipe(writeStream, { end: false })
      readStream.on("end", function () {
        fs.unlink(fname, function (err) {
          if (err) {
            throw err
          }
        })
        if (cindex + 1 < chunkCount) {
          cindex += 1
          fnMergeFile()
        }
      })
    }
    fnMergeFile()
    ctx.body = "merge ok 200"
  }
})
