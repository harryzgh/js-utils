/**
 * @type string
 */
const defaultCookiePath = '/'
/**
 * 全局共用的 localStorage Key统一管理
 */
export const LOCAL_STORAGE_KEYS = {
  // 存储的语言类型
  LANGUAGE: 'language',
  // 存储的主题类型
  THEME: 'theme',
  // 红绿涨跌方向
  RED_GREEN_DIRECTION: 'redGreenDirection',
  // 交易页面资产显示状态
  TRADE_ASSETS_VISIBLE: 'trade_assets_visible',
  // 数量单位
  TRADE_UNIT: 'trade_unit',
  // 永续单位
  SWAP_UNIT: 'swap_unit',
  // 正向永续单位
  LINEAR_SWAP_UNIT: 'linear_swap_unit',
  // 期权交易单位
  OPTION_UNIT: 'option_unit',
  // 交割合约
  CONTRACT: 'contract',
  // 币本位永续
  SWAP: 'swap',
  // 币本位永续
  LINEAR_SWAP: 'linear_swap',
  // ip弹窗
  IP_ALERT_STORAGR: 'ip_alert_storage',
  // 所有周期选择
  ALL_EXPIRIESATIONS_STORAGE: 'all_expiriesations_storage',
  // 所有品种选择
  ALL_SYMBOL_STORAGE: 'all_symbol_storage',
  // ----------------------------------------- global站常量
  // uc token 大写
  HB_UC_TOKEN_COOKIE: 'HB-UC-TOKEN',
  // pro old token 存储常量
  HB_OLD_TOKEN_COOKIE: 'HB-OLD-TOKEN',
  // pro token 存储常量
  HB_PRO_TOKEN_COOKIE: 'HB-PRO-TOKEN',
  // hadax token 存储常量
  HB_HADAX_TOKEN_COOKIE: 'hb-hadaxv2-token',
  // pro kyc token 存储常量
  HB_KYC_TOKEN_COOKIE: 'HB-KYC-TOKEN',

  // ----------------------------------------- 合约站常量
  // contract session 存储常量
  CONTRACT_SESSION: 'contract-session',
  // k线指标缓存key
  CONTRACT_TV_SETTINGS: 'contract-tv-settings',
  // 是否切换ws链接
  WS_CONFIG: 'ws-config',
  // session过期，控制页面自动刷新次数
  PAGE_REFRESH_TIMES: 'page-refresh-times',
  // 用户中心是否展示资产
  IS_SHOW_ASSETS: 'is_show_assets',
  // 资产页面是否展示资产
  ASSER_USER_INFO_SHOW_ASSET: 'hideSmallCoin',
  // 全部、全仓、逐仓
  LINEARSWAP_CROSSISOLATEDTYPE: 'linearswap_crossisolatedtype',
  // 是否使用新版交易页
  IS_USE_NEW_TRADE_PAGE: 'is_use_new_trade_page',
  // 新版交易页布局类型0、1、2
  NEW_TRADE_LAYOUT_STYLE: 'new_trade_layout_style',
  // 调用清退数据接口的时间
  TIME_CALL_DISCHARGE_API: 'time_call_discharge_api',

  // ==================全站币种或者法币缓存变量 start===============================
  // 折算法币
  CONVERTED_CURRENCY: 'converted_currency',
  // 折算货币 (数字货币加法币)
  ALL_ASSETS_CONVERTED_COIN_CURRENCY: 'all_assets_converted_coin_currency',
  // ==================全站币种或者法币缓存变量 end===============================
  // ================== 各页面localstorage缓存 ================================
  CONTRACT_SIZE: 'contract_size',
  // 当前label缓存
  CURRENT_LABEL_STORAGE: 'current_label_storage',
  TOOLTIP_SHOWN_KEY: 'usdt_swaps_contest_tooltip_shown',
  // 展示更多的缓存
  EXPANSION_STORAGE: 'expansion_storage',
  LABEL_OPTION_STORAGE: 'label_option_storage',
  LABEL_OPTION_V_STORAGE: 'label_option_v_storage',
  // 全逐仓缓存
  LINEAR_SWAP_CROSS_ISOLATED_TYPE_TAB_STORAGE: 'linear_swap_cross_isolated_type_tab_storage',
  GRID_CROSS_ISOLATED_TYPE_TAB_STORAGE: 'grid_cross_isolated_type_tab_storage',
  HEADER_TIP: 'header-tips',
  NOTICE_ISREAD: 'notice_isread',
  IS_HIDE_HAVE_READ: 'isHideHaveRead',
  FLOATING_ORDER_IS_SHOW_STORAGE_KEY: 'floating-order-is-show',
  // 位置缓存改版一次，换个名字-2
  FLOATING_ORDER_POSITION_STORAGE_KEY: 'floating-order-position-2',
  // 风险评估存储menuKey
  RISK_ASSESSMENT_MENUKEY: 'risk-assessment-menu-key',
  // 交易页-网格交易横幅提示: 当前合约存在网格交易
  // GRID_EX_EXIST_TEMP_TIP: 'grid_ex_exist_temp_tip'
  INDEX_COMPARE_STORAGE: '',
  VERIFY_STEP: 'verify_step',
  GUIDE_STORAGE: '__guide__',
  TRADING_PAIR_STORAGE: 'trading_pair_storage',
  TAGS_GROUP: 'tags-group',
  GRID_LAYOUT_STORAGE: 'grid-layout'

}

