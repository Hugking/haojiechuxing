// pages/menu/modify/modify.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    loadProgress: 0,
    index: null,
    sex: true,
    picker: ['车型1', '车型2', '其他'],
    role: null,
    info: null,
    id: null
  },
  onLoad: function() {
    wx.showNavigationBarLoading()
    var that = this
    var role = wx.getStorageSync('role')
    that.setData({
      role: role
    })
    var userinfo = wx.getStorageSync('userinfo')
    let Prodect = new wx.BaaS.TableObject(role)
    let query = new wx.BaaS.Query()
    Prodect.setQuery(query.contains('openid', userinfo.openid)).find().then(res => {
      // success
      console.log("查询到的信息", res.data.objects[0])
      if (res.data.objects[0].sex == '女') {
        that.setData({
          sex: false
        })
      }
      that.setData({
        info: res.data.objects[0],
        id: res.data.objects[0].id
      })
      wx.hideNavigationBarLoading()
    })
  },
  PickerChange(e) {
    console.log(e.detail.value);
    this.setData({
      index: e.detail.value
    })
  },
  sexchange(e) {
    console.log(e.detail.value);
    this.setData({
      sex: e.detail.value
    })
  },
  submitd: function(e) {
    let Product = new wx.BaaS.TableObject("Driver")
    let product = Product.getWithoutData(this.data.id)
    if (this.data.sex == true){
      e.detail.value['sex']='男'
    }
    if (this.data.sex == false) {
      e.detail.value['sex'] = '女'
    }
    console.log("填入的司机信息", e.detail.value)
    product.set(e.detail.value)
    product.update().then(res => {
      // success
      console.log(res.data)
      wx.showToast({
        title: '信息修改成功',
        icon: 'success',
        duration: 2000
      })
    }, err => {
      // err
    })
  },
  submitp: function(e) {
    let Product = new wx.BaaS.TableObject("Passenger")
    let product = Product.getWithoutData(this.data.id)
    console.log("填入的乘客信息", e.detail.value)
    product.set(e.detail.value)
    product.update().then(res => {
      // success
      console.log(res.data)
      wx.showToast({
        title: '信息修改成功',
        icon: 'success',
        duration: 2000
      })
    }, err => {
      // err
    })

  }
})