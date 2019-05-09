// pages/menu/money/detail/detail.js
const app = getApp()
var util = require('../../../../utils/util.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    TabCur: 1,
    arr: ['未结算', '已结算', '全部'],
    index: 0,
    orderlist: null,
    isLoad: true,
    over: null,
  },
  tabSelect(e) {
    this.setData({
      TabCur: e.currentTarget.dataset.id,
    })
    if (this.data.TabCur == 0) {
      this.Order_info('up', 'driver_openid', 'no_settle');
    }
    if (this.data.TabCur == 1) {
      this.Order_info('up', 'driver_openid', 'settle');
    }
    if (this.data.TabCur == 2) {
      this.Order_info('up', 'driver_openid', 'all');
    }
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
    if (status == 'no_settle') {
      query.compare('city', '=', "平顶山市");
      // query.compare('delete', '=', false);
      query.compare('pay_status', '=', true);
      query.compare('cancel', '=', false);
      query.compare('isget', '=', true);
      // query.compare('confirm_isget', '=', true);
      query.compare('completion', '=', true);
      // query.compare('in_car', '=', false);
      // query.compare('reminder', '=', false);
      query.compare('settle', '=', false);
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
      query.compare('settle', '=', true);
    }
    Order.setQuery(query).limit(10).offset(this.data.index * 10).orderBy('-pre_time').find().then(res => {
      // success
      // console.log("原始订单", res.data.objects)
      if (res.data.objects.length == 0) {
        console.log('最后一页', res.data.objects)
        that.setData({
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
  onLoad: function() {
    this.Order_info('first', 'driver_openid', 'settle');
    var Amount = new wx.BaaS.TableObject('amount')
    var query = new wx.BaaS.Query()
    let userInfo = wx.getStorageSync('userinfo')
    query.compare('openid', '=', userInfo.openid)
    Amount.setQuery(query).find().then(res => {
      console.log(res.data.objects[0])
      if (res.data.objects[0]) {
        this.setData({
          cost: res.data.objects[0].now_cost,
          no_cost: res.data.objects[0].no_cost
        })
      } else {}
    })
  },
  settle(e) {
    var Amount = new wx.BaaS.TableObject('amount')
    var query = new wx.BaaS.Query()
    let userInfo = wx.getStorageSync('userinfo')
    query.compare('openid', '=', userInfo.openid)
    Amount.setQuery(query).find().then(res => {
      console.log(res.data.objects[0])
      if (res.data.objects[0]) {
        if (!res.data.objects[0].code) {
          //上传付款码
          console.log("上传付款码")
          wx.navigateTo({
            url: '../up_pic/up_pic?id=' + res.data.objects[0].id,
          })
        } else {
          if (this.data.cost == 0) {
            wx.showToast({
              title: '余额为零，不可提现',
              icon: 'none'
            })
          } else {
            let amount = Amount.getWithoutData(res.data.objects[0].id)
            amount.set("now_cost", res.data.objects[0].now_cost - this.data.cost)
            amount.set("no_cost", res.data.objects[0].no_cost + this.data.cost)
            amount.update().then(res => {
              this.setData({
                cost: res.data.now_cost,
                no_cost: res.data.no_cost
              })
              wx.showToast({
                title: '提现申请已提交',
              })
            })
          }
        }
      } else {}
    })
  },
  onReachBottom: function() {
    if (this.data.TabCur == 0) {
      this.Order_info('low', 'driver_openid', 'no_settle');
    }
    if (this.data.TabCur == 1) {
      this.Order_info('low', 'driver_openid', 'settle');
    }
    if (this.data.TabCur == 2) {
      this.Order_info('low', 'driver_openid', 'all');
    }
  },
  go_detail(e) {
    wx.navigateTo({
      url: '../../../order/order?id=' + e.currentTarget.id,
    })
  },
  onPullDownRefresh(e) {
    if (this.data.TabCur == 0) {
      this.Order_info('up', 'driver_openid', 'no_settle');
    }
    if (this.data.TabCur == 1) {
      this.Order_info('up', 'driver_openid', 'settle');
    }
    if (this.data.TabCur == 2) {
      this.Order_info('up', 'driver_openid', 'all');
    }
  }
})
// let Order = new wx.BaaS.TableObject("Order")
// let query = new wx.BaaS.Query()
// let userInfo = wx.getStorageSync('userinfo')
// query.compare('driver_openid', '=', userInfo.openid);
// query.compare('city', '=', "平顶山市");
// query.compare('pay_status', '=', true);
// query.compare('cancel', '=', false);
// query.compare('isget', '=', true);
// query.compare('completion', '=', true);
// query.compare('settle', '=', false);
// let records = Order.getWithoutData(query)
// records.set("settle", true)
// records.update().then(res => {
//   console.log(res.data.operation_result)
//   if (res.data.operation_result.length == 0) { wx.hideLoading()} else {
//     for (var i = 0; i < res.data.operation_result.length; i++) {
//       app.globalData.settleList.unshift(res.data.operation_result[i]['success']['id'])
//     }
//     var q = new wx.BaaS.Query()
//     q.compare('driver_openid', '=', userInfo.openid);
//     q.compare('city', '=', "平顶山市");
//     q.compare('pay_status', '=', true);
//     q.compare('cancel', '=', false);
//     q.compare('isget', '=', true);
//     q.compare('completion', '=', true);
//     q.compare('settle', '=', true);
//     q.compare('updated_at', '<', Date.parse(new Date()) / 1000 + 60);
//     q.compare('updated_at', '>', Date.parse(new Date()) / 1000 - 60);
//     Order.setQuery(q).orderBy('updated_at').find().then(res => {
//       // success
//       console.log("更新后", res.data.objects)
//       let cost = 0
//       for (var i = 0; i < res.data.objects.length; i++) {
//         for (var j = 0; j < res.data.objects.length; j++) {
//           if (res.data.objects[i].id == app.globalData.settleList[i]) {
//             cost = cost + parseInt(res.data.objects[i].cost)-1
//           } else {
//             cost = cost + 0
//           }
//         }
//       }
//       console.log(cost)

//       this.setData({
//         cost:cost
//       })
//       var Amount = new wx.BaaS.TableObject('amount')
//       var query = new wx.BaaS.Query()
//       let userInfo = wx.getStorageSync('userinfo')
//       query.compare('openid', '=', userInfo.openid)
//       Amount.setQuery(query).find().then(res => {
//         console.log(res.data.objects[0])
//         let amount = Amount.getWithoutData(res.data.objects[0].id)
//         amount.set("now_cost", res.data.objects[0].now_cost + this.data.cost)
//         amount.set("total_cost", res.data.objects[0].total_cost + this.data.cost)
//         amount.set("settle", res.data.objects[0].settle+this.data.cost)
//         amount.set("no_settle", res.data.objects[0].no_settle - this.data.cost)
//         amount.update().then(res => {
//           // success
//           console.log("账户余额",res.data)
//           wx.hideLoading()
//           wx.startPullDownRefresh()
//           if (this.data.TabCur == 0) {
//             this.Order_info('up', 'driver_openid', 'no_settle');
//           }
//           if (this.data.TabCur == 1) {
//             this.Order_info('up', 'driver_openid', 'settle');
//           }
//           if (this.data.TabCur == 2) {
//             this.Order_info('up', 'driver_openid', 'all');
//           }
//           setTimeout(function(){
//             wx.stopPullDownRefresh()
//           },1000)
//         }, err => {
//           // err
//         })
//         if (res.data.objects[0]) {

//         } else {
//           let amount = Amount.create();
//           amount.set("openid", userInfo.openid).save().then(res => {
//             // success
//             console.log(res)
//           }, err => {
//             //err 为 HError 对象
//           })

//         }
//       })
//     }, err => {
//       // err
//       wx.hideLoading()
//     })
//   }
// }, err => {
//   wx.hideLoading()
// })