const formatTime = date => {
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  return [hour, minute].map(formatNumber).join(':')
}
const formatDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return [year, month, day].map(formatNumber).join('-') 
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
/*
   * Unix时间戳转换成日期格式  FormatDateTime("1497232433000")
   * @param UnixTime Unix时间戳
   * @return yyyy-MM-dd HH:mm:ss
   */
function Formatunixtime(UnixTime) {
  var date = new Date(parseInt(UnixTime*1000));
  var h = date.getHours();
  h = h < 10 ? ('0' + h) : h;
  var minute = date.getMinutes();
  minute = minute < 10 ? ('0' + minute) : minute;
  return h + ':' + minute ;
};
function Formatunixtimeh(UnixTime) {
  var date = new Date(parseInt(UnixTime * 1000));
  var h = date.getHours();
  h = h < 10 ? ('0' + h) : h;
  return h;
};
function Formatunixtimem(UnixTime) {
  var date = new Date(parseInt(UnixTime * 1000));
  var minute = date.getMinutes();
  minute = minute < 10 ? ('0' + minute) : minute;
  return minute;
};
function Formatunixdate(UnixTime) {
  var date = new Date(parseInt(UnixTime * 1000));
  var y = date.getFullYear();
  var m = date.getMonth() + 1;
  m = m < 10 ? ('0' + m) : m;
  var d = date.getDate();
  d = d < 10 ? ('0' + d) : d;
  return y + '-' + m + '-' + d;
};
function Formatunix(UnixTime) {
  var date = new Date(parseInt(UnixTime * 1000));
  var y = date.getFullYear();
  var m = date.getMonth() + 1;
  m = m < 10 ? ('0' + m) : m;
  var d = date.getDate();
  d = d < 10 ? ('0' + d) : d;
  var h = date.getHours();
  h = h < 10 ? ('0' + h) : h;
  var minute = date.getMinutes();
  minute = minute < 10 ? ('0' + minute) : minute;
  return y + '-' + m + '-' + d + ' ' + h + ':' + minute;
};
function getTimeStamp(isostr) {
  var parts = isostr.match(/\d+/g);
  return new Date(parts[0] + '-' + parts[1] + '-' + parts[2] + ' ' + parts[3] + ':' + parts[4] + ':' + parts[5]).getTime();
}
module.exports = {
  formatTime: formatTime,
  formatDate:formatDate,
  Formatunixtime: Formatunixtime,
  Formatunixdate: Formatunixdate,
  Formatunix: Formatunix,
  getTimeStamp: getTimeStamp,
  Formatunixtimeh:Formatunixtimeh,
  Formatunixtimem: Formatunixtimem
}
