App({
	globalData: {
		tabBar: [],
		homePage: '/pages/index',
		pages: ['/pages/index', '/pages/index/monitor', '/pages/index/edit_param'],
    wifi_state: 0, 
    mqtt_state: 0,
    deviceId:'',
    ble_state: 1,
    ble_name: "ESP32_HM_ID9527",
    SERVICE_UUID_wifi                 :"6E400001-B5A3-F393-E0A9-E50E24DCCA9E", // UART service UUID
    SERVICE_UUID_LD2410               :"6E400002-B5A3-F393-E0A9-E50E24DCCA9E", // UART service UUID
    CHARACTERISTIC_UUID_Wifi_ssid     :"DEA04111-FFCE-4152-B6B1-9049EEFDD97A",
    CHARACTERISTIC_UUID_Wifi_Pwd      :"81F0B721-56D7-4B82-A2F1-D53F9911FE8B",
    CHARACTERISTIC_UUID_MQTT_Site     :"60FDB096-901D-4FC3-85B0-CC5CE6B5D037",
    CHARACTERISTIC_UUID_MQTT_port     :"6925960C-AC10-41CB-AD88-BB762C9F16C6",
    CHARACTERISTIC_UUID_MQTT_Account  :"F91AE54A-4882-48FF-B0E0-FD1F0FB1CF0D",
    CHARACTERISTIC_UUID_MQTT_pwd      :"F10E9DE3-7CEB-4CE5-8B43-E2F517296E32",
    CHARACTERISTIC_UUID_LD2410_Th     :"E0F956DA-2708-488D-BCC5-DD8B19676222",
    CHARACTERISTIC_UUID_LD2410_Status :"921AF35A-4165-4F5B-988F-91CB5733A485",
    CHARACTERISTIC_UUID_Net_States    :"DF460C3E-50AE-466C-A503-CAC4C01D5398",
    CHARACTERISTIC_UUID_Judge_Params  :"C015A05B-9617-455A-97AD-4E44EA286CD2",
    CHARACTERISTIC_UUID_Send_CMD      :"C015A05C-9617-455A-97AD-4E44EA286CD2",
    CHARACTERISTIC_UUID_LD2410_Result :"C015A05D-9617-455A-97AD-4E44EA286CD2",    
    MoveData                          :[50, 30, 24, 18, 35, 47, 60, 43, 25],
    MoveTh                            :[20, 20, 20, 20, 20, 20, 20, 20, 20],
    SilentData                        :[50, 30, 24, 18, 35, 47, 60, 43, 25],
    SilentTh                          :[20, 20, 20, 20, 20, 20, 20, 20, 20]
	},
	onLaunch() {
		wx.getSystemInfo({
			success: (e) => {
				this.globalData.StatusBar = e.statusBarHeight;
				let capsule = wx.getMenuButtonBoundingClientRect();
				this.globalData.WindowWidth = e.windowWidth;
				this.globalData.PixelRatio = 750 / e.windowWidth;
				if (capsule) {
					this.globalData.Custom = capsule;
					this.globalData.CustomBar = capsule.bottom + capsule.top - e.statusBarHeight;
				} else {
					this.globalData.CustomBar = e.statusBarHeight + 50;
				}
			}
		});
	},
	onShow() {},
	onHide() {}
});
