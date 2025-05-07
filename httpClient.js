import configCom from "./configCom"
import axios from "axios"
import { parse, stringify } from "json-bigint"
import { StoreUtil } from "./storeUtil"
import {
  getApiContractProtocolDomain,
  getBrokerProtocolDomain,
  getMulanAssetProtocolDomain,
  getHuobiGlobalProtocolDomain,
  getFinancialProtocolDomain,
} from "./domain"
import { intl, getCurrentLanguage } from "../intl/intl"
import Modal from "../pages/components/modal/modalIndex"
import { logger } from "./logger"
import { restfulServer } from "./server.js"
import { getProjectType, getItemByProject } from "./commonFunction"
var httpClient = {}
// 合约请求协议和域名
const apiContractProtocolDomain = getApiContractProtocolDomain()
// global 请求协议和域名
const apiBrokerProtocolDomain = getBrokerProtocolDomain()
// global finacial 请求协议和域名
const apiFinancialProtocolDomain = getFinancialProtocolDomain()

// global 资金划转等的请求协议和域名
const apiMulanAssetProtocolDomain = getMulanAssetProtocolDomain()

// uc请求协议和域名
// const ucProtocolDomain = getUcProtocolDomain()

// global api请求协议和域名
const apiHuobiGlobalProtocalDomain = getHuobiGlobalProtocolDomain()

// 合约token常量
const HB_CONTRACT_TOKEN = "hbsession"

// pro token常量
export const HB_PRO_TOKEN = "HB-PRO-TOKEN"

// hadax token常量
export const HB_HADAX_TOKEN = "HB-HADAXV2-TOKEN"

// 短信、邮件头部处理参数
export const HUOBI_BUSINESS = "HUOBI-BUSINESS"

// 服务接口前缀 ------------------------------------------------------
// 交割：Order服务接口前缀
const contractOrderServerPrefix = `${restfulServer.contractOrderServerPrefix}/x/v1`
// 中台服务接口前缀
const centerOrderServerPrefix = `${restfulServer.centerOrderServerPrefix}/x/v1`
// 交割：旧行情服务接口前缀
const contractMarketServerPrefix = restfulServer.contractMarketServerPrefix
// 交割：新行情服务接口前缀
const contractIndexMarketServerPrefix =
  restfulServer.contractIndexMarketServerPrefix
// 反向永续：Order服务接口前缀
const swapOrderServerPrefix = `${restfulServer.swapOrderServerPrefix}/x/v1`
// 反向永续：行情服务接口前缀
const swapMarketServerPrefix = restfulServer.swapMarketServerPrefix
// 正向永续：Order服务接口前缀
const linearSwapOrderServerPrefix = `${restfulServer.linearSwapOrderServerPrefix}/x/v1`
// 正向永续：行情服务接口前缀
const linearSwapMarketServerPrefix = restfulServer.linearSwapMarketServerPrefix
// 期权：Order服务接口前缀
const optionOrderServerPrefix = `${restfulServer.optionOrderServerPrefix}/x/v1`
// 各业务线服务接口前缀数组----
// 交割合约
const contractServerPrefixArray = [
  contractOrderServerPrefix,
  contractMarketServerPrefix,
  contractIndexMarketServerPrefix,
]
//
const swapServerPrefixArray = [swapOrderServerPrefix, swapMarketServerPrefix]
//
const linearSwapServerPrefixArray = [
  linearSwapOrderServerPrefix,
  linearSwapMarketServerPrefix,
]
//
const optionServerPrefixArray = [optionOrderServerPrefix]

// 后端接口服务器名称------------------------------------------------------
// 交割order服务器
export const contractOrderServer = "CONTRACT-ORDER-SERVER"
// 中台服务器
export const centerOrderServer = "CENTER-ORDER-SERVER"
// 交割行情服务器(旧)
export const contractMarketServer = "CONTRACT-MARKET-SERVER"
// 交割行情服务器(新)
export const contractIndexMarketServer = "CONTRACT-INDEX-MARKET-SERVER"
// 永续order服务器
export const swapOrderServer = "SWAP-ORDER-SERVER"
// 永续行情服务器
export const swapMarketServer = "SWAP-MARKET-SERVER"
// 正向永续order服务器
export const linearSwapOrderServer = "LINEAR-SWAP-ORDER-SERVER"
// 正向永续永续行情服务器
export const linearSwapMarketServer = "LINEAR-SWAP-MARKET-SERVER"
// 期权order服务器
export const optionOrderServer = "OPTION-ORDER-SERVER"

