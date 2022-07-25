/**
 * create by: 邓志锋 <280160522@qq.com> <https://www.diygw.com> DIYGW可视化设计一键生成源码
 * Page扩展函数
 * @param {*} Page 原生Page
 */
import Tools from 'common/Tools.js'
import HttpService from 'common/HttpService.js'
import Session from 'common/Session.js'
import ValidateClazz from 'common/Validate'

const pageExtend = Page => {
    return object => {
        // 导出原生Page传入的object参数中的生命周期函数
        // 由于命名冲突，所以将onLoad生命周期函数命名成了onLoaded
        const { onLoad } = object
        
        object.getOption = function(option){
        	if(option !== null && typeof option === 'object'){
        		for (let key in option) {
        			option[key] = decodeURIComponent(option[key])
        		}
        	}
        	return option
        }
        // // 公共的onLoad生命周期函数
        object.onLoad = function (options) {
            var thiz = this;
            if (options) {
                this.setData({
                    globalOptions: this.getOption(options)
                })
            }
            // 执行onLoaded生命周期函数
            if (typeof onLoad === 'function') {
                onLoad.call(thiz, options)
            }
            
            // 判断用户是否已登录，如果已登录设置用户信息
            if(this.$session.getUser()){
                this.setData({
                    userInfo:this.$session.getUser()
                })
        	}
        }

        object.$tools = new Tools()
        object.$http = new HttpService()
        object.$session = Session
        
        

        object.navigateTo = function (e) {
            let thiz = this
	          let dataset = e.currentTarget?e.currentTarget.dataset:e
            let { id, type } = dataset
            if (type == 'openmodal') {
                this.setData({
                    [id]: 'show'
                })
            } else if (type == 'closemodal') {
                this.setData({
                    [id]: ''
                })
            } else if (type == 'page' || type == 'inner' || type == 'href') {
                this.$tools.navigateTo(dataset.url, dataset);
            } else if (type == 'submit') {
                this.showToast('将执行表单提交动作')
            } else if (type == 'reset') {
                this.showToast('将执行表单重置动作')
            } else if (type == 'tip') {
                this.showToast(dataset.tip)
            } else if (type == 'confirm') {
                wx.showModal({
                    title: '提示',
                    content: dataset.tip,
                    showCancel: !1,
                });
            } else if (type == 'daohang') {
                wx.openLocation({
                    latitude: Number(dataset.lat),
                    longitude: Number(dataset.lng),
                    address: dataset.address,
                    success: function () {
                        console.log('success');
                    }
                });
            } else if (type == 'phone') {
                this.$tools.makePhoneCall(e)
            } else if(type=='previewImage'||type=='preview'){
                wx.previewImage({
                    current: this.$tools.renderImage(dataset.img), // 当前显示图片的http链接
                    urls: [this.$tools.renderImage(dataset.img)] // 需要预览的图片http链接列表
                })
            } else if (type == 'copy') {

                wx.setClipboardData({
                    data: dataset.copy,
                    showToast: false,
                    success: function () {
                        thiz.showToast(dataset.tip || '复制成功', 'none')
                    }
                });
            } else if (type == 'xcx') {
                wx.navigateToMiniProgram({
                    appId: dataset.appid,
                    path: dataset.path,
                    success(res) {
                        // 打开成功
                    }
                })
            } else if(typeof thiz[type]=='function'){
        		if(type.endsWith("Api")){
        			thiz[type]()
        		}else{
        			thiz[type](dataset)
        		}
        	} else if (type == 'login') {
                let thiz = this
                wx.getUserProfile({
                    lang: 'zh_CN',
                    desc: '用于登陆',
                    success: function (wxInfo) {
                        wx.login({
                            success: function (res) {
                                let data={
                                    code:res.code,
                                    type: dataset.logintype,
                                    userInfo: JSON.stringify(wxInfo.userInfo)
                                }
                                thiz.$http.post(dataset.loginurl,data).then(res=>{
                                    if(res.code==200){
                                        thiz.setData({
                                            userInfo:res.data
                                        })
                                        thiz.$session.setUser(res.data)
                                    }
                                    if(thiz[dataset.callback]){
                                        thiz[dataset.callback](res)
                                    }
                                })
                            },
                            fail: function () {
                                wx.showModal({
                                    title: '获取用户信息',
                                    content: '请允许授权以便为您提供给服务',
                                    success: function (res) {
                                        if (res.confirm) {
                                            thiz.navigateTo(dataset)
                                        }
                                    }
                                })
                            }
                        });
                    },
                    fail: function (res) {
                        wx.showModal({
                            title: '友情提示',
                            content: '已拒绝小程序获取信息',
                            showCancel: !1,
                        })
                    }
                })
            } else {
                thiz.showToast(type + '类型有待实现')
            }
        }

        object.showModal = function (message) {
            wx.showModal({
                title: '友情提示',
                content: message,
                showCancel: !1,
            });
        }

        object.showToast = function (title, icon) {
            wx.showToast({
                title: title,
                icon: icon ? icon : 'none'
            })
        }
        object.Validate = (rules, messages) => new ValidateClazz(rules, messages)
        object.getPickerChildren = function (data, chindInex1, childIndex2) {
            if (chindInex1 != null && data[chindInex1] && data[chindInex1].children && data[chindInex1].children) {
                let children = data[chindInex1].children
                //只判断一级
                if (childIndex2 == null) {
                    if (children != null && children.length > 0) {
                        return children.map(item => item.label)
                    } else {
                        return []
                    }
                } else {
                    //判断二级
                    //有可能并设置下级结点
                    if (children[childIndex2] == null) {
                        return []
                    }
                    let children2 = children[childIndex2].children
                    if (children2 != null && children2.length > 0) {
                        return children2.map(item => item.text)
                    } else {
                        return []
                    }
                }
            } else {
                return []
            }
        }
        
        object.changeValue = function(e){
            const { key } = e.currentTarget.dataset;
            if(typeof e.detail=='object' && this.$tools.isArray(e.detail)){
                this.setData({ [key]: e.detail });
            }else if(typeof e.detail=='object' && e.detail.hasOwnProperty('value')){
                this.setData({ [key]: e.detail.value });
            }else{
                this.setData({ [key]: e.detail });
            }
        }
        //根据field获取数据
        object.getDiygwFiledData = function(thiz,field){
            // 通过正则表达式  查找路径数据
            const regex = /([\w$]+)|\[(:\d)\]/g
            const patten = field.match(regex)
            let result = thiz.data // 指向调用的数据 如data
            // 遍历路径  逐级查找  最后一级用于直接赋值
            for (let i = 0; i < patten.length - 1; i++) {
            let key = patten[i]
            result = result[key]
            }
            return result[patten[patten.length - 1]]
        }

        object.uploadImage = function (thiz, field,fieldData,uploadUrl) {
            if(!uploadUrl){
        		thiz.showToast('请配置上传地址')
        		return;
        	}
            wx.chooseImage({
                sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
                sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
                success: function (res) {
                    // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                    let tempFilePaths = res.tempFilePaths;
                    for (let i = 0; i < tempFilePaths.length; i++) {
                        wx.uploadFile({
                            url: thiz.$http.setUrl(uploadUrl), //仅为示例，非真实的接口地址
                            filePath: tempFilePaths[0],
                            name: 'file',
                            header:{
        						Authorization : thiz.$session.getToken()||''
        					},
                            success: function (res) {
                                let data = thiz.$tools.fromJson(res.data);
                                let url = thiz.$tools.renderImage(data.url);
                                let files = thiz.getDiygwFiledData(thiz,fieldData).concat(url);
                                thiz.setData({
                                    [fieldData]: files,
                                    [field]: (files || []).join(',').replace(/^[]/, ''),
                                });
                                
                            },
                        });
                    }
                },
            });
        }

        return Page(object)
    }
}

// 获取原生Page
const originalPage = Page
// 定义一个新的Page，将原生Page传入Page扩展函数
Page = pageExtend(originalPage)
