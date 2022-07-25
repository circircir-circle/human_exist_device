//Update: 邓志锋 <280160522@qq.com> <http://www.diygw.com>
import __config from '../siteinfo'

class Tools {

	constructor() {
		Object.assign(this, {
			$$basePath: __config.basePath
		})
	}

	/**
	 * 返回文件后缀
	 * @param  {Object} file
	 * @return {String}
	 */
	getFilenameExt(file) {
		const types = file.name.split('.')
		return types[types.length - 1]
	}

	getCurrentDate() {
		const date = new Date();
		const year = date.getFullYear()
		const month = date.getMonth() + 1
		const day = date.getDate()
		return [year, month, day].join('-')
	}

	getCurrentTime() {
		const date = new Date();
		const hour = date.getHours()
		const minute = date.getMinutes()
		return [hour, minute].join(':')
	}

	/**
	 * 返回指定范围内的一个整数
	 * @param  {Number} min
	 * @param  {Number} max
	 * @return {String}
	 */
	rand(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min)
	}

	/**
	 * 生成字符串组合
	 * @param  {Number} size
	 * @return {String}
	 */
	randString(size) {
		let result = ''
		let allChar = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

		size = size || 1

		while (size--) {
			result += allChar.charAt(this.rand(0, allChar.length - 1))
		}

		return result
	}

	/**
	 * 生成文件名
	 * @param  {Object} file
	 * @return {String}
	 */
	randFilename(file) {
		return this.randString(this.rand(10, 100)) + Date.parse(new Date()) + '.' + this.getFilenameExt(file)
	}

	/**
	 * 判断某个元素是否为字符串
	 * @param  {String}  value
	 * @return {Boolean}
	 */
	isString(value) {
		return typeof value === 'string'
	}

	/**
	 * 判断某个元素是否为函数
	 * @param  {Function}  value
	 * @return {Boolean}
	 */
	isFunction(value) {
		return this.type(value) === 'function'
	}

	/**
	 * 判断某个元素是否为数组
	 * @param  {Array}  value
	 * @return {Boolean}
	 */
	isArray(value) {
		return Array.isArray(value)
	}

	/**
	 * 判断某个元素是否为对象
	 * @param  {Obejct}  value
	 * @return {Boolean}
	 */
	isObject(value) {
		return value !== null && typeof value === 'object'
	}

	/**
	 * 判断某个元素是否为数值
	 * @param  {Number}  value
	 * @return {Boolean}
	 */
	isNumber(value) {
		return typeof value === 'number'
	}

	/**
	 * 判断某个元素是否为日期
	 * @param  {Date}  value
	 * @return {Boolean}
	 */
	isDate(value) {
		return this.type(value) === '[object Date]'
	}

	/**
	 * 判断某个元素是否为正则表达式
	 * @param  {RegExp}  value
	 * @return {Boolean}
	 */
	isRegExp(value) {
		return this.type(value) === '[object RegExp]'
	}

	/**
	 * 判断某个元素是否为File对象
	 * @param  {Object}  obj
	 * @return {Boolean}
	 */
	isFile(obj) {
		return this.type(obj) === '[object File]'
	}

	/**
	 * 判断某个元素是否为FormData对象
	 * @param  {Object}  obj
	 * @return {Boolean}
	 */
	isFormData(obj) {
		return this.type(obj) === '[object FormData]'
	}

	/**
	 * 判断某个元素是否为Blob对象
	 * @param  {Object}  obj
	 * @return {Boolean}
	 */
	isBlob(obj) {
		return this.type(obj) === '[object Blob]'
	}

	/**
	 * 判断某个元素是否为布尔值
	 * @param  {boolean}  value
	 * @return {Boolean}
	 */
	isBoolean(value) {
		return typeof value === 'boolean'
	}

	/**
	 * 判断某个元素是否为Promise对象
	 * @param  {Function}  obj
	 * @return {Boolean}
	 */
	isPromiseLike(obj) {
		return obj && this.isFunction(obj.then)
	}

	/**
	 * 判断数组类型
	 * @param  {Array}  value
	 * @return {Boolean}
	 */
	isTypedArray(value) {
		const TYPED_ARRAY_REGEXP =
			/^\[object (?:Uint8|Uint8Clamped|Uint16|Uint32|Int8|Int16|Int32|Float32|Float64)Array\]$/
		return value && this.isNumber(value.length) && TYPED_ARRAY_REGEXP.test(this.type(value))
	}

	/**
	 * 判断某个元素是否为ArrayBuffer对象
	 * @param  {Object}  obj
	 * @return {Boolean}
	 */
	isArrayBuffer(obj) {
		return this.type(obj) === '[object ArrayBuffer]'
	}

	/**
	 * 判断某个元素是否为defined
	 * @param  {undefined}  value
	 * @return {Boolean}
	 */
	isDefined(value) {
		return typeof value !== 'undefined'
	}

	/**
	 * 判断某个元素是否为undefined
	 * @param  {undefined}  value
	 * @return {Boolean}
	 */
	isUndefined(value) {
		return typeof value === 'undefined'
	}

	/**
	 * 判断某个元素是否为null
	 * @param  {Null}  value
	 * @return {Boolean}
	 */
	isNull(value) {
		return value === null
	}

	/**
	 * 判断某个元素是否为有限数
	 * @param  {Number}  value
	 * @return {Boolean}
	 */
	isFinite(value) {
		return typeof value == 'number' && isFinite(value)
	}

	/**
	 * 判断某个元素是否为自然数
	 * @param  {Number}  value
	 * @return {Boolean}
	 */
	isNaN(value) {
		return this.isNumber(value) && value != +value
	}

	/**
	 * 判断某个元素是否为错误类型
	 * @param  {Object}  value
	 * @return {Boolean}
	 */
	isError(value) {
		return this.type(value) === '[object Error]'
	}

	/**
	 * 删除字符串左右两端的空格
	 * @param  {String} str
	 * @return {String}
	 */
	trim(str) {
		return this.isString(str) ? str.trim() : str
	}

	/**
	 * 字符串转义
	 * @param  {String} str
	 * @return {String}
	 */
	escapeForRegexp(str) {
		return str.replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, '\\$1').replace(/\x08/g, '\\x08')
	}

	/**
	 * 字符串转对象
	 * @param  {String} str 'key1,key2,...'
	 * @return {Object} in the form of {key1:true, key2:true, ...}
	 */
	makeMap(str) {
		let obj = {},
			items = str.split(',')
		for (let i = 0; i < items.length; i++) {
			obj[items[i]] = !0
		}
		return obj
	}

	/**
	 * 判断数组中是否含有指定元素
	 * @param  {Array} arr
	 * @param  {Objext} obj
	 * @return {Array}
	 */
	includes(arr, obj) {
		return Array.prototype.indexOf.call(arr, obj) != -1
	}

	/**
	 * 数组删除指定的元素，并返回元素的索引值
	 * @param  {Array} array
	 * @param  {String} value
	 * @return {Number}
	 */
	arrayRemove(array, value) {
		let index = array.indexOf(value)
		if (index >= 0) {
			array.splice(index, 1)
		}
		return index
	}

	/**
	 * 日期增加分钟
	 * @param  {Date} date
	 * @param  {Number} minutes
	 * @return {Date}
	 */
	addDateMinutes(date, minutes) {
		date = new Date(date.getTime())
		date.setMinutes(date.getMinutes() + minutes || 0)
		return date
	}

	/**
	 * 对象解析出JSON字符串
	 * @param  {Object} obj
	 * @param  {Number} pretty
	 * @return {Object}
	 */
	toJson(obj, pretty) {
		if (this.isUndefined(obj)) return undefined
		if (!this.isNumber(pretty)) {
			pretty = pretty ? 2 : null
		}
		return JSON.stringify(obj, null, pretty)
	}

	/**
	 * JSON字符串解析成对象
	 * @param  {String} json
	 * @return {Object}
	 */
	fromJson(json) {
		return this.isString(json) ? JSON.parse(decodeURIComponent(json).replace(new RegExp("&quot;", "gm"),
			"\"")) : json
	}

	/**
	 * 扩展对象
	 * @return {Object}
	 */
	extend() {
		let src, copyIsArray, copy, name, options, clone,
			target = arguments[0] || {},
			i = 1,
			length = arguments.length,
			deep = !1;

		if (typeof target === 'boolean') {
			deep = target
			target = arguments[i] || {}
			i++
		}

		if (typeof target !== 'object' && !this.isFunction(target)) {
			target = {}
		}

		if (i === length) {
			target = this
			i--
		}

		for (; i < length; i++) {
			if ((options = arguments[i]) != null) {
				for (name in options) {
					src = target[name]
					copy = options[name]

					if (target === copy) {
						continue
					}

					if (deep && copy && (this.isPlainObject(copy) || (copyIsArray = this.isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = !1
							clone = src && this.isArray(src) ? src : []
						} else {
							clone = src && this.isPlainObject(src) ? src : {}
						}
						target[name] = this.extend(deep, clone, copy)
					} else if (copy !== undefined) {
						target[name] = copy
					}
				}
			}
		}
		return target
	}

	/**
	 * 判断传入的参数是否为纯粹的对象，即直接量{}或new Object()创建的对象
	 * @param  {[type]}  obj [description]
	 * @return {Boolean}     [description]
	 */
	isPlainObject(obj) {
		let getProto = Object.getPrototypeOf
		let class2type = {}
		let toString = class2type.toString
		let hasOwn = class2type.hasOwnProperty
		let fnToString = hasOwn.toString
		let ObjectFunctionString = fnToString.call(Object)
		let proto, Ctor
		if (!obj || this.type(obj) !== '[object Object]') {
			return !1
		}
		proto = getProto(obj)
		if (!proto) {
			return !0
		}
		Ctor = hasOwn.call(proto, 'constructor') && proto.constructor
		return typeof Ctor === 'function' && fnToString.call(Ctor) === ObjectFunctionString
	}

	/**
	 * 判断对象是否为空
	 * @param  {Object}  obj
	 * @return {Boolean}
	 */
	isEmptyObject(obj) {
		for (let i in obj)
			return !1
		return !0
	}

	/**
	 * 判断对象的类型
	 * @param  {Object} obj
	 * @return {String}
	 */
	type(obj) {
		const toString = Object.prototype.toString

		if (obj == null) {
			return obj + ''
		}

		return typeof obj === 'object' || typeof obj === 'function' ? toString.call(obj) || 'object' : typeof obj
	}

	/**
	 * 合并对象并返回一个新的对象，目标对象自身也会改变
	 * @param  {Array} args
	 * @return {Object}
	 */
	merge(...args) {
		return Object.assign(...args)
	}

	/**
	 * 拷贝对象并返回一个新的对象
	 * @param  {Object} obj
	 * @return {Object}
	 */
	clone(obj) {
		if (typeof obj !== 'object' || !obj) {
			return obj
		}
		let copy = {}
		for (let attr in obj) {
			if (obj.hasOwnProperty(attr)) {
				copy[attr] = obj[attr]
			}
		}
		return copy
	}

	getUrlParams(url) {
		var _params = {},
			qStart = url.indexOf('?'),
			hStart = url.indexOf('#'),
			q = url.substr(qStart + 1),
			tmp,
			parts,
			i;

		if (hStart === -1) hStart = url.length;

		if (q) {
			tmp = q.split('&');
			i = tmp.length;
			while (i--) {
				parts = tmp[i].split('=');
				_params[parts[0]] = decodeURIComponent(parts[1]).replace(/\+/g, ' ');
				//_params[parts[0]] = parts[1];
			}
		}
		return _params;
	}

	getUrlParam(url, name) {
		return this.getUrlParams(url)[name];
	}


	/**
	 * 删除对象上的指定属性并返回一个新的对象
	 * @param  {Object} obj
	 * @param  {Array} keys
	 * @return {[type]}
	 */
	omit(obj, keys) {
		let o = this.clone(obj)
		keys.forEach(key => {
			delete o[key]
		})
		return o
	}

	/**
	 * 返回一个新数组，数组中的元素为指定属性的值
	 * @param  {Array} arr
	 * @param  {String} key
	 * @return {Array}
	 */
	pluck(arr, key) {
		if (typeof arr !== 'object' || arr.length === 0) {
			return []
		}
		if (!key) {
			return arr
		}
		return arr.map(a => a[key])
	}

	/**
	 * 返回序列化的值
	 * @param  {String} value
	 * @return {String}
	 */
	serializeValue(value) {
		if (this.isObject(value)) return this.isDate(value) ? value.toISOString() : this.toJson(value)
		return value
	}

	/**
	 * 编码URI
	 * @param  {String} value
	 * @param  {String} pctEncodeSpaces
	 * @return {String}
	 */
	encodeUriQuery(value, pctEncodeSpaces) {
		return encodeURIComponent(value)
			.replace(/%40/gi, '@')
			.replace(/%3A/gi, ':')
			.replace(/%24/g, '$')
			.replace(/%2C/gi, ',')
			.replace(/%3B/gi, ';')
			.replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'))
	}

	/**
	 * 对象序列化
	 * @param  {Object} obj
	 * @return {String}
	 */
	paramSerializer(obj) {
		if (!obj) return ''
		let that = this
		let parts = []
		for (let key in obj) {
			//if(key=='url')continue;
			const value = obj[key]
			if (value === null || that.isUndefined(value)) return
			if (that.isArray(value)) {
				value.forEach(function(v) {
					parts.push(that.encodeUriQuery(key) + '=' + that.encodeUriQuery(that.serializeValue(v)))
				})
			} else {
				parts.push(that.encodeUriQuery(key) + '=' + that.encodeUriQuery(that.serializeValue(value)))
			}
		}
		return parts.join('&')
	}

	/**
	 * 拼接URL
	 * @param  {String} obj
	 * @param  {Object} obj
	 * @return {String}
	 */
	buildUrl(url, obj) {
		const serializedParams = this.paramSerializer(obj)
		if (serializedParams.length > 0) {
			url += ((url.indexOf('?') == -1) ? '?' : '&') + serializedParams
		}
		return url
	}
	
	/**
	 * 全局唯一标识符（uuid，Globally Unique Identifier）,也称作 uuid(Universally Unique IDentifier) 
	 * 一般用于多个组件之间,给它一个唯一的标识符,或者v-for循环的时候,如果使用数组的index可能会导致更新列表出现问题
	 * 最可能的情况是左滑删除item或者对某条信息流"不喜欢"并去掉它的时候,会导致组件内的数据可能出现错乱
	 * v-for的时候,推荐使用后端返回的id而不是循环的index
	 * @param {Number} len uuid的长度
	 * @param {Boolean} firstU 将返回的首字母置为"u"
	 * @param {Nubmer} radix 生成uuid的基数(意味着返回的字符串都是这个基数),2-二进制,8-八进制,10-十进制,16-十六进制
	 */
	guid(len = 32, firstU = true, radix = null) {
		let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
		let uuid = [];
		radix = radix || chars.length;
	
		if (len) {
			// 如果指定uuid长度,只是取随机的字符,0|x为位运算,能去掉x的小数位,返回整数位
			for (let i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
		} else {
			let r;
			// rfc4122标准要求返回的uuid中,某些位为固定的字符
			uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
			uuid[14] = '4';
	
			for (let i = 0; i < 36; i++) {
				if (!uuid[i]) {
					r = 0 | Math.random() * 16;
					uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
				}
			}
		}
		// 移除第一个字符,并用u替代,因为第一个字符为数值时,该guuid不能用作id或者class
		if (firstU) {
			uuid.shift();
			return 'u' + uuid.join('');
		} else {
			return uuid.join('');
		}
	}
	
	/**
	 * 查询节点信息
	 * 当前方法在支付宝小程序中无法获取组件跟接点的尺寸
	 * 解决办法：为组件根部再套一个没有任何作用的view元素
	 */
	getRect(selector, all) {
	  return new Promise((resolve) => {
	    wx.createSelectorQuery()
	      .in(this)[all ? 'selectAll' : 'select'](selector)
	      .boundingClientRect(rect => {
	        if (all && Array.isArray(rect) && rect.length) {
	          resolve(rect)
	        }
	        if (!all && rect) {
	          resolve(rect)
	        }
	      })
	      .exec()
	  })
	} 
	

	renderUrl(url, defaultUrl) {
		if (!url || url == "") {
			url = defaultUrl;
		}
		if (url.indexOf("__weui-popup") > 0 || url.startsWith("tel:") || url.startsWith("http://") || url
			.startsWith(
				"https://")) {
			return url;
		}
		if (url.indexOf("/pages/" + url) != 0) {
			url = "/pages/" + url;
		}
		return url;
	}

	renderImage(path) {
		if (!path) return ''
		if (path.indexOf('http') !== -1) return path
		path = `${this.$$basePath}${path}`;
		if(path.indexOf("www.diygw.com/upload")>0){
			path = path.replace("www.diygw.com","lib.diygw.com")
		}
		return path;
	}

	makePhoneCall(e) {
		let phone = "";
		if (e.currentTarget) {
			var dataset = e.currentTarget.dataset;
			phone = dataset.phone;
		}else if(this.isObject(e) && e.phone){
			phone = e.phone
		}else{
			phone = e
		}
		if (phone.indexOf("tel:") !== -1) {
			phone = phone.substr(4);
		}
		wx.makePhoneCall({
			phoneNumber: phone
		})
	}

	navigateTo(url, params) {
		if (url.startsWith("tel:")) {
			this.makePhoneCall(url);
		} else {
			if (url.startsWith("http://") || url.startsWith("https://")) {
				const $$url = this.buildUrl("/pages/webview", params)
				return new Promise((resolve, reject) => {
					wx.navigateTo({
						url: $$url,
						success: res => resolve(res),
						fail: res => reject(res),
					})
				});
			} else {
				if (url.startsWith("pages/")){
					url = "/" + url;
				}
				if (!url.startsWith("/pages/")) {
					url = "/pages/" + url;
				}
				if (getApp().globalData.tabBar.indexOf(url) != -1) {
					wx.switchTab({
						url: url
					});
				} else if (params && params['redirect']) {
					const $$url = this.buildUrl(url, params)
					wx.redirectTo({
						url: $$url,
						success: (res)=>{
							console.log("success"+res)
						},
						fail: (res)=>{
							console.log("error"+res)
						}
					})
				} else {
					const $$url = this.buildUrl(url, params)
					wx.navigateTo({
						url: $$url,
						success: (res)=>{
							console.log("success"+res)
						},
						fail: (res)=>{
							console.log("error"+res)
							if(res&&res.errMsg&&res.errMsg.indexOf("limit")>0){
								wx.redirectTo({
									url: $$url,
									success: (res)=>{
										console.log("success"+res)
									},
									fail: (res)=>{
										console.log("error"+res)
									}
								})
							}
						}
					})
				}
			}

		}
	}
	
	
	// 补0，如1 -> 01
	padZero(num, targetLength = 2) {
	    let str = `${num}`
	    while (str.length < targetLength) {
	        str = `0${str}`
	    }
	    return str
	}
	
	parseTimeData(time) {
		const SECOND = 1000
		const MINUTE = 60 * SECOND
		const HOUR = 60 * MINUTE
		const DAY = 24 * HOUR
	    const days = Math.floor(time / DAY)
	    const hours = Math.floor((time % DAY) / HOUR)
	    const minutes = Math.floor((time % HOUR) / MINUTE)
	    const seconds = Math.floor((time % MINUTE) / SECOND)
	    const milliseconds = Math.floor(time % SECOND)
	    return {
	        days,
	        hours,
	        minutes,
	        seconds,
	        milliseconds
	    }
	}
	
	parseFormat(format, timeData) {
	    let {
	        days,
	        hours,
	        minutes,
	        seconds,
	        milliseconds
	    } = timeData
	    // 如果格式化字符串中不存在DD(天)，则将天的时间转为小时中去
	    if (format.indexOf('DD') === -1) {
	        hours += days * 24
	    } else {
	        // 对天补0
	        format = format.replace('DD', this.padZero(days))
	    }
	    // 其他同理于DD的格式化处理方式
	    if (format.indexOf('HH') === -1) {
	        minutes += hours * 60
	    } else {
	        format = format.replace('HH', this.padZero(hours))
	    }
	    if (format.indexOf('mm') === -1) {
	        seconds += minutes * 60
	    } else {
	        format = format.replace('mm', this.padZero(minutes))
	    }
	    if (format.indexOf('ss') === -1) {
	        milliseconds += seconds * 1000
	    } else {
	        format = format.replace('ss', this.padZero(seconds))
	    }
	    return format.replace('SSS', this.padZero(milliseconds, 3))
	}
	
	isSameSecond(time1, time2) {
	    return Math.floor(time1 / 1000) === Math.floor(time2 / 1000)
	}
	
	addUnit(value = 'auto', unit = 'rpx') {
	    return this.isNumber(value) ? `${value}${unit}` : value;
	}
	
	// 获取父组件的参数，因为支付宝小程序不支持provide/inject的写法
	// this.$parent在非H5中，可以准确获取到父组件，但是在H5中，需要多次this.$parent.$parent.xxx
	// 这里默认值等于undefined有它的含义，因为最顶层元素(组件)的$parent就是undefined，意味着不传name
	// 值(默认为undefined)，就是查找最顶层的$parent
	getParent(parent,name = undefined) {
		// 通过while历遍，这里主要是为了H5需要多层解析的问题
		while (parent) {
			// 父组件
			if (parent.$options && parent.$options.name !== name) {
				// 如果组件的name不相等，继续上一级寻找
				parent = parent.$parent;
				let tmp =  this.getParent(parent,name)
				if(tmp){
					return tmp;
				}
			} else {
				return parent;
			}
		}
		return false;
	}
	
	os() {
		return wx.getSystemInfoSync().platform;
	}
	
	sys() {
		return wx.getSystemInfoSync();
	}
}

export default Tools
