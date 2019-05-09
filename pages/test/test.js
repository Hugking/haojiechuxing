// pages/test/test.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    trade_no: null
  },
  pay(e) {
    let params = {
      // totalCost: 0.1,
      totalCost: 0.01, //cost
      merchandiseDescription: "测试",
    }
    wx.BaaS.pay(params).then(res => {
      console.log('微信支付流水号', res.transaction_no, '微信支付订单号号', res.trade_no)
      console.log('支付状态', res.errMsg)
      this.setData({
        trade_no: res.trade_no
      })
    }, err => {
      // HError 对象
      if (err.code === 603) {
        console.log('用户尚未授权')
      } else if (err.code === 607) {
        console.log('用户取消支付')
      } else if (err.code === 608) {
        console.log('支付失败', err.message)
      }
    })
  },
  pay_black(e) {
    wx.BaaS.invoke('pay_black', {
      "trade_no": this.data.trade_no
    }).then(res => {
      console.log(res) // 'hello world'
    })
  },
  amount(e) {
    this.setData({
      item:{'cost':'40'}
    })
    var Amount = new wx.BaaS.TableObject('amount')
    var query = new wx.BaaS.Query()
    let userInfo = wx.getStorageSync('userinfo')
    query.compare('openid', '=', userInfo.openid)
    Amount.setQuery(query).find().then(res => {
      console.log(res.data.objects[0])
      if (res.data.objects[0]) {
        var Amount = new wx.BaaS.TableObject('amount')
        let amount = Amount.getWithoutData(res.data.objects[0].id)
        amount.set("now_cost", parseFloat((res.data.objects[0].now_cost + parseFloat((parseInt(this.data.item.cost) * 0.93).toFixed(2))).toFixed(2)))
        amount.set("total_cost", parseFloat((res.data.objects[0].total_cost + parseFloat((parseInt(this.data.item.cost) * 0.93).toFixed(2))).toFixed(2)))
        amount.update().then(res => {
          console.log('加入结算成功',res.data)
          wx.showToast({
            title: '金额已到账户',
            icon: 'success',
            duration: 2000
          })
        }, err => {
          console.log('加入结算失败')
        })
      } else {
        var Amount = new wx.BaaS.TableObject('amount')
        let amount = Amount.create();
        let Driver = new wx.BaaS.TableObject('Driver')
        let query = new wx.BaaS.Query()
        Driver.setQuery(query.contains('openid', userInfo.openid)).find().then(res => {
          console.log(res.data.objects[0])
          let userInfo = wx.getStorageSync('userinfo')
          amount.set("now_cost", parseInt(this.data.item.cost) - 1)
          amount.set("total_cost", parseInt(this.data.item.cost) - 1)
          amount.set("openid", userInfo.openid)
          amount.set("name", res.data.objects[0].name)
          amount.save().then(res => {
            // success
            console.log(res)
            wx.showToast({
              title: '金额已到账户',
              icon: 'success',
              duration: 2000
            })
          }, err => {
            //err 为 HError 对象
          })
        })
      }
    })

  }
})
