/**
 * 全站使用BigNumber.js进行数据的计算和展示，注意点：
 * 1、后端传回的Long类型数据如果超过17位，会在axios的全局配置中用transformResponse转化为 BigNumber类型，避免浏览器自动转为Number类型造成精度丢失
 * 2、涉及计算时，建议传进以下计算方法的数字参数为String数字或者BigNumber类型数字，因为BigNumber构造函数没法将不合法Number类型数字转成正确的BigNumber或者String数字
 * 
 *  if (!isNotUseTransformResponse) {
 *    // 后端返回Long类型的数据超过17位时，本配置会将返回的数据封装成BigNumber类型数据
 *    requestConfig.transformResponse = [(data, headers) => {
 *      return parse(stringify(parse(data)))
 *    }]
 *  }
 *  axios(requestConfig).then(res => { successHandler(res, resolve, reject, url) }).catch(error => { errorHandler(error, reject) })
 * 
 * 
 */

import { BigNumber } from 'bignumber.js'
// '2394723979384832423423.234083294823098423'
// const name = '2.394723979384832423423234083294823098423e+21'
// const le = '--'
// const nalds = new BigNumber(1.002343200)
// console.log('test++++++++++++++++', nalds.toPrecision(3), nalds.toFixed(), name, nalds, nalds.toFixed())
// console.log('formatNumber++++++', formatNumber(NaN))

/**
 * 定制Number的toFixed方法，默认返回截断处理的数字,
 * 能够达到 将科学记数法数值转化为非科学记数法数值 的功能
 * 所以以前的方法toNonExponentialNum没用了，舍弃掉
 * @param num: 需要转换的数字， 可以为数字，字符串，BigNumber等
 * @param precision：保留小数的位数, 整数，默认4位。传-1时有多少位保留多少位（仍然会按12位截取，即传-1时最多保留12位，传非-1的值可以超过12), 精度不固定时可传-1
 * @param isCutOff: 是否截断处理，默认截断处理, false: 向上进1
 * @param isRemoveUnlessZero: 是否去掉小数后面没用的0
 * @returns {string}
 */
function toFix (num, precision = 4, isCutOff = true, isRemoveUnlessZero = false) {
  num = new BigNumber(num)
  precision = Number(precision)

  if (num.isNaN() || isNaN(precision)) {
    return '--'
  }

  // 传-1时，有多少位保留多少位。（为避免长度过长影响样式，目前默认最多12位）
  if (precision === -1) {
    // 由于是先按12位截取，这里仍然要去掉末尾0
    isRemoveUnlessZero = true
    precision = 12
  }

  num = num.toFixed(precision, isCutOff ? BigNumber.ROUND_DOWN : BigNumber.ROUND_UP)
  // 去掉末尾多余的0
  if (isRemoveUnlessZero) {
    num = new BigNumber(num).toFixed()
  }

  return num
}
// console.log('console.log++++++++', toFix(0.0000000000000001))
// console.log('toFix++++', toFix(new BigNumber('98809.000000399999999999'), '--', false), new BigNumber(-1.239432).toFixed(2, BigNumber.ROUND_UP))

/**
 * 两个浮点数相减
 * @param a 被减数 可以为数字，字符串，BigNumber等
 * @param b 减数 可以为数字，字符串，BigNumber等
 * @returns {string}
 */
function sub (a, b) {
  a = new BigNumber(a)
  return a.minus(b).toFixed()
}
// console.log('sub++++++++', sub('ds', '--'))
// console.log('sub++++++++', sub(0.223394598378923, new BigNumber(0.193923482304823082323023048239)))
// console.log('sub++++++++', sub(2.394723979384832423423234083294823098423e+5, 2.394723979384832423423234083294823098423e+3))

/**
 * 多个浮点数相减
 * @returns {*}
 */
function subs () {
  if (arguments.length < 2) {
    throw new Error('subs params wrong')
  }
  let res = sub(arguments[0], arguments[1])
  for (let i = 2; i < arguments.length; i++) {
    res = sub(res, arguments[i])
  }
  return res
}