// 交割默认服务器名称（交割Order服务器）-----------------------------------------
const defaultContractServerName = contractOrderServer
// 中台服务器
const defaultCenterServerName = centerOrderServer
// 反向永续默认服务器名称（永续Order服务器）
const defaultSwapServerName = swapOrderServer
// 正向永续默认服务器名称（正向永续Order服务器）
const defaultLinearSwapServerName = linearSwapOrderServer
// 期权默认服务器名称（期权Order服务器）
const defaultOptionServerName = optionOrderServer

/**
 * 服务器前缀map
 * 'centerOrderServer': 中台服务器,
 * 'contractOrderServer': 交割order服务器,
 * 'contractMarketServer':  交割行情服务器,
 * 'swapOrderServer':  永续order服务器,
 * 'swapMarketServer':  永续行情服务器,
 */
const serverPrefixMap = {
  [centerOrderServer]: centerOrderServerPrefix,
  [contractOrderServer]: contractOrderServerPrefix,
  [contractMarketServer]: contractMarketServerPrefix,
  [contractIndexMarketServer]: contractIndexMarketServerPrefix,
  [swapOrderServer]: swapOrderServerPrefix,
  [swapMarketServer]: swapMarketServerPrefix,
  [linearSwapOrderServer]: linearSwapOrderServerPrefix,
  [linearSwapMarketServer]: linearSwapMarketServerPrefix,
  [optionOrderServer]: optionOrderServerPrefix,
}

/**
 * 获取api请求的来源
 */
function getApiSource() {
  const userAgent = navigator.userAgent
  if (/macintosh|mac os x/i.test(userAgent) && /huobi/i.test(userAgent)) {
    return "mac-web" // mac客户端
  } else if (/windows/i.test(userAgent) && /huobi/i.test(userAgent)) {
    return "windows-web" // windows客户端
  } else {
    return "web"
  }
}

/**
 * 获取不同业务的维护中状态
 * @param prefixArray
 * @returns {*}
 */
function getProjectMaintainStatus(url, serverPrefixArray) {
  return serverPrefixArray.some((item) => {
    return url.includes(item)
  })
}
/**
 * 成功处理
 * @param res
 * @param resolve
 * @param reject
 * @param url
 */
