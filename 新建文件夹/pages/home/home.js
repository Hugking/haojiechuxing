// pages/home/home.js
const app = getApp()
var amapFile = require('../../libs/amap-wx.js');
var util = require('../../utils/util.js');
Page({
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom,
    Screenheight: app.globalData.Screenheight,
    Screenwidth: app.globalData.Screenwidth,
    mapheight: '300px',
    tabbar: 0,
    peonumarr: ['1', '2', '3', '4'],
    sthotaddr: ["平顶山学院", "平顶山学院医学院", "河南城建学院西门", "河南城建学院北门", '平顶山站', '平顶山西站', '平顶山长途汽车站', '平顶山汽车站', "漯河西站", "许昌东站", "郑州新郑国际机场", "郑州东站", "郑州站", "郑州地铁站"],
    enhotaddr: ["平顶山学院", "平顶山学院医学院", "河南城建学院西门", "河南城建学院北门", '平顶山站', '平顶山西站', '平顶山长途汽车站', '平顶山汽车站', "漯河西站", "许昌东站", "郑州新郑国际机场", "郑州东站", "郑州站", "郑州地铁站"],
    city:'',
    hotaddr: app.globalData.hotaddr,
    indexs: null,
    indexe: null,
    indexr: null,
    userInfo: {},
    time: '12:01',
    date: '2019-01-01',
    distance: '--',
    cost: '-.--',
    desc: '',
    weather:'天气信息',
    role: null,
    markers: null,
    markere: null,
    longitude: null,
    latitude: null,
    markerfin: null,
    polyline: null,
    hidden: false
  },
  onLoad: function() {
    var that = this
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
      this.getlocation();
      that.setData({
        userInfo: wx.getStorageSync('userinfo'),
        time: util.Formatunixtime(Date.parse(new Date()) / 1000 + 1800),
        date: util.Formatunixdate(Date.parse(new Date()) / 1000),
        role: role
      })
    }
    var query = wx.createSelectorQuery();
    query.select('#getheight1').boundingClientRect()
    query.select('#getheight2').boundingClientRect()
    query.exec(function (res) {
      //console.log(res);
      //console.log(res[0].height, res[1].height, app.globalData.windowHeight);
      that.setData({
        mapheight: (app.globalData.windowHeight - res[0].height - res[1].height) + 'px'
      })
    })
  },
  onShow: function() {
  },
  getlocation: function() {
    var that = this
    that.setData({
      polyline: null
    })
    var myAmapFun = new amapFile.AMapWX({
      key: '3634f9de8bb3671b2481a1cfeda77202'
    });
    myAmapFun.getRegeo({
      success: function(data) {
        //成功回调
        console.log('地理位置信息', data[0].regeocodeData.addressComponent.city, data[0])
        that.setData({
          latitude: data[0].latitude,
          longitude: data[0].longitude,
          city: data[0].regeocodeData.addressComponent.city
        })
      },
      fail: function(info) {
        //失败回调l
        console.log(info)
        wx.showModal({
          title: info.errMsg
        })
      }
    })
    myAmapFun.getWeather({
      success: function (data) {
        //成功回调
        console.log('地理天气信息', data)
        that.setData({
          weather: data.weather.text + " " + data.weather.data + ' ' + data.humidity.text + " " + data.humidity.data
        })
      },
      fail: function (info) {
        //失败回调
        console.log(info)
        wx.showModal({
          title: info.errMsg
        })
      }
    })
  },
  getuserinfo(e) {
    //console.log(wx.getStorageSync('userinfo'))
    wx.showNavigationBarLoading();
    if (wx.getStorageSync('userinfo')) {
      setTimeout(function() {
        wx.navigateTo({
          url: '../sign_in/sign_in',
        })
      }, 500)
      wx.hideNavigationBarLoading()
    } else {
      wx.BaaS.auth.loginWithWechat(e).then(res => {
        // res 包含用户完整信息
        console.log('获取到的用户信息(已成功)', res)
        wx.setStorageSync('userinfo', res)
        app.globalData.userInfo = res
        this.setData({
          userInfo: res
        })
        setTimeout(function () {
          wx.navigateTo({
            url: '../sign_in/sign_in',
          })
        }, 500)})
      wx.hideNavigationBarLoading()
    }
    wx.hideNavigationBarLoading()
  },
  Pickerpeonum(e) {
    this.setData({
      indexr: e.detail.value
    })
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
  preModal(e) {
    //console.log(e.currentTarget)
    var that = this
    var that = this
    if (that.data.role == null || that.data.role == '') {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
    } else {
      that.setData({
        modalName: e.currentTarget.dataset.target,
        hidden: true
      })
    }
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
    if (that.data.indexr == null) {
      wx.showToast({
        title: '还未选择乘车人数',
        icon: 'none'
      })
    } else {
      var strtime = that.data.date + ' ' + that.data.time
      var date = new Date(strtime.replace(/-/g, "/"))
      var time = Date.parse(date) //日期转时间戳
      date.setHours(date.getHours(), date.getMinutes()); //date.getTimezoneOffset()时区转化
      var ISOstr = date.toISOString() //ISO8901-8小时
      var startpoint = new wx.BaaS.GeoPoint(that.data.markerfin[0].longitude, that.data.markerfin[0].latitude)
      var endpoint = new wx.BaaS.GeoPoint(that.data.markerfin[1].longitude, that.data.markerfin[1].latitude)
      let order_info = {
        startname: that.data.sthotaddr[that.data.indexs],
        endname: that.data.enhotaddr[that.data.indexe],
        startpoint: startpoint,
        endpoint: endpoint,
        distance: that.data.distance,
        desc: that.data.desc,
        peonum: that.data.peonumarr[that.data.indexr],
        useropenid: that.data.userInfo.openid,
        pre_time: ISOstr,
        pre_time_str: time,
        cost: (parseInt(that.data.cost) * parseInt(that.data.peonumarr[that.data.indexr])).toString()
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
        }
      }
    }
    //this.waydetail();
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
        this.waydetail();
      }
    }

  },
  waydetail(e) {
    var that = this
    var myAmapFun = new amapFile.AMapWX({
      key: '3634f9de8bb3671b2481a1cfeda77202'
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
      'st': that.data.markers.longitude + ',' + that.data.markers.latitude,
      'en': that.data.markere.longitude + ',' + that.data.markere.latitude
    }
    myAmapFun.getDrivingRoute({
      origin: app.globalData.marker['st'],
      destination: app.globalData.marker['en'],
      success: function(data) {
        console.log(data)
        var points = [];
        if (data.paths && data.paths[0] && data.paths[0].steps) {
          var steps = data.paths[0].steps;
          for (var i = 0; i < steps.length; i++) {
            var poLen = steps[i].polyline.split(';');
            for (var j = 0; j < poLen.length; j++) {
              points.push({
                longitude: parseFloat(poLen[j].split(',')[0]),
                latitude: parseFloat(poLen[j].split(',')[1])
              })
            }
          }
        }
        that.setData({
          polyline: [{
            points: points,
            color: "#0091ff",
            width: 6
          }]
        });
        if (data.paths[0] && data.paths[0].distance) {
          that.setData({
            distance: ((data.paths[0].distance - (data.paths[0].distance) % 10) / 10) / 100
          });
        }
      }
    })
  },
  cost(e) {
    wx.showNavigationBarLoading();
    var that = this
    var strtimeline = that.data.date + ' ' + '21:00'
    var dateline = new Date(strtimeline.replace(/-/g, "/"))
    console.log(dateline)
    var timeline = Date.parse(dateline) //日期转时间戳
    var strtime = that.data.date + ' ' + that.data.time
    var date = new Date(strtime.replace(/-/g, "/"))
    var time = Date.parse(date) //日期转时间戳
    var night;
    if (time <= timeline && time >= timeline - 14 * 3600 * 1000) {
      night = false
    } else {
      night = true
    }
    console.log("晚上",night)
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
    query.exec(function (res) {
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
    query.exec(function (res) {
      //console.log(res);
      //console.log(res[0].height, res[1].height, app.globalData.windowHeight);
      that.setData({
        mapheight: (app.globalData.windowHeight - res[0].height - res[1].height) + 'px'
      })
    })
    that.selend();
  },
  TimeChange(e) {
    var that = this
    //console.log(e.detail.value)
    that.setData({
      time: e.detail.value,
      cost: "-.--"
    })
    var query = wx.createSelectorQuery();
    query.select('#getheight1').boundingClientRect()
    query.select('#getheight2').boundingClientRect()
    query.exec(function (res) {
      //console.log(res);
      //console.log(res[0].height, res[1].height, app.globalData.windowHeight);
      that.setData({
        mapheight: (app.globalData.windowHeight - res[0].height - res[1].height) + 'px'
      })
    })
  },
  DateChange(e) {
    console.log(e.detail.value)
    var that = this
    if (e.detail.value != util.formatDate(new Date())) {
      that.setData({
        date: e.detail.value,
        today: false,
        time: util.formatTime(new Date())
      })
    } else {
      let p_time = Date.parse(new Date()) / 1000 + 1800
      //console.log(util.Formatunix(p_time))
      if (util.Formatunixdate(p_time) == that.data.data) {
        that.setData({
          date: e.detail.value,
          today: true,
          time: util.Formatunixtime(p_time)
        })
      } else {
        setTimeout(function() {
          that.setData({
            date: util.Formatunixdate(p_time),
            today: true,
            time: util.Formatunixtime(p_time)
          })
        }, 300)

      }
    }
    this.setData({
      date: e.detail.value
    })
    var query = wx.createSelectorQuery();
    query.select('#getheight1').boundingClientRect()
    query.select('#getheight2').boundingClientRect()
    query.exec(function (res) {
      //console.log(res);
      //console.log(res[0].height, res[1].height, app.globalData.windowHeight);
      that.setData({
        mapheight: (app.globalData.windowHeight - res[0].height - res[1].height) + 'px'
      })
    })
  },
  log(e) {
    wx.navigateTo({
      url: '../logs/logs',
    })
  },
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
  now_city(e){
    this.getlocation();
  }
})