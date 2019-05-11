// pages/driver/order_detail/order_detail.js
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
    id: null,
    order: null,
    formIdString: ''
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
  onLoad: function(options) {
    //console.log(options.id)
    this.setData({
      id: options.id
    })
    let Order = new wx.BaaS.TableObject('Order')
    Order.get(this.data.id).then(res => {
      // success
      console.log('接单详情', res)
      res.data.created_at = util.Formatunix(res.data['created_at']);
      res.data.time = util.Formatunixtime(res.data['pre_time_str'] / 1000);
      res.data.datetime = util.Formatunix(res.data['pre_time_str'] / 1000);
      res.data.date = util.Formatunixdate(res.data['pre_time_str'] / 1000);
      this.setData({
        order: res.data
      })

    }, err => {
      // err
    })
  },
  cancel(e) {
    //console.log(e)
    //console.log(e.target.id)
    // let Order = new wx.BaaS.TableObject('Order')
    // let order = Order.getWithoutData(this.data.id)
    // Order.get(e.target.id).then(res => {
    //   // success
    //   //console.log(res)
    //   order.set('isget', false)
    //   order.set('confirm_isget', false)
    //   order.set('driver_openid', null)
    //   order.set('driver_tel', null)
    //   order.set('driver_name',null)
    //   order.update().then(res => {
    //     // success
    //     console.log("正在放弃接单", res.data)
    //     wx.reLaunch({
    //       url: '../driver',
    //     })
    //   }, err => {
    //     // err
    //   })
    // }, err => {
    //   // err
    // })
    setTimeout(function() {
      wx.navigateBack({})
    }, 200)
  },
  phonecall(e) {
    wx.makePhoneCall({
      phoneNumber: this.data.order.usertel,
    })
  },
  formSubmit: function(e) {
    if (e.detail.formId != 'the formId is a mock one') {
      this.setData({
        formIdString: e.detail.formId + "," + this.data.formIdString
      })
      var formIds = this.data.formIdString.split(",");
      //console.log(formIds.length);
      for (var i = 0; i < formIds.length - 1; i++) {
        //console.log(formIds[i], i)
        wx.BaaS.wxReportTicket(formIds[i])
      }
    }
    console.log(e.detail, this.data.formIdString)
  },
  send_order(e) {
    this.hideModal();
    var that = this
    let Order = new wx.BaaS.TableObject('Order')
    let order = Order.getWithoutData(this.data.id)
    var Driver = new wx.BaaS.TableObject('Driver')
    var query = new wx.BaaS.Query()
    let userInfo = wx.getStorageSync('userinfo')
    query.compare('openid', '=', userInfo.openid)
    Driver.setQuery(query).find().then(res => {
      // success
      var tel = res.data.objects[0].tel
      var name = res.data.objects[0].name
      var car_num = res.data.objects[0].car_num
      var can_get = res.data.objects[0].can_get
      var q = new wx.BaaS.Query()
      //query.compare('created_at', '<', Date.parse(new Date()) / 1000)
      if (can_get == false) {
        wx.showToast({
          title: '未通过审核您现在还不能接单',
          icon: 'none',
          duration: 3000
        })
      } else {
        q.compare('id', '=', e.target.id)
        Order.setQuery(q).find().then(res => {
          if (!res.data.isget && !res.data.cancel) {
            order.set('isget', true)
            order.set('confirm_isget', true)
            order.set('driver_openid', userInfo.openid)
            order.set('driver_tel', tel)
            order.set('driver_name', name)
            order.update().then(res => {
              // success
              console.log("接单后的数据", res.data)
              that.setData({
                order: res.data
              })

              var Passenger = new wx.BaaS.TableObject('Passenger')
              var query = new wx.BaaS.Query()
              query.compare('openid', '=', that.data.order.useropenid)
              Passenger.setQuery(query).find().then(res => {
                wx.BaaS.invoke('send_passenger', {
                  "user_id": res.data.objects[0].passengerid,
                  "tem_id": "jJ1yBC2T6BM6SLgiN3Rci4PIPz1G1WCP1cemSYBq_pg",
                  "order_id": this.data.order.id,
                  "way": this.data.order.startname + "=>" + this.data.order.endname,
                  "time": util.Formatunix(this.data.order.pre_time_str / 1000),
                  "driver": this.data.order.driver_name,
                  "car_num": car_num,
                  "tel": this.data.order.driver_tel,
                }).then(res => {
                  console.log("乘客提醒", res)
                })

              }, err => {})
              wx.showToast({
                  title: '已成功接单',
                  icon: 'success',
                  duration: 5000
                })
                setTimeout(function() {
                  wx.reLaunch({
                    url: '../../order/order_coming/order_coming?id=' + that.data.id + "&&index=0",
                  })
                }, 200)

            }, err => {
              // err
            })
          } else {
            console.log("已被接单")
            this.setData({
              disabled: true
            })
            wx.showToast({
              title: '已被接单或者已退款,请选择其他订单',
              icon: 'none'
            })
          }
        }, err => {

        })

      }


    }, err => {
      // err
    })

  }
})