let pageRefreshTimes = Number(
  StoreUtil.getStorage(StoreUtil.PAGE_REFRESH_TIMES)
) // 页面刷新次数
function successHandler(res, resolve, reject, url) {
  let language = getCurrentLanguage()
  let error = {}
  if (res) {
    // http请求 错误
    if (res.status !== 200) {
      error.errorCode = res.statusCode
      error.errorMsg = res.statusText
      reject(error)
      return
    }
    // http请求 正确
    let data = res.data
    // 1、系统维护中，自动跳维护页（1、某业务的页面 2、该页面调用该业务的接口返回了维护中状态  满足两个条件才跳转）
    if (data.status === "maintain") {
      const projectType = getProjectType()
      const isCurrentPageShouldGotoMaintainPage =
        getItemByProject(
          projectType,
          getProjectMaintainStatus(url, contractServerPrefixArray),
          getProjectMaintainStatus(url, swapServerPrefixArray),
          getProjectMaintainStatus(url, linearSwapServerPrefixArray),
          getProjectMaintainStatus(url, optionServerPrefixArray)
        ) || false
      isCurrentPageShouldGotoMaintainPage &&
        window.open(window.location.origin + "/maintain", "_self")
    }
    // 2、系统正常
    if (!data.size) {
      if (
        data.code === 200 || // uc
        data.code === 10070 || // uc登录接口返回10070代表需要二次验证
        // 普通接口
        data.status === "ok" ||
        data.status === 200 ||
        data.success === true ||
        typeof res.data === "number" // getDate
      ) {
        // 获取合约 token 存入 localstorage
        let contractToken = res.headers[HB_CONTRACT_TOKEN]
        if (contractToken && url.match("center_login")) {
          StoreUtil.setStorage(StoreUtil.CONTRACT_SESSION, contractToken)
          StoreUtil.setStorage(StoreUtil.PAGE_REFRESH_TIMES, 0)
          pageRefreshTimes = 0
        }
        resolve(data.data)
      } else {
        error.errorCode =
          data.code || // uc
          data["err_code"] || // 普通接口
          data["err-code"] // pro或者行情等接口
        error.errorMsg = data.message || data["err_msg"] || data["err-msg"]
        if (
          (error.errorCode === 1029 ||
            error.errorCode === 1011 ||
            error.errorCode === 512) &&
          !(
            url.match("/user/get") ||
            url.match("/ticket/get") ||
            url.match("/account/transfer") ||
            url.match("/swap_user_info") ||
            url.match("/contract_user_info") ||
            url.match("/center_user_info")
          )
        ) {
          // session过期页面最多刷新一次, 合约后端需要登录态的接口要判断登录成功才能调用
          if (pageRefreshTimes < 1) {
            pageRefreshTimes = pageRefreshTimes + 1
            StoreUtil.setStorage(StoreUtil.PAGE_REFRESH_TIMES, pageRefreshTimes)
            window.location.reload()
          }
          // auth.noticeAuthenticatedChange()
        }
        // 全局错误提示加上 1032 超出限频的提示
        if (error.errorCode === 1032) {
          Modal.tipWarn(error.errorMsg)
        }
        reject(error)
      }
    } else {
      let reader = new FileReader()
      reader.readAsText(data)
      reader.onload = (e) => {
        try {
          let error = JSON.parse(e.target.result)
          error.errorCode =
            error.code || // uc
            error["err_code"] || // 普通接口
            error["err-code"] // pro或者行情等接口
          error.errorMsg = error.message || error["err_msg"] || error["err-msg"]
          if (
            error.errorCode === 1029 ||
            error.errorCode === 1011 ||
            error.errorCode === 512
          ) {
            // session过期页面最多刷新一次, 合约后端需要登录态的接口要判断登录成功才能调用
            if (pageRefreshTimes < 1) {
              pageRefreshTimes = pageRefreshTimes + 1
              StoreUtil.setStorage(
                StoreUtil.PAGE_REFRESH_TIMES,
                pageRefreshTimes
              )
              window.location.reload()
            }
          }
          reject(error)
        } catch (error) {
          resolve(data)
        }
      }
    }
  } else {
    error.errorCode = -1
    error.errorMsg = intl(language, "net_work_error")
    reject(error)
  }
}

function errorHandler(error, reject) {
  let language = getCurrentLanguage()
  error.errorCode = -1
  error.errorMsg = intl(language, "net_work_error")
  reject(error)
}

/**
 * 获取是否需要用transformResponse处理的接口状态
 */
function getUrlUseTransformResponseType(url) {
  // 前面加x/v1是防止indexOf匹配不精准
  let filterUrlList = [
    "x/v1/swap_product_info",
    "x/v1/contract_product_info",
    "x/v1/linear_swap_product_info",
    "x/v1/swap_contract_info",
    "x/v1/contract_contract_info",
    "x/v1/linear_swap_contract_info",
  ]
  let isNeedFilter = filterUrlList.find((filterUrl) => {
    return url.indexOf(filterUrl) > -1
  })
  let isExport = url.indexOf("_export") > -1
  return !!isNeedFilter || isExport
}

/**
 * 基础请求设置
 * @param {string} requestMethod 请求方法
 * @param {string} url url
 * @param {object} data 数据
 * @param {string} responseType
 * @param {Boolean} allowOrigin 允许跨域
 * @param {object} headers 请求头信息
 * @param {number} timeout 超时时间，默认为没有超时，单位毫秒
 */
