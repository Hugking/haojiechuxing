// pages/pay_order/order_detail/order_detail.js
const app = getApp()
var util = require('../../../utils/util.js');
var amapFile = require('../../../libs/amap-wx.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    windowHeight: app.globalData.windowHeight,
    order_info: null,
    loadProgress: 0,
    orderId: null,
    isLoad: true,
    no_pay: false,
    markers: null,
    markere: null,
    longitude: null,
    latitude: null,
    markerfin: null,
    polyline: null,
  },
  onReady: function() {
    var totalSecond = 590;
    var interval = setInterval(function() {
      // 秒数
      var second = totalSecond;
      // 天数位
      var day = Math.floor(second / 3600 / 24);
      var dayStr = day.toString();
      if (dayStr.length == 1) dayStr = '0' + dayStr;
      // 小时位
      var hr = Math.floor((second - day * 3600 * 24) / 3600);
      var hrStr = hr.toString();
      if (hrStr.length == 1) hrStr = '0' + hrStr;
      // 分钟位
      var min = Math.floor((second - day * 3600 * 24 - hr * 3600) / 60);
      var minStr = min.toString();
      if (minStr.length == 1) minStr = '0' + minStr;
      // 秒位
      var sec = second - day * 3600 * 24 - hr * 3600 - min * 60;
      var secStr = sec.toString();
      if (secStr.length == 1) secStr = '0' + secStr;
      this.setData({
        countDownMinute: minStr,
        countDownSecond: secStr,
      });
      totalSecond--;
      if (totalSecond < 0) {
        clearInterval(interval);
        wx.showToast({
          title: '订单已过期',
        });
        this.setData({
          countDownMinute: '00',
          countDownSecond: '00',
        });
      }
    }.bind(this), 1000);
  },
  onLoad: function(options) {
    var that = this
    wx.showNavigationBarLoading()
    if (options.id) {
      this.setData({
        orderId: options.id
      })
      let Order = new wx.BaaS.TableObject("Order")
      let order = Order.get(this.data.orderId) // 数据行 id
      order.then(res => {
        wx.hideNavigationBarLoading()
        console.log(res.data)
        that.setData({
          order_info: res.data,
          no_pay: true
        })
        var markers = [{
          latitude: res.data.startpoint.coordinates[1],
          longitude: res.data.startpoint.coordinates[0],
        }]
        var markere = [{
          latitude: res.data.endpoint.coordinates[1],
          longitude: res.data.endpoint.coordinates[0],
        }]
        that.setData({
          item: res.data,
          markers: markers,
          markere: markere,
          latitude: res.data.startpoint.coordinates[1],
          longitude: res.data.startpoint.coordinates[0]
        })
        that.waydetail();
        console.log("支付订单详情", that.data.order_info)
      }, err => {})
    }
    if (that.data.orderId == null) {
      var arr = getCurrentPages();
      if (arr[arr.length - 2].route == 'pages/pay_order/pay_order') {
        that.setData({
          order_info: arr[arr.length - 2].data.order_info,
        })
        wx.hideNavigationBarLoading();
        console.log("订单详情支付", that.data.order_info)
        var markers = [{
          latitude: that.data.order_info.startpoint.latitude,
          longitude: that.data.order_info.startpoint.longitude,
        }]
        var markere = [{
          latitude: that.data.order_info.endpoint.latitude,
          longitude: that.data.order_info.endpoint.longitude,
        }]
        that.setData({
          markers: markers,
          markere: markere,
          latitude: that.data.order_info.startpoint.latitude,
          longitude: that.data.order_info.startpoint.longitude
        })
        that.waydetail();
      } else {
        console.log(arr)
      }
    }
  },
  onShow: function() {
    var that = this
    var query = wx.createSelectorQuery();
    query.select('#getheight').boundingClientRect()
    query.exec(function(res) {
      //console.log(res);
      //console.log(res[0].height, app.globalData.Screenheight);
      that.setData({
        mapheight: (app.globalData.Screenheight - (app.globalData.Screenheight - app.globalData.windowHeight) - res[0].height) + 'px'
      })
    })
  },
  showModal(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
  },
  hideModal(e) {
    this.setData({
      modalName: null,
      hidden: false
    })
  },
  waydetail(e) {
    var that = this
    var myAmapFun = new amapFile.AMapWX({
      key: '3634f9de8bb3671b2481a1cfeda77202'
    });
    let markerfin = [{
      iconPath: "/img/mapicon_navi_s.png",
      id: 0,
      latitude: that.data.markers[0].latitude,
      longitude: that.data.markers[0].longitude,
      width: 23,
      height: 33
    }, {
      iconPath: "/img/mapicon_navi_e.png",
      id: 0,
      latitude: that.data.markere[0].latitude,
      longitude: that.data.markere[0].longitude,
      width: 24,
      height: 34
    }]
    that.setData({
      markerfin: markerfin
    })
    app.globalData.marker = {
      'st': that.data.markers[0].longitude + ',' + that.data.markers[0].latitude,
      'en': that.data.markere[0].longitude + ',' + that.data.markere[0].latitude
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
  cancel(e) {
    let Order = new wx.BaaS.TableObject('Order')
    let order = Order.getWithoutData(this.data.orderId)
    order.set('cancel', true)
    order.update().then(res => {
      wx.showToast({
        title: '订单取消成功',
        icon: 'none'
      })
      wx.reLaunch({
        url: '../../home/home',
      })
    })
  },
  pay_order(e) {
    var that = this
    if (that.data.orderId == null) {
      let Passenger = new wx.BaaS.TableObject('Passenger')
      let query = new wx.BaaS.Query()
      Passenger.setQuery(query.contains('openid', this.data.order_info.useropenid)).find().then(res => {
        // success
        console.log(res.data.objects[0])
        this.data.order_info.username = res.data.objects[0].name
        this.data.order_info.usertel = res.data.objects[0].tel
        let Order = new wx.BaaS.TableObject("Order")
        let order = Order.create()
        order.set(that.data.order_info).save().then(res => {
          // success
          console.log("上传订单成功", res.data)
          that.setData({
            orderId: res.data.id
          })
        }, err => {
          //err 为 HError 对象
        })
      }, err => {})
    }
    setTimeout(() => {
      that.setData({
        modalName: e.currentTarget.dataset.target,
        isLoad: false,
        hidden: true
      })
    }, 500)
  },
  pay(e) {
    this.setData({
      isLoad: false
    })
    let Order = new wx.BaaS.TableObject("Order")
    let order = Order.getWithoutData(this.data.orderId) // 数据行 id
    //console.log(util.Formatunix(time / 1000))//时间戳转日期
    let params = {
      totalCost: 0.1,
      // totalCost: this.data.order_info.cost, //cost
      merchandiseDescription: util.Formatunix(this.data.order_info.pre_time_str / 1000) + " " + this.data.order_info.startname + '》' + this.data.order_info.startname,
      merchandiseSchemaID: 70227,
      merchandiseRecordID: this.data.orderId
    }
    order.set('pay_status', true)
    order.update().then(res => {
      console.log(res.data)
    })
    wx.reLaunch({
      url: '../../home/home',
    })
    // wx.BaaS.pay(params).then(res => {
    //   console.log('微信支付流水号', res.transaction_no)
    //   console.log('支付状态', res)
    //   order.set('pay_status', true)
    //   order.update().then(res => {
    //     // success
    //     this.setData({
    //       isLoad: true
    //     })
    //     wx.showToast({
    //       title: '支付成功',
    //       icon: 'success',
    //       duration: 2000
    //     })
    //     wx.reLaunch({
    //       url: '../../pages/order/order_coming/order_coming?id=' + this.data.orderId,
    //     })
    //     //可加订单详情页
    //   }, err => {
    //     // err
    //   })
    // }, err => {
    //   // HError 对象
    //   if (err.code === 603) {
    //     console.log('用户尚未授权')
    //   } else if (err.code === 607) {
    //     console.log('用户取消支付')
    //     wx.navigateTo({
    //       url: '../pay_order/no_pay/no_pay',
    //     })
    //   } else if (err.code === 608) {
    //     console.log('支付失败', err.message)
    //     wx.navigateTo({
    //       url: '../pay_order/no_pay/no_pay',
    //     })
    //   }
    // })
  },
  nopay(e) {
    console.log('未支付')
    wx.navigateTo({
      url: '../no_pay/no_pay',
    })
  },
  go_detail(e) {
    wx.showToast({
      title: '暂不可使用',
      icon: 'none'
    })
  },
  call_admin(e) {
    wx.showToast({
      title: '暂不可使用',
      icon: 'none'
    })
  }
})