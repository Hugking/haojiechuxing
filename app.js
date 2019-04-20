//app.js
App({

  onLaunch: function() {
    var that = this

    wx.cloud.init({
      traceUser: true,
      env: 'haojiechuxing-3bf093'
    })

    wx.BaaS = requirePlugin('sdkPlugin')
    //让插件帮助完成登录、支付等功能
    wx.BaaS.wxExtend(wx.login, wx.getUserInfo, wx.requestPayment)
    //知晓云管理后台获取到的 ClientID
    let clientID = '3f5751e5076c11b4d4df'
    wx.BaaS.init(clientID)

    var role = wx.getStorageSync('role') || []

    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })
    // 获取系统状态栏信息
    wx.getSystemInfo({
      success: e => {
        this.globalData.StatusBar = e.statusBarHeight;
        this.globalData.windowHeight = e.windowHeight;
        this.globalData.Screenwidth = e.screenWidth;
        this.globalData.Screenheight = e.screenHeight;
        let custom = wx.getMenuButtonBoundingClientRect();
        this.globalData.Custom = custom;
        this.globalData.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
      }
    })
  },
  globalData: {
    userInfo: null,
    access_token: '',
    hotaddr: [{
        latitude: 33.74882,
        longitude: 113.20913,
        name: "平顶山学院",
        bg: "bg-red"
      },
      {
        latitude: 33.77323,
        longitude: 113.17813,
        name: "平顶山学院医学院",
        bg: "bg-orange"
      },
      {
        latitude: 33.77242,
        longitude: 113.18154,
        name: "河南城建学院西门",
        bg: "bg-yellow"
      },
      {
        latitude: 33.7267,
        longitude: 113.32885,
        name: "河南城建学院北门",
        bg: "bg-olive"
      },
      {
        latitude: 33.7193,
        longitude: 113.30413,
        name: '平顶山站',
        bg: 'bg-green'
      },
      {
        latitude: 33.85509,
        longitude: 113.04694,
        name: '平顶山西站',
        bg: 'bg-cyan'
      },
      {
        latitude: 33.74109,
        longitude: 113.32619,
        name: '平顶山长途汽车站',
        bg: 'bg-blue'
      },
      {
        latitude: 33.72517,
        longitude: 113.30505,
        name: '平顶山汽车站',
        bg: 'bg-purple'
      },
      {
        latitude: 33.57271,
        longitude: 113.96334,
        name: "漯河西站",
        bg: "bg-mauve"
      },
      {
        latitude: 34.04806,
        longitude: 113.88765,
        name: "许昌东站",
        bg: "bg-pink"
      },
      {
        latitude: 34.525319858,
        longitude: 113.854726419,
        name: "郑州新郑国际机场",
        bg: "bg-brown"
      },
      {
        latitude: 34.759276621,
        longitude: 113.779147133,
        name: "郑州东站",
        bg: "bg-grey"
      },
      {
        latitude: 34.746045932,
        longitude: 113.659617973,
        name: "郑州站",
        bg: "bg-gray"
      },
      {
        latitude: 34.746648,
        longitude: 113.655957,
        name: "郑州地铁站",
        bg: "bg-blue"
      }
    ],
    enhotaddr: [
      {
        latitude: 33.7193,
        longitude: 113.30413,
        name: '平顶山站',
        bg: 'bg-green'
      },
      {
        latitude: 33.85509,
        longitude: 113.04694,
        name: '平顶山西站',
        bg: 'bg-cyan'
      },
      {
        latitude: 33.74109,
        longitude: 113.32619,
        name: '平顶山长途汽车站',
        bg: 'bg-blue'
      },
      {
        latitude: 33.72517,
        longitude: 113.30505,
        name: '平顶山汽车站',
        bg: 'bg-purple'
      },
      {
        latitude: 33.57271,
        longitude: 113.96334,
        name: "漯河西站",
        bg: "bg-mauve"
      },
      {
        latitude: 34.04806,
        longitude: 113.88765,
        name: "许昌东站",
        bg: "bg-pink"
      },
      {
        latitude: 34.525319858,
        longitude: 113.854726419,
        name: "郑州新郑国际机场",
        bg: "bg-brown"
      },
      {
        latitude: 34.759276621,
        longitude: 113.779147133,
        name: "郑州东站",
        bg: "bg-grey"
      },
      {
        latitude: 34.746045932,
        longitude: 113.659617973,
        name: "郑州站",
        bg: "bg-gray"
      },
      {
        latitude: 34.746648,
        longitude: 113.655957,
        name: "郑州地铁站",
        bg: "bg-blue"
      },
      {
        latitude: 33.74882,
        longitude: 113.20913,
        name: "平顶山学院",
        bg: "bg-red"
      },
      {
        latitude: 33.77323,
        longitude: 113.17813,
        name: "平顶山学院医学院",
        bg: "bg-orange"
      },
      {
        latitude: 33.77242,
        longitude: 113.18154,
        name: "河南城建学院西门",
        bg: "bg-yellow"
      },
      {
        latitude: 33.7267,
        longitude: 113.32885,
        name: "河南城建学院北门",
        bg: "bg-olive"
      },
    ],
    ColorList: [{
        title: '嫣红',
        name: 'red',
        color: '#e54d42'
      },
      {
        title: '桔橙',
        name: 'orange',
        color: '#f37b1d'
      },
      {
        title: '明黄',
        name: 'yellow',
        color: '#fbbd08'
      },
      {
        title: '橄榄',
        name: 'olive',
        color: '#8dc63f'
      },
      {
        title: '森绿',
        name: 'green',
        color: '#39b54a'
      },
      {
        title: '天青',
        name: 'cyan',
        color: '#1cbbb4'
      },
      {
        title: '海蓝',
        name: 'blue',
        color: '#0081ff'
      },
      {
        title: '姹紫',
        name: 'purple',
        color: '#6739b6'
      },
      {
        title: '木槿',
        name: 'mauve',
        color: '#9c26b0'
      },
      {
        title: '桃粉',
        name: 'pink',
        color: '#e03997'
      },
      {
        title: '棕褐',
        name: 'brown',
        color: '#a5673f'
      },
      {
        title: '玄灰',
        name: 'grey',
        color: '#8799a3'
      },
      {
        title: '草灰',
        name: 'gray',
        color: '#aaaaaa'
      },
      {
        title: '墨黑',
        name: 'black',
        color: '#333333'
      },
      {
        title: '雅白',
        name: 'white',
        color: '#ffffff'
      }
    ]
  }
})
// ChooseImagedl() {
//   wx.chooseImage({
//     count: 4, //默认9
//     sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
//     sourceType: ['album'], //从相册选择
//     success: (res) => {
//       if (this.data.Driver_lic.length != 0) {
//         this.setData({
//           Driver_lic: this.data.Driver_lic.concat(res.tempFilePaths)
//         })
//       } else {
//         this.setData({
//           Driver_lic: res.tempFilePaths
//         })
//       }
//     }
//   });
// },
// ViewImagedl(e) {
//   wx.previewImage({
//     urls: this.data.Driver_lic,
//     current: e.currentTarget.dataset.url
//   });
// },
// DelImgdl(e) {
//   wx.showModal({
//     title: '删除',
//     content: '确定要删除吗？',
//     cancelText: '取消',
//     confirmText: '确认',
//     success: res => {
//       if (res.confirm) {
//         this.data.Driver_lic.splice(e.currentTarget.dataset.index, 1);
//         this.setData({
//           Driver_lic: this.data.Driver_lic
//         })
//       }
//     }
//   })
// },