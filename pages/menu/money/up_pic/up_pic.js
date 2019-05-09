// pages/menu/money/up_pic/up_pic.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgList: [],
    recordID:null
  },
  onLoad(options){
    if(options){
      this.setData({
        recordID:options.id
      })
    }
  },
  ChooseImage() {
    wx.chooseImage({
      count: 4, //默认9
      sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], //从相册选择
      success: (res) => {
        if (this.data.imgList.length != 0) {
          this.setData({
            imgList: this.data.imgList.concat(res.tempFilePaths)
          })
        } else {
          this.setData({
            imgList: res.tempFilePaths
          })
        }
      }
    });
  },
  ViewImage(e) {
    wx.previewImage({
      urls: this.data.imgList,
      current: e.currentTarget.dataset.url
    });
  },
  DelImg(e) {
    wx.showModal({
      title: '删除',
      content: '确定要删除这张图片吗？',
      cancelText: '取消',
      confirmText: '确定',
      success: res => {
        if (res.confirm) {
          this.data.imgList.splice(e.currentTarget.dataset.index, 1);
          this.setData({
            imgList: this.data.imgList
          })
        }
      }
    })
  },
  up(e) {
    let MyFile = new wx.BaaS.File()
    let fileParams = { filePath: this.data.imgList[0] }
    let metaData = { categoryName: 'code' }
    MyFile.upload(fileParams, metaData).then(res => {
      let data = res.data  // res.data 为 Object 类型
      let Product = new wx.BaaS.TableObject("amount")
      let product = Product.getWithoutData(this.data.recordID)
      product.set('code', res.data.file)
      product.update().then(res => {
        console.log(res)
      }).catch(err => {
        console.log(err)
      })
    }, err => {
      // err
    }).onProgressUpdate(e => {
      // 监听上传进度
      console.log(e)
    })
    wx.showToast({
      title: '上传成功',
      icon: 'success',
      duration: 2000
    })
    setTimeout(function() {
      wx.navigateBack()
    }, 1000)

  }
})