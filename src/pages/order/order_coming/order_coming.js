// pages/order/order_coming/order_coming.js
const app = getApp()
var QQMapWX = require('../../../libs/qqmap-wx-jssdk.min.js');
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
    item: null,
    longitude: null,
    latitude: null,
    markerfin: null,
    polyline: null,
    markers: null,
    markere: null,
    role: null,
    index: null
  },
  onShow: function() {
    // var that = this
    // var query = wx.createSelectorQuery();
    // query.select('#getheight1').boundingClientRect()
    // query.select('#getheight2').boundingClientRect()
    // query.exec(function (res) {
    //   //console.log(res);
    //   that.setData({
    //     mapheight: (app.globalData.Screenheight - res[0].height - res[1].height) + 'px'
    //   })
    // })
  },
  onLoad: function(options) {
    wx.showNavigationBarLoading()
    console.log(options)
    var that = this
    that.setData({
      id: options.id,
      role: wx.getStorageSync("role"),
      nowtime: Date.parse(new Date())
    })
    if (options.index) {
      this.setData({
        index: options.index
      })
    }
    let Order = new wx.BaaS.TableObject('Order');
    Order.get(that.data.id).then(res => {
      // success
      console.log('订单详情', res.data)
      if (res.data.isget && !res.data.confirm_isget) {
        wx.reLaunch({
          url: '../../driver/order_detail/order_detail?id=' + res.data.id,
        })
      } else {
        res.data.datetime = util.Formatunix(res.data['pre_time_str'] / 1000);
        var markers = {
          latitude: res.data.startpoint.coordinates[1],
          longitude: res.data.startpoint.coordinates[0],
        }
        var markere = {
          latitude: res.data.endpoint.coordinates[1],
          longitude: res.data.endpoint.coordinates[0],
        }
        that.setData({
          item: res.data,
          markers: markers,
          markere: markere,
          latitude: res.data.startpoint.coordinates[1],
          longitude: res.data.startpoint.coordinates[0]
        })
        that.waydetail();
      }
      wx.hideNavigationBarLoading()

    }, err => {
      // err
    })
  },
  waydetail(e) {
    var that = this
    var qqmapsdk = new QQMapWX({
      key: '5U7BZ-QDB6X-MDS46-ZWGSA-WXRKZ-SMBVD'
    });
    let markerfin = [{
      iconPath: "/img/mapicon_navi_s.png",
      id: 0,
      latitude: that.data.markers.latitude,
      longitude: that.data.markers.longitude, //高德返回的是数组
      width: 23,
      height: 33
    }, {
      iconPath: "/img/mapicon_navi_e.png",
      id: 0,
      latitude: that.data.markere.latitude,
      longitude: that.data.markere.longitude,
      width: 24,
      height: 34
    }]
    that.setData({
      markerfin: markerfin
    })
    app.globalData.marker = {
      'st': that.data.markers.latitude + ',' + that.data.markers.longitude,
      'en': that.data.markere.latitude + ',' + that.data.markere.longitude,
    }
    qqmapsdk.direction({
      mode: 'driving', //可选值：'driving'（驾车）、'walking'（步行）、'bicycling'（骑行），不填默认：'driving',可不填
      //from参数不填默认当前地址
      from: app.globalData.marker['st'],
      to: app.globalData.marker['en'],
      success: function(res) {
        //console.log(res);
        var ret = res;
        var coors = ret.result.routes[0].polyline,
          pl = [];
        //坐标解压（返回的点串坐标，通过前向差分进行压缩）
        var kr = 1000000;
        for (var i = 2; i < coors.length; i++) {
          coors[i] = Number(coors[i - 2]) + Number(coors[i]) / kr;
        }
        //将解压后的坐标放入点串数组pl中
        for (var i = 0; i < coors.length; i += 2) {
          pl.push({
            latitude: coors[i],
            longitude: coors[i + 1]
          })
        }
        //console.log(pl)
        //设置polyline属性，将路线显示出来,将解压坐标第一个数据作为起点
        that.setData({
          latitude: pl[0].latitude,
          longitude: pl[0].longitude,
          polyline: [{
            points: pl,
            color: '#0081ff',
            width: 4
          }]
        })
        if (ret.result.routes[0] && ret.result.routes[0].distance) {
          that.setData({
            distance: ((ret.result.routes[0].distance - (ret.result.routes[0].distance) % 10) / 10) / 100
          });
        }
      },
      fail: function(error) {
        console.error(error);
        // wx.showModal({
        //   title: error
        // })
      }
    });
  },
  incar(e) {
    console.log(e)
    var that = this
    let Order = new wx.BaaS.TableObject('Order')
    let order = Order.getWithoutData(this.data.id)
    Order.get(this.data.id).then(res => {
      // success
      console.log('订单详情', res)
      order.set('in_car', true)
      order.update().then(res => {
        // success
        console.log("乘客已坐车", res.data)
        res.data.datetime = util.Formatunix(res.data['pre_time_str'] / 1000);
        that.setData({
          item: res.data,
        })

        wx.showToast({
          title: '确认乘客到达后完成订单',
          icon: 'none',
          duration: 2000
        })
      }, err => {
        // err
      })
    }, err => {
      // err
    })
  },
  completion(e) {
    console.log(e)
    var that = this
    let Order = new wx.BaaS.TableObject('Order')
    let order = Order.getWithoutData(this.data.id)
    Order.get(this.data.id).then(res => {
      // success
      console.log('订单详情', res.data)

      var Amount = new wx.BaaS.TableObject('amount')
      var query = new wx.BaaS.Query()
      let userInfo = wx.getStorageSync('userinfo')
      query.compare('openid', '=', userInfo.openid)
      Amount.setQuery(query).find().then(res => {
        if (res.data.objects[0]) {
          console.log('查询的余额', res.data.objects[0].now_cost, res.data.objects[0].total_cost)
          var Amount = new wx.BaaS.TableObject('amount')
          let amount = Amount.getWithoutData(res.data.objects[0].id)
          amount.set("now_cost", util.accAdd(parseFloat(res.data.objects[0].now_cost).toFixed(2), parseFloat((parseInt(this.data.item.cost) * 0.93).toFixed(2))))
          amount.set("total_cost", util.accAdd(parseFloat(res.data.objects[0].total_cost).toFixed(2), parseFloat((parseInt(this.data.item.cost) * 0.93).toFixed(2))))
          // amount.set("now_cost", parseFloat(res.data.objects[0].now_cost + parseFloat((parseInt(this.data.item.cost) * 0.93).toFixed(2)) ).toFixed(2) )
          // amount.set("total_cost", parseFloat(res.data.objects[0].total_cost + parseFloat((parseInt(this.data.item.cost) * 0.93).toFixed(2)) ).toFixed(2))
          amount.update().then(res => {
            console.log('加入结算成功', res.data.now_cost, res.data.total_cost, res.data)
            wx.showToast({
              title: '金额已到账户',
              icon: 'success',
              duration: 2000
            })
            order.set('completion', true)
            order.set('settle', true)
            order.update().then(res => {
              // success
              console.log("订单已完成", res.data)
              res.data.datetime = util.Formatunix(res.data['pre_time_str'] / 1000);
              that.setData({
                item: res.data,
              })
            }, err => {
              console.log('加入结算失败')
            })
          })
        } else {
          // var Amount = new wx.BaaS.TableObject('amount')
          // let amount = Amount.create();
          // let Driver = new wx.BaaS.TableObject('Driver')
          // let query = new wx.BaaS.Query()
          // Driver.setQuery(query.contains('openid', userInfo.openid)).find().then(res => {
          //   console.log(res.data.objects[0])
          //   let userInfo = wx.getStorageSync('userinfo')
          //   amount.set("now_cost", parseFloat((parseInt(this.data.item.cost) * 0.93).toFixed(2)))
          //   amount.set("total_cost", parseFloat((parseInt(this.data.item.cost) * 0.93).toFixed(2)))
          //   amount.set("openid", userInfo.openid)
          //   amount.set("name", res.data.objects[0].name)
          //   amount.save().then(res => {
          //     // success
          //     console.log(res)
          //     wx.showToast({
          //       title: '金额已到账户',
          //       icon: 'success',
          //       duration: 2000
          //     })
          //   }, err => {
          //     //err 为 HError 对象
          //   })
          // })
        }
      })

      var Driver = new wx.BaaS.TableObject('Driver')
      var query = new wx.BaaS.Query()
      query.compare('openid', '=', that.data.item.driver_openid)
      Driver.setQuery(query).find().then(res => {
        console.log('司机信息', res.data.objects[0])
        wx.BaaS.invoke('send_driver', {
          "user_id": res.data.objects[0].driverid,
          "tem_id": "3foYa9__1-M1n1TcydQ4jb67Dv3ucKSs3POnkvZHOPM",
          "order_id": that.data.item.id,
          "way": that.data.item.startname + "=>" + this.data.item.endname,
          "time": util.Formatunix(this.data.item.pre_time_str / 1000),
        }).then(res => {
          console.log("司机提醒", res)
        })
      }, err => {})

      setTimeout(function() {
        wx.reLaunch({
          url: '../../driver/driver',
        })
      }, 300)

    }, err => {
      // err
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
  go_index(e) {
    wx.reLaunch({
      url: '../../home/home',
    })
  },
  phonecall(e) {
    wx.makePhoneCall({
      phoneNumber: this.data.item.usertel,
    })
  },
})