// pages/pay_order/no_pay/no_pay.js
const app = getApp()
var util = require('../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    orderId: null,
    loadProgress: 0,
    order_info: null,
    isLoad: true
  },
  onLoad(e) {

  },
  onShow: function() {
    var arr = getCurrentPages();
    if (arr[arr.length - 2].route == 'pages/pay_order/order_detail/order_detail') {
      //console.log(arr[arr.length - 2].data.orderId)
      arr[arr.length - 2].data.order_info.time = util.Formatunix(arr[arr.length - 2].data.order_info.pre_time_str / 1000)
      this.setData({
        orderId: arr[arr.length - 2].data.orderId,
        order_info: arr[arr.length - 2].data.order_info
      })
    } else {
      console.log(arr)
    }
    let Order = new wx.BaaS.TableObject('Order')
    Order.get(this.data.orderId).then(res => {
      // success
      if (res.data.trade_no) {
        let order = Order.getWithoutData(this.data.orderId)
        order.set('pay_status', true)
        order.update().then(res => {
          console.log(res.data)
          setTimeout(function() {
            wx.reLaunch({
              url: '../../order/order?id=' + this.data.orderId,
            })
          }, 200)
        })
      } else {}
    }, err => {
      // err
    })
  },
  back_mytrip(e) {
    setTimeout(() => {
      wx.reLaunch({
        url: '../../home/home',
      })
    }, 200)
  },
  pay_no(e) {
    this.back_mytrip();
  },
  pay(e) {
    wx.showNavigationBarLoading()
    let Order = new wx.BaaS.TableObject("Order")
    let order = Order.getWithoutData(this.data.orderId) // 数据行 id
    //console.log(util.Formatunix(time / 1000))//时间戳转日期
    let params = {
      totalCost: this.data.order_info.cost, //cost
      // totalCost: 0.01,
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
        wx.hideNavigationBarLoading()
        wx.showToast({
          title: '支付成功',
          icon: 'success',
          duration: 2000
        })
        setTimeout(function() {
          wx.reLaunch({
            url: '../../order/order?id=' + res.data.id,
          })
        }, 200)
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
      } else if (err.code === 607) {
        console.log('用户取消支付')
        order.set('pay_status', false)
        order.update().then(res => {
          // success
          this.setData({
            isLoad: true
          })
          wx.showToast({
            title: '取消支付',
            icon: 'none',
            duration: 2000
          })
          setTimeout(function() {
            wx.reLaunch({
              url: '../../home/home',
            })
          }, 200)
        }, err => {
          // err
        })
      } else if (err.code === 608) {
        console.log('支付失败', err.message)
        order.set('pay_status', false)
        order.update().then(res => {
          // success
          this.setData({
            isLoad: true
          })
          wx.showToast({
            title: '支付失败',
            icon: 'none',
            duration: 2000
          })
          setTimeout(function() {
            wx.reLaunch({
              url: '../../home/home',
            })
          }, 200)
        }, err => {
          // err
        })

      }
    })
  },
  cancel(e) {
    let Order = new wx.BaaS.TableObject("Order")
    let order = Order.getWithoutData(this.data.orderId) // 数据行 id
    order.set('cancel', true)
    order.update().then(res => {
      // success
      console.log("订单取消成功", res)
      wx.showToast({
        title: '取消成功',
        icon: 'success',
        duration: 2000
      })
      setTimeout(function() {
        wx.reLaunch({
          url: '../../home/home',
        })
      }, 200)
    }, err => {
      // err
    })

  }
})