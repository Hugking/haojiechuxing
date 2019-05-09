// pages/pay_order/order_detail/order_detail.js
const app = getApp()
var QQMapWX = require('../../../libs/qqmap-wx-jssdk.min.js');
var util = require('../../../utils/util.js');
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
    this.ReportHeart(600,false)
  },
  ReportHeart(time,clear){
    var totalSecond = time;
    var interval = setInterval(function () {
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
      if (totalSecond < 0||clear) {
        clearInterval(interval);//关闭时钟
        this.setData({
          countDownMinute: '00',
          countDownSecond: '00',
        });
      }
    }.bind(this), 1000);
  },
  onUnload(e){
    this.ReportHeart(600, true)
  },
  onHide(e){
    this.ReportHeart(600, true)
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
        var markers = {
          latitude: res.data.startpoint.coordinates[1],
          longitude: res.data.startpoint.coordinates[0],
        }
        var markere = {
          latitude: res.data.endpoint.coordinates[1],
          longitude: res.data.endpoint.coordinates[0],
        }
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
    // if (that.data.orderId == null) {
    //   var arr = getCurrentPages();
    //   if (arr[arr.length - 2].route == 'pages/pay_order/pay_order') {
    //     that.setData({
    //       order_info: arr[arr.length - 2].data.order_info,
    //     })
    //     wx.hideNavigationBarLoading();
    //     console.log("订单详情支付", that.data.order_info)
    //     var markers = [{
    //       latitude: that.data.order_info.startpoint.latitude,
    //       longitude: that.data.order_info.startpoint.longitude,
    //     }]
    //     var markere = [{
    //       latitude: that.data.order_info.endpoint.latitude,
    //       longitude: that.data.order_info.endpoint.longitude,
    //     }]
    //     that.setData({
    //       markers: markers,
    //       markere: markere,
    //       latitude: that.data.order_info.startpoint.latitude,
    //       longitude: that.data.order_info.startpoint.longitude
    //     })
    //     that.waydetail();
    //   } else {
    //     console.log(arr)
    //   }
    // }
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
    var qqmapsdk = new QQMapWX({
      key: '5U7BZ-QDB6X-MDS46-ZWGSA-WXRKZ-SMBVD'
    });
    let markerfin = [{
      iconPath: "/img/mapicon_navi_s.png",
      id: 0,
      latitude: that.data.markers.latitude,
      longitude: that.data.markers.longitude, //高德返回的是数组
      width: 23,
      height: 33
    }, {
      iconPath: "/img/mapicon_navi_e.png",
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
      // totalCost: 0.01,
      totalCost: this.data.order_info.cost, //cost
      merchandiseDescription: util.Formatunix(this.data.order_info.pre_time_str / 1000) + " " + this.data.order_info.startname + '=>' + this.data.order_info.endname + this.data.order_info.username,
      merchandiseSchemaID: 70227,
      merchandiseRecordID: this.data.orderId
    }
    wx.BaaS.pay(params).then(res => {
      console.log('微信支付流水号', res.transaction_no, '微信支付订单号', res.trade_no)
      console.log('支付状态', res)
      order.set('transaction_no', res.transaction_no)
      order.set('trade_no', res.trade_no)
      order.set('pay_status', true)
      order.update().then(res => {
        // success
        this.setData({
          isLoad: true
        })
        wx.showToast({
          title: '支付成功',
          icon: 'success',
          duration: 2000
        })
        ////BUG
        setTimeout(function () {
          wx.reLaunch({
            url: '../../order/order?id=' + this.data.orderId,
          })
        }, 200)
        //可加订单详情页
      }, err => {
        // err
      })
    }, err => {
      // HError 对象
      if (err.code === 603) {
        console.log('用户尚未授权')
        wx.showModal({
          title: '用户尚未授权',
        })
        // let Order = new wx.BaaS.TableObject('Order')
        // Order.get(this.data.orderId).then(res => {
        //   // success
        //   if (res.data.trade_no){
        //     let order = Order.getWithoutData(this.data.orderId)
        //     order.set('pay_status', true)
        //     order.update().then(res => {
        //       console.log(res.data)
        //       wx.reLaunch({
        //         url: '../../order/order?id=' + this.data.orderId,
        //       })
        //     })
        //   }else{
        //     let order = Order.getWithoutData(this.data.orderId)
        //     order.set('pay_status', false)
        //     order.update().then(res => {
        //       console.log(res.data)
        //       wx.navigateTo({
        //         url: '../no_pay/no_pay',
        //       })
        //     })
        //   }
        // }, err => {
        //   // err
        // })
      } else if (err.code === 607) {
        console.log('用户取消支付')
        setTimeout(function () {
          wx.navigateTo({
            url: '../no_pay/no_pay',
          })
        }, 200)
      } else if (err.code === 608) {
        console.log('支付失败', err.message)
        setTimeout(function () {
          wx.navigateTo({
            url: '../no_pay/no_pay',
          })
        }, 200)
      }
    })
  },
  nopay(e) {
    console.log('未支付')
    setTimeout(function () {
      wx.navigateTo({
        url: '../no_pay/no_pay',
      })
    }, 200)
  },
  go_detail(e) {
    wx.navigateTo({
      url: '../../order/order?id=' + this.data.orderId,
    })
  },
  call_admin(e) {
    wx.makePhoneCall({
      phoneNumber: '18637501671',
    })
  }
})