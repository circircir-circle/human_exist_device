const app = getApp()
Page({
	data: {
		text1: `<p style="text-align: center;"><span style="color: #e03e2d; font-size: 20px;">——— 第三步: 设置传感器参数 ———</span></p>`,
		text7: `<p><span style="font-size: 18px;">&nbsp; 设置持续次数参数, 传感器1s中检测10次, 当连续检测到该状态这么多次时, 就给出相应的判定结果</span></p>`,
		sb_move_times: 10,
		sb_not_move_times: 10, 
		sb_silent_times: 10,
		sb_not_silent_times: 10,
	},
	onLoad(option) {
    this.init();
    let array = new Uint8Array(1);
    array[0] = 0x01;
    console.log("切换到设置页面")
    wx.writeBLECharacteristicValue({
      deviceId:app.globalData.deviceId,
      serviceId:app.globalData.SERVICE_UUID_LD2410,
      characteristicId:app.globalData.CHARACTERISTIC_UUID_Send_CMD,
      value: array.buffer,
      fail(res) {
        console.error('writeBLECharacteristicValue', res)
      }
    })
	},
	onShareAppMessage() {},
	onShareTimeline() {},
	onShow() {},
	async init() {
    wx.onBLECharacteristicValueChange((result) => {
      if (result.characteristicId.toUpperCase() == app.globalData.CHARACTERISTIC_UUID_Judge_Params.toUpperCase())
      {        
        let rx_data = new Uint8Array(result.value)
        console.log("LD2410_Result = ", rx_data)
        this.setData({
          sb_move_times: rx_data[0],
          sb_not_move_times: rx_data[1],
          sb_silent_times: rx_data[2],
          sb_not_silent_times: rx_data[3]
        })
      }
    })
  },
	changeSlider9(evt) {
		let sb_move_times = evt.detail.value;
		this.setData({ sb_move_times });
	},
	changeSlider1(evt) {
		let sb_not_move_times = evt.detail.value;
		this.setData({ sb_not_move_times });
	},
	changeSlider2(evt) {
		let sb_silent_times = evt.detail.value;
		this.setData({ sb_silent_times });
	},
	changeSlider8(evt) {
		let sb_not_silent_times = evt.detail.value;
		this.setData({ sb_not_silent_times });
  },
  
  send2device: function () {
    console.log("向传感器下发数据")
    let tu8 = new Uint8Array(4);
    tu8[0] = this.data.sb_move_times;
    tu8[1] = this.data.sb_not_move_times;
    tu8[2] = this.data.sb_silent_times;
    tu8[3] = this.data.sb_not_silent_times;    
    wx.writeBLECharacteristicValue({
      deviceId:app.globalData.deviceId,
      serviceId:app.globalData.SERVICE_UUID_LD2410,
      characteristicId:app.globalData.CHARACTERISTIC_UUID_Judge_Params,
      value: tu8.buffer,
      fail(res) {
        console.error('writeBLECharacteristicValue', res)
      }
    })
  },
  navigateTo_peiwang: function(e)
  {
    console.log("已经点击" + e)
    wx.redirectTo({
      url: '../index',
    })
  },
  navigateTo_jiankong: function(e)
  {
    console.log("已经点击" + e)
    wx.redirectTo({
      url: 'monitor',
    })
  },
  navigateTo_shezhi: function(e)
  {
    console.log("已经点击" + e)
    wx.redirectTo({
      url: 'edit_param',
    })
  },



});
