/**
 * 表单验证
 * Update: 邓志锋 <280160522@qq.com> <http://www.diygw.com>
 * @param {Object} rules 验证字段的规则
 *
 */
class Validate {
	constructor(rules = {}) {
		Object.assign(this, {
			rules
		})
		this.__init()
	}

	/**
	 * __init
	 */
	__init() {
		this.__initMethods()
		this.__initDefaults()
		this.__initData()
	}

	/**
	 * 初始化默认提示信息
	 */
	__initDefaults() {
		this.defaults = {
			messages: {
				required: '这是必填字段。',
				email: '请输入有效的电子邮件地址。',
				tel: '请输入11位的手机号码。',
				url: '请输入有效的网址。',
				date: '请输入有效的日期。',
				dateISO: '请输入有效的日期（ISO），例如：2009-06-23，1998/01/22。',
				number: '请输入有效的数字。',
				regexp: '请输入有效的正则匹配值。',
				digits: '只能输入数字。',
				idcard: '请输入18位的有效身份证。',
				equalTo: '输入值必须和%s相同。',
				contains: '输入值必须包含%s。',
				minlength: '最少要输入%s个字符。',
				maxlength: '最多可以输入%s个字符。',
				rangelength: '请输入长度在%s到%s之间的字符。',
				min: '请输入不小于%s的数值。',
				max: '请输入不大于%s的数值。',
				range: '请输入范围在%s到 {1} 之间的数值。',
			}
		}
	}

	/**
	 * 初始化数据
	 */
	__initData() {
		this.form = {}
		this.errorList = []
	}


