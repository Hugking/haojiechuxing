// pages/register/Passenger_reg/Passenger_reg.js
const app = getApp();
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
  submit: function (e) {
    console.log("填入的乘客信息", e.detail.value)
    var userinfo = wx.getStorageSync('userinfo');
    console.log(userinfo)
    if (e.detail.value['name'] == '' || e.detail.value['tel'] == '') {
      wx.showToast({
        title: '姓名电话为必填项，不能为空',
        icon: 'none',
        duration: 2000
      })
    }
    else {
      wx.showNavigationBarLoading();
      let Passenger = new wx.BaaS.TableObject('Passenger')
      let query = new wx.BaaS.Query()
      Passenger.setQuery(query.contains('openid', userinfo.openid)).find().then(res => {
        // success
        console.log("查询到的信息", res.data.objects)
        if (res.data.objects[0] == null) {
          console.log("查询失败，正在注册")

          let passenger = Passenger.create()
          let info = {
            name: e.detail.value['name'],
            tel: e.detail.value['tel'],
            grade: e.detail.value['grade'],
            magor: e.detail.value['magor'],
            school: e.detail.value['school'],
            openid: userinfo['openid'],
            passengerid: userinfo['id']
          }
          console.log(info)
          passenger.set(info).save().then(res => {
            // success
            console.log("上传乘客信息成功", res)
            wx.setStorageSync('role', 'Passenger')
            wx.hideNavigationBarLoading()
            wx.reLaunch({
              url: '../../home/home',
              success: function(res) {},
              fail: function(res) {},
              complete: function(res) {},
            })
          }, err => {
            //err 为 HError 对象
          })
        }
        else {
          wx.showNavigationBarLoading();
          console.log("查询成功，正在登录")
          wx.showToast({
            title: '已注册，正在登录',
            icon: 'none',
            duration: 2000
          })
          wx.setStorageSync('role', 'Passenger')
          wx.hideNavigationBarLoading()
          wx.reLaunch({
            url: '../../home/home',
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { },
          })
        }
      })
    }

  },
})
