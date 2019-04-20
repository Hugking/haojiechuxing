// pages/order/order_driver.js
var util = require('../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
    data: {
    loadProgress: 0,
    index: 0,
    orderlist: null,
    isLoad: true,
    over: null,
    role: null,
    TabCur: 1,
    tablistp: ['全部',"已接单",'结算'],
    isgo: true,
    cancel: false
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (this.data.TabCur == 0) {
      this.Order_info('first', 'driver_openid', 'all');
    }
    if (this.data.TabCur == 1) {
      this.Order_info('first', 'driver_openid', 'no_com');
    }
    if (this.data.TabCur == 2) {
      this.Order_info('first', 'driver_openid', 'settle');
    }
  },
  tabSelect(e) {
    //console.log(e.currentTarget.dataset.id);
    this.setData({
      TabCur: e.currentTarget.dataset.id,
      orderlist: null
    })
    if (this.data.TabCur == 0) {
      this.Order_info('up', 'driver_openid', 'all');
    }
    if (this.data.TabCur == 1) {
      this.Order_info('up', 'driver_openid', 'no_com');
    }
    if (this.data.TabCur == 2) {
      this.Order_info('up', 'driver_openid', 'settle');
    }
  },
  go_detail(e) {
    //console.log(e.currentTarget.dataset)
    wx.navigateTo({
      url: '../../pages/order/order_coming/order_coming?id=' + e.currentTarget.id,
    })
  },
  Order_info(type, openidtype, status) {
    var that = this
    console.log(type)
    wx.showNavigationBarLoading();
    if (type == 'up') {
      that.setData({
        orderlist: null,
        isLoad: false,
        index: 0
      })
    }
    if (type == 'low' || 'first') {
      that.setData({
        isLoad: false
      })
    }
    var Order = new wx.BaaS.TableObject('Order')
    var query = new wx.BaaS.Query()
    let userInfo = wx.getStorageSync('userinfo')
    query.compare(openidtype, '=', userInfo.openid)
    if (status == 'all') {
      query.compare('city', '=', "平顶山");
      query.compare('pay_status', '=', true);
    }
    if (status == 'no_com') {
      query.compare('city', '=', "平顶山");
      // query.compare('delete', '=', false);
      query.compare('pay_status', '=', true);
      query.compare('cancel', '=', false);
      query.compare('isget', '=', true);
      // query.compare('confirm_isget', '=', true);
      query.compare('completion', '=', false);
      // query.compare('in_car', '=', false);
      // query.compare('reminder', '=', false);
      // query.compare('settle', '=', false);
    }
    if (status == 'settle') {
      query.compare('city', '=', "平顶山");
      // query.compare('delete', '=', false);
      query.compare('pay_status', '=', true);
      query.compare('cancel', '=', false);
      query.compare('isget', '=', true);
      // query.compare('confirm_isget', '=', true);
      query.compare('completion', '=', true);
      // query.compare('in_car', '=', false);
      // query.compare('reminder', '=', false);
      // query.compare('settle', '=', false);
    }
    Order.setQuery(query).limit(10).offset(this.data.index * 10).orderBy('-pre_time').find().then(res => {
      // success
      // console.log("原始订单", res.data.objects)
      if (res.data.objects.length == 0) {
        console.log('最后一页', res.data.objects)
        that.setData({
          over: true,
          isLoad: true,
          over: true
        })
        wx.hideNavigationBarLoading();
      } else {
        for (var i = 0; i < res.data.objects.length; i++) {
          res.data.objects[i].time = util.Formatunix(res.data.objects[i]['pre_time_str'] / 1000);
        }
        if (type == 'first' || type == 'up') {
          console.log('首页', res.data.objects)
          that.setData({
            orderlist: res.data.objects,
            isLoad: true,
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
            isLoad: true
          })
          wx.hideNavigationBarLoading()
        }

      }

    }, err => {
      // err
    })
  },
  onPullDownRefresh: function () {
    if (this.data.TabCur == 0) {
      this.Order_info('up', 'driver_openid', 'all');
    }
    if (this.data.TabCur == 1) {
      this.Order_info('up', 'driver_openid', 'no_com');
    }
    if (this.data.TabCur == 2) {
      this.Order_info('up', 'driver_openid', 'settle');
    }
    wx.stopPullDownRefresh()
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.TabCur == 0) {
      this.Order_info('low', 'driver_openid', 'all');
    }
    if (this.data.TabCur == 1) {
      this.Order_info('low', 'driver_openid', 'no_com');
    }
    if (this.data.TabCur == 2) {
      this.Order_info('low', 'driver_openid', 'settle');
    }
  }
})