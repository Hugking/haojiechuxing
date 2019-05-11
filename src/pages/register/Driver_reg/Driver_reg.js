// pages/register/Driver_reg/Driver_reg.js
const app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    loadProgress: 0,
    index: null,
    typeindex: null,
    sex: true,
    picker: ['斯柯达', '上汽大通', '东风悦达起亚', '现代','其他'],
    typepicker:['白班(7:00~18:00)','夜班(18:00~7:00)'],
    ID_pic_z: null,
    ID_pic_b: null,
    ID_pic_z_id: null,
    ID_pic_b_id: null,
    Driver_lic_z: null,
    Driver_lic_b: null,
    Driver_lic_z_id: null,
    Driver_lic_b_id: null,
    Vechicle_lic_z: null,
    Vechicle_lic_b: null,
    Vechicle_lic_z_id: null,
    Vechicle_lic_b_id: null,
    Vechicle_pic_z: null,
    Vechicle_pic_b: null,
    Vechicle_pic_z_id: null,
    Vechicle_pic_b_id: null,
    isLoad: true,
    recordID: null,
    pic: false,
  },
  PickerChange(e) {
    console.log(e.detail.value);
    this.setData({
      index: e.detail.value
    })
  },
  TypeChange(e) {
    console.log(e.detail.value);
    this.setData({
      typeindex: e.detail.value
    })
  },
  sexchange(e) {
    console.log(e.detail.value);
    this.setData({
      sex: e.detail.value
    })
  },
  submit: function (e) {
    if(this.data.recordID == null){
      console.log("填入的司机信息", e.detail.value)
      var userinfo = wx.getStorageSync('userinfo');
      //console.log(userinfo)
      if (e.detail.value['name'] == '' || e.detail.value['tel'] == '' || e.detail.value['car_num'] == '' || this.data.index == null ||this.data.typeindex == null) {
        wx.showToast({
          title: '必填项，不能为空',
          icon: 'none',
          duration: 2000
        })
      } else {
        let Driver = new wx.BaaS.TableObject('Driver')
        let query = new wx.BaaS.Query()
        wx.showLoading({
          title: '上传中',
        })
        Driver.setQuery(query.contains('openid', userinfo.openid)).find().then(res => {
          // success
          console.log("查询到的信息", res.data.objects)
          var Amount = new wx.BaaS.TableObject('amount')
          var query = new wx.BaaS.Query()
          query.compare('openid', '=', userinfo.openid)
          Amount.setQuery(query).find().then(res => {
            console.log('账户信息',res.data.objects[0])
            if (res.data.objects[0]) {
            } else {
              var Amount = new wx.BaaS.TableObject('amount')
              let amount = Amount.create();
              amount.set("openid", userinfo.openid)
              amount.set("name", e.detail.value['name'])
              amount.save().then(res => {
                // success
                console.log("账户信息",res.data)
              }, err => {
                //err 为 HError 对象
              })
            }
          })
          if (res.data.objects[0] == null) {
            console.log("未查询到，正在注册")
            if (this.data.index == 4) {
              var car_type = e.detail.value['car_type']
            } else {
              car_type = this.data.picker[this.data.index]
            }
            if (this.data.sex) {
              var sexup = '男'
            } else {
              var sexup = '女'
            };
            if (this.data.typeindex == 0) {
              var type = 'light'
            } else {
              var type = 'night'  
            };

            let driver = Driver.create()
            let info = {
              name: e.detail.value['name'],
              tel: e.detail.value['tel'],
              openid: userinfo['openid'],
              driverid: userinfo['id'],
              car_num: e.detail.value['car_num'],
              car_type: car_type,
              sex: sexup,
              type:type
            }

            driver.set(info).save().then(res => {
              // success
              console.log("上传司机信息成功", res)
              wx.setStorageSync('role', 'Driver')
              wx.setStorageSync('driver_register', true)
              wx.hideLoading()
              this.setData({
                recordID: res.data.id,
                pic: true
              })
            }, err => {
              //err 为 HError 对象
              wx.hideLoading()
            })
          } else {
            console.log("已注册过，正在登录")
            wx.showToast({
              title: '已被注册过，正在登录',
              icon: 'none',
              duration: 2000
            })
            wx.setStorageSync('role', 'Driver')
            wx.setStorageSync('driver_register', true)
            setTimeout(() => {
              wx.reLaunch({
                url: '../../driver/driver',
              })
            }, 1000)

          }
        })
      }
    }
    else{
      wx.showLoading({
        title: '请稍后',
      })
    }
  },
  reset: function (e) {
  },
  del(e) {
    //console.log(e.currentTarget.id)
    let MyFile = new wx.BaaS.File()
    if (e.currentTarget.id == 'ID_pic_z') {
      MyFile.delete(this.data.ID_pic_z_id).then((res) => {
        console.log("删除成功", res)
        this.setData({
          ID_pic_z: null,
          ID_pic_z_id: null
        })
      })
    }
    if (e.currentTarget.id == 'ID_pic_b') {
      MyFile.delete(this.data.ID_pic_b_id).then((res) => {
        console.log("删除成功", res)
        this.setData({
          ID_pic_b: null,
          ID_pic_b_id: null
        })
      })
    }
    if (e.currentTarget.id == 'Driver_lic_z') {
      MyFile.delete(this.data.Driver_lic_z_id).then((res) => {
        console.log("删除成功", res)
        this.setData({
          Driver_lic_z: null,
          Driver_lic_z_id: null
        })
      })
    }
    if (e.currentTarget.id == 'Driver_lic_b') {
      MyFile.delete(this.data.Driver_lic_b_id).then((res) => {
        console.log("删除成功", res)
        this.setData({
          Driver_lic_b: null,
          Driver_lic_b_id: null
        })
      })
    }
    if (e.currentTarget.id == 'Vechicle_lic_z') {
      MyFile.delete(this.data.Vechicle_lic_z_id).then((res) => {
        console.log("删除成功", res)
        this.setData({
          Vechicle_lic_z: null,
          Vechicle_lic_z_id: null
        })
      })
    }
    if (e.currentTarget.id == 'Vechicle_lic_b') {
      MyFile.delete(this.data.Vechicle_lic_b_id).then((res) => {
        console.log("删除成功", res)
        this.setData({
          Vechicle_lic_b: null,
          Vechicle_lic_b_id: null
        })
      })
    }
    if (e.currentTarget.id == 'Vechicle_pic_z') {
      MyFile.delete(this.data.Vechicle_pic_z_id).then((res) => {
        console.log("删除成功", res)
        this.setData({
          Vechicle_pic_z: null,
          Vechicle_pic_z_id: null
        })
      })
    }
    if (e.currentTarget.id == 'Vechicle_pic_b') {
      MyFile.delete(this.data.Vechicle_pic_b_id).then((res) => {
        console.log("删除成功", res)
        this.setData({
          Vechicle_pic_b: null,
          Vechicle_pic_b_id: null
        })
      })
    }
  },
  sel(type, pic, show) {
    var that = this
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success(res) {
        var tempFilePaths = res.tempFilePaths
        //console.log(res.tempFilePaths)
        let MyFile = new wx.BaaS.File()
        let fileParams = {
          filePath: res.tempFilePaths[0]
        }
        let metaData = {
          categoryName: type
        }
        //console.log(metaData)
        that.setData({
          isLoad: false
        })
        MyFile.upload(fileParams, metaData).then(res => {
          let data = res.data // res.data 为 Object 类型
          let Product = new wx.BaaS.TableObject("Driver")
          let product = Product.getWithoutData(that.data.recordID)
          product.set(pic, res.data.file)
          product.update().then(res => {
            console.log(res)
          }).catch(err => {
            console.log(err)
          })
          console.log("上传成功", data.path)
          if (data.path) {
            if (show == 'ID_pic_z') {
              that.setData({
                ID_pic_z: data.path + '!/both/100x100',
                ID_pic_z_id: data.file.id,
              })
            }
            if (show == 'ID_pic_b') {
              that.setData({
                ID_pic_b: data.path + '!/both/100x100',
                ID_pic_b_id: data.file.id,
              })
            }
            if (show == 'Driver_lic_z') {
              that.setData({
                Driver_lic_z: data.path + '!/both/100x100',
                Driver_lic_z_id: data.file.id,
              })
            }
            if (show == 'Driver_lic_b') {
              that.setData({
                Driver_lic_b: data.path + '!/both/100x100',
                Driver_lic_b_id: data.file.id,
              })
            }
            if (show == 'Vechicle_lic_z') {
              that.setData({
                Vechicle_lic_z: data.path + '!/both/100x100',
                Vechicle_lic_z_id: data.file.id,
              })
            }
            if (show == 'Vechicle_lic_b') {
              that.setData({
                Vechicle_lic_b: data.path + '!/both/100x100',
                Vechicle_lic_b_id: data.file.id,
              })
            }
            if (show == 'Vechicle_pic_z') {
              that.setData({
                Vechicle_pic_z: data.path + '!/both/100x100',
                Vechicle_pic_z_id: data.file.id,
              })
            }
            if (show == 'Vechicle_pic_b') {
              that.setData({
                Vechicle_pic_b: data.path + '!/both/100x100',
                Vechicle_pic_b_id: data.file.id,
              })
            }
          }
        }, err => {
          // err
        }).onProgressUpdate(e => {
          // 监听上传进度
          console.log(e)
          if (e.progress == '100') {
            that.setData({
              isLoad: true
            })
          }
        })
      }
    })
  },
  vel(e) {
    console.log(e.currentTarget.id)
    if (e.currentTarget.id == 'ID_pic_z') {
      this.ViewImage(this.data.ID_pic_z)
    }
    if (e.currentTarget.id == 'ID_pic_b') {
      this.ViewImage(this.data.ID_pic_b)
    }
    if (e.currentTarget.id == 'Driver_lic_z') {
      this.ViewImage(this.data.Driver_lic_z)
    }
    if (e.currentTarget.id == 'Driver_lic_b') {
      this.ViewImage(this.data.Driver_lic_b)
    }
    if (e.currentTarget.id == 'Vechicle_lic_z') {
      this.ViewImage(this.data.Vechicle_lic_z)
    }
    if (e.currentTarget.id == 'Vechicle_lic_b') {
      this.ViewImage(this.data.Vechicle_lic_b)
    }
    if (e.currentTarget.id == 'Vechicle_pic_z') {
      this.ViewImage(this.data.Vechicle_pic_z)
    }
    if (e.currentTarget.id == 'Vechicle_pic_b') {
      this.ViewImage(this.data.Vechicle_pic_b)
    }
  },
  ID_pic_z(e) {
    this.sel("ID_pic", "ID_pic_z", "ID_pic_z");
  },
  ID_pic_b(e) {
    this.sel("ID_pic", "ID_pic_b", "ID_pic_b");
  },
  Driver_lic_z(e) {
    this.sel("Driver_lic", "Driver_lic_z", "Driver_lic_z");
  },
  Driver_lic_b(e) {
    this.sel("Driver_lic", "Driver_lic_b", "Driver_lic_b");
  },
  Vechicle_lic_z(e) {
    this.sel("Vechicle_lic", "Vechicle_lic_z", "Vechicle_lic_z");
  },
  Vechicle_lic_b(e) {
    this.sel("Vechicle_lic", "Vechicle_lic_b", "Vechicle_lic_b");
  },
  Vechicle_pic_z(e) {
    this.sel("Vechicle_pic", "Vechicle_pic_z", "Vechicle_pic_z");
  },
  Vechicle_pic_b(e) {
    this.sel("Vechicle_pic", "Vechicle_pic_b", "Vechicle_pic_b");
  },
  com(e) {
    if (this.data.ID_pic_z && this.data.ID_pic_b && this.data.Driver_lic_z && this.data.Driver_lic_b && this.data.Vechicle_lic_z && this.data.Vechicle_lic_b && this.data.Vechicle_pic_z && this.data.Vechicle_pic_b) {
      setTimeout(function(){
        wx.reLaunch({
          url: '../../driver/driver',
        })
      },300)
    } else {
      wx.showToast({
        title: '需上传全部图片',
        icon: 'none',
        duration: 2000
      })
    }
  },
  ViewImage(file) {
    let urls = []
    urls.push(file)
    let curs = file
    console.log(urls, curs)
    wx.previewImage({
      urls: urls,
      current: curs
    });
  },
  black(e) {
    this.setData({
      pic: false
    })
  }
})