// pages/menu/about/about.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    loadProgress: 0,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showNavigationBarLoading()
    let contentGroupID = 1555671806003867
    let richTextID = 1555672028597339
    let MyContentGroup = new wx.BaaS.ContentGroup(contentGroupID)
    MyContentGroup.getContent(richTextID).then(res => {
      // success
      this.setData({
        content: res.data.content
      })
      wx.hideNavigationBarLoading()
    }, err => {
      // err
    })
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
  car(e){
    this.showModal(e);
    wx.showNavigationBarLoading()
    let contentGroupID = 1556291137908242
    let richTextID = 1556291272775138
    let MyContentGroup = new wx.BaaS.ContentGroup(contentGroupID)
    MyContentGroup.getContent(richTextID).then(res => {
      // success
      this.setData({
        contentup: res.data.content
      })
      wx.hideNavigationBarLoading()
    }, err => {
      // err
    })
  },
  soft(e){
    this.showModal(e);
    wx.showNavigationBarLoading()
    let contentGroupID = 1556291418789706
    let richTextID = 1556291452718949
    let MyContentGroup = new wx.BaaS.ContentGroup(contentGroupID)
    MyContentGroup.getContent(richTextID).then(res => {
      // success
      this.setData({
        contentup: res.data.content
      })
      wx.hideNavigationBarLoading()
    }, err => {
      // err
    })
  },
  user(e){
    this.showModal(e);
    wx.showNavigationBarLoading()
    let contentGroupID = 1556291303339115
    let richTextID = 1556291402469161
    let MyContentGroup = new wx.BaaS.ContentGroup(contentGroupID)
    MyContentGroup.getContent(richTextID).then(res => {
      // success
      this.setData({
        contentup: res.data.content
      })
      wx.hideNavigationBarLoading()
    }, err => {
      // err
    })
  }
})