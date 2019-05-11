// pages/register/register.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    value:[]
  },

  checkboxChange(e) {
    console.log('checkbox发生change事件，携带value值为：', e.detail.value)
    this.setData({
      value: e.detail.value
    })
  },
  onLoad(e) {

  },
  driver(e) {
    if (this.data.value.length==3) {
      wx.navigateTo({
        url: '../register/Driver_reg/Driver_reg',
      })
    } else {
      this.setData({
        modalName: 'Modal'
      })
    }
  },
  passenger(e) {
    if (this.data.value.length == 3) {
      wx.navigateTo({
        url: '../register/Passenger_reg/Passenger_reg',
      })
    } else {
      this.setData({
        modalName: 'Modal'
      })
    }
  },
  showModal(e){
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
  look(e) {
    this.setData({
      look: true,
      modalName: null
    })
  },
  car(e) {
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
  soft(e) {
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
  user(e) {
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