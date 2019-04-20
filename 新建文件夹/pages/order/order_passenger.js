// pages/order/order_passenger.js
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
    TabCur: 0,
    tablistp: ["待出行", '全部'],
    isgo: true,
    cancel: false,
    cancelreason: ['预订信息有错误, 我重新订车', '行程安排有变化, 我不用了', '一直没给我安排好车, 我要取消', '其他原因'],
    cancelcontext: null,
    orderID:null,
    orderIDX:null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (this.data.TabCur == 0) {
      this.Order_info('first', 'useropenid', 'isgo');
    }
    if (this.data.TabCur == 1) {
      this.Order_info('first', 'useropenid', 'all');
    }
  },
  tabSelect(e) {
    //console.log(e.currentTarget.dataset.id);
    this.setData({
      TabCur: e.currentTarget.dataset.id,
      orderlist: null
    })
    if (this.data.TabCur == 0) {
      this.Order_info('up', 'useropenid', 'isgo');
    }
    if (this.data.TabCur == 1) {
      this.Order_info('up', 'useropenid', 'all');
    }
  },
  go_detail(e) {
    //console.log(e.currentTarget.dataset)
    wx.navigateTo({
      url: '../../pages/order/order?id=' + e.currentTarget.id,
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
      query.compare('delete', '=', false);
    }
    if (status == 'isgo') {
      query.compare('city', '=', "平顶山");
      query.compare('delete', '=', false);
      query.compare('pay_status', '=', true);
      query.compare('cancel', '=', false);
      // query.compare('isget', '=', true);
      // query.compare('confirm_isget', '=', true);
      query.compare('completion', '=', false);
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
          wx.hideNavigationBarLoading();
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
          wx.hideNavigationBarLoading();
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
  cancel(e) {
    console.log("取消订单",e.currentTarget.id, e.currentTarget.dataset.idx)
    var that = this
    let Order = new wx.BaaS.TableObject('Order')
    let order = Order.getWithoutData(e.currentTarget.id)
    console.log(that.data.orderlist[e.currentTarget.dataset.idx])
    if (that.data.orderlist[e.currentTarget.dataset.idx].confirm_isget) {
      wx.showToast({
        title: '已被接单暂不可取消',
        icon:'none'
      })
    } else {
      if (!e.currentTarget.dataset.target){
        order.set('cancel', true)
        order.update().then(res => {
          // success
          console.log("取消订单", res.data)
          res.data.time = util.Formatunix(res.data['pre_time_str'] / 1000);
          that.data.orderlist[e.currentTarget.dataset.idx] = res.data
          that.setData({
            orderlist: that.data.orderlist,
          })
          wx.BaaS.invoke('send_admin', {
            "tem_id": "_WYN8YxLxpKus16E0OatAyH9bvl8OJQrgbxh4ScGGwk",
            "id": e.currentTarget.id,
            "data": util.Formatunix(that.data.orderlist[e.currentTarget.dataset.idx].pre_time_str / 1000) + ' ' + that.data.orderlist[e.currentTarget.dataset.idx].startname + "=>" + that.data.orderlist[e.currentTarget.dataset.idx].endname,
            "time": util.Formatunix(Date.parse(new Date()) / 1000),
            "cost": res.data.cost,
            "name": res.data.username
          }).then(res => {
            console.log("退款提醒", res)
            wx.showToast({
              title: '已取消',
              icon: 'success',
              duration: 2000
            })
          })
        }, err => {
          // err
        })

      }else{
        that.data.orderID = e.currentTarget.id,
        that.data.orderIDX = e.currentTarget.dataset.idx,
        that.setData({
          modalName: e.currentTarget.dataset.target,
        })
      }
    }

  },
  Delete(e) {
    console.log(e.currentTarget.id, e.currentTarget.dataset.idx)
    var that = this
    let Order = new wx.BaaS.TableObject('Order')
    let order = Order.getWithoutData(e.currentTarget.id)
    order.set('delete', true)
    order.update().then(res => {
      // success
      console.log("删除订单", res.data)
      if (that.data.TabCur == 0) {
        that.Order_info('up', 'useropenid', 'isgo');
      }
      if (that.data.TabCur == 1) {
        that.Order_info('up', 'useropenid', 'all');
      }
      wx.showToast({
        title: '已删除',
        icon: 'success',
        duration: 2000
      })
    }, err => {
      // err
    })

  },
  reminder(e) {
    console.log(e.currentTarget.id, e.currentTarget.dataset.idx)
    var that = this
    let Order = new wx.BaaS.TableObject('Order')
    let order = Order.getWithoutData(e.currentTarget.id)
    if (that.data.orderlist[e.currentTarget.dataset.idx].confirm_isget) {
      wx.showToast({
        title: '已被接单暂不可催单',
        icon: 'none'
      })
    } else {
      order.set('reminder', true)
      order.update().then(res => {
        // success
        console.log("催单", res.data)
        res.data.time = util.Formatunix(res.data['pre_time_str'] / 1000);
        that.data.orderlist[e.currentTarget.dataset.idx] = res.data
        that.setData({
          orderlist: that.data.orderlist,
        })
        wx.BaaS.invoke('send_hot', {
          "tem_id": "6Mbw2Tz6dIv9nsmAfaY1nzx6IL_CB3PwRsrMBCPPEHo",
          "id": e.currentTarget.id,
          "data": util.Formatunix(that.data.orderlist[e.currentTarget.dataset.idx].pre_time_str / 1000) + ' ' + that.data.orderlist[e.currentTarget.dataset.idx].startname + "》" + that.data.orderlist[e.currentTarget.dataset.idx].endname,
          "time": util.Formatunix(that.data.orderlist[e.currentTarget.dataset.idx].created_at),
          "name": res.data.username
        }).then(res => {
          console.log("催单提醒", res)
        })
        wx.showToast({
          title: '已催单',
          icon: 'success',
          duration: 2000
        })
      }, err => {
        // err
      })
    }
  },
  comment(e) {
    console.log(e.currentTarget.id)
    //评论
  },
  pay(e) {
    console.log(e.currentTarget.id)
    //支付
    wx.navigateTo({
      url: '../../pages/pay_order/pay_order?id=' + e.currentTarget.id,
    })
  },
  onPullDownRefresh: function() {
    if (this.data.TabCur == 0) {
      this.Order_info('up', 'useropenid', 'isgo');
    }
    if (this.data.TabCur == 1) {
      this.Order_info('up', 'useropenid', 'all');
    }
    wx.stopPullDownRefresh()
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (this.data.TabCur == 0) {
      this.Order_info('low', 'useropenid', 'isgo');
    }
    if (this.data.TabCur == 1) {
      this.Order_info('low', 'useropenid', 'all');
    }
  },
  sel_reason(e) {
    var that = this
    console.log('取消原因', this.data.cancelreason[e.currentTarget.id])
    let Order = new wx.BaaS.TableObject('Order')
    let order = Order.getWithoutData(that.data.orderID)
    this.data.cancelcontext = this.data.cancelreason[e.currentTarget.id]
    order.set('cancel', true)
    order.set('cancel_reason', that.data.cancelcontext)
    order.update().then(res => {
      // success
      console.log("取消订单", res.data)
      res.data.time = util.Formatunix(res.data['pre_time_str'] / 1000);
      that.data.orderlist[that.data.orderIDX] = res.data
      that.setData({
        orderlist: that.data.orderlist,
      })
      wx.BaaS.invoke('send_admin', {
        "tem_id": "_WYN8YxLxpKus16E0OatAyH9bvl8OJQrgbxh4ScGGwk",
        "id": e.currentTarget.id,
        "data": util.Formatunix(that.data.orderlist[that.data.orderIDX].pre_time_str / 1000) + ' ' + that.data.orderlist[that.data.orderIDX].startname + "=>" + that.data.orderlist[that.data.orderIDX].endname + ' ' + that.data.cancelcontext,
        "time": util.Formatunix(Date.parse(new Date()) / 1000),
        "cost": res.data.cost,
        "name": res.data.username
      }).then(res => {
        console.log("退款提醒", res)
        that.hideModal();
        wx.showToast({
          title: '已取消',
          icon: 'success',
          duration: 2000
        })
      })
      that.data.cancelcontext = null
      that.data.orderIDX = null
      that.data.orderID = null
    }, err => {
      // err
    })
  }
})