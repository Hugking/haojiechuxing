// pages/order/order.js
const app = getApp()
var amapFile = require('../../libs/amap-wx.js');
var util = require('../../utils/util.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    item: null,
  },
  onLoad: function (options) {
    console.log(options.id)
    var that = this
    that.setData({
      id: options.id,
      role: wx.getStorageSync("role"),
      nowtime: Date.parse(new Date())
    })
    let Order = new wx.BaaS.TableObject('Order');
    Order.get(that.data.id).then(res => {
      // success
      console.log('订单详情', res)
      res.data['created_at'] = util.Formatunix(res.data['created_at'])
      res.data.time = util.Formatunix(res.data['pre_time_str'] / 1000)
      that.setData({
        item: res.data
      })
    }, err => {
      // err
    })
  }
})