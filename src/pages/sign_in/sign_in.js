// pages/sign_in/sign_in.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.hideLoading()
  },
  Passenger_sign_in: function (e) {
    var userinfo = wx.getStorageSync('userinfo');
    console.log(userinfo)
    let query = new wx.BaaS.Query()
    let Passenger = new wx.BaaS.TableObject('Passenger')
    // 不设置查询条件
    Passenger.setQuery(query.contains('openid', userinfo.openid)).find().then(res => {
      // success
      console.log("查询到的乘客信息", res.data.objects)
      if (res.data.objects[0] == null) {
        console.log("查询失败，请先注册")
        wx.setStorageSync('passenger_register', false)
        wx.showToast({
          icon: 'none',
          title: '您还未注册哟',
          duration: 2000
        })
      }
      else {
        console.log("查询成功，正在登录")
        wx.setStorageSync('role', 'Passenger')
        wx.setStorageSync('passenger_register', true)
        app.globalData.role = 'Passenger'
        wx.showToast({
          title: '乘客登录成功',
          icon: 'none'
        })
        wx.reLaunch({
          url: '../home/home',
        })
      }

    }, err => {
      // err
      this.loadProgress();
      console.log("查询过程中失败", err)
    })

  },
  Driver_sign_in: function (e) {
    var userinfo = wx.getStorageSync('userinfo');
    //console.log(userinfo)
    let query = new wx.BaaS.Query()
    let Driver = new wx.BaaS.TableObject('Driver')
    // 不设置查询条件
    Driver.setQuery(query.contains('openid', userinfo.openid)).find().then(res => {
      // success
      console.log("查询到的司机信息", res.data.objects)
      if (res.data.objects[0] == null) {
        console.log("查询失败，请先注册")
        wx.setStorageSync('driver_register', false)
        wx.showToast({
          icon: 'none',
          title: '您还未注册哟',
          duration: 2000
        })
      }
      else {
        console.log("查询成功，正在登录")
        wx.setStorageSync('role', 'Driver')
        wx.setStorageSync('driver_register', true)
        app.globalData.role = "Driver"
        wx.showToast({
          title: '司机登录成功',
          icon: 'none'
        })
        this.loadProgress();
        wx.reLaunch({
          url: '../driver/driver',
        })
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
  register: function (e) {
    wx.navigateTo({
      url: '../register/register',
    })
  }
})
