// pages/driver/driver.js
const app = getApp()
var QQMapWX = require('../../libs/qqmap-wx-jssdk.min.js');
var util = require('../../utils/util.js');
var objDeepCopy = function(source) {
  var sourceCopy = source instanceof Array ? [] : {};
  for (var item in source) {
    sourceCopy[item] = typeof source[item] === 'object' ? objDeepCopy(source[item]) : source[item];
  }
  return sourceCopy;
}
var startarray = objDeepCopy(app.globalData.hotaddr);
var endarray = objDeepCopy(app.globalData.hotaddr)
startarray.unshift({
  name: "不限",
  id: 0
})
endarray.unshift({
  name: "不限",
  id: 0
})
Page({
  data: {
    marqueeDistance: 0,//初始滚动距离
    // animationData: {}, //公告动画
    announcementText: "本小程序致力于车站与高校的出行服务，司机端订单过期后30分钟内仍可接单，提示未注册时，请退出登录重新注册，每周四为结算日，请提前上传收款码，谢谢您的配合，如有问题请联系管理员微信18637501671或提交反馈给我们，我们会尽快解决！", //公告内容
    city: '',
    userInfo: null,
    orderlist: null,
    index: 0,
    over: null,
    disabled: false,
    TabCur: 0,
    tablist: ['全部', '时间', '人数', '地点'],
    _time: 0,
    _peonum: 0,
    _startname: 0,
    _endname: 0,
    __time: null,
    __peonum: null,
    __startname: null,
    __endname: null,
    addarray: ['出发地', '目的地'],
    // 筛选
    timearray: ['不限', '7:00-8:00', '8:00-9:00', '9:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00', '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00', '17:00-18:00', '18:00-19:00', '19:00-20:00', '20:00-21:00', '21:00-22:00', '22:00-23:00'],
    peonumarray: ['不限', '1', '2', '3', '4'],
    startarray: startarray,
    endarray: endarray,
    one: 0,
    two: 0,
    third: 0,
    four: 0,
    five: 0,
    isShow: true,
    listhidden: false,
    overtime: true,
    formIdString: '',
    weather: '天气信息'
  },
  onLoad: function() {
    var that = this
    var dates = util.Formatunixdate(Date.parse(new Date()) / 1000) + ' ' + '00:00'
    var datelines = new Date(dates.replace(/-/g, "/"))
    var datee = util.Formatunixdate(Date.parse(datelines) / 1000 + 24 * 3600) + " " + '00:00'
    var datea = util.Formatunixdate(Date.parse(datelines) / 1000 + 2 * 24 * 3600) + " " + '00:00'
    var datelinee = new Date(datee.replace(/-/g, "/"))
    var datelinea = new Date(datea.replace(/-/g, "/"))
    that.getlocation();
    //console.log(util.Formatunix('1553369186'), Date.parse(new Date()) / 1000)
    that.setData({
      userInfo: wx.getStorageSync('userinfo'),
      nowtime: Date.parse(new Date()),
      dates: Date.parse(datelines),
      datee: Date.parse(datelinee),
      datea: Date.parse(datelinea)
    })
    that.Order_info('first');
    if (wx.getStorageSync('driver_register')) {} else {
      wx.showToast({
        title: '未注册，请退出登录后注册',
        icon: 'none'
      })
    }
  },
  onShow: function() {
    //this.initAnimation(this.data.announcementText)
    // var that = this;
    // var length = that.data.announcementText.length * 12;//文字长度
    // var windowWidth = wx.getSystemInfoSync().windowWidth;// 屏幕宽度
    // //console.log(length,windowWidth);
    // that.setData({
    //   length: length,
    //   windowWidth: windowWidth
    // });
    // that.scrolltxt();// 第一个字消失后立即从右边出现
  },
  scrolltxt: function() {
    var that = this;
    var length = that.data.length; //滚动文字的宽度
    var windowWidth = that.data.windowWidth; //屏幕宽度
    if (length > windowWidth) {
      var interval = setInterval(function() {
        var maxscrollwidth = length; //滚动的最大宽度，文字宽度+间距，如果需要一行文字滚完后再显示第二行可以修改marquee_margin值等于windowWidth即可
        var crentleft = that.data.marqueeDistance;
        if (crentleft < maxscrollwidth) { //判断是否滚动到最大宽度
          that.setData({
            marqueeDistance: crentleft + 1
          })
        } else {
          //console.log("替换");
          that.setData({
            marqueeDistance: 0 // 直接重新滚动
          });
          clearInterval(interval);
          that.scrolltxt();
        }
      }, 30);
    } else {
    }
  },
  initAnimation: function(announcementText) {
    var that = this;
    //初始化动画
    var animation = wx.createAnimation({
      duration: 22500,
      timingFunction: 'linear'
    });
    animation.translate(-Number(announcementText.length * 12), 0).step();
    that.setData({
      animationData: animation.export()
    });
    /****************************优化部分*******************************/
    // 重新开始动画
    that.restartAnimation = setInterval(function() {
      animation.translate(255, 0).step({
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
    //清除定时器interval
    //clearInterval(this.restartAnimation);
    clearInterval(this.interval);
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
      success: function (res) { //成功后的回调
        console.log('地理位置信息', res.result.address_component.city, res.result);
        // console.log( data[0].regeocodeData.addressComponent.city, data[0])
        that.setData({
          city: res.result.address_component.city
        })
      },
      fail: function (info) {
        //失败回调l
        console.log(info)
        wx.showModal({
          title: info
        })
      }
    })
  },
  onShareAppMessage() {
    return {
      title: '豪杰出行',
      paths: '/pages/home/home'
    }
  },
  tabSelect(e) {
    //console.log(e.currentTarget.dataset.id);
    this.setData({
      TabCur: e.currentTarget.dataset.id,
      listhidden: true
    })
    this.setData({
      displays: "block"
    })
    if (this.data.TabCur === e.currentTarget.dataset.id) {
      return false;
    } else {
      var showMode = e.currentTarget.dataset.id == 0;
      this.setData({
        TabCur: e.currentTarget.dataset.id,
        isShow: showMode
      })
    }
  },
  time_zone_st(zone) {
    let zones = zone.split("-")
    var strtime = util.formatDate(new Date()) + ' ' + zones[0]
    console.log(strtime)
    var date = new Date(strtime.replace(/-/g, "/"))
    var time = Date.parse(date) //日期转时间戳
    return time
  },
  time_zone_en(zone) {
    let zones = zone.split("-")
    var strtime = util.formatDate(new Date()) + ' ' + zones[1]
    console.log(strtime)
    var date = new Date(strtime.replace(/-/g, "/"))
    var time = Date.parse(date) //日期转时间戳
    return time
  },
  hideNav: function() {
    this.setData({
      displays: "none",
      listhidden: false
    })
  },
  _chosetime: function(e) {
    var id = e.currentTarget.dataset.id; //获取自定义的ID值  
    console.log(this.data.timearray[e.currentTarget.dataset.id])
    if (id != 0) {
      this.setData({
        one: id,
        __time: this.data.timearray[e.currentTarget.dataset.id],
        listhidden: false,
        displays: "none"
      })
      this.Order_info('up');
    } else {
      this.setData({
        one: id,
        __time: null,
        displays: "none",
        listhidden: false,
      })
      this.Order_info('up');
    }
  },
  _chosepeonum: function(e) {
    var id = e.currentTarget.dataset.id; //获取自定义的ID值  
    console.log(this.data.peonumarray[e.currentTarget.dataset.id])
    if (id != 0) {
      this.setData({
        two: id,
        __peonum: this.data.peonumarray[e.currentTarget.dataset.id],
        listhidden: false,
        displays: "none"
      })
      this.Order_info('up');
    } else {
      this.setData({
        two: id,
        __peonum: null,
        displays: "none",
        listhidden: false,
      })
      this.Order_info('up');
    }
  },
  _choseadd(e) {
    var id = e.currentTarget.dataset.id;
    //console.log(e.currentTarget.dataset.id)
    this.setData({
      five: id
    })
  },
  _chosestartname(e) {
    var id = e.currentTarget.dataset.id; //获取自定义的ID值  
    console.log(this.data.startarray[e.currentTarget.dataset.id])
    if (id != 0) {
      this.setData({
        third: id,
        __startname: this.data.startarray[e.currentTarget.dataset.id].name,
        listhidden: false,
        displays: "none"
      })
      this.Order_info('up');
    } else {
      this.setData({
        third: id,
        __startname: null,
        displays: "none",
        listhidden: false,
      })
      this.Order_info('up');
    }
  },
  _choseendname(e) {
    var id = e.currentTarget.dataset.id; //获取自定义的ID值  
    console.log(this.data.endarray[e.currentTarget.dataset.id])
    if (id != 0) {
      this.setData({
        four: id,
        __endname: this.data.endarray[e.currentTarget.dataset.id].name,
        listhidden: false,
        displays: "none"
      })
      this.Order_info('up');
    } else {
      this.setData({
        four: id,
        __endname: null,
        displays: "none",
        listhidden: false,
      })
      this.Order_info('up');
    }
  },
  // 筛选
  chosetime: function(e) {
    var id = e.currentTarget.dataset.id; //获取自定义的ID值  
    console.log(this.data.timearray[e.currentTarget.dataset.id])
    this.setData({
      one: id,
    })
  },
  chosepeonum: function(e) {
    var id = e.currentTarget.dataset.id; //获取自定义的ID值  
    console.log(this.data.peonumarray[e.currentTarget.dataset.id])
    this.setData({
      two: id
    })
  },
  chosestartname: function(e) {
    var id = e.currentTarget.dataset.id; //获取自定义的ID值  
    console.log(this.data.startarray[e.currentTarget.dataset.id])
    this.setData({
      third: id
    })
  },
  choseendname: function(e) {
    var id = e.currentTarget.dataset.id; //获取自定义的ID值  
    console.log(this.data.endarray[e.currentTarget.dataset.id])
    this.setData({
      four: id
    })
  },
  clear(e) {
    //console.log(e)
    this.setData({
      one: 0,
      two: 0,
      third: 0,
      four: 0,
      __time: null,
      __peonum: null,
      __startname: null,
      __endname: null
    })
    this.Order_info('up');
    this.setData({
      displays: "none",
      listhidden: false
    })
  },
  confirm(e) {
    //console.log(e)
    this.setData({
      __time: this.data.timearray[this.data.one],
      __peonum: this.data.peonumarray[this.data.two],
      __startname: this.data.startarray[this.data.third].name,
      __endname: this.data.endarray[this.data.four].name
    })
    if (this.data.one == 0) {
      this.setData({
        __time: null
      })
    }
    if (this.data.two == 0) {
      this.setData({
        __peonum: null
      })
    }
    if (this.data.third == 0) {
      this.setData({
        __startname: null
      })
    }
    if (this.data.four == 0) {
      this.setData({
        __endname: null
      })
    }
    this.Order_info('up');
    this.setData({
      displays: "none",
      listhidden: false
    })
  },
  onPullDownRefresh: function() {
    this.Order_info('up');
    this.setData({
      nowtime: Date.parse(new Date()),
    })
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    this.Order_info('low');
  },
  Order_info(type) {
    var that = this
    console.log(type)
    wx.showNavigationBarLoading();
    var Order = new wx.BaaS.TableObject('Order')
    var query = new wx.BaaS.Query()
    if (type == 'up') {
      that.setData({
        orderlist: null,
        index: 0
      })
    }
    var time = this.data.__time;
    var peonum = this.data.__peonum;
    var startname = this.data.__startname;
    var endname = this.data.__endname;
    if (time) {
      query.compare('pre_time_str', '>=', this.time_zone_st(time));
      query.compare('pre_time_str', '<', this.time_zone_en(time));
      console.log(this.time_zone_st(time), this.time_zone_en(time))
    };
    if (peonum) {
      query.compare('peonum', '=', peonum)
    };
    if (startname) {
      query.compare('startname', '=', startname)
    };
    if (endname) {
      query.compare('endname', '=', endname)
    };
    query.compare('pay_status', '=', true)
    query.compare('isget', '=', false)
    query.compare('confirm_isget', '=', false)
    query.compare('city', '=', '平顶山市')
    query.compare('cancel', '=', false)
    query.compare('type', '=', 'pre')
    query.compare('pre_time_str', '>=', parseInt(this.data.dates))
    Order.setQuery(query).limit(10).offset(this.data.index * 10).orderBy('pre_time').find().then(res => {
      // success
      if (res.data.objects.length == 0) {
        console.log('最后一页', res.data.objects)
        that.setData({
          over: true
        })
        wx.hideNavigationBarLoading()
      } else {
        for (var i = 0; i < res.data.objects.length; i++) {
          res.data.objects[i]['created_at'] = util.Formatunix(res.data.objects[i]['created_at']);
          res.data.objects[i].datetime = util.Formatunix(res.data.objects[i]['pre_time_str'] / 1000);
          res.data.objects[i].time = util.Formatunixtime(res.data.objects[i]['pre_time_str'] / 1000);
          res.data.objects[i].date = util.Formatunixdate(res.data.objects[i]['pre_time_str'] / 1000);
        }
        if (type == 'first' || type == 'up') {
          console.log('首页', res.data.objects)
          that.setData({
            orderlist: res.data.objects,
            index: 1
          })
          wx.hideNavigationBarLoading()
        }
        if (type == 'low') {
          console.log('下一页', this.data.index, res.data.objects)
          var list = res.data.objects
          //console.log(res.data.objects[0]['created_at'] = util.Formatunix(res.data.objects[0]['created_at']), res.data.objects[0])
          that.setData({
            orderlist: this.data.orderlist.concat(list),
            index: this.data.index + 1,
          })
          wx.hideNavigationBarLoading()
        }

      }

    }, err => {
      // err
    })
  },
  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
  get_over_time(e) {
    wx.hideNavigationBarLoading()
    wx.navigateTo({
      url: '../driver/order_detail/order_detail?id=' + this.order_id,
    })
  },
  get_order(e) {
    console.log(e)
    wx.showNavigationBarLoading();
    let Driver = new wx.BaaS.TableObject('Driver')
    let query = new wx.BaaS.Query()
    let Order = new wx.BaaS.TableObject('Order')
    let order = Order.getWithoutData(e.currentTarget.id)
    Driver.setQuery(query.contains('openid', this.data.userInfo.openid)).find().then(res => {
      console.log(res.data.objects[0])
      if (res.data.objects[0]) {
        if (res.data.objects[0].can_get) {
          Order.get(e.currentTarget.id).then(res => {
            // success
            //console.log(res)nowtime>item.pre_time_str
            if (res.data['confirm_isget'] || res.data['isget']) {
              wx.showToast({
                title: '此订单已被接,请刷新后重试',
                icon: 'none',
                duration: 2000
              })
              wx.hideNavigationBarLoading()
            } else {
              if (this.data.nowtime > res.data['pre_time_str']) {
                if (this.data.nowtime > res.data['pre_time_str'] + 1800 * 1000) {
                  wx.showToast({
                    title: '已过期',
                    icon: 'none',
                    duration: 2000
                  })
                  wx.hideNavigationBarLoading()
                } else {
                  this.setData({
                    modalName: e.currentTarget.dataset.target
                  })
                  this.order_id = e.currentTarget.id
                  wx.hideNavigationBarLoading()
                }
              } else {
                // order.set('isget', true)
                // order.set('driver_openid', this.data.userInfo.openid)
                // order.update().then(res => {
                //   // success
                //   console.log("正在接单", res.data)
                // }, err => {
                //   // err
                // })
                wx.hideNavigationBarLoading()
                wx.navigateTo({
                  url: '../driver/order_detail/order_detail?id=' + e.currentTarget.id,
                })
              }
            }
          }, err => {
            // err
          })
        } else {
          wx.showToast({
            title: '未通过审核您现在还不能预览',
            icon: 'none',
            duration: 3000
          })
        }
      } else {
        wx.showToast({
          title: '未查询到用户，请重新注册',
        })
      }

    }, err => {})

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
  }
})