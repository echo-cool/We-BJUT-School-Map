// pages/index/index.js
var app = getApp()
const config = require("../config");

const AV = require('../utils/av-weapp-min');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        show_auth: true,
        images: app.globalData.introduce.images,
        shortName: app.globalData.introduce.shortName,
        mapCopyright: app.globalData.introduce.mapCopyright,
        imgCDN: app.imgCDN
    },

    /** 
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let that = this;
        wx.setNavigationBarTitle({
          title: app.globalData.introduce.name
        })

        wx.showLoading({
            title: '验证中...',
        });
        AV.User.loginWithWeapp().then(user => {
            wx.hideLoading()
            wx.showLoading({
                title: '加载中...',
            });
            app.globalData.user = user.attributes;
            app.globalData.blacklist = user.attributes.blacklist;
            if (app.globalData.blacklist) {
                wx.showToast({
                    icon:"none",
                    title: '黑名单用户！',
                })
            } else {
                wx.getSetting({
                    success(res) {
                        console.log(res)
                        if (!res.authSetting['scope.userInfo']) {
                            that.setData({
                                show_auth: true
                            });
                            wx.hideLoading()
                        } else {
                            //获取用户信息
                            that.getUserInfo()
                            // that.login()
                        }
                    }
                })
            }
        }).catch(console.error);



    },
    // login
    login: function () {
        var that = this
        wx.showLoading({
            title: '登录中...',
        });
        // 调用云函数
        wx.cloud.callFunction({
            name: 'login',
            data: {},
            success: res => {
                console.log('[云函数] [login] user openid: ', res.result.openid)
                app.globalData.userId = res.result.openid
                wx.setStorageSync('openid', res.result.openid)
                wx.hideLoading()
                wx.navigateTo({
                    url: '/pages/map/index'
                })
            },
            fail: err => {
                wx.showModal({
                    title: '登录失败',
                    content: err,
                })
            }
        })
    },
    /**
     * 获取用户信息 
     */
    getUserInfo: function () {
        wx.showLoading({
            title: '加载中...',
        });
        // console.log('get user info');
        let that = this;
        wx.getSetting({
            success: res => {
                console.log('getuserinfo', res);
                if (res.authSetting['scope.userInfo']) {
                    //   已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
                    wx.getUserInfo({
                        success: res => {
                            // 可以将 res 发送给后台解码出 unionId
                            app.globalData.userInfo = res.userInfo
                            // console.log('userinfo', app.globalData)
                            // 缓存
                            if (!wx.getStorageSync('userInfo')) {
                                console.log('22')
                                wx.setStorageSync('userInfo', res.userInfo)

                            }
                            wx.hideLoading()
                            // 登录
                            that.login()
                            // wx.hideLoading()
                        }
                    })
                } else {
                    console.log('未授权');
                    wx.navigateTo({
                        url: '/pages/index',
                    })
                }
            }
        })
    },

    /**
     * 监听用户点击授权按钮
     */
    getAuthUserInfo: function (data) {
        // console.log('data', data)
        if(app.globalData.blacklist){
            wx.showToast({
                icon:"none",
                title: '黑名单用户！',
            })
        }
        else{
        console.log('data', data.detail.errMsg)
        if (data.detail.errMsg == "getUserInfo:ok") {
            this.setData({
                show_auth: false
            });
            // wx.showLoading({
            //     title: '登录中...',
            // })
            // 获取用户信息
            this.getUserInfo()
            // this.login()
        } else {
            this.setData({
                show_auth: true
            });
        }
    }

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

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function (res) {
      if (res.from === 'button') {
        // 来自页面内转发按钮
        console.log(res.target)
      }
      return {
        title: app.globalData.introduce.name + ' - 校园导览',
        path: '/pages/index',
        imageUrl: app.imgCDN + app.globalData.introduce.share,
        success: function (res) {
          // 转发成功
        },
        fail: function (res) {
          // 转发失败
        }
      }
    },
})