// pages/menu/mytrip/mytrip.js
const app = getApp()
var util = require('../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    loadProgress: 0,
    index: 0,
    orderlist: null,
    isLoad: true,
    over: null,
    role:null,
    TabCur: 0,
    tablistp:['全部','未接单','未完成','已完成','已取消','未支付'],
    tablistd: ['全部', '未完成', '已完成','已抢单','已结算','未结算']
  },
  tabSelect(e) {
    //console.log(e.currentTarget.dataset.id);
    this.setData({
      TabCur: e.currentTarget.dataset.id,
      orderlist:null
    })
    if (wx.getStorageSync('role') == 'Driver') {
      if (this.data.TabCur == 0) { this.Order_info('up', 'driver_openid', 'all'); }
      if (this.data.TabCur == 1) { this.Order_info('up', 'driver_openid', 'not_com'); }
      if (this.data.TabCur == 2) { this.Order_info('up', 'driver_openid', 'com'); }
      if (this.data.TabCur == 3) { this.Order_info('up', 'driver_openid', 'confirm_isget'); }
      if (this.data.TabCur == 4) { this.Order_info('up', 'driver_openid', 'settle'); }
      if (this.data.TabCur == 5) { this.Order_info('up', 'driver_openid', 'no_settle'); }
    }
    if (wx.getStorageSync('role') == 'Passenger') {
      if (this.data.TabCur == 0) { this.Order_info('up', 'useropenid', 'all'); }
      if (this.data.TabCur == 1) { this.Order_info('up', 'useropenid', 'not_get'); }
      if (this.data.TabCur == 2) { this.Order_info('up', 'useropenid', 'not_com'); }
      if (this.data.TabCur == 3) { this.Order_info('up', 'useropenid', 'com'); }
      if (this.data.TabCur == 4) { this.Order_info('up', 'useropenid', 'cancel'); }
      if (this.data.TabCur == 5) { this.Order_info('up', 'useropenid', 'no_pay'); }
    }
  },
  Order_info(type, openidtype,status){
    var that = this
    console.log(type)
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
    if(status == 'all') { }
    if (status == 'not_get') { query.compare('isget', '=', false); query.compare('cancel', '=', false); query.compare('pay_status', '=', true); }
    if (status == 'not_com') { query.compare('isget', '=', true); query.compare('completion', '=', false); query.compare('cancel', '=', false); query.compare('pay_status', '=', true); }
    if (status == 'get') { query.compare('isget', '=', true); query.compare('cancel', '=', false); query.compare('pay_status', '=', true); }
    if (status == 'com') { query.compare('completion', '=', true); query.compare('cancel', '=', false); }
    if (status == 'confirm_isget') { query.compare('confirm_isget', '=', false); query.compare('isget', '=', true); query.compare('cancel', '=', false); query.compare('pay_status', '=', true); }
    if (status == 'no_settle') { query.compare('confirm_isget', '=', true); query.compare('settle', '=', false); query.compare('completion', '=', true); query.compare('cancel', '=', false); }
    if (status == 'settle') { query.compare('confirm_isget', '=', true); query.compare('settle', '=', true); query.compare('completion', '=', true); query.compare('cancel', '=', false); query.compare('pay_status', '=', true);} 
    if (status == 'cancel') { query.compare('cancel', '=', true); query.compare('pay_status', '=', true); }
    if (status == 'no_pay') { query.compare('pay_status', '=', false); query.compare('cancel', '=', false); }
    Order.setQuery(query).limit(10).offset(this.data.index * 10).orderBy('-pre_time').find().then(res => {
      // success
      if (res.data.objects.length == 0) {
        console.log('最后一页', res.data.objects)
        that.setData({
          over: true,
          isLoad: true
        })
      } else {
        for (var i = 0; i < res.data.objects.length; i++) {
          res.data.objects[i].time = util.Formatunixtime(res.data.objects[i]['pre_time_str'] / 1000);
          res.data.objects[i].date = util.Formatunixdate(res.data.objects[i]['pre_time_str'] / 1000);
        }
        if (type == 'first' || type == 'up') {
          console.log('首页', res.data.objects)
          that.setData({
            orderlist: res.data.objects,
            isLoad: true,
            index: 1
          })
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
        }

      }

    }, err => {
      // err
    })
  },
  loadProgress() {
    this.setData({
      loadProgress: this.data.loadProgress + 3
    })
    if (this.data.loadProgress < 100) {
      setTimeout(() => {
        this.loadProgress();
      }, 100)
    } else {
      this.setData({
        loadProgress: 0
      })
    }
  },
  go_detail(e){
    //console.log(e.currentTarget.dataset)
    if (e.currentTarget.dataset.name){
      wx.reLaunch({
        url: '../../order/order_coming/order_coming?id=' + e.currentTarget.id,
      })
    }
    else{
      if(this.data.role == 'Passenger'){
        if (e.currentTarget.dataset.pay){
          wx.reLaunch({
            url: '../../order/order_coming/order_coming?id=' + e.currentTarget.id,
          })
        }
        else{
          //付款页面
          wx.reLaunch({
            url: '../../pay_order/pay_order?id=' + e.currentTarget.id,
          })
        }
      }
      else{
        wx.reLaunch({
          url: '../../driver/order_detail/order_detail?id=' + e.currentTarget.id,
        })
      }
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //console.log(options.TabCur)
    if (options){
      if (options.TabCur == '未支付'){this.setData({TabCur:5})}
    }
    this.setData({
      role: wx.getStorageSync("role")
    })
    if(wx.getStorageSync('role') == 'Driver'){
      if (this.data.TabCur == 0) { this.Order_info('first', 'driver_openid','all');}
      if (this.data.TabCur == 1) { this.Order_info('first', 'driver_openid', 'not_com'); }
      if (this.data.TabCur == 2) { this.Order_info('first', 'driver_openid', 'com'); } 
      if (this.data.TabCur == 3) { this.Order_info('first', 'driver_openid', 'confirm_isget'); }
      if (this.data.TabCur == 4) { this.Order_info('first', 'driver_openid', 'settle'); }
      if (this.data.TabCur == 5) { this.Order_info('first', 'driver_openid', 'no_settle'); }
    }
    if (wx.getStorageSync('role') == 'Passenger') {
      if (this.data.TabCur == 0) { this.Order_info('first', 'useropenid', 'all'); }
      if (this.data.TabCur == 1) { this.Order_info('first', 'useropenid', 'not_get'); }
      if (this.data.TabCur == 2) { this.Order_info('first', 'useropenid', 'not_com'); }
      if (this.data.TabCur == 3) { this.Order_info('first', 'useropenid', 'com'); } 
      if (this.data.TabCur == 4) { this.Order_info('first', 'useropenid', 'cancel'); }
      if (this.data.TabCur == 5) { this.Order_info('first', 'useropenid', 'no_pay'); }
    }
  },
  onPullDownRefresh: function () {
    if (wx.getStorageSync('role') == 'Driver') {
      if (this.data.TabCur == 0) { this.Order_info('up', 'driver_openid', 'all'); }
      if (this.data.TabCur == 1) { this.Order_info('up', 'driver_openid', 'not_com'); }
      if (this.data.TabCur == 2) { this.Order_info('up', 'driver_openid', 'com'); }
      if (this.data.TabCur == 3) { this.Order_info('up', 'driver_openid', 'confirm_isget'); }
      if (this.data.TabCur == 4) { this.Order_info('up', 'driver_openid', 'settle'); }
      if (this.data.TabCur == 5) { this.Order_info('up', 'driver_openid', 'no_settle'); }
    }
    if (wx.getStorageSync('role') == 'Passenger') {
      if (this.data.TabCur == 0) { this.Order_info('up', 'useropenid', 'all'); }
      if (this.data.TabCur == 1) { this.Order_info('up', 'useropenid', 'not_get'); }
      if (this.data.TabCur == 2) { this.Order_info('up', 'useropenid', 'not_com'); }
      if (this.data.TabCur == 3) { this.Order_info('up', 'useropenid', 'com'); } 
      if (this.data.TabCur == 4) { this.Order_info('up', 'useropenid', 'cancel'); }
      if (this.data.TabCur == 5) { this.Order_info('up', 'useropenid', 'no_pay'); }
    }
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (wx.getStorageSync('role') == 'Driver') {
      if (this.data.TabCur == 0) { this.Order_info('low', 'driver_openid', 'all'); }
      if (this.data.TabCur == 1) { this.Order_info('low', 'driver_openid', 'not_com'); }
      if (this.data.TabCur == 2) { this.Order_info('low', 'driver_openid', 'com'); }
      if (this.data.TabCur == 3) { this.Order_info('low', 'driver_openid', 'confirm_isget'); }
      if (this.data.TabCur == 4) { this.Order_info('low', 'driver_openid', 'settle'); }
      if (this.data.TabCur == 5) { this.Order_info('low', 'driver_openid', 'no_settle'); }
    }
    if (wx.getStorageSync('role') == 'Passenger') {
      if (this.data.TabCur == 0) { this.Order_info('low', 'useropenid', 'all'); }
      if (this.data.TabCur == 1) { this.Order_info('low', 'useropenid', 'not_get'); }
      if (this.data.TabCur == 2) { this.Order_info('low', 'useropenid', 'not_com'); }
      if (this.data.TabCur == 3) { this.Order_info('low', 'useropenid', 'com'); } 
      if (this.data.TabCur == 4) { this.Order_info('low', 'useropenid', 'cancel'); }
      if (this.data.TabCur == 5) { this.Order_info('low', 'useropenid', 'no_pay'); }
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  },
  backdriver(e){
    setTimeout(function () {
      wx.reLaunch({
        url: '../../driver/driver',
      })
    }, 1000)
  },
  backpassenger(e){
    setTimeout(function () {
      wx.reLaunch({
        url: '../../home/home',
      })
    }, 1000)
  }
})
