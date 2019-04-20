// pages/pay_order/pay_order.js
const app = getApp()
var amapFile = require('../../libs/amap-wx.js');
var util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    order_info: null,
    loadProgress: 0,
    orderId: null,
    isLoad: true,
    no_pay: false,
  },
  onReady: function() {
    var totalSecond = 600;
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
    if (options.id) {
      this.setData({
        orderId: options.id
      })
      let Order = new wx.BaaS.TableObject("Order")
      let order = Order.get(this.data.orderId) // 数据行 id
      order.then(res => {
        res.data['created_at'] = util.Formatunix(res.data['created_at'])
        res.data.time = util.Formatunix(res.data['pre_time_str'] / 1000)
        this.setData({
          order_info: res.data,
          role: wx.getStorageSync("role")
        })
        console.log("未支付订单详情", this.data.order_info)
      }, err => {})
    }
  },
  onShow: function() {
    var that = this
    if (that.data.orderId == null) {
      var arr = getCurrentPages();
      if (arr[arr.length - 2].route == 'pages/home/home') {
        arr[arr.length - 2].data.order_info.time = util.Formatunix(arr[arr.length - 2].data.order_info.pre_time_str / 1000)
        that.setData({
          order_info: arr[arr.length - 2].data.order_info,
        })
        console.log("订单详情", that.data.order_info)
      } else {
        console.log(arr)
      }
    }
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
  pay_order(e) {
    var that = this
    wx.showNavigationBarLoading()
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
          wx.hideNavigationBarLoading()
          console.log("上传订单成功", res.data)
          setTimeout(() => {
            wx.navigateTo({
              url: '../../pages/pay_order/order_detail/order_detail?id=' + res.data.id,
            })
          }, 300)
        }, err => {
          //err 为 HError 对象
        })
      }, err => {})
    }
    else{
      setTimeout(() => {
        wx.navigateTo({
          url: '../../pages/pay_order/order_detail/order_detail?id=' + this.data.orderId,
        })
      }, 300)
    }

  },
  // pay(e) {
  //   this.setData({
  //     isLoad: false
  //   })
  //   let Order = new wx.BaaS.TableObject("Order")
  //   let order = Order.getWithoutData(this.data.orderId) // 数据行 id
  //   //console.log(util.Formatunix(time / 1000))//时间戳转日期
  //   let params = {
  //     totalCost: 0.1,
  //     // totalCost: this.data.order_info.cost, //cost
  //     merchandiseDescription: util.Formatunix(this.data.order_info.pre_time_str / 1000) + " " + this.data.order_info.startname + '》' + this.data.order_info.startname,
  //     merchandiseSchemaID: 70227,
  //     merchandiseRecordID: this.data.orderId
  //   }
  //   order.set('pay_status', true)
  //   order.update().then(res => { console.log(res.data) })
  //   wx.navigateTo({
  //     url: '../../pages/pay_order/order_detail/order_detail?id=' + this.data.orderId,
  //   })
  //   // wx.BaaS.pay(params).then(res => {
  //   //   console.log('微信支付流水号', res.transaction_no)
  //   //   console.log('支付状态', res)
  //   //   order.set('pay_status', true)
  //   //   order.update().then(res => {
  //   //     // success
  //   //     this.setData({
  //   //       isLoad: true
  //   //     })
  //   //     wx.showToast({
  //   //       title: '支付成功',
  //   //       icon: 'success',
  //   //       duration: 2000
  //   //     })
  //   //     wx.reLaunch({
  //   //       url: '../../pages/order/order_coming/order_coming?id=' + this.data.orderId,
  //   //     })
  //   //     //可加订单详情页
  //   //   }, err => {
  //   //     // err
  //   //   })
  //   // }, err => {
  //   //   // HError 对象
  //   //   if (err.code === 603) {
  //   //     console.log('用户尚未授权')
  //   //   } else if (err.code === 607) {
  //   //     console.log('用户取消支付')
  //   //     wx.navigateTo({
  //   //       url: '../pay_order/no_pay/no_pay',
  //   //     })
  //   //   } else if (err.code === 608) {
  //   //     console.log('支付失败', err.message)
  //   //     wx.navigateTo({
  //   //       url: '../pay_order/no_pay/no_pay',
  //   //     })
  //   //   }
  //   // })
  // },
  // nopay(e) {
  //   console.log('未支付')
  //   wx.navigateTo({
  //     url: '../pay_order/no_pay/no_pay',
  //   })
  // }
})