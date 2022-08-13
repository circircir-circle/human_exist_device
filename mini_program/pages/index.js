// index.js
// 获取应用实例
const app = getApp()
var t;

/******************************************
 * 信号帧格式如下:  0xAA55AA55 + A + B + data
 * A 表示帧内容: 若A小于0x80表示是下载(小程序-->ESP), 若A>0x80表示是上传(ESP-->小程序), 具体格式如下
 *    0x00: 下载 wifi_ssid
 *    0x80: 上传 wifi_ssid
 *    0x01: 下载 wifi_pwd
 *    0x81: 上传 wifi_pwd
 *    0x02: 下载 mqtt_site
 *    0x82: 上传 mqtt_site
 *    0x03: 下载 mqtt_port
 *    0x83: 上传 mqtt_port
 *    0x04: 下载 mqtt_account
 *    0x84: 上传 mqtt_account
 *    0x05: 下载 mqtt_pwd
 *    0x85: 上传 mqtt_pwd
 *    0x06: 下载 LD2410_threshold
 *    0x86: 上传 LD2410_threshold
 *    0x87: 上传 LD2410_status
 *    0x88: 上传 wifi_mqtt_state // 第0个byte表示 wifi状态, 1表示连接成功, 0表示连接失败, 第1个byte 表示mqtt状态
 *    0x09: 下载 judge_params    // 0: 持续次数, 即连续n次检测到运动或静止, 才判定为有人
 *    0x89: 上传 judge_params
 * B: 表示后面数据的长度
 * data: 表示具体数据
 ******************************************/


