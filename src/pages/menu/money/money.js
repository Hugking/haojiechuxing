// pages/menu/money/money.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    index: 0,
    orderlist: null,
    isLoad: true,
    over: null,
  },
  onShow(e){
    var Amount = new wx.BaaS.TableObject('amount')
    var query = new wx.BaaS.Query()
    let userInfo = wx.getStorageSync('userinfo')
    query.compare('openid', '=', userInfo.openid)
    Amount.setQuery(query).find().then(res => {
      if (res.data.objects[0]) {
        console.log('查询的余额', res.data.objects[0].total_cost, res.data.objects[0].now_cost, res.data.objects[0].no_cost)
        this.setData({
          now_cost: res.data.objects[0].now_cost,
          total_cost: res.data.objects[0].total_cost,
          no_cost: res.data.objects[0].no_cost,
          yes_cost: res.data.objects[0].yes_cost
        })
      } else {
        var Amount = new wx.BaaS.TableObject('amount')
        let amount = Amount.create();
        let Driver = new wx.BaaS.TableObject('Driver')
        let query = new wx.BaaS.Query()
        Driver.setQuery(query.contains('openid',userInfo.openid)).find().then(res => {
          console.log(res.data.objects[0])
          amount.set("openid", userInfo.openid)
          amount.set("name", res.data.objects[0].name)
          amount.save().then(res => {
            // success
            console.log(res)
          }, err => {
            //err 为 HError 对象
          })
        })
      }
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
  go_detail(e){
    wx.navigateTo({
      url: '../../menu/money/detail/detail',
    })
  }
})