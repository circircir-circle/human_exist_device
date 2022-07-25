const App = getApp();

Page({
	data: {
		url: ''
	},
	onLoad(option) {
		if (option) {
			this.setData({
				url: decodeURIComponent(option.url)
			});
		}
	}
});