function requestCommon(
  requestMethod,
  url,
  data,
  responseType,
  allowOrigin,
  headers = {},
  timeout = 0
) {
  const hbsession = StoreUtil.getStorage(StoreUtil.CONTRACT_SESSION)
  const language = getCurrentLanguage()
  return new Promise((resolve, reject) => {
    let requestConfig = {
      url: url,
      method: requestMethod,
      responseType,
      headers: {
        "Accept-Language": language,
        hbsession: hbsession,
        source: getApiSource(),
        "Cache-Control": "no-cache",
        "Content-Type": "application/json; charset=UTF-8",
        ...headers,
      },
      data,
      timeout,
    }
    // api是否需要跨域
    if (allowOrigin) {
      requestConfig.withCredentials = true
    } else {
      requestConfig.headers["Accept"] = "application/json, text/plain, */*"
      requestConfig.withCredentials = false
    }

    // 请求 pro 接口 跨域解决
    if (
      url.indexOf("/v1/users/login") > -1 ||
      url.indexOf("/hb/api/") > -1 ||
      url.indexOf("/hbg/v1/") > -1 ||
      url.indexOf("/hbg/finance/") > -1 ||
      url.indexOf("/v1/account/accounts") > -1 ||
      url.indexOf("/opt/option/") > -1
    ) {
      delete requestConfig.headers["hbsession"]
      delete requestConfig.headers["source"]
      delete requestConfig.headers["Cache-Control"]
      delete requestConfig.headers["Content-Type"]
    }

    let isNotUseTransformResponse = getUrlUseTransformResponseType(url)
    if (!isNotUseTransformResponse) {
      // 后端返回Long类型的数据超过17位时，本配置会将返回的数据封装成BigNumber类型数据
      requestConfig.transformResponse = [
        (data, headers) => {
          return parse(stringify(parse(data)))
        },
      ]
    }
    axios(requestConfig)
      .then((res) => {
        successHandler(res, resolve, reject, url)
      })
      .catch((error) => {
        errorHandler(error, reject)
      })
  })
}

/**
 * 上传文件请求设置
 * @param requestMethod 请求方法
 * @param url url
 * @param data 数据
 * @param responseType
 * @param allowOrigin 允许跨域
 */
function requestUploadFile(
  requestMethod,
  url,
  data,
  responseType,
  allowOrigin,
  headers = {}
) {
  let session = StoreUtil.getStorage(StoreUtil.CONTRACT_SESSION)
  let language = getCurrentLanguage()
  return new Promise((resolve, reject) => {
    let requestConfig = {
      url: url,
      method: requestMethod,
      responseType,
      headers: {
        "Accept-Language": language,
        hbsession: session,
        source: getApiSource(),
        "Cache-Control": "no-cache",
        "Content-Type": "multipart/form-data;",
        ...headers,
      },
      data,
    }
    if (allowOrigin) {
      requestConfig.withCredentials = true
    } else {
      requestConfig.headers["Accept"] = "application/json, text/plain, */*"
    }
    // 请求 pro 接口 跨域解决
    if (url.indexOf("/hb/api/") > -1) {
      delete requestConfig.headers["hbsession"]
      delete requestConfig.headers["source"]
      delete requestConfig.headers["Cache-Control"]
    }
    axios(requestConfig)
      .then((res) => {
        successHandler(res, resolve, reject, url)
      })
      .catch((error) => {
        errorHandler(error, reject)
      })
  })
}

// ----------------------------------------------------合约内部请求封装-start-------------------------------------------------
/**
 * 获取拼接url
 * @param url
 * @param serverName 后端接口服务器名称
 */
function getFullUrl(url, serverName = null) {
  if (!configCom || !apiContractProtocolDomain) {
    throw new Error("not found request protocol and domain!")
  }

  if (!serverName) {
    if (/^linear_swap/.test(url)) {
      serverName = defaultLinearSwapServerName
    } else if (/^swap/.test(url)) {
      serverName = defaultSwapServerName
    } else if (/^center/.test(url)) {
      serverName = defaultCenterServerName
    } else if (/^option/.test(url)) {
      serverName = defaultOptionServerName
    } else {
      serverName = defaultContractServerName
    }
  }

  const serverPrefix = serverPrefixMap[serverName]
  if (!serverPrefix) {
    logger.e(
      `the error restfulServer name is: ${serverName}, please try to restart the project!`
    )
  }
  if (url) {
    return `${apiContractProtocolDomain}${serverPrefix}/${url}`
  }
  return apiContractProtocolDomain
}

