/**
 * 日志工具类
 */
export const logger = {}

// 日志等级
export const level = {
  NONE: -1,
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
}

// 参数
const options = [
  {
    title: '×××××××××××××××',
    color: '#ee0000'
  }, {
    title: '☹☹☹☹☹☹☹☹☹☹☹☹☹☹☹',
    color: '#ee9a00'
  }, {
    title: '☛☛☛☛☛☛☛☛☛☛☛☛☛☛☛',
    color: '#4d4d4d'
  }, {
    title: '●●●●●●●●●●●●●●●●●●',
    color: '#0366d6'
  }
]

// 当前日志等级
// TODO: 设置编译环境后 process.env.NODE_ENV 一直是production 无法修改
let currentLevel = ['development', 'test', "preview"].includes(import.meta.env.MODE) ? level.DEBUG : level.ERROR

/**
 * 设置日志等级
 * @param level 日志等级
 */
logger.setLevel = function (level) {
  currentLevel = level
}

/**
 * log info
 * @param info 输出信息
 */
logger.i = function (info) {
  log(level.INFO, info)
}

/**
 * log error
 * @param error 输出信息
 */
logger.e = function (error) {
  log(level.ERROR, error)
}

/**
 * log debug
 * @param debug 输出信息
 */
logger.d = function (debug) {
  log(level.DEBUG, debug)
}

/**
 * log warn
 * @param warn 输出信息
 */
logger.w = function (warn) {
  log(level.WARN, warn)
}

/**
 * 日志输出
 * @param level 日志等级
 * @param object 输出信息
 */
function log (level, object) {
  const headerCSS = `color: ${options[level].color}; font-weight: bold; font-size: 14px`
  const contentCSS = `color: ${options[level].color}`
  if (currentLevel >= level) {
    console.group(`%c ${options[level].title}`, headerCSS)
    if (typeof object === 'object') {
      console.log(object)
    } else {
      console.log(`%c ${object}`, contentCSS)
    }
    console.groupEnd()
  }
}
