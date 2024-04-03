/**
 * 国际化相关设置文件
 * 国家化语言添加注意点：每次添加语言仅需 在如下两个 languageMap，transferBrowserLanToBackenLan
 * 字段方法中添加对应语言的内容即可
 */
import React from 'react'
import { getIsBrokerProjectBool } from '../projectConfig'
import {StoreUtil} from '../utils/storeUtil'
import {shouldUseMobileType} from '../utils/commonFunction'

/**
 * 前后端交互使用的语言格式：中划线串接驼峰，如 zh-CN
 * 前端链接中使用的语言格式：中划线串接全小写，如 zh-cn
 */
export const languageMap = {
  'zh-CN': '中文简体',
  'zh-HK': '中文繁体',
  'en-US': 'English',
  // 俄语
  'ru-RU': 'Русский',
  // 韩语
  // 'ko-KR': '한국어',
  // 土耳其  (Türkçe)
  'tr-TR': 'Türkçe',
  // 越南语 (Tiếng Việt)
  'vi-VI': 'Tiếng Việt',
  // 法语 (Français)
  'fr-FR': 'Français',
  // 西班牙语 (Español tradicional)
  'es-ES': 'Español-ES',
  // 拉美西语 (Español latinoamericano)
  'es-LA': 'Español-LA',
  // 德语 (Deutsch)
  'de-DE': 'Deutsch',
  // 印尼语（Bahasa Indonesia)
  'id-ID': 'Bahasa Indonesia',
  // 意大利语 (Italiano)
  'it-IT': 'Italiano',
  // 马来语 (Bahasa Malaysia)
  'ms-MY': 'Bahasa Malaysia',
  // 荷兰语 (Nederlands)
  'nl-NL': 'Nederlands',
  // 印度英语（English (India))
  'en-IN': 'English (India)',
  // 葡萄牙语
  'pt-PT': 'Português-PT',
  // 印地语
  'hi-IN': 'हिंदी',
  // 乌克兰语
  'uk-UA': 'Українська'
}

// 只有经纪商才加下面语言
if (getIsBrokerProjectBool()) {
  // 巴葡
  languageMap['pt-BR'] = 'Português-BR'
}

// 后端语言key数组 ['zh-CN', 'en-US', ...]
export const backendLanguageKeys = Object.keys(languageMap)

/**
 * 语言json合集
 * {'zh-CN': {}, 'en-US': {}, ...}
 * @returns {{}}
 */
const getLanguageJsonMap = () => {
  let languageJsonMap = {}
  backendLanguageKeys.forEach(backendLanguageKey => {
    languageJsonMap = Object.assign(languageJsonMap, {
      [backendLanguageKey]: {}
    })
  })
  return languageJsonMap
}
const languageJsonMap = getLanguageJsonMap()

// 期权项目没有的语言
export const languagesNotInOptionProject = ['tr-TR', 'vi-VI', 'es-ES', 'es-LA']

/**
 *
 * @param language
 * @param importPromise
 * @returns {function(): *}
 */
const importLanguagePromise = (language, importPromise) => () => {
  return importPromise().then((languageJsonData) => {
    if (languageJsonMap) {
      languageJsonMap[language] = languageJsonData
    }
  })
}

/**
 * 获取对应语言的语言json Map
 * {'en-US': importLanguagePromise('en-US', () => import(/!* webpackChunkName: "en-US" *!/ './en-US.json')), ...}
 */
export const importLanguageFileMap = () => {
  let languageFileMap = {}
  backendLanguageKeys.forEach(backendLanguageKey => {
    languageFileMap = Object.assign(languageFileMap, {
      [backendLanguageKey]: importLanguagePromise(backendLanguageKey, () => import(/* webpackChunkName: "[request]" */`./${backendLanguageKey}.json`))
    })
  })
  return languageFileMap
}

/**
 * 获取后端语言key map
 * {'ZH-CN': 'zh-CN', 'EN-US': 'en-US', ...}
 * @returns {{}}
 */
const getBackendLanguageMap = () => {
  let backendLanguageMap = {}
  backendLanguageKeys.forEach(backendLanguageKey => {
    backendLanguageMap = Object.assign(backendLanguageMap, {
      [backendLanguageKey.toUpperCase()]: backendLanguageKey
    })
  })
  return backendLanguageMap
}
// {'ZH-CN': 'zh-CN', 'EN-US': 'en-US', ...}
export const LANGUAGE = getBackendLanguageMap()

// 默认语言设置
export const defaultLanguage = LANGUAGE['EN-US']

/**
 * 查找翻译
 * @param language 语言
 * @param key 文字对应的key
 * @returns {*} 返回key对应的语言文字
 */