/**
 * get请求
 * @param url
 * @param serverName 后端接口服务器名称
 * @param timeout 超时时间
 */
httpClient.requestGet = function (url, serverName, timeout = 0) {
  let fullUrl = getFullUrl(url, serverName)
  return requestCommon("GET", fullUrl, null, null, false, {}, timeout)
}

/**
 * post请求封装
 * @param url 请求api
 * @param postData 请求数据
 * @param headers 请求头
 * @param serverName 后端接口服务器名称
 * @param timeout 超时时间
 */
httpClient.requestPost = function (
  url,
  postData,
  headers,
  serverName,
  timeout = 0
) {
  let fullUrl = getFullUrl(url, serverName)
  return requestCommon("POST", fullUrl, postData, null, true, headers, timeout)
}

httpClient.requestExportGet = function (url, postData, serverName) {
  let fullUrl = getFullUrl(url, serverName)
  return requestCommon("GET", fullUrl, postData, "blob")
}

httpClient.requestExport = function (url, postData, serverName) {
  let fullUrl = getFullUrl(url, serverName)
  return requestCommon("POST", fullUrl, postData, "blob")
}

/**
 * upload请求封装
 * @param url
 * @param postData
 * @param serverName 后端接口服务器名称
 */
httpClient.uploadPost = function (url, postData, serverName) {
  let fullUrl = getFullUrl(url, serverName)
  return requestUploadFile("POST", fullUrl, postData)
}
// ----------------------------------------------------合约内部请求封装-end-------------------------------------------------

// ----------------------------------------------------合约外部请求封装（uc、global、hadax等请求）-------------------------
/**
 * 请求uc信息
 * uc相关请求 需要传HB_UC_TOKEN
 */
httpClient.requestGetUc = function (url) {
  if (!apiHuobiGlobalProtocalDomain) {
    throw new Error("uc protocol and domain not found!")
  }
  const headers = {}
  const HB_UC_TOKEN = StoreUtil.getCookie(StoreUtil.HB_UC_TOKEN_COOKIE)
  if (HB_UC_TOKEN) {
    headers[StoreUtil.HB_UC_TOKEN_COOKIE] = HB_UC_TOKEN
  }
  const ucFullUrl = `${apiHuobiGlobalProtocalDomain}/-/x/uc/uc/open/${url}`
  return requestCommon("GET", ucFullUrl, null, null, true, headers)
}

/**
 * uc post请求
 * uc相关请求 需要传HB_UC_TOKEN
 */
httpClient.requestPostUc = function (url, param, headers = {}) {
  if (!apiHuobiGlobalProtocalDomain) {
    throw new Error("uc protocol domain not found!")
  }
  const HB_UC_TOKEN = StoreUtil.getCookie(StoreUtil.HB_UC_TOKEN_COOKIE)
  if (HB_UC_TOKEN) {
    headers[StoreUtil.HB_UC_TOKEN_COOKIE] = HB_UC_TOKEN
  }
  const ucFullUrl = `${apiHuobiGlobalProtocalDomain}/-/x/uc/uc/open/${url}`
  return requestCommon("POST", ucFullUrl, param, null, true, headers)
}

/**
 * @description 用于请求新kyc相关的数据
 * @param {url} 例如：/common/uc/token/login、/kyc/auth/info/get?authBizCode=FUTURES
 * @param {param} POST请求的参数
 * @param {requestMethod} GET、POST
 * @param {headers} 请求头
 */
httpClient.requestNewKyc = function ({
  url,
  requestMethod = "POST",
  param,
  headers,
}) {
  if (!apiHuobiGlobalProtocalDomain) {
    throw new Error("huobi global protocol domain not found!")
  }
  const apiGlobalProtocolDomain = `${apiHuobiGlobalProtocalDomain}/-/x/huobi-kyc/v1/public`
  const proFullUrl = `${apiGlobalProtocolDomain}${url}`
  return requestCommon(requestMethod, proFullUrl, param, null, true, headers)
}

/**
 * pro get请求
 * @param url
 * @param headers
 * @returns {Promise<unknown>}
 */