/**
 * 两个浮点数相加
 * @param a 可以为数字，字符串，BigNumber等
 * @param b 可以为数字，字符串，BigNumber等
 */
function add (a, b) {
  a = new BigNumber(a)
  return a.plus(b).toFixed()
}
// console.log('add++++++++', add('ds', '--'))
// console.log('add++++++++', add(0.223394598378923, 0.193923482304823082323023048239))
// console.log('add++++++++', add(2.394723979384832423423234083294823098423e+5, 2.394723979384832423423234083294823098423e+3))

/**
 * 多个浮点数相加
 * @returns {*}
 */
function adds () {
  if (arguments.length < 2) {
    throw new Error('adds params wrong')
  }
  let res = add(arguments[0], arguments[1])
  for (let i = 2; i < arguments.length; i++) {
    res = add(res, arguments[i])
  }
  return res
}

/**
 * 两个浮点数相乘
 * @param a 可以为数字，字符串，BigNumber等
 * @param b 可以为数字，字符串，BigNumber等
 * @returns {number}
 */
function mul (a, b) {
  a = new BigNumber(a)
  return a.multipliedBy(b).toFixed()
}
// console.log('mul++++++++', mul('ds', '--'))
// console.log('mul++++++++', mul(0.3, 6))
// console.log('mul++++++++', mul(0.223394598378923, 0.193923482304823082323023048239))
// console.log('mul++++++++', mul(2.394723979384832423423234083294823098423e+5, 2.394723979384832423423234083294823098423e+3))

/**
 * 多个浮点数相乘
 * @returns {*}
 */
function muls () {
  if (arguments.length < 2) {
    throw new Error('muls params wrong')
  }
  let res = mul(arguments[0], arguments[1])
  for (let i = 2; i < arguments.length; i++) {
    res = mul(res, arguments[i])
  }
  return res
}

/**
 * 两个浮点数相除
 * @param a 可以为数字，字符串，BigNumber等
 * @param b 可以为数字，字符串，BigNumber等
 */
function div (a, b) {
  a = new BigNumber(a)
  return a.dividedBy(b).toFixed()
}
// console.log('div++++++++', div('ds', '--'))
// console.log('div++++++++', div(0.3, 6))
// console.log('div++++++++', div(0.223394598378923, 0.193923482304823082323023048239))
// console.log('div++++++++', div(2.394723979384832423423234083294823098423e+5, 2.394723979384832423423234083294823098423e+3))

/**
 * 多个浮点数相除
 * @returns {*}
 */
function divs () {
  if (arguments.length < 2) {
    throw new Error('divs params wrong')
  }
  let res = div(arguments[0], arguments[1])
  for (let i = 2; i < arguments.length; i++) {
    res = div(res, arguments[i])
  }
  return res
}

/**
 * 对比两个数字a和b的大小
 *
 * 默认a和b都是number类型的值，如果不能确认a和b的类型，则一定使用本方法，
 * 否则因为全站使用 bignumber 的缘故，大概率会出现两个字符串数字对比而出错。
 *
 * 一：
 * a > b 返回 1
 * a === b 返回 0
 * a < b 返回 -1
 * a 和 b 任何一个参数为NaN  返回 null
 *
 * 二：
 * 应用：如果返回值 >= 0 则有 a >= b, 同理如果 a >= b，则返回值必然 >=0。 返回值小于等于0的情况一样。
 *
 * @param a  number|string|BigNumber
 * @param b  number|string|BigNumber
 */
function comparedTwoNumbers (a, b) {
  return new BigNumber(a).comparedTo(b)
}
/* console.log('comparedTwoNumbers+++',
  '62501' < '29834082304823',
  comparedTwoNumbers('62501', new BigNumber('29834082304823')),
  comparedTwoNumbers('62501', '29834082304823'),
  comparedTwoNumbers(62501, '29834082304823')
) */

export {sub, subs, add, adds, mul, muls, div, divs, toFix, comparedTwoNumbers}
