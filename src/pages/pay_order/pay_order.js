// pages/pay_order/pay_order.js
const app = getApp()
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
    peonumarr: ['1', '2', '3', '4'],
    indexr: 0,
    cost: '-.--',
    desc: '',
    sigcost: null
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
        // if (parseInt(res.data.peonum)>2){
        //   this.setData({
        //     sigcost: ((parseInt(res.data.cost) + (parseInt(res.data.peonum) - 2) * 10) / (parseInt(res.data.peonum) - (parseInt(res.data.peonum) - 2))).toString(),
        //   })
        // }
        // else{
        //   this.setData({
        //     sigcost: ((parseInt(res.data.cost)) / parseInt(res.data.peonum)).toString(),
        //   })
        // }
        this.setData({
          sigcost: ((parseInt(res.data.cost)) / parseInt(res.data.peonum)).toString(),
        })
        this.setData({
          order_info: res.data,
          cost: res.data.cost,
          desc: res.data.desc
        })
        for (var i = 0; i < this.data.peonumarr.length; i++) {
          if (res.data.peonum == this.data.peonumarr[i]) {
            this.setData({
              indexr: i
            })
          }
        }
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
          sigcost: arr[arr.length - 2].data.order_info.cost,
          cost: arr[arr.length - 2].data.order_info.cost
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
        this.data.order_info.peonum = this.data.peonumarr[this.data.indexr]
        // if (parseInt(this.data.peonumarr[this.data.indexr])>2){
        //   this.data.order_info.cost = (parseInt(this.data.sigcost) * parseInt(this.data.peonumarr[this.data.indexr]) - 10 * (parseInt(this.data.peonumarr[this.data.indexr])-2) ).toString()
        // }
        // else{
        //   this.data.order_info.cost = (parseInt(this.data.sigcost) * parseInt(this.data.peonumarr[this.data.indexr])).toString()
        // }
        this.data.order_info.cost = (parseInt(this.data.sigcost) * parseInt(this.data.peonumarr[this.data.indexr])).toString()
        this.data.order_info.desc = this.data.desc ? this.data.desc:'无'
        let Order = new wx.BaaS.TableObject("Order")
        let order = Order.create()
        order.set(that.data.order_info).save().then(res => {
          // success
          wx.hideNavigationBarLoading()
          console.log("上传订单成功", res.data)
          that.setData({
            orderId: res.data.id
          })
          setTimeout(() => {
            wx.navigateTo({
              url: '../../pages/pay_order/order_detail/order_detail?id=' + res.data.id,
            })
          }, 300)
        }, err => {
          //err 为 HError 对象
        })
      }, err => {})

    } else {
      let Order = new wx.BaaS.TableObject("Order")
      let order = Order.getWithoutData(this.data.orderId) // 数据行 id
      // if (parseInt(this.data.peonumarr[this.data.indexr]) > 2) {
      //   order.set('cost', (parseInt(this.data.sigcost) * parseInt(this.data.peonumarr[this.data.indexr]) -10 * (parseInt(this.data.peonumarr[this.data.indexr]) - 2) ).toString())
      // }
      // else {
      //   order.set('cost', (parseInt(this.data.sigcost) * parseInt(this.data.peonumarr[this.data.indexr])).toString())
      // }
      order.set('cost', (parseInt(this.data.sigcost) * parseInt(this.data.peonumarr[this.data.indexr])).toString())
      order.set('peonum', this.data.peonumarr[this.data.indexr])
      order.set('desc', this.data.desc)
      order.update().then(res => {
        // success
        console.log("订单更新成功", res.data)
        setTimeout(() => {
          wx.navigateTo({
            url: '../../pages/pay_order/order_detail/order_detail?id=' + this.data.orderId,
          })
        }, 300)
      })
    }
  },
  Pickerpeonum(e) {
    this.setData({
      indexr: e.detail.value
    })
    // if (parseInt(this.data.peonumarr[this.data.indexr]) > 2) {
    //   this.setData({
    //     cost: (parseInt(this.data.sigcost) * parseInt(this.data.peonumarr[e.detail.value]) - 10 * (parseInt(this.data.peonumarr[this.data.indexr]) - 2) ).toString()
    //   })
    // }
    // else {
    //   this.setData({
    //     cost: (parseInt(this.data.sigcost) * parseInt(this.data.peonumarr[e.detail.value])).toString()
    //   })
    // }
    this.setData({
      cost: (parseInt(this.data.sigcost) * parseInt(this.data.peonumarr[e.detail.value])).toString()
    })
  },
  desc(e) {
    //console.log(e.detail.value)
      this.setData({
        desc: e.detail.value
      })
  },
})