httpClient.requestGetPro = function (url, headers = {}) {
  if (!apiHuobiGlobalProtocalDomain) {
    throw new Error("huobi global protocol domain not found!")
  }
  const proFullUrl = `${apiHuobiGlobalProtocalDomain}${url}`
  return requestCommon("GET", proFullUrl, null, null, true, headers)
}

/**
 * pro post 请求
 */
httpClient.requestPostPro = function (url, param, headers = {}) {
  if (!apiBrokerProtocolDomain) {
    throw new Error("huobi global protocol domain not found!")
  }
  const proFullUrl = `${apiBrokerProtocolDomain}/v1/${url}`
  return requestCommon("POST", proFullUrl, param, null, true, headers)
}

/**
 * pro 资金划转等的请求
 */
httpClient.requestPostMulanAsset = function (url, param, headers = {}) {
  if (!apiMulanAssetProtocolDomain) {
    throw new Error("huobi global protocol domain not found!")
  }
  let proFullUrl = `${apiMulanAssetProtocolDomain}/v2/${url}`
  if (process.env.NODE_ENV === "production") {
    proFullUrl = `${apiMulanAssetProtocolDomain}/-/x/pro/v2/${url}`
  }
  return requestCommon("POST", proFullUrl, param, null, true, headers)
}

/**
 * pro financial get 请求
 */
httpClient.requestGetFinancial = function (url, headers) {
  if (!apiFinancialProtocolDomain) {
    throw new Error("huobi global financial protocol domain not found!")
  }
  let proFullUrl = `${apiFinancialProtocolDomain}/hbg/v1/pledge/${url}`
  if (process.env.NODE_ENV === "production") {
    proFullUrl = `${apiFinancialProtocolDomain}/-/x/hbg/v1/pledge/${url}`
  }
  return requestCommon("GET", proFullUrl, null, null, true, headers)
}

/**
 * pro financial post 请求
 */
httpClient.requestPostFinancial = function (url, param, headers = {}) {
  if (!apiFinancialProtocolDomain) {
    throw new Error("huobi global protocol domain not found!")
  }
  let proFullUrl = `${apiFinancialProtocolDomain}/hbg/v1/pledge/${url}`
  if (process.env.NODE_ENV === "production") {
    proFullUrl = `${apiFinancialProtocolDomain}/-/x/hbg/v1/pledge/${url}`
  }
  return requestCommon("POST", proFullUrl, param, null, true, headers)
}

/**
 * global 身份认证相关api get请求
 * 相关请求 需要传HB_OLD_TOKEN
 */
httpClient.requestGetProOld = function (url) {
  if (!apiHuobiGlobalProtocalDomain) {
    throw new Error("login protocol domain not found!")
  }
  const headers = {}
  const HB_OLD_TOKEN = StoreUtil.getCookie(StoreUtil.HB_OLD_TOKEN_COOKIE)
  if (HB_OLD_TOKEN) {
    headers[StoreUtil.HB_OLD_TOKEN_COOKIE] = HB_OLD_TOKEN
  }
  const fullUrl = `${apiHuobiGlobalProtocalDomain}/-/x/hb/api/${url}`
  return requestCommon("GET", fullUrl, null, null, true, headers)
}

/**
 * global 身份认证相关api post请求
 * 相关请求 需要传HB_OLD_TOKEN
 */
httpClient.requestPostProOld = function (url, param, headers = {}) {
  if (!apiHuobiGlobalProtocalDomain) {
    throw new Error("login protocol domain not found!")
  }
  const HB_OLD_TOKEN = StoreUtil.getCookie(StoreUtil.HB_OLD_TOKEN_COOKIE)
  if (HB_OLD_TOKEN) {
    headers[StoreUtil.HB_OLD_TOKEN_COOKIE] = HB_OLD_TOKEN
  }
  const fullUrl = `${apiHuobiGlobalProtocalDomain}/-/x/hb/api/${url}`
  return requestCommon("POST", fullUrl, param, null, true, headers)
}

/**
 * global 身份认证图片上传 post请求
 * @param url
 * @param postData
 * @param serverName 后端接口服务器名称
 */