export function intl (language, key) {
  if (languageJsonMap) {
    let msg = languageJsonMap[language]
    if (!msg) {
      msg = languageJsonMap[defaultLanguage]
    }
    return msg[key] || ''
  }
}
/**
 * 查找翻译并将文字中的{000} {000} {111} {111}以此类推翻译成你设置的标签转换成reactDom可以直接在项目在jsx中使用
 * 规范1：要输出成reactdom的文案必须从{000}开始依次累加，必须为三个数字
 * 规范2：翻译中的文案必须为闭合标签，不允许出现不闭合的标签文案
 * 规范2: 不能嵌套标签，嵌套标签自行处理
 * @param language 语言
 * @param key 文字对应的key
 * @param {Array} fns dom处理，从第一个开始
 * @returns {*} 返回key对应的语言文字
 */
export function intlToHtml (language, key, fns = []) {
  if (languageJsonMap) {
    let msg = languageJsonMap[language]
    if (!msg) {
      msg = languageJsonMap[defaultLanguage]
    }
    const messageString = msg[key]
    if (!messageString) {
      console.error('缺少翻译，请添加带有标签标示的文案')
      return '--'
    }
    return stringTransToHtml(messageString, fns)
  }
}
/**
 * 查将文字中的{000} {000} {111} {111}翻译成你设置的标签成HTML
 * 规范1：要输出成reactdom的文案必须从{000}开始依次累加，必须为三个数字
 * 规范2：必须为闭合标签，不允许出现不闭合的标签文案
 * @param messageString 文案
 * @param {Array} fns dom处理，从第一个开始
 * @returns {*} 返回key对应的语言文字
 */
export function stringTransToHtml (messageString, fns) {
  try {
    const elements = []
    const plainText = []
    let lastText = messageString
    fns.forEach((fn, index) => {
      // 翻译文案没翻译的情况
      if (typeof lastText !== 'string') {
        console.error(`${messageString} stringTransToHtml 方法所传文案不规范`)
        return
      }
      const strArray = lastText.split(`{${index}${index}${index}}`)
      plainText.push(strArray[0])
      lastText = strArray[2]
      if (typeof strArray[1] === 'string') {
        elements.push(fn(strArray[1]))
      }
    })
    // 将字符串通过标记截断，取第二段为内容
    return <React.Fragment>
      {elements.map((_, index) => {
        return [plainText[index], elements[index]]
      })}
      {lastText}
    </React.Fragment>
  } catch (error) {
    console.error(error)
    console.error(`${messageString} stringTransToHtml 方法所传文案不规范`)
    return '--'
  }
}

/**
 * 此方法为升级版本，为处理项目中函数组件传入函数报错的问题
 * 规范1：要输出成reactdom的文案必须从{000}开始依次累加，必须为三个数字
 * 规范2：必须为闭合标签，不允许出现不闭合的标签文案
 * @param messageString 文案
 * @param {Array} nodeNames 要转换的标签的名字，从第一个开始
 * @param props 每个标签的属性
 * @returns {*} 返回key对应的语言文字
 */
export function stringTransToHtmlPro (messageString, nodeNames, props = []) {
  try {
    const elements = []
    const plainText = []
    let lastText = messageString
    nodeNames.forEach((nodeName, index) => {
      // 翻译文案没翻译的情况
      if (typeof lastText !== 'string') {
        console.error(`${messageString} stringTransToHtml 方法所传文案不规范`)
        return
      }
      const strArray = lastText.split(`{${index}${index}${index}}`)
      plainText.push(strArray[0])
      lastText = strArray[2]
      if (typeof strArray[1] === 'string') {
        elements.push(React.createElement(nodeName, props[index], strArray[1]))
      }
    })
    // 将字符串通过标记截断，取第二段为内容
    return <React.Fragment>
      {elements.map((_, index) => {
        return [plainText[index], elements[index]]
      })}
      {lastText}
    </React.Fragment>
  } catch (error) {
    console.error(error)
    console.error(`${messageString} stringTransToHtml 方法所传文案不规范`)
    return '--'
  }
}

/**
 * 格式化语言 默认语言为英语
 * @param language 通过 window.navigator.language 获取到的浏览器的语言
 * @returns {*}
 */
