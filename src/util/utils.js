export default {
  simpleDateFormat(date = new Date(), pattern = 'yyyy-MM-dd') {
    if (!/GMT\+0800/g.test(date.toString())) {
      date = this.convertCST2GMT(date.toString());
    }
    var o = {
      'M+': date.getMonth() + 1, // 月份
      'd+': date.getDate(), // 日
      'H+': date.getHours(), // 小时
      'm+': date.getMinutes(), // 分
      's+': date.getSeconds(), // 秒
      'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
      'S': date.getMilliseconds() // 毫秒
    };
    if (/(y+)/.test(pattern)) pattern = pattern.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    for (var k in o) { if (new RegExp('(' + k + ')').test(pattern)) pattern = pattern.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length))); }
    return pattern;
  },
  convertCST2GMT(dateStr) {
    if (!dateStr) return '';
    var dateStrArr = dateStr.trim().split(' ');
    var strGMT = `${dateStrArr[0]} ${dateStrArr[1]} ${dateStrArr[2]} ${dateStrArr[5]} ${dateStrArr[3]} GMT+0800`;
    return new Date(strGMT);
  }
}
