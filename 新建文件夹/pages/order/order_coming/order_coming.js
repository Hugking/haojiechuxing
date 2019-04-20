// pages/order/order_coming/order_coming.js
const app = getApp()
var amapFile = require('../../../libs/amap-wx.js');
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
    role:null,
    index:null
  },
  onShow:function(){
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
  onLoad: function (options) {
    wx.showNavigationBarLoading()
    console.log(options)
    var that = this
    that.setData({
      id: options.id,
      role: wx.getStorageSync("role"),
      nowtime: Date.parse(new Date())
    })
    if (options.index){
      this.setData({
        index: options.index
      })
    }
    let Order = new wx.BaaS.TableObject('Order');
    Order.get(that.data.id).then(res => {
      // success
      console.log('订单详情', res.data)
      if (res.data.isget && !res.data.confirm_isget){
        wx.reLaunch({
          url: '../../driver/order_detail/order_detail?id=' + res.data.id,
        })
      }
      else{
        res.data.datetime = util.Formatunix(res.data['pre_time_str'] / 1000);
        var markers = [{
          latitude: res.data.startpoint.coordinates[1],
          longitude: res.data.startpoint.coordinates[0],
        }]
        var markere = [{
          latitude: res.data.endpoint.coordinates[1],
          longitude: res.data.endpoint.coordinates[0],
        }]
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
    var myAmapFun = new amapFile.AMapWX({
      key: '3634f9de8bb3671b2481a1cfeda77202'
    });
    let markerfin = [{
      iconPath: "/img/mapicon_navi_s.png",
      id: 0,
      latitude: that.data.markers[0].latitude,
      longitude: that.data.markers[0].longitude,
      width: 23,
      height: 33
    }, {
      iconPath: "/img/mapicon_navi_e.png",
      id: 0,
      latitude: that.data.markere[0].latitude,
      longitude: that.data.markere[0].longitude,
      width: 24,
      height: 34
    }]
    that.setData({
      markerfin: markerfin
    })
    app.globalData.marker = {
      'st': that.data.markers[0].longitude + ',' + that.data.markers[0].latitude,
      'en': that.data.markere[0].longitude + ',' + that.data.markere[0].latitude
    }
    myAmapFun.getDrivingRoute({
      origin: app.globalData.marker['st'],
      destination: app.globalData.marker['en'],
      success: function (data) {
        console.log(data)
        var points = [];
        if (data.paths && data.paths[0] && data.paths[0].steps) {
          var steps = data.paths[0].steps;
          for (var i = 0; i < steps.length; i++) {
            var poLen = steps[i].polyline.split(';');
            for (var j = 0; j < poLen.length; j++) {
              points.push({
                longitude: parseFloat(poLen[j].split(',')[0]),
                latitude: parseFloat(poLen[j].split(',')[1])
              })
            }
          }
        }
        that.setData({
          polyline: [{
            points: points,
            color: "#0091ff",
            width: 6
          }]
        });
        if (data.paths[0] && data.paths[0].distance) {
          that.setData({
            distance: ((data.paths[0].distance - (data.paths[0].distance) % 10) / 10) / 100
          });
        }
      }
    })
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
          duration:2000
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
      console.log('订单详情', res)
      order.set('completion', true)
      order.update().then(res => {
        // success
        console.log("订单已完成", res.data)
        res.data.datetime = util.Formatunix(res.data['pre_time_str'] / 1000);
        that.setData({
          item: res.data,
        })
        var Driver = new wx.BaaS.TableObject('Driver')
        var query = new wx.BaaS.Query()
        query.compare('openid', '=', that.data.item.driver_openid)
        Driver.setQuery(query).find().then(res => {
          console.log(res)
          wx.BaaS.invoke('send_driver', {
            "user_id": res.data.objects[0].driverid,
            "tem_id": "3foYa9__1-M1n1TcydQ4jb67Dv3ucKSs3POnkvZHOPM",
            "order_id": that.data.item.id,
            "way": that.data.item.startname + "=>" + this.data.item.endname,
            "time": util.Formatunix(this.data.item.pre_time_str / 1000),
          }).then(res => {
            console.log("司机提醒", res)
          })
        }, err => { })
        wx.showToast({
          title: '订单已完成',
          icon: 'success',
          duration: 2000
        })
        setTimeout(
          wx.reLaunch({
            url: '../../driver/driver',
          }),1000
        )
      }, err => {
        // err
      })
    }, err => {
      // err
    })

  },
  formSubmit: function (e) {
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
  go_index(e){
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
