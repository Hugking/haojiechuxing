// pages/home/home.js
const app = getApp()
var QQMapWX = require('../../libs/qqmap-wx-jssdk.min.js');
var util = require('../../utils/util.js');
let hour = null
let min = null
var addrCopy = function(item) {
  var addr = []
  for (var i = 0; i < item.length; i++) {
    addr.push(item[i].name)
  }
  return addr
}
// ["平顶山学院", "平顶山学院医学院", "河南城建学院西门", "河南城建学院北门", '河南城建学院东门', '平顶山站', '平顶山西站', '平顶山汽车站','平顶山长途汽车站']
// ["平顶山学院", "平顶山学院医学院", "河南城建学院西门", "河南城建学院北门", '河南城建学院东门', '平顶山站', '平顶山西站', '平顶山汽车站', "漯河西站", "许昌东站", "郑州新郑国际机场", "郑州东站", "郑州站", "郑州地铁站"]
//["平顶山学院", "平顶山学院医学院", "河南城建学院西门", "河南城建学院北门", '河南城建学院东门', '平顶山站', '平顶山西站', '平顶山汽车站', '平顶山长途汽车站', "平顶山市区", "鲁山", "叶县", "漯河西站", "许昌东站", "郑州新郑国际机场", "郑州东站", "郑州站", "郑州地铁站", "郑州(三环内)"]
var addr = addrCopy(app.globalData.hotaddr)
Page({
  data: {
    Screenheight: app.globalData.Screenheight,
    Screenwidth: app.globalData.Screenwidth,
    mapheight: '300px',
    tabbar: 0,
    city: '',
    hotaddr: app.globalData.hotaddr,
    sthotaddr: ["平顶山学院", "平顶山学院医学院", "河南城建学院西门", "河南城建学院北门", '河南城建学院东门', '平顶山站', '平顶山西站', '平顶山汽车站', '平顶山长途汽车站'],
    enhotaddr: ["平顶山学院", "平顶山学院医学院", "河南城建学院西门", "河南城建学院北门", '河南城建学院东门', '平顶山站', '平顶山西站', '平顶山汽车站', '平顶山长途汽车站'],
    peonumarr: ['1', '2', '3', '4'],
    indexr: null,
    indexs: null,
    indexe: null,
    userInfo: {},
    date: '2019-01-01',
    distance: '--',
    cost: '-.--',
    desc: '',
    role: null,
    markers: null,
    markere: null,
    longitude: null,
    latitude: null,
    markerfin: null,
    polyline: null,
    hidden: false,
    nowtime: util.Formatunixtime(Date.parse(new Date()) / 1000),
    nowdate: util.Formatunixdate(Date.parse(new Date()) / 1000),
    multiArray: null,
    multiIndex: [0, 0, 0],
    hourarr: null,
    minarr: null,
    pre_time_str: null,
    time_over_order: null,
    animationData: {}, //公告动画
    announcementText: "本小程序致力于车站与高校的出行服务，如有需要请联系管理员微信18637501671！晚上8:00至早上7:00为夜班，若无车使用，可即时退款，由于您选择的是拼车服务,所以建议您选择最迟出发时间为火车发车前的1个半小时,便于车辆调度 例:15:30的火车 建议最迟选择时间为14:00~14:20", //公告内容
  },
  hourarr(e) {
    var arr = []
    for (var i = parseInt(hour); i < 24; i++) {
      arr.push(i.toString())
    }
    //console.log(arr)
    if (arr.length != 0) {
      if (min >= 40) {
        arr.shift()
      }
      return arr
    } else {
      wx.showToast({
        title: '时间错误',
        icon: 'none'
      })
    }
  },
  minarr(e) {
    var arr = []
    if (min < 20) {
      arr = ['20~40', '40~59']
    } else {
      if (min < 40) {
        arr = ['40~59']
      } else {
        arr = ['00~20', '20~40', '40~59']
      }
    }
    return arr
  },
  bindMultiPickerChange(e) {
    //console.log('picker发送选择改变，携带值为', e.detail.value)
    console.log(this.data.multiArray[0][this.data.multiIndex[0]],
      this.data.multiArray[1][this.data.multiIndex[1]],
      this.data.multiArray[2][this.data.multiIndex[2]]
    )
    this.setdate();
    var that = this
    that.setData({
      cost: "-.--",
      multiIndex: e.detail.value,
    })
    var query = wx.createSelectorQuery();
    query.select('#getheight1').boundingClientRect()
    query.select('#getheight2').boundingClientRect()
    query.exec(function(res) {
      that.setData({
        mapheight: (app.globalData.windowHeight - res[0].height - res[1].height) + 'px'
      })
    })
  },
  bindMultiPickerColumnChange(e) {
    //console.log('修改的列为', e.detail.column, '，值为', e.detail.value)
    const data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    }
    // ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23']
    data.multiIndex[e.detail.column] = e.detail.value
    switch (e.detail.column) {
      case 0:
        switch (data.multiIndex[0]) {
          case 0:
            data.multiArray[1] = this.data.hourarr
            data.multiArray[2] = this.data.minarr
            break
          case 1:
            data.multiArray[1] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23']
            data.multiArray[2] = ['00~20', '20~40', '40~59']
            break
        }
        data.multiIndex[1] = 0
        data.multiIndex[2] = 0
        break
      case 1:
        switch (data.multiIndex[0]) {
          case 0:
            switch (data.multiIndex[1]) {
              case 0:
                data.multiArray[2] = this.data.minarr
                break
              case 1:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
              case 2:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
              case 3:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
              case 4:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
              case 5:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
              case 6:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
              case 7:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
              case 8:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
              case 9:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
              case 10:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
              case 11:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
              case 12:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
              case 13:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
              case 14:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
              case 15:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
              case 16:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
              case 17:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
              case 18:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
              case 19:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
              case 20:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
              case 21:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
              case 22:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
              case 23:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
            }
            break
          case 1:
            switch (data.multiIndex[1]) {
              case 0:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
              case 1:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
              case 2:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
              case 3:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
              case 4:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
              case 5:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
              case 6:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
              case 7:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
              case 8:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
              case 9:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
              case 10:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
              case 11:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
              case 12:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
              case 13:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
              case 14:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
              case 15:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
              case 16:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
              case 17:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
              case 18:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
              case 19:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
              case 20:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
              case 21:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
              case 22:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
              case 23:
                data.multiArray[2] = ['00~20', '20~40', '40~59']
                break
            }
            break
        }
        data.multiIndex[2] = 0
        break
    }
    console.log(data.multiIndex)
    this.setData(data)
  },
  onLoad: function() {
    var that = this
    that.Passenger_sign_in();
    that.Driver_sign_in();
    var role = wx.getStorageSync('role') || ''
    if (role == 'Driver') {
      wx.reLaunch({
        url: '../driver/driver',
      })
    } else {
      wx.BaaS.auth.loginWithWechat().then(user => {
        // 静默登录成功
      }, err => {
        // 登录失败
      })

      if (role == 'Passenger') {
        if (wx.getStorageSync('passenger_register')) {

        } else {
          wx.showToast({
            title: '未注册，请退出登录后注册',
            icon: 'none'
          })
        }
      }
      this.getlocation();
      that.setData({
        userInfo: wx.getStorageSync('userinfo'),
        time: util.Formatunixtime(Date.parse(new Date()) / 1000 + 1800),
        date: util.Formatunixdate(Date.parse(new Date()) / 1000),
        role: role
      })
      this.time_over_order()
    }
    var query = wx.createSelectorQuery();
    query.select('#getheight1').boundingClientRect()
    query.select('#getheight2').boundingClientRect()
    query.exec(function(res) {
      //console.log(res);
      //console.log(res[0].height, res[1].height, app.globalData.windowHeight);
      that.setData({
        mapheight: (app.globalData.windowHeight - res[0].height - res[1].height) + 'px'
      })
    })
  },
  Passenger_sign_in: function(e) {
    var userinfo = wx.getStorageSync('userinfo');
    console.log(userinfo)
    if (userinfo) {
      let query = new wx.BaaS.Query()
      let Passenger = new wx.BaaS.TableObject('Passenger')
      // 不设置查询条件
      Passenger.setQuery(query.contains('openid', userinfo.openid)).find().then(res => {
        // success
        console.log("查询到的乘客信息", res.data.objects)
        if (res.data.objects[0] == null) {
          console.log("查询失败，请先注册")
          wx.setStorageSync('passenger_register', false)
        } else {
          console.log("查询成功")
          wx.setStorageSync('passenger_register', true)
        }

      }, err => {
        // err
        console.log("查询过程中失败", err)
      })
    } else {}
  },
  Driver_sign_in: function(e) {
    var userinfo = wx.getStorageSync('userinfo');
    //console.log(userinfo)
    if (userinfo) {
      let query = new wx.BaaS.Query()
      let Driver = new wx.BaaS.TableObject('Driver')
      // 不设置查询条件
      Driver.setQuery(query.contains('openid', userinfo.openid)).find().then(res => {
        // success
        console.log("查询到的司机信息", res.data.objects)
        if (res.data.objects[0] == null) {
          console.log("查询失败，请先注册")
          wx.setStorageSync('driver_register', false)
        } else {
          console.log("查询成功")
          wx.setStorageSync('driver_register', true)
        }

      }, err => {
        // err
      })
    } else {

    }
  },
  onShow: function() {
    hour = util.Formatunixtimeh(Date.parse(new Date()) / 1000)
    min = util.Formatunixtimem(Date.parse(new Date()) / 1000)
    console.log(this.hourarr())
    console.log(min, this.minarr())
    this.setData({
      hourarr: this.hourarr(),
      minarr: this.minarr(),
    })
    if (this.data.multiIndex[0] == 1) {
      this.setData({
        multiArray: [
          ['今天', '明天'],
          ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'],
          ['00~20', '20~40', '40~59']
        ]
      })
    } else {
      this.setData({
        multiArray: [
          ['今天', '明天'], this.hourarr(), this.minarr()
        ]
      })
    }
    console.log(this.data.multiArray[0][this.data.multiIndex[0]],
      this.data.multiArray[1][this.data.multiIndex[1]],
      this.data.multiArray[2][this.data.multiIndex[2]]
    )
    this.initAnimation(this.data.announcementText)
    this.setdate();
    this.count_down();
  },
  setdate(e) {
    var today = util.Formatunixdate(Date.parse(new Date()) / 1000) + ' ' + '00:00'
    var todays = new Date(today.replace(/-/g, "/"))
    if (this.data.multiArray[0][this.data.multiIndex[0]] == '今天') {
      this.setData({
        date: util.Formatunixdate(Date.parse(new Date()) / 1000)
      })
      if (this.data.multiArray[2][this.data.multiIndex[2]] == '00~20') {
        var dates = util.Formatunixdate(Date.parse(new Date()) / 1000) + ' ' + this.data.multiArray[1][this.data.multiIndex[1]] + ":" + "00"
        var datelines = new Date(dates.replace(/-/g, "/"))
        this.data.pre_time_str = Date.parse(datelines)
        this.data.datestr = datelines
      } else if (this.data.multiArray[2][this.data.multiIndex[2]] == '20~40') {
        var dates = util.Formatunixdate(Date.parse(new Date()) / 1000) + ' ' + this.data.multiArray[1][this.data.multiIndex[1]] + ":" + "20"
        var datelines = new Date(dates.replace(/-/g, "/"))
        this.data.pre_time_str = Date.parse(datelines)
        this.data.datestr = datelines
      } else if (this.data.multiArray[2][this.data.multiIndex[2]] == '40~59') {
        var dates = util.Formatunixdate(Date.parse(new Date()) / 1000) + ' ' + this.data.multiArray[1][this.data.multiIndex[1]] + ":" + "40"
        var datelines = new Date(dates.replace(/-/g, "/"))
        this.data.pre_time_str = Date.parse(datelines)
        this.data.datestr = datelines
      }
    } else if (this.data.multiArray[0][this.data.multiIndex[0]] == '明天') {
      this.setData({
        date: util.Formatunixdate(Date.parse(todays) / 1000 + 24 * 3600)
      })
      if (this.data.multiArray[2][this.data.multiIndex[2]] == '00~20') {
        var dates = util.Formatunixdate(Date.parse(todays) / 1000 + 24 * 3600) + ' ' + this.data.multiArray[1][this.data.multiIndex[1]] + ":" + "00"
        var datelines = new Date(dates.replace(/-/g, "/"))
        this.data.pre_time_str = Date.parse(datelines)
        this.data.datestr = datelines
      } else if (this.data.multiArray[2][this.data.multiIndex[2]] == '20~40') {
        var dates = util.Formatunixdate(Date.parse(todays) / 1000 + 24 * 3600) + ' ' + this.data.multiArray[1][this.data.multiIndex[1]] + ":" + "20"
        var datelines = new Date(dates.replace(/-/g, "/"))
        this.data.pre_time_str = Date.parse(datelines)
        this.data.datestr = datelines
      } else if (this.data.multiArray[2][this.data.multiIndex[2]] == '40~59') {
        var dates = util.Formatunixdate(Date.parse(todays) / 1000 + 24 * 3600) + ' ' + this.data.multiArray[1][this.data.multiIndex[1]] + ":" + "40"
        var datelines = new Date(dates.replace(/-/g, "/"))
        this.data.pre_time_str = Date.parse(datelines)
        this.data.datestr = datelines
      }
    }
  },
  initAnimation: function(announcementText) {
    var that = this;
    //初始化动画
    var animation = wx.createAnimation({
      duration: 35000,
      timingFunction: 'linear'
    });
    animation.translate(-Number(announcementText.length * 12), 0).step();
    that.setData({
      animationData: animation.export()
    });
    /****************************优化部分*******************************/
    // 重新开始动画
    that.restartAnimation = setInterval(function() {
      animation.translate(150, 0).step({
        duration: 0
      });
      that.setData({
        animationData: animation.export()
      });
      // 延迟3再执行下个动画
      that.sleep(3);
      animation.translate(-Number(announcementText.length * 12), 0).step();
      that.setData({
        animationData: animation.export()
      });
    }.bind(this), 22500);
  },
  sleep: function(num) {
    var nowTime = new Date();
    var exitTime = nowTime.getTime() + num;
    while (true) {
      nowTime = new Date();
      if (nowTime.getTime() > exitTime)
        return;
    }
  },
  onUnload: function() {
    //清除定时器
    clearInterval(this.restartAnimation);
  },
  onReady: function() {
    var first_tost = wx.getStorageSync('first_tost')
    if (first_tost) {
      this.setData({
        modalName: 'Modal',
        hidden: true
      })
      wx.setStorageSync('first_tost', false)
    } else {}
  },
  onShareAppMessage() {
    return {
      title: '豪杰出行',
      paths: '/pages/home/home'
    }
  },
  time_over_order(e) {
    if (this.data.role == 'Passenger') {
      var Order = new wx.BaaS.TableObject('Order')
      var query = new wx.BaaS.Query()
      query.compare("useropenid", '=', this.data.userInfo.openid)
      query.compare('city', '=', "平顶山市");
      query.compare('delete', '=', false);
      query.compare('pay_status', '=', true);
      query.compare('cancel', '=', false);
      query.compare('isget', '=', false);
      query.compare('confirm_isget', '=', false);
      query.compare('completion', '=', false);
      // query.compare('in_car', '=', false);
      // query.compare('reminder', '=', false);
      // query.compare('settle', '=', false);
      query.compare('pre_time_str', '>', Date.parse(new Date()) - 1800 * 1000);
      query.compare('pre_time_str', '<', Date.parse(new Date()) + 1800 * 1000);
      Order.setQuery(query).limit(2).orderBy('-pre_time').find().then(res => {
        // success
        console.log("临近订单", res.data.objects[0])
        if (res.data.objects[0]) {
          if (res.data.objects[0].pre_time_str + 20 * 60 * 1000 < Date.parse(new Date()) && Date.parse(new Date()) < res.data.objects[0].pre_time_str + 30 * 60 * 1000) {
            this.setData({
              modalName: 'DialogModal2',
              hidden: true,
              time_over_order: res.data.objects
            })
          } else {
            this.setData({
              time_over_order: null
            })
          }
        }
      })
    } else {}
  },
  getlocation: function() {
    var that = this
    that.setData({
      polyline: null
    })
    var qqmapsdk = new QQMapWX({
      key: '5U7BZ-QDB6X-MDS46-ZWGSA-WXRKZ-SMBVD'
    });
    qqmapsdk.reverseGeocoder({
      success: function(res) { //成功后的回调
        console.log('地理位置信息', res.result.address_component.city, res.result);
        that.setData({
          city: res.result.address_component.city,
          latitude: res.result.location.lat,
          longitude: res.result.location.lng,
        })
      },
      fail: function(info) {
        console.log(info)
        wx.showModal({
          title: info
        })
      }
    })
  },
  getuserinfo(e) {
    // console.log(wx.getStorageSync('userinfo'))
    wx.showLoading();
    if (this.data.userInfo) {
      wx.navigateTo({
        url: '../sign_in/sign_in',
      })
      wx.hideLoading()
    } else {
      wx.BaaS.auth.loginWithWechat(e).then(res => {
        // res 包含用户完整信息
        console.log('获取到的用户信息(已成功)', res)
        wx.navigateTo({
          url: '../sign_in/sign_in',
        })
        wx.setStorageSync('userinfo', res)
      })
      wx.hideLoading()
    }
    wx.hideLoading()
  },
  exit(e) {
    try {
      wx.clearStorageSync()
      wx.reLaunch({
        url: '../home/home',
      })
    } catch (e) {
      // Do something when catch error
      console.log('清除缓存失败', e)
    }
  },
  Pickerpeonum(e) {
    this.setData({
      indexr: e.detail.value
    })
  },
  desc(e) {
    console.log(e.detail.value)
    if (e.detail.value == '') {
      this.setData({
        desc: "无"
      })
    } else {
      this.setData({
        desc: e.detail.value
      })
    }
  },
  pre_pay(e) {
    var that = this
    if (that.data.role == null || that.data.role == '') {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
    } else {
      //this.data.datestr = this.data.date+' '+this.data.time
      //  var datelines = new Date(this.data.datestr.replace(/-/g, "/"))
      //this.data.pre_time_str = Date.parse(datelines)
      //console.log(this.data.pre_time_str)
      //var strtime = this.data.datestr
      var datestr = this.data.datestr
      datestr.setHours(datestr.getHours(), datestr.getMinutes()); //date.getTimezoneOffset()时区转化
      var ISOstr = datestr.toISOString() //ISO8901-8小时
      var startpoint = new wx.BaaS.GeoPoint(that.data.markerfin[0].longitude, that.data.markerfin[0].latitude)
      var endpoint = new wx.BaaS.GeoPoint(that.data.markerfin[1].longitude, that.data.markerfin[1].latitude)
      let order_info = {
        startname: that.data.sthotaddr[that.data.indexs],
        endname: that.data.enhotaddr[that.data.indexe],
        startpoint: startpoint,
        endpoint: endpoint,
        distance: that.data.distance,
        useropenid: that.data.userInfo.openid,
        pre_time: ISOstr,
        pre_time_str: this.data.pre_time_str,
        cost: that.data.cost
      }
      //console.log("订单数据", order_info)
      that.setData({
        order_info: order_info
      })
      setTimeout(function() {
        wx.navigateTo({
          url: '../pay_order/pay_order',
        })
      }, 500)
    }
  },
  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target,
      hidden: true
    })
  },
  hideModal(e) {
    var that = this
    that.setData({
      modalName: null,
      hidden: false
    })
  },
  selstart(e) {
    for (var i = 0; i < this.data.hotaddr.length; i++) {
      if (this.data.sthotaddr[this.data.indexs] == this.data.hotaddr[i].name) {
        var marker = {
          id: 0,
          latitude: this.data.hotaddr[i].latitude,
          longitude: this.data.hotaddr[i].longitude,
          iconPath: '../../img/marker.png',
          width: 22,
          height: 32,
        }
        let m = []
        m.push(marker)
        //console.log(m)
        this.data.markers = marker
        this.setData({
          markerfin: m,
          latitude: this.data.hotaddr[i].latitude,
          longitude: this.data.hotaddr[i].longitude,
          polyline: null
        })
        if (this.data.markere != null) {
          this.waydetail();
        }else{
        }
      }
    }
  },
  selend(e) {
    for (var i = 0; i < this.data.hotaddr.length; i++) {
      if (this.data.enhotaddr[this.data.indexe] == this.data.hotaddr[i].name) {
        var marker = {
          id: 0,
          latitude: this.data.hotaddr[i].latitude,
          longitude: this.data.hotaddr[i].longitude,
          iconPath: '../../img/marker.png',
          width: 22,
          height: 32,
        }
        this.data.markere = marker
        this.setData({
          latitude: this.data.hotaddr[i].latitude,
          longitude: this.data.hotaddr[i].longitude,
        })
        if (this.data.markers != null) {
          this.waydetail();
        } else {
          wx.showToast({
            title: '请选择出发地',
            icon:'none'
          })
        }
      }
    }

  },
  waydetail(e) {
    var that = this
    var qqmapsdk = new QQMapWX({
      key: '5U7BZ-QDB6X-MDS46-ZWGSA-WXRKZ-SMBVD'
    });
    let markerfin = [{
      iconPath: "../../img/mapicon_navi_s.png",
      id: 0,
      latitude: that.data.markers.latitude,
      longitude: that.data.markers.longitude, //高德返回的是数组
      width: 23,
      height: 33
    }, {
      iconPath: "../../img/mapicon_navi_e.png",
      id: 0,
      latitude: that.data.markere.latitude,
      longitude: that.data.markere.longitude,
      width: 24,
      height: 34
    }]
    that.setData({
      markerfin: markerfin
    })
    app.globalData.marker = {
      'st': that.data.markers.latitude + ',' + that.data.markers.longitude,
      'en': that.data.markere.latitude + ',' + that.data.markere.longitude,
    }
    qqmapsdk.direction({
      mode: 'driving',//可选值：'driving'（驾车）、'walking'（步行）、'bicycling'（骑行），不填默认：'driving',可不填
      //from参数不填默认当前地址
      from: app.globalData.marker['st'],
      to: app.globalData.marker['en'],
      success: function (res) {
        //console.log(res);
        var ret = res;
        var coors = ret.result.routes[0].polyline, pl = [];
        //坐标解压（返回的点串坐标，通过前向差分进行压缩）
        var kr = 1000000;
        for (var i = 2; i < coors.length; i++) {
          coors[i] = Number(coors[i - 2]) + Number(coors[i]) / kr;
        }
        //将解压后的坐标放入点串数组pl中
        for (var i = 0; i < coors.length; i += 2) {
          pl.push({ latitude: coors[i], longitude: coors[i + 1] })
        }
        //console.log(pl)
        //设置polyline属性，将路线显示出来,将解压坐标第一个数据作为起点
        that.setData({
          latitude: pl[0].latitude,
          longitude: pl[0].longitude,
          polyline: [{
            points: pl,
            color: '#0081ff',
            width: 4
          }]
        })
        if (ret.result.routes[0] && ret.result.routes[0].distance) {
          that.setData({
            distance: ((ret.result.routes[0].distance - (ret.result.routes[0].distance) % 10) / 10) / 100
          });
        }
      },
      fail: function (error) {
        console.error(error);
        // wx.showModal({
        //   title: error
        // })
      }
    });
  },
  cost(e) {
    wx.showNavigationBarLoading();
    var that = this
    // this.data.datestr = this.data.date + ' ' + this.data.time
    // var datelines = new Date(this.data.datestr.replace(/-/g, "/"))
    // this.data.pre_time_str = Date.parse(datelines)
    // console.log(this.data.pre_time_str)
    var strtime = that.data.date + ' ' + '20:00'
    var date = new Date(strtime.replace(/-/g, "/"))
    var timeline = Date.parse(date) //日期转时间戳
    //console.log(timeline)
    var night = false;
    if (this.data.pre_time_str <= timeline && this.data.pre_time_str >= timeline - 14 * 3600 * 1000) {
      night = false
    } else {
      night = true
    }
    console.log("晚上", night)
    wx.cloud.callFunction({
      // 云函数名称
      name: 'send_cost',
      // 传给云函数的参数
      data: {
        startname: that.data.sthotaddr[that.data.indexs],
        endname: that.data.enhotaddr[that.data.indexe],
        night: night
      },
      success(res) {
        //console.log("微信云函数",res.result) // 3
        if (res.result.action[0]) {
          console.log("计算费用", res.result.action[0][1].cost)
          if (res.result.action[0][1].cost == null) {
            wx.hideNavigationBarLoading();
            wx.showToast({
              title: '抱歉,该时间暂不可预订',
              icon: 'none',
              duration: 2000
            })
          } else {
            that.setData({
              cost: res.result.action[0][1].cost
            })
            var query = wx.createSelectorQuery();
            query.select('#getheight1').boundingClientRect()
            query.select('#getheight2').boundingClientRect()
            query.exec(function(res) {
              //console.log(res);
              //console.log(res[0].height, res[1].height, app.globalData.windowHeight);
              that.setData({
                mapheight: (app.globalData.windowHeight - res[0].height - res[1].height) + 'px'
              })
            })
            wx.hideNavigationBarLoading();
          }
        } else {
          console.log("没有此路线")
          wx.hideNavigationBarLoading();
          wx.showToast({
            title: '抱歉,此路线暂不支持',
            icon: 'none',
            duration: 2000
          })
        }
      },
      fail: console.error
    })
  },
  tabsel(e) {
    //console.log(e.currentTarget.id)
    this.setData({
      tabbar: e.currentTarget.id
    })
  },
  Pickerstart(e) {
    //console.log(e);
    var that = this
    that.setData({
      indexs: e.detail.value,
      cost: "-.--"
    })
    var query = wx.createSelectorQuery();
    query.select('#getheight1').boundingClientRect()
    query.select('#getheight2').boundingClientRect()
    query.exec(function(res) {
      //console.log(res);
      //console.log(res[0].height, res[1].height, app.globalData.windowHeight);
      that.setData({
        mapheight: (app.globalData.windowHeight - res[0].height - res[1].height) + 'px'
      })
    })
    that.selstart();
  },
  Pickerend(e) {
    //console.log(e);
    var that = this
    that.setData({
      indexe: e.detail.value,
      cost: "-.--"
    })
    var query = wx.createSelectorQuery();
    query.select('#getheight1').boundingClientRect()
    query.select('#getheight2').boundingClientRect()
    query.exec(function(res) {
      //console.log(res);
      //console.log(res[0].height, res[1].height, app.globalData.windowHeight);
      that.setData({
        mapheight: (app.globalData.windowHeight - res[0].height - res[1].height) + 'px'
      })
    })
    that.selend();
  },
  // TimeChange(e) {
  //   this.setData({
  //     time: e.detail.value,
  //     cost:'-.--'
  //   })
  // },
  // DateChange(e) {
  //   console.log(e.detail.value)
  //   this.setData({
  //     cost: '-.--'
  //   })
  //   var that = this
  //   if (e.detail.value != util.formatDate(new Date())) {
  //     that.setData({
  //       date: e.detail.value,
  //       today: false,
  //       time: util.formatTime(new Date())
  //     })
  //   } else {
  //     let p_time = Date.parse(new Date()) / 1000 + 1800
  //     //console.log(util.Formatunix(p_time))
  //     if (util.Formatunixdate(p_time) == that.data.data) {
  //       that.setData({
  //         date: e.detail.value,
  //         today: true,
  //         time: util.Formatunixtime(p_time)
  //       })
  //     } else {
  //       setTimeout(function() {
  //         that.setData({
  //           date: util.Formatunixdate(p_time),
  //           today: true,
  //           time: util.Formatunixtime(p_time)
  //         })
  //       }, 300)
  //     }
  //   }
  //   var query = wx.createSelectorQuery();
  //   query.select('#getheight1').boundingClientRect()
  //   query.select('#getheight2').boundingClientRect()
  //   query.exec(function(res) {
  //     that.setData({
  //       mapheight: (app.globalData.windowHeight - res[0].height - res[1].height) + 'px'
  //     })
  //   })
  // },
  formSubmit: function(e) {
    if (e.detail.formId != 'the formId is a mock one') {
      this.setData({
        formIdString: e.detail.formId + "," + this.data.formIdString
      })
      var formIds = this.data.formIdString.split(",");
      //console.log(formIds.length);
      for (var i = 0; i < formIds.length - 1; i++) {
        //console.log(formIds[i], i)
        wx.BaaS.wxReportTicket(formIds[i])
      }
    }
    console.log(e.detail, this.data.formIdString)
  },
  now_city(e) {
    this.getlocation();
  },
  log(e) {
    wx.navigateTo({
      url: '../logs/logs',
    })
  },
  count_down: function(e) {
    var that = this;
    if (wx.getStorageSync('role') == 'Passenger') {
      var my_time = Date.parse(new Date())
      wx.setStorageSync('my_time', my_time)
      if (!wx.getStorageSync('ok_time')) {
        wx.setStorageSync('ok_time', my_time + 10 * 60 * 1000)
      } else {
        if (wx.getStorageSync('my_time') >= wx.getStorageSync('ok_time')) {
          that.time_over_order();
          wx.removeStorageSync('ok_time')
        }
      }
      setTimeout(function() {
        that.count_down()
      }, 1000)
    }
  },
  yes(e) {
    this.hideModal()
  },
  no(e) {
    if (this.data.time_over_order) {
      let Order = new wx.BaaS.TableObject('Order')
      var query = new wx.BaaS.Query()
      query.compare("useropenid", '=', this.data.userInfo.openid)
      query.compare('city', '=', "平顶山市");
      query.compare('delete', '=', false);
      query.compare('pay_status', '=', true);
      query.compare('cancel', '=', false);
      query.compare('isget', '=', false);
      query.compare('confirm_isget', '=', false);
      query.compare('completion', '=', false);
      query.compare('pre_time_str', '>', Date.parse(new Date()) - 1800 * 1000);
      query.compare('pre_time_str', '<', Date.parse(new Date()) + 1800 * 1000);
      Order.setQuery(query).limit(2).orderBy('-pre_time').find().then(res => {
        if (res.data.objects[0]) {
          if (res.data.objects[0].id == this.data.time_over_order[0].id) {
            let order = Order.getWithoutData(this.data.time_over_order[0].id)
            order.set('cancel', true)
            order.set('cancel_reason', '无人接单')
            order.update().then(res => {
              console.log('无人接单，用户退款')
              wx.BaaS.invoke('send_admin', {
                "tem_id": "_WYN8YxLxpKus16E0OatAyH9bvl8OJQrgbxh4ScGGwk",
                "id": res.data.id,
                "data": util.Formatunix(res.data.pre_time_str / 1000) + ' ' + res.data.startname + "=>" + res.data.endname,
                "time": util.Formatunix(Date.parse(new Date()) / 1000),
                "cost": res.data.cost,
                "name": res.data.username,
                "reason": '无人接单，用户退款'
              }).then(res => {
                console.log("退款提醒", res)
              })
              wx.BaaS.invoke('pay_black', {
                "trade_no": res.data['trade_no']
              }).then(res => {
                console.log(res)
                wx.showToast({
                  title: '退款成功',
                })
                this.hideModal();
              })
            })
          }
        }
      })
    }
  }
})