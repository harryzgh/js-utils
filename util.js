const Util = {
//去除空格  type 1-所有空格  2-前后空格  3-前空格 4-后空格
  trim: function (str, type) {
    switch (type) {
      case 1:
        return str.replace(/\s+/g, "");
      case 2:
        return str.replace(/(^\s*)|(\s*$)/g, "");
      case 3:
        return str.replace(/(^\s*)/g, "");
      case 4:
        return str.replace(/(\s*$)/g, "");
      default:
        return str;
    }
  },

//jquery中使用ajax公共函数
  ajaxFunction:function(url,method,isAsync,jsonData,rightBack,errorBack){
    var ajax = $.ajax({
      url: url,
      type: method,
      async: isAsync,
      data: jsonData,
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success:rightBack,
      error:errorBack
    });
    return ajax;
  },

//过滤数字或数字字符串(Number或者String类型)使之保留两位小数
  //strOrNum:数字或数字字符串，isPercentage：是否显示百分号，digit:显示的小数位数
  filterNumber:function(strOrNum,isPercentage,digit){
    if(typeof strOrNum === "number"){
      if(isPercentage){
        return (strOrNum*100).toFixed(digit)+"%";
      }else{
        return strOrNum.toFixed(digit);
      }
    }else if(typeof strOrNum === "string"){
      var num = Number(strOrNum);
      if(isNaN(num)){  //非数字字符串
        return strOrNum;
      }else{
        if(isPercentage){
          return (num*100).toFixed(digit)+"%";
        }else{
          return num.toFixed(digit);
        }
      }
    }else{
      console.log("Invalid argument in filterNumber:"+strOrNum);
      return "";
    }
  },

//给整数部分每三位加逗号
  addComma:function(numOrStr){
    if(typeof numOrStr === 'number' ){
      numOrStr = String(numOrStr);
    }else if(typeof numOrStr === 'string'){
      numOrStr = numOrStr.replace(/(^\s*)|(\s*$)/g, ""); //去掉前后空格
      var num = Number(numOrStr);
      if(isNaN(num)){  //非数字字符串
        return numOrStr;
      }
    }else{
      console.log("Invalid argument in addComma:"+numOrStr);
      return "";
    }
    var prevNumStr = numOrStr.split(".")[0]; //小数点前的整数串
    var nextNumStr = numOrStr.split(".")[1]; //小数点后的整数串

    if(numOrStr.indexOf("-")>=0){
      prevNumStr = prevNumStr.replace("-","");
    }
    var strArray = prevNumStr.split("");
    var strLen = strArray.length;
    var commaNum = strLen/3;
    var remainder = strLen%3;
    if(remainder<1){
      commaNum = commaNum - 1;
    }else if(remainder==1&&numOrStr.indexOf("-")>=0){
      commaNum = commaNum - 1;
    }
    for(var i=0;i<commaNum;i++){
      strArray[strLen-3*(i+1)] = ","+strArray[strLen-3*(i+1)];
    }
    return numOrStr.indexOf("-")>=0?("-"+strArray.join("")+"."+nextNumStr):(strArray.join("")+"."+nextNumStr);
  },
//月份字符串返回月份数字
  monthStrToNum:function(str){
    switch(str){
      case 'Jan':
        return 1;
        break;
      case 'Feb':
        return 2;
        break;
      case 'Mar':
        return 3;
        break;
      case 'Apr':
        return 4;
        break;
      case 'May':
        return 5;
        break;
      case 'Jun':
        return 6;
        break;
      case 'Jul':
        return 7;
        break;
      case 'Aug':
        return 8;
        break;
      case 'Sep':
        return 9;
        break;
      case 'Oct':
        return 10;
        break;
      case 'Nov':
        return 11;
        break;
      case 'Dec':
        return 12;
        break;
      default:
        return '';
    }
  },
//时间格式转化 (毫秒或秒转时间字符串)
  timeStamp2TimeStr:function(ss,type){
    var datetime = null;
    if(type==0){ //ss是毫秒
      datetime = new Date();
      datetime.setTime(ss);
    }else if(type==1){  //是秒
      datetime = new Date(ss);
    }else{
      console.log("the arg is error in timeStamp2TimeStr")
    }
    var year = datetime.getFullYear();
    var month = datetime.getMonth() + 1 < 10 ? "0" + (datetime.getMonth() + 1) : datetime.getMonth() + 1;
    var day = datetime.getDate() < 10 ? "0" + datetime.getDate() : datetime.getDate();
    var hour = datetime.getHours() < 10 ? "0" + datetime.getHours() : datetime.getHours();
    var minute = datetime.getMinutes() < 10 ? "0" + datetime.getMinutes() : datetime.getMinutes();
    var second = datetime.getSeconds() < 10 ? "0" + datetime.getSeconds() : datetime.getSeconds();
    return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
  },

//将网页内容粘贴到剪贴板
  copyTextToClipboard:function(text) {
    var textArea = document.createElement("textarea");
    textArea.style.position = 'fixed';
    textArea.style.top = 0;
    textArea.style.left = 0;
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    // We don't need padding, reducing the size if it does flash render.
    textArea.style.padding = 0;
    // Clean up any borders.
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    // Avoid flash of white box if rendered for any reason.
    textArea.style.background = 'transparent';
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
      console.log('Copying text command was ' + msg);
    } catch(err) {
      console.log('Oops, unable to copy',err);
    }
    document.body.removeChild(textArea);
  },