// sessionStorage存储的key
export const SESSION_KEYS = {
  WINDOWLOADSTATUS: 'windowLoadStatus',
  CONTRACT_DATA_VOL_UNIT: 'contractDataVolUnit',
  CONTRACT_DATA_TUNOVER_UNIT: 'contractDataTurnoverUnit',
  SYMBOL: 'symbol'
}
/**
 * cookie / storage工具类
 * @type {{WS_CONFIG: string, removeStorage(*=): void, HB_HADAX_TOKEN_COOKIE: string, setCookie(*, *=, *=, *=, *, *): void, PAGE_REFRESH_TIMES: string, getCookie(*): null, HB_PRO_TOKEN_COOKIE: string, deleteCookie(*=, *, *=): void, HB_OLD_TOKEN_COOKIE: string, trim(*, *): (*), setStorage: StoreUtil.setStorage, getStorage(*=): string | null, CONTRACT_TV_SETTINGS: string, CONTRACT_SESSION: string, HB_UC_TOKEN_COOKIE: string}}
 */
export const StoreUtil = {
  ...LOCAL_STORAGE_KEYS,
  ...SESSION_KEYS,
  // 共享session的key.发送
  SEND_TAB_SHARE_SESSION_KEY: '__send_tab_share_session_key__',
  // 共享session的key.获取
  GET_TAB_SHARE_SESSION_KEY: '__get_tab_share_session_key__',
  // 共享session的key. 收到通知同步其他tab
  SYNC_TO_OTHER_TAB_SHARE_SESSION_KEY: '__sync_other_tab_share_session_key__',

  setStorage: (key, value) => {
    window.localStorage.setItem(key, value)
  },

  getStorage  (key) {
    return window.localStorage.getItem(key)
  },

  removeStorage  (key) {
    return window.localStorage.removeItem(key)
  },

  setSessionStorage: (key, value) => {
    window.sessionStorage.setItem(key, value)
  },

  getSessionStorage  (key) {
    return window.sessionStorage.getItem(key)
  },

  removeSessionStorage  (key) {
    return window.sessionStorage.removeItem(key)
  },

  // 解析对象
  getStorageObj (key) {
    const data = this.getStorage(key)
    try {
      if (data === '' || data === undefined || data === null) {
        return data
      } else {
        return JSON.parse(data)
      }
    } catch (e) {
      return data
    }
  },

  setStorageObj (key, value) {
    this.setStorage(key, JSON.stringify(value))
  },

  // 去除空格  type 1-所有空格  2-前后空格  3-前空格 4-后空格
  trim (str, type) {
    switch (type) {
      case 1:
        return str.replace(/\s+/g, '')
      case 2:
        return str.replace(/(^\s*)|(\s*$)/g, '')
      case 3:
        return str.replace(/(^\s*)/g, '')
      case 4:
        return str.replace(/(\s*$)/g, '')
      default:
        return str
    }
  },

  /**
   * 设置cookie
   * @param keyName
   * @param value
   * @param expires
   * @param path
   * @param domain
   * @param secure
   */
  setCookie (keyName, value, expires, path = defaultCookiePath, domain, secure) {
    let today = new Date()
    today.setTime(today.getTime())
    if (expires) {
      expires = expires * 1000 * 60 * 60 * 24
    }
    let expiresDate = new Date(today.getTime() + (expires))
    document.cookie = keyName + '=' + encodeURIComponent(value) +
      ((expires) ? ';expires=' + expiresDate.toUTCString() : '') + // expires.toGMTString()
      ((path) ? ';path=' + path : '') +
      ((domain) ? ';domain=' + domain : '') +
      ((secure) ? ';secure' : '')
  },

  /**
   * 获取cookie
   * @param keyName
   * @returns {null}
   */
  getCookie (keyName) {
    var cookieValue = null
    if (document.cookie && document.cookie !== '') {
      var cookies = document.cookie.split(';')
      for (var i = 0; i < cookies.length; i++) {
        var cookie = this.trim(cookies[i], 2)
        // Does this cookie string begin with the keyName we want?
        if (cookie.substring(0, keyName.length + 1) === (keyName + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(keyName.length + 1))
          break
        }
      }
    }
    return cookieValue
  },

  /**
   * 删除cookie
   * @param keyName
   * @param domain
   * @param path
   */
  deleteCookie  (keyName, domain, path = defaultCookiePath) {
    if (this.getCookie(keyName)) {
      document.cookie = keyName + '=' +
      ((path) ? ';path=' + path : '') +
      ((domain) ? ';domain=' + domain : '') +
      ';expires=Thu, 01-Jan-1970 00:00:01 GMT'
    }
  }
}