export function transferBrowserLanToBackenLan (language) {
  if (typeof language !== 'string') {
    return LANGUAGE['EN-US']
  }
  let navigatorLanguage = language.toLowerCase()
  // 简体中文  'zh-sg': 中文（新加坡）
  let zhCns = ['zh-cn', 'zh', 'zh-sg']
  // 繁体中文
  let zhHks = ['zh-tw', 'zh-hk', 'zh-mo']
  if (zhCns.includes(navigatorLanguage)) {
    language = LANGUAGE['ZH-CN']
  } else if (zhHks.includes(navigatorLanguage) || navigatorLanguage.includes('zh')) {
    language = LANGUAGE['ZH-HK']
  } else if (navigatorLanguage.includes('ko')) {
    language = LANGUAGE['KO-KR']
  } else if (navigatorLanguage.includes('ru')) {
    language = LANGUAGE['RU-RU']
  } else if (navigatorLanguage.includes('tr')) {
    language = LANGUAGE['TR-TR']
  } else if (navigatorLanguage.includes('vi')) {
    language = LANGUAGE['VI-VI']
  } else if (['fr-fr', 'fr'].includes(navigatorLanguage)) {
    language = LANGUAGE['FR-FR']
  } else if (['es-es', 'es', 'spa'].includes(navigatorLanguage)) {
    language = LANGUAGE['ES-ES']
  } else if (['es-419', 'es-la'].includes(navigatorLanguage)) {
    language = LANGUAGE['ES-LA']
  } else if (['de-de'].includes(navigatorLanguage)) {
    language = LANGUAGE['DE-DE']
  } else if (['id', 'id-id'].includes(navigatorLanguage)) {
    language = LANGUAGE['ID-ID']
  } else if (['it', 'it-it'].includes(navigatorLanguage)) {
    language = LANGUAGE['IT-IT']
  } else if (['ms', 'ms-my'].includes(navigatorLanguage)) {
    language = LANGUAGE['MS-MY']
  } else if (['nl', 'nl-nl'].includes(navigatorLanguage)) {
    language = LANGUAGE['NL-NL']
  } else if (['en-in'].includes(navigatorLanguage)) {
    language = LANGUAGE['EN-IN']
  } else if (['pt', 'pt-pt'].includes(navigatorLanguage)) {
    language = LANGUAGE['PT-PT']
  } else if (['pt-br'].includes(navigatorLanguage)) {
    language = LANGUAGE['PT-BR']
  } else if (['hi', 'hi-in'].includes(navigatorLanguage)) {
    language = LANGUAGE['HI-IN']
  } else if (['uk', 'uk-ua'].includes(navigatorLanguage)) {
    language = LANGUAGE['UK-UA']
  } else {
    language = LANGUAGE['EN-US']
  }
  return language
}

/**
 * 根据Lurlanguage 获取相关map
 * @param urlLanguage
 * @returns {{languageKeys: string[], isProjectSupportUrlLanguage: (*|boolean)}}
 */
export const getUrlLanguageMap = (urlLanguage) => {
  const isClientMobile = shouldUseMobileType()
  let languageKeys = backendLanguageKeys
  if (isClientMobile) {
    languageKeys = ['zh-CN', 'zh-HK', 'en-US']
  }
  const isProjectSupportUrlLanguage = urlLanguage && languageKeys.some(lang => lang.toLowerCase() === urlLanguage.toLowerCase())
  return {
    languageKeys,
    isProjectSupportUrlLanguage
  }
}

/**
 * 获取当前语言
 * language === value ? value : defaultLanguage
 * 语言两种格式： zh-CN: 用于api 和 前端语言国际化, zh-cn: 用于请求链接展示
 * 语言抓取优先级：1、抓链接中的语言 2、抓缓存中的语言 3、抓浏览器当前选择的语言
 * @returns {*} 当前使用的语言，格式： zh-CN, en-US 等
 * 规则：1、首先获取链接中语言 2、链接中语言不被项目支持，使用 localStorage 中语言
 *      3、localStorage中语言不被支持，使用浏览器自带的默认语言 4、浏览器自带默认语言，使用项目默认语言 defaultLanguage
 */
export function getCurrentLanguage () {
  let language
  // 抓取链接中语言
  const pathname = location.pathname
  const regExp = /\/([a-zA-Z0-9-]+)?(\/|$)(.+)?/
  const langMatch = pathname.match(regExp)
  const urlLanguage = language = langMatch && langMatch[1] ? langMatch[1] : ''
  const urlLanguageMap = getUrlLanguageMap(urlLanguage)
  // url中语言不存在或者存在的语言不在项目支持的语言列表中
  if (!urlLanguageMap.isProjectSupportUrlLanguage) {
    const languageKeys = urlLanguageMap.languageKeys
    // 不支链接中的语言, 抓取缓存中语言
    language = StoreUtil.getStorage(StoreUtil.LANGUAGE)
    const isProjectSopportStorageLanguage = language && languageKeys.some(lang => lang.toLowerCase() === language.toLowerCase())
    if (!isProjectSopportStorageLanguage) {
      // 不支持缓存中的语言, 抓取浏览器本身语言
      language = transferBrowserLanToBackenLan(window.navigator.language || '')
      const isProjectSopportNavigatorLanguage = language && languageKeys.some(lang => lang.toLowerCase() === language.toLowerCase())
      if (!isProjectSopportNavigatorLanguage) {
        language = defaultLanguage
      }
    }
  }
  return LANGUAGE[language.toUpperCase()]
}