httpClient.uploadProOldPost = function (url, param, headers = {}) {
  if (!apiHuobiGlobalProtocalDomain) {
    throw new Error("login protocol domain not found!")
  }
  const HB_OLD_TOKEN = StoreUtil.getCookie(StoreUtil.HB_OLD_TOKEN_COOKIE)
  if (HB_OLD_TOKEN) {
    headers[StoreUtil.HB_OLD_TOKEN_COOKIE] = HB_OLD_TOKEN
  }
  const fullUrl = `${apiHuobiGlobalProtocalDomain}/-/x/hb/api/${url}`
  return requestUploadFile("POST", fullUrl, param, null, true, headers)
}

/**
 * hadax get请求
 */
httpClient.requestGetHadax = function (url, param, headers = {}) {
  if (!apiHuobiGlobalProtocalDomain) {
    throw new Error("uc protocol and domain not found!")
  }
  const hdaxFullUrl = `${apiHuobiGlobalProtocalDomain}/-/x/ssc/hadax/v2/open/${url}`
  return requestCommon("GET", hdaxFullUrl, param, null, true, headers)
}

/**
 * hadax post请求
 */
httpClient.requestPostHadax = function (url, param, headers = {}) {
  if (!apiHuobiGlobalProtocalDomain) {
    throw new Error("uc protocol domain not found!")
  }
  const hdaxFullUrl = `${apiHuobiGlobalProtocalDomain}/-/x/ssc/hadax/v2/open/${url}`
  return requestCommon("POST", hdaxFullUrl, param, null, true, headers)
}

/**
 * global 客户端下载链接相关api get请求
 */
httpClient.requestGetProGroup = function (url) {
  if (!apiHuobiGlobalProtocalDomain) {
    throw new Error("uc protocol and domain not found!")
  }
  const fullUrl = `${apiHuobiGlobalProtocalDomain}/-/x/hb/p/api/${url}`
  return requestCommon("GET", fullUrl, null, null, false)
}

/**
 * global 客户端下载链接相关api get请求
 */
httpClient.requestGetProGroup = function (url) {
  if (!apiHuobiGlobalProtocalDomain) {
    throw new Error("uc protocol and domain not found!")
  }
  const fullUrl = `${apiHuobiGlobalProtocalDomain}/-/x/hb/p/api/${url}`
  return requestCommon("GET", fullUrl, null, null, false)
}

/**
 * 获取资产账户入口是否展示权限
 * @param url
 * @param headers
 * @returns {Promise<unknown>}
 */
httpClient.requestGetAccountMenusRightShow = function (url, headers) {
  if (!apiHuobiGlobalProtocalDomain) {
    throw new Error("huobi global financial protocol domain not found!")
  }
  const proFullUrl = `${apiHuobiGlobalProtocalDomain}/-/x/hbg/${url}`
  return requestCommon("GET", proFullUrl, null, null, true, headers)
}

/**
 * 是否显示存币宝
 */
httpClient.requestGetCoinTreasure = function (url, headers = {}) {
  if (!apiHuobiGlobalProtocalDomain) {
    throw new Error("huobi global protocol domain not found!")
  }
  const proFullUrl = `${apiHuobiGlobalProtocalDomain}/-/x/pro/v1/${url}`
  return requestCommon("GET", proFullUrl, null, null, true, headers)
}

/**
 * pro holding get 请求
 */
httpClient.requestGetHolding = function (url, headers) {
  if (!apiHuobiGlobalProtocalDomain) {
    throw new Error("huobi global financial protocol domain not found!")
  }
  const proFullUrl = `${apiHuobiGlobalProtocalDomain}/-/x/hbg/v1/holding/${url}`
  return requestCommon("GET", proFullUrl, null, null, true, headers)
}

/**
 * pro holding post 请求
 */
httpClient.requestPostHolding = function (url, param, headers = {}) {
  if (!apiHuobiGlobalProtocalDomain) {
    throw new Error("huobi global protocol domain not found!")
  }
  const proFullUrl = `${apiHuobiGlobalProtocalDomain}/-/x/hbg/v1/holding/${url}`
  return requestCommon("POST", proFullUrl, param, null, true, headers)
}

export { httpClient }