	/**
	 * 初始化默认验证方法
	 */
	__initMethods() {
		const that = this
		that.methods = {
			/**
			 * 验证必填元素
			 */
			required: {
				valid(value, param) {
					if (!that.depend(param)) {
						return 'dependency-mismatch'
					} else if (typeof value === 'number') {
						value = value.toString()
					} else if (typeof value === 'boolean') {
						return !0
					}
					return value.length > 0
				},
				message(param) {
					return param.message || '这是必填字段。';
				}
			},
			/**
			 * 验证电子邮箱格式
			 */
			email: {
				valid(value, param) {
					return that.optional(value) ||
						/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
						.test(value)
				},
				message(param) {
					return param.message || '请输入有效的电子邮件地址。';
				}
			},
			/**
			 * 验证手机格式
			 */
			tel: {
				valid(value, param) {
					return that.optional(value) || /^1[34578]\d{9}$/.test(value)
				},
				message(param) {
					return param.message || '请输入11位的手机号码。';
				}

			},
			/**
			 * 验证URL格式
			 */
			url: {
				valid(value, param) {
					return that.optional(value) ||
						/^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i
						.test(value)
				},
				message(param) {
					return param.message || '请输入有效的网址。';
				}
			},
			/**
			 * 验证日期格式
			 */
			date: {
				valid(value, param) {
					return that.optional(value) || !/Invalid|NaN/.test(new Date(value).toString())
				},
				message(param) {
					return param.message || '请输入有效的日期。';
				}

			},
			/**
			 * 验证ISO类型的日期格式
			 */
			dateISO: {
				valid(value, param) {
					return that.optional(value) ||
						/^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/.test(value)
				},
				message(param) {
					return param.message || '请输入有效的日期（ISO），例如：2009-06-23，1998/01/22。';
				}
			},
			/**
			 * 验证十进制数字
			 */
			number: {
				valid(value, param) {
					return that.optional(value) || /^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value)
				},
				message(param) {
					return param.message || '请输入有效的数字。';
				}

			},
			/**
			 * 验证整数
			 */
			digits: {
				valid(value, param) {
					return that.optional(value) || /^\d+$/.test(value)
				},
				message(param) {
					return param.message || '只能输入整数。';
				}
			},
			/**
			 * 验证身份证号码
			 */
			idcard: {
				valid(value, param) {
					return that.optional(value) ||
						/^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/.test(value)
				},
				message(param) {
					return param.message || '请输入18位的有效身份证。';
				}
			},
			/**
			 * 正则验证值
			 */
			regexp: {
				valid(value, param) {
					var regexp = ('string' === typeof param.regexp) ? new RegExp(param.regexp) : param.regexp;
					return that.optional(value) || regexp.test(value)
				},
				message(param) {
					return param.message || '请输入有效的正则匹配值';
				}
			},
			/**
			 * 验证两个输入框的内容是否相同
			 */
			equalTo: {
				valid(value, param) {
					return that.optional(value) || value === that.scope.detail.value[param.field]
				},
				message(param) {
					return that.formatMessage(param.message || '输入值必须和%s相同。', [that.scope.detail.value[param
						.field]]);
				}
			},
			/**
			 * 验证是否包含某个值
			 */
			contains: {
				valid(value, param) {
					return that.optional(value) || value.indexOf(param.value) >= 0
				},
				message(param) {
					return that.formatMessage(param.message || '输入值必须包含%s。', [param.value]);
				}
			},
			/**
			 * 验证最小长度
			 */
			minlength: {
				valid(value, param) {
					return that.optional(value) || value.length >= param.value
				},
				message(param) {
					return that.formatMessage(param.message || '最少要输入%s个字符。', [param.value]);
				}

			},
			/**
			 * 验证最大长度
			 */
			maxlength: {
				valid(value, param) {
					return that.optional(value) || value.length <= param.value
				},
				message(param) {
					return that.formatMessage(param.message || '最多可以输入%s个字符。', [param.value]);
				}
			},
			/**
			 * 验证一个长度范围[min, max]
			 */
			rangelength: {
				valid(value, param) {
					return that.optional(value) || (value.length >= param.min && value.length <= param.max)
				},
				message(param) {
					return that.formatMessage(param.message || '请输入长度在%s到%s之间的字符。', [param.min, param.max]);
				}

			},
			/**
			 * 验证最小值
			 */
			min: {
				valid(value, param) {
					return that.optional(value) || value >= param.value
				},
				message(param) {
					return that.formatMessage(param.message || '请输入不小于%s的数值。', [param.value]);
				}
			},
			/**
			 * 验证最大值
			 */
			max: {
				valid(value, param) {
					return that.optional(value) || value <= param.value
				},
				message(param) {
					return that.formatMessage(param.message || '请输入不大于%s的数值。', [param.value]);
				}

			},
			/**
			 * 验证一个值范围[min, max]
			 */
			range: {
				valid(value, param) {
					return that.optional(value) || (value >= param.min && value <= param.max)
				},
				message(param) {
					return that.formatMessage(param.message || '请输入范围在%s到%s之间的数值。', [param.min, param.max]);
				}

			},
		}
	}

	/**
	 * 添加自定义验证方法
	 * @param {String} name 方法名
	 * @param {Function} method 函数体，接收两个参数(value, param)，value表示元素的值，param表示参数
	 * @param {String} message 提示信息
	 */
	addMethod(name, method, message) {
		this.methods[name] = method
		this.defaults.messages[name] = message !== undefined ? message : this.defaults.messages[name]
	}

	/**
	 * 判断验证方法是否存在
	 */
	isValidMethod(value) {
		return this.methods.hasOwnProperty(value);
	}

	/**
	 * 格式化提示信息模板
	 */
	formatMessage(message, parameters) {
		if (!Array.isArray(parameters)) {
			parameters = [parameters];
		}

		for (var i in parameters) {
			message = message.replace('%s', parameters[i]);
		}

		return message;
	}

	/**
	 * 格式化提示信息模板
	 */
	formatTpl(source, params) {
		const that = this
		if (arguments.length === 1) {
			return function() {
				let args = Array.from(arguments)
				args.unshift(source)
				return that.formatTpl.apply(this, args)
			}
		}
		if (params === undefined) {
			return source
		}
		if (arguments.length > 2 && params.constructor !== Array) {
			params = Array.from(arguments).slice(1)
		}
		if (params.constructor !== Array) {
			params = [params]
		}
		params.forEach(function(n, i) {
			source = source.replace(new RegExp("\\{" + i + "\\}", "g"), function() {
				return n
			})
		})
		return source
	}

	/**
	 * 判断规则依赖是否存在
	 */
	depend(param) {
		switch (typeof param) {
			case 'boolean':
				param = param
				break
			case 'string':
				param = !!param.length
				break
			case 'function':
				param = param()
			default:
				param = !0
		}
		return param
	}

	/**
	 * 判断输入值是否为空
	 */
	optional(value) {
		return !this.methods.required.valid(value) && 'dependency-mismatch'
	}

	/**
	 * 获取自定义字段的提示信息
	 * @param {String} param 字段名
	 * @param {Object} rule 规则
	 */
	customMessage(param, rule) {
		if (!rule.parameters.message) {
			rule.parameters.message = this.defaults.messages[rule.method];
		}
		if (rule.parameters.message.indexOf("%s") >= 0) {
			return this.methods[rule.method].message
		} else {
			return rule.parameters.message;
		}
	}

	/**
	 * 获取某个指定字段的提示信息
	 * @param {String} param 字段名
	 * @param {Object} rule 规则
	 */
	defaultMessage(param, rule) {
		let message = this.customMessage(param, rule) || this.defaults.messages[rule.method]
		let type = typeof message

		if (type === 'undefined') {
			message = `Warning: No message defined for ${rule.method}.`
		} else if (type === 'function') {
			message = message.call(this, rule.parameters)
		}

		return message
	}

	/**
	 * 缓存错误信息
	 * @param {String} param 字段名
	 * @param {Object} rule 规则
	 * @param {String} value 元素的值
	 */
	formatTplAndAdd(param, rule, value) {
		let msg = this.defaultMessage(param, rule)

		this.errorList.push({
			param: param,
			msg: msg,
			value: value,
		})
	}

	/**
	 * 验证某个指定字段的规则
	 * @param {String} param 字段名
	 * @param {Object} rules 规则
	 * @param {Object} event 表单数据对象
	 */
	checkParam(param, rules, event) {

		// 缓存表单数据对象
		this.scope = event

		// 缓存字段对应的值
		const data = event.detail.value
		const value = data[param] || ''

		// 遍历某个指定字段的所有规则，依次验证规则，否则缓存错误信息
		for (let method in rules) {

			// 判断验证方法是否存在
			if (this.isValidMethod(method)) {

				// 缓存规则的属性及值
				const rule = {
					method: method,
					parameters: rules[method]
				}

				// 调用验证方法
				const result = this.methods[method].valid(value, rule.parameters)

				// 若result返回值为dependency-mismatch，则说明该字段的值为空或非必填字段
				if (result === 'dependency-mismatch') {
					continue
				}

				this.setValue(param, method, result, value)

				// 判断是否通过验证，否则缓存错误信息，跳出循环
				if (!result) {
					this.formatTplAndAdd(param, rule, value)
					break
				}
			}
		}
	}

	/**
	 * 设置字段的默认验证值
	 * @param {String} param 字段名
	 */
	setView(param) {
		this.form[param] = {
			$name: param,
			$valid: true,
			$invalid: false,
			$error: {},
			$success: {},
			$viewValue: ``,
		}
	}

	/**
	 * 设置字段的验证值
	 * @param {String} param 字段名
	 * @param {String} method 字段的方法
	 * @param {Boolean} result 是否通过验证
	 * @param {String} value 字段的值
	 */
	setValue(param, method, result, value) {
		const params = this.form[param]
		params.$valid = result
		params.$invalid = !result
		params.$error[method] = !result
		params.$success[method] = result
		params.$viewValue = value
	}

	/**
	 * 验证所有字段的规则，返回验证是否通过
	 * @param {Object} event 表单数据对象
	 */
	checkForm(event) {
		this.__initData()

		for (let param in this.rules) {
			this.setView(param)
			this.checkParam(param, this.rules[param], event)
		}

		return this.valid()
	}

	/**
	 * 返回验证是否通过
	 */
	valid() {
		return this.size() === 0
	}

	/**
	 * 返回错误信息的个数
	 */
	size() {
		return this.errorList.length
	}

	/**
	 * 返回所有错误信息
	 */
	validationErrors() {
		return this.errorList
	}
}

export default Validate
