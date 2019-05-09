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
    tablistp: ['全部', "已接单", '结算'],
    isgo: true,
    cancel: false,
    orderId: null
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
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
      query.compare('city', '=', "平顶山市");
      query.compare('pay_status', '=', true);
    }
    if (status == 'no_com') {
      query.compare('city', '=', "平顶山市");
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
      query.compare('city', '=', "平顶山市");
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
          res.data.objects[i].cost = parseFloat((parseInt(res.data.objects[i].cost) * 0.93).toFixed(2));
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
  onPullDownRefresh: function() {
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
  get_black_model(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target,
      orderId: e.currentTarget.id
    })
  },
  pay_black_model(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target,
      orderId: e.currentTarget.id
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
      orderId: null
    })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (this.data.TabCur == 0) {
      this.Order_info('low', 'driver_openid', 'all');
    }
    if (this.data.TabCur == 1) {
      this.Order_info('low', 'driver_openid', 'no_com');
    }
    if (this.data.TabCur == 2) {
      this.Order_info('low', 'driver_openid', 'settle');
    }
  },
  get_black(e) {
    var that = this
    let Order = new wx.BaaS.TableObject("Order")
    if (that.data.orderId) {
      let product = Order.getWithoutData(that.data.orderId)
      product.set('isget', false)
      product.set('confirm_isget', false)
      product.set('incar', false)
      product.set('driver_openid', null)
      product.set('driver_tel', null)
      product.set('driver_name', null)
      product.update().then(res => {
        // success
        console.log('退单成功', res.data)
        that.Order_info('up', 'driver_openid', 'no_com');
        that.hideModal();
      }, err => {
        // err
      })
    } else {
      wx.showToast({
        title: '请重试',
        icon: 'none'
      })
      that.hideModal();
    }
  },
  pay_black(e) {
    var that = this
    let Order = new wx.BaaS.TableObject("Order")
    if (that.data.orderId) {
      let product = Order.getWithoutData(that.data.orderId)
      product.set('cancel', true)
      product.set('cancel_reason', '司机退款')
      product.set('isget', false)
      product.set('confirm_isget', false)
      product.set('in_car', false)
      product.set('completion', false)
      product.set('settle', false)
      product.update().then(res => {
        // success
        console.log('退款', res.data)
        wx.BaaS.invoke('send_admin', {
          "tem_id": "_WYN8YxLxpKus16E0OatAyH9bvl8OJQrgbxh4ScGGwk",
          "id": res.data.id,
          "data": util.Formatunix(res.data.pre_time_str / 1000) + ' ' + res.data.startname + "=>" + res.data.endname,
          "time": util.Formatunix(Date.parse(new Date()) / 1000),
          "cost": res.data.cost,
          "name": res.data.username,
          "reason": ' 司机退款'
        }).then(res => {
          console.log("退款提醒", res)
          that.hideModal();
          wx.showToast({
            title: '已取消',
            icon: 'success',
            duration: 2000
          })
        })
        wx.BaaS.invoke('pay_black', {
          "trade_no": res.data['trade_no']
        }).then(res => {
          console.log(res)
        })
        let item = res.data
        var Amount = new wx.BaaS.TableObject('amount')
        var query = new wx.BaaS.Query()
        let userInfo = wx.getStorageSync('userinfo')
        query.compare('openid', '=', userInfo.openid)
        Amount.setQuery(query).find().then(res => {
          console.log(res.data.objects[0])
          if (res.data.objects[0]) {
            var Amount = new wx.BaaS.TableObject('amount')
            let amount = Amount.getWithoutData(res.data.objects[0].id)
            amount.set("now_cost", parseFloat((parseFloat(res.data.objects[0].now_cost).toFixed(2)  - parseFloat((parseInt(item.cost) * 0.93).toFixed(2))).toFixed(2)))
            amount.set("total_cost", parseFloat((parseFloat(res.data.objects[0].total_cost).toFixed(2) - parseFloat((parseInt(item.cost) * 0.93).toFixed(2))).toFixed(2)))
            amount.update().then(res => {
              console.log('扣除成功', res.data)
              wx.showToast({
                title: '金额已从账户中扣除',
                icon: 'success',
                duration: 2000
              })
            }, err => {
              console.log('扣除失败')
            })
          }
        })
        that.setData({
          orderID: null
        })
        that.Order_info('up', 'driver_openid', 'all');
      }, err => {
        // err
      })
    } else {
      wx.showToast({
        title: '请重试',
        icon: 'none'
      })
      that.hideModal();
    }
  }
})