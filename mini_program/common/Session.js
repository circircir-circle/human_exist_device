var SESSION_KEY = 'user_session_diygw_com';
var REDIRECT_SESSION_KEY = 'redirect_session_diygw_com';

var Session = {
	getRedirecturl() {
		return wx.getStorageSync(REDIRECT_SESSION_KEY) || null;
	},

	setRedirecturl(url) {
		wx.setStorageSync(REDIRECT_SESSION_KEY, url);
	},
	getUser() {
		return wx.getStorageSync(SESSION_KEY) || null;
	},

	setUser(session) {
		wx.setStorageSync(SESSION_KEY, session);
	},

	clearUser() {
		wx.removeStorageSync(SESSION_KEY);
	},

	getToken() {
		var userInfo = this.getUser();
		return userInfo ? userInfo.token : null
	},

	getOpenId() {
		var userInfo = this.getUser();
		return userInfo ? userInfo.openid : null
	},
	
	setValue(key,value) {
		wx.setStorageSync(key, value);
	},
	
	getValue(key){
		return wx.getStorageSync(key) || null;
	}
	
}

export default Session