Page({
  
	data: {
		text: `<p style="text-align: center;"><span style="color: #e03e2d; font-size: 20px;">——— 第一步: 填写配网信息 ———</span></p>`,
		text1: `<p><span style="font-size: 16px;">&nbsp; WiFi名称</span></p>`,
		input5: '',
		text6: `<p><span style="font-size: 16px;">&nbsp; WiFi密码</span></p>`,
		input4: '',
		text5: `<p><span style="font-size: 16px;">&nbsp; MQTT服务器</span></p>`,
		input: '',
		text4: `<p><span style="font-size: 16px;">&nbsp; MQTT端口</span></p>`,
		input3: '',
		text3: `<p><span style="font-size: 16px;">&nbsp; MQTT服务器账号</span></p>`,
		input2: '',
		text2: `<p><span style="font-size: 16px;">&nbsp; MQTT服务器密码</span></p>`,
		input1: '',
		text7: `<p><span style="font-size: 18px;">&nbsp; WIFI: 连接成功</span></p>`,
    text8: `<p><span style="font-size: 18px;">&nbsp; MQTT: 连接成功</span></p>`,
		text9: `<p><span style="font-size: 18px;">&nbsp; WIFI: 未连接</span></p>`,
    text10: `<p><span style="font-size: 18px;">&nbsp; MQTT: 未连接</span></p>`,
    text11: `<p><span style="font-size: 18px;">&nbsp;</span></p>`,
    deviceId:'',
    serviceId:'',
    characteristicId:'',
    inputValue: '',
    mqtt_state_page: 0, 
    wifi_state_page: 0, 
    ble_state_page: 1,
    ble_name_page: "usrname",
    value_page: "",
    wifi_ssid: "",
    wifi_pwd: "",
    mqtt_site: "",
    mqtt_port: "",
    mqtt_account: "",
    mqtt_pwd: "",
	},
	onLoad(option) {
    this.init();
    this.bleInit();
	},
	onShareAppMessage() {},
	onShareTimeline() {},
	onShow() {},
	async init() {},
  bleInit() {
    console.log('searchBle')
    var that = this;
    // 监听扫描到新设备事件
    wx.onBluetoothDeviceFound((res) => {
      res.devices.forEach((device) => {
        // 这里可以做一些过滤        
//      if(device.deviceId == "2E209DD5-18CD-C223-8403-A2A0C1AD89CA"){
        t = device.name.substring(0, 12);
        console.log('subname = ', t)
        if (t == "HMConfigWifi") {            
            console.log("已找到指定设备")
            console.log('Device Found', device)
            // 找到设备开始连接
            that.bleConnection(device.deviceId);
            app.globalData.deviceId = device.deviceId
            this.setData({
              'ble_name_page': device.name,
              deviceId: device.deviceId
            })
            // 找到要搜索的设备后，及时停止扫描
            wx.stopBluetoothDevicesDiscovery()               
        }
      })
    })

    // 初始化蓝牙模块
    wx.openBluetoothAdapter({
      mode: 'central',
      success: (res) => {
        // 开始搜索附近的蓝牙外围设备
        wx.startBluetoothDevicesDiscovery({
          allowDuplicatesKey: false,
        })
      },
      fail: (res) => {
        if (res.errCode !== 10001) return
        wx.onBluetoothAdapterStateChange((res) => {
          if (!res.available) return
          // 开始搜寻附近的蓝牙外围设备
          wx.startBluetoothDevicesDiscovery({
            allowDuplicatesKey: false,
          })
        })
      }
    })
    var that = this
    let ts = "";
    let tu16 = 0;
    wx.onBLECharacteristicValueChange((result) => {
      if (result.characteristicId.toUpperCase() == app.globalData.CHARACTERISTIC_UUID_Wifi_ssid.toUpperCase())
      {
        console.log("更新wifi_ssid")
        ts = that.hextoString(that.ab2hex(result.value))
        this.setData({
          input5: ts,
          wifi_ssid: ts
        })
      }
      if (result.characteristicId.toUpperCase() == app.globalData.CHARACTERISTIC_UUID_Wifi_Pwd.toUpperCase())
      {
        console.log("更新wifi_pwd")
        ts = that.hextoString(that.ab2hex(result.value))
        this.setData({
          input4: ts,
          wifi_pwd: ts
        })
      }
      if (result.characteristicId.toUpperCase() == app.globalData.CHARACTERISTIC_UUID_MQTT_Site.toUpperCase())
      {
        console.log("更新MQTT_Site")
        ts = that.hextoString(that.ab2hex(result.value))
        this.setData({
          input: ts,
          mqtt_site: ts
        })
      }
      if (result.characteristicId.toUpperCase() == app.globalData.CHARACTERISTIC_UUID_MQTT_port.toUpperCase())
      {
        console.log("更新MQTT_port")
        let tu16 = new Int16Array(result.value)
        this.setData({
          input3: tu16[0],
          mqtt_port: tu16[0]
        })
      }
      if (result.characteristicId.toUpperCase() == app.globalData.CHARACTERISTIC_UUID_MQTT_Account.toUpperCase())
      {
        console.log("更新MQTT_Account")
        ts = that.hextoString(that.ab2hex(result.value))
        this.setData({
          input2: ts,
          mqtt_account: ts
        })
      }
      if (result.characteristicId.toUpperCase() == app.globalData.CHARACTERISTIC_UUID_MQTT_pwd.toUpperCase())
      {
        console.log("更新MQTT_pwd")
        ts = that.hextoString(that.ab2hex(result.value))
        this.setData({
          input1: ts,
          mqtt_pwd: ts
        })
      }
      if (result.characteristicId.toUpperCase() == app.globalData.CHARACTERISTIC_UUID_Net_States.toUpperCase())
      {
        console.log("更新网络状态")
        let tu8 = new Uint8Array(result.value)
        this.setData({
          wifi_state_page: tu8[0],
          mqtt_state_page: tu8[1]
        })
      }
      console.log('index: onBLECharacteristicValueChange',result.value)
      console.log('index: characteristicId',result.characteristicId)
      let hex = that.ab2hex(result.value)
      console.log('index: hextoString',that.hextoString(hex))
      console.log('hex',hex)
    })
  },
  bleConnection(deviceId){
    wx.createBLEConnection({
      deviceId, // 搜索到设备的 deviceId
      success: () => {
        // 连接成功，获取服务
        console.log('连接成功，获取服务')
        this.setData({
          'ble_state_page': 1
        })
        this.bleGetDeviceServices(deviceId)
      }
    })
  },
  bleGetDeviceServices(deviceId){
    wx.getBLEDeviceServices({
      deviceId, // 搜索到设备的 deviceId
      success: (res) => {
        console.log("发现的服务")
        console.log(res.services)
        // res.services.length 表示服务数量
        // res.services[i].uuid 第i个服务的uuid 
        for (let i = 0; i < res.services.length; i++) {
          if (res.services[i].isPrimary) {
            this.bleGetDeviceCharacteristics(deviceId, res.services[i].uuid)
            this.setData({
              serviceId: res.services[i].uuid
            })
          }
        }    
      }
    })
  },
  bleGetDeviceCharacteristics(deviceId,serviceId){
    console.log("开始搜索Characteristics");
    wx.getBLEDeviceCharacteristics({
      deviceId, // 搜索到设备的 deviceId
      serviceId, // 上一步中找到的某个服务
      success: (res) => {
        for (let i = 0; i < res.characteristics.length; i++) {
          let item = res.characteristics[i]
          console.log(item)
          if (item.properties.read) { // 该特征值可读
            wx.readBLECharacteristicValue({
              deviceId,
              serviceId,
              characteristicId: item.uuid,
            })
          }
          if (item.properties.notify || item.properties.indicate) {
            // 必须先启用 wx.notifyBLECharacteristicValueChange 才能监听到设备 onBLECharacteristicValueChange 事件
            wx.notifyBLECharacteristicValueChange({
              deviceId,
              serviceId,
              characteristicId: item.uuid,
              state: true,
            })
          }
        }        
      }
    })
  },
  stringToBytes(str) {
    var array = new Uint8Array(str.length);
    for (var i = 0, l = str.length; i < l; i++) {
      array[i] = str.charCodeAt(i);
    }
    console.log(array);
    return array.buffer;
  },
  hextoString: function (hex) {
    var arr = hex.split("")
    var out = ""
    for (var i = 0; i < arr.length / 2; i++) {
      var tmp = "0x" + arr[i * 2] + arr[i * 2 + 1]
      var charValue = String.fromCharCode(tmp);
      out += charValue
    }
    return out
  },
  ab2hex(buffer) {
    var hexArr = Array.prototype.map.call(
      new Uint8Array(buffer),
      function (bit) {
        return ('00' + bit.toString(16)).slice(-2)
      }
    )
    return hexArr.join('');
  },
  light1on(){
    var buffer = this.stringToBytes("light1on")
    wx.writeBLECharacteristicValue({
      deviceId:this.data.deviceId,
      serviceId:this.data.serviceId,
      characteristicId:this.data.characteristicId,
      value: buffer,
    })
  },

  bindKeyInput: function (e) {
    this.setData({
      inputValue: e.detail.value
    })
  },

  read_wifi_setting: function()
  {
    let array = new Uint8Array(1);
/*
    console.log("开始调试")
    let t = "youseeme";
    // 要转为 arraybuffer
    let tt = this.stringToBytes(t)
    console.log("t = ", t)
    console.log("tt = ", tt)

    this.setData({
      input5: tu16[0]
    })
*/
    array[0] = 0x01;
    console.log("点下读取按钮")
    console.log(this.data.deviceId)
    console.log(app.globalData.SERVICE_UUID_LD2410)
    console.log(app.globalData.CHARACTERISTIC_UUID_Send_CMD)
    wx.writeBLECharacteristicValue({
      deviceId:this.data.deviceId,
      serviceId:app.globalData.SERVICE_UUID_LD2410,
      characteristicId:app.globalData.CHARACTERISTIC_UUID_Send_CMD,
      value: array.buffer,
      fail(res) {
        console.error('writeBLECharacteristicValue', res)
      }
    })
  },

  write_wifi_setting: function()
  {
    var buf;
    console.log("点下设置按钮");
    let t = 
    wx.writeBLECharacteristicValue({
      deviceId:this.data.deviceId,
      serviceId:app.globalData.SERVICE_UUID_wifi,
      characteristicId:app.globalData.CHARACTERISTIC_UUID_Wifi_ssid,
      value: this.stringToBytes(this.data.wifi_ssid),
      fail(res) {
        console.error('writeBLECharacteristicValue', res)
      }
    })
    wx.writeBLECharacteristicValue({
      deviceId:this.data.deviceId,
      serviceId:app.globalData.SERVICE_UUID_wifi,
      characteristicId:app.globalData.CHARACTERISTIC_UUID_Wifi_Pwd,
      value: this.stringToBytes(this.data.wifi_pwd),
      fail(res) {
        console.error('writeBLECharacteristicValue', res)
      }
    })
    wx.writeBLECharacteristicValue({
      deviceId:this.data.deviceId,
      serviceId:app.globalData.SERVICE_UUID_wifi,
      characteristicId:app.globalData.CHARACTERISTIC_UUID_MQTT_Site,
      value: this.stringToBytes(this.data.mqtt_site),
      fail(res) {
        console.error('writeBLECharacteristicValue', res)
      }
    })
    wx.writeBLECharacteristicValue({
      deviceId:this.data.deviceId,
      serviceId:app.globalData.SERVICE_UUID_wifi,
      characteristicId:app.globalData.CHARACTERISTIC_UUID_MQTT_port,
      value: this.stringToBytes(this.data.mqtt_port),
      fail(res) {
        console.error('writeBLECharacteristicValue', res)
      }
    })
    wx.writeBLECharacteristicValue({
      deviceId:this.data.deviceId,
      serviceId:app.globalData.SERVICE_UUID_wifi,
      characteristicId:app.globalData.CHARACTERISTIC_UUID_MQTT_Account,
      value: this.stringToBytes(this.data.mqtt_account),
      fail(res) {
        console.error('writeBLECharacteristicValue', res)
      }
    })
    wx.writeBLECharacteristicValue({
      deviceId:this.data.deviceId,
      serviceId:app.globalData.SERVICE_UUID_wifi,
      characteristicId:app.globalData.CHARACTERISTIC_UUID_MQTT_pwd,
      value: this.stringToBytes(this.data.mqtt_pwd),
      fail(res) {
        console.error('writeBLECharacteristicValue', res)
      }
    })
    console.log("wifi ssid = " + this.data.wifi_ssid);
    console.log("wifi pwd = " + this.data.wifi_pwd);
    console.log("mqtt_site = " + this.data.mqtt_site);
    console.log("mqtt_port = " + this.data.mqtt_port);
    console.log("mqtt_account = " + this.data.mqtt_account);
    console.log("mqtt_pwd = " + this.data.mqtt_pwd);
  },

  wifi_ssid_input: function(e)
  {
    this.setData({
      wifi_ssid: e.detail.value
    })
  },

  wifi_pwd_input: function(e)
  {
    this.setData({
      wifi_pwd: e.detail.value
    })
  },

  mqtt_site_input: function(e)
  {
    this.setData({
      mqtt_site: e.detail.value
    })
  },

  mqtt_port_input: function(e)
  {
    this.setData({
      mqtt_port: e.detail.value
    })
  },

  mqtt_account_input: function(e)
  {
    this.setData({
      mqtt_account: e.detail.value
    })
  },

  mqtt_pwd_input: function(e)
  {
    this.setData({
      mqtt_pwd: e.detail.value
    })
  },
  
  navigateTo_peiwang: function(e)
  {
    console.log("已经点击" + e)
    wx.redirectTo({
      url: 'index',
    })
  },
  navigateTo_jiankong: function(e)
  {
    console.log("已经点击" + e)
    wx.redirectTo({
      url: 'index/monitor',
    })
  },
  navigateTo_shezhi: function(e)
  {
    console.log("已经点击" + e)
    wx.redirectTo({
      url: 'index/edit_param',
    })
  },
})

