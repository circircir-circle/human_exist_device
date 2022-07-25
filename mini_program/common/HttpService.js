import ServiceBase from './ServiceBase';
import Session from './Session';
//Update: 邓志锋 <280160522@qq.com> <http://www.diygw.com>
class Service extends ServiceBase {
	constructor() {
		super();
		this.$$prefix = '';
	}

	/**
	 * 初始化默认拦截器
	 */
	__initInterceptor() {}

	//获取POST数据
	postData(params, url) {
		return this.post(url || this.$$path.data, params);
	}

	//获取GET数据
	getData(params, url) {
		return this.get(url || this.$$path.data, params);
	}

	//保存数据
	saveData(params, url) {
		return this.post(url || this.$$path.save, params);
	}

	//删除数据
	delData(params, url) {
		return this.post(url || this.$$path.del, params);
	}
}

export default Service;
