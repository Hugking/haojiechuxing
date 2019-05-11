// pages/menu/feedback/feedback.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    loadProgress: 0,
    textareaAValue: null
  },
  textareaAInput(e) {
    this.setData({
      textareaAValue: e.detail.value
    })
  },
  submit(e) {
    let Product = new wx.BaaS.TableObject("bug")
    let product = Product.create()
    // 设置方式一
    let user = wx.getStorageSync('userinfo')
    let info = {
      openid: user.openid,
      context: this.data.textareaAValue
    }
    product.set(info).save().then(res => {
      // success
      console.log("反馈",res.data)
      wx.showToast({
        title: '提交成功,感谢您的反馈',
        icon: 'none'
      })
    }, err => {
      //err 为 HError 对象
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})