//check email format
  checkEmailFormat:function(email){
    var isEmailFormat = true;
    var reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/;
    if(!reg.test(email)){
      isEmailFormat = false;
    }
    return isEmailFormat;
  },

//cookie相关
  setCookie:function( keyName, value, expires, path, domain, secure ) {
    var today = new Date();
    today.setTime( today.getTime() );
    if ( expires ) {
      expires = expires * 1000 * 60 * 60 * 24;
    }
    var expires_date = new Date( today.getTime() + (expires) );
    document.cookie = keyName + "=" +encodeURIComponent( value ) +
      ( ( expires ) ? ";expires=" + expires_date.toUTCString() : "" ) + //expires.toGMTString()
      ( ( path ) ? ";path=" + path : "" ) +  //( ( path ) ? ";path=" + path : "/" )
      ( ( domain ) ? ";domain=" + domain : "" ) +
      ( ( secure ) ? ";secure" : "" );
  },
  getCookie:function(keyName){
    var cookieValue = null;
    if (document.cookie && document.cookie !== ''){
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
        var cookie = jQuery.trim(cookies[i]);
        // Does this cookie string begin with the keyName we want?
        if (cookie.substring(0, keyName.length + 1) === (keyName + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(keyName.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  },
  deleteCookie:function( keyName, path, domain ) {
    if ( getCookie( keyName ) ) document.cookie = keyName + "=" +
      ( ( path ) ? ";path=" + path : "") +
      ( ( domain ) ? ";domain=" + domain : "" ) +
      ";expires=Thu, 01-Jan-1970 00:00:01 GMT";
  },

//csrftoken相关（用于jquery中）
  csrfSafeFun:function(){
    $.ajaxSetup({
      beforeSend: function(xhr, settings){
        var csrftoken = getCookie('csrftoken');
        if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
          xhr.setRequestHeader("X-CSRFToken", csrftoken);
        }
      }
    })
  },
  csrfSafeMethod:function(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
  },

//获取非vue-router URL字符串中参数的值
  getQueryString:function(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return decodeURI(r[2]); return null;
  },

//获取vue-router URL字符串中的值
  getVueQueryString:function(name){
    var search = window.location.href.split("?")[1];
    if(search){
      var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
      var r = search.substr(0).match(reg);
      if (r != null) return decodeURI(r[2]); return null;
    }else{
      return "";
    }
  },

//弹窗绑定拖动功能,outerBox是弹窗最外层div代表的dom元素，moveBar：鼠标能够拖动的dom元素
  boxMove:function(outerBox,moveBar){
    var leftSpan,topSpan,isMousedown;
    moveBar.onmousedown = function(event){
      isMousedown = true;
      var event = event || window.event;
      leftSpan = event.clientX - outerBox.offsetLeft;  //鼠标位置离弹框左边线的距离
      topSpan = event.clientY - outerBox.offsetTop; //鼠标位置离弹框上边线的距离
      document.onmousemove = function(event) {
        if(isMousedown){
          var event = event||window.event;
          var mouseX = event.clientX;   //鼠标距浏览器窗口的左边沿位置
          var mouseY = event.clientY;
          outerBox.style.left = mouseX - leftSpan+"px";
          outerBox.style.top = mouseY - topSpan+"px";
        }
      }
      moveBar.onmouseup = function() {
        isMousedown = false;
        document.onmousemove = null;
        //$(document).off("mousemove");
      }
    }
  },
}
