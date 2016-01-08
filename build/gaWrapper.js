'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var gaWrapper = (function () {
	function gaWrapper() {
		var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		_classCallCheck(this, gaWrapper);

		this._testMode = opts.testMode ? opts.testMode : false;
		this._verbose = opts.verbose ? opts.verbose : false;
		this.enabled = false;
		this.clicked = false;
		this.bindings = [];
		if (typeof ga === 'function') this.enabled = true;

		var self = this;

		$(document).on('touchstart click', function (e) {
			if (!self.clicked) {
				self.clicked = true;
				setTimeout(function () {
					self.clicked = false;
				}, 100);
				self._click(e);
			}
		});

		$(document).ready(function () {
			self.refresh();
		});

		this.log('init');

		if (this._testMode) {
			this.testMode(true);
		}
	}

	_createClass(gaWrapper, [{
		key: 'bind',
		value: function bind(keyword, fn) {
			if (typeof fn !== 'function') return;
			this.bindings.push({ 'keyword': keyword, 'function': fn });
		}
	}, {
		key: 'refresh',
		value: function refresh() {
			$('*[data-ga-bind-label]').each(function (i, val) {
				$(val).find('*[data-ga-label]').each(function (j, val1) {
					if (!$(val1).attr('data-ga-label').length) {
						$(val1).attr('data-ga-label', $(val).attr('data-ga-bind-label'));
					}
				});
			});
			$('*[data-ga-bind-action]').each(function (i, val) {
				$(val).find('*[data-ga-action]').each(function (j, val1) {
					if (!$(val1).attr('data-ga-action').length) {
						$(val1).attr('data-ga-action', $(val).attr('data-ga-bind-action'));
					}
				});
			});
			$('*[data-ga-bind-category]').each(function (i, val) {
				$(val).find('*[data-ga-category]').each(function (j, val1) {
					if (!$(val1).attr('data-ga-category').length) {
						$(val1).attr('data-ga-category', $(val).attr('data-ga-bind-category'));
					}
				});
			});
		}
	}, {
		key: 'push',
		value: function push(props) {
			var element = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

			if (!this.checkGALoaded()) return;

			if (!element) {
				this._push(category, action, label);
				return;
			}

			for (var i in props) {
				props[i] = this._fillBinding(props[i], element);
				if (!props[i]) props[i] = undefined;
			}

			var propsCheck = this._objHasEmptyValue(props, ['labelPrefix', 'categoryPrefix', 'actionPrefix']);
			if (propsCheck) {
				this.log('push event received but ' + propsCheck + ' is undefined', 0);return;
			}

			props.category = props.categoryPrefix ? props.categoryPrefix + props.category : props.category;
			props.action = props.actionPrefix ? props.actionPrefix + props.action : props.action;
			props.label = props.labelPrefix ? props.labelPrefix + props.label : props.label;

			this.log("pushed event (category: '" + props.category + "', action: '" + props.action + "', label: '" + props.label + "')");
			if (!this._testMode) ga('send', 'event', props.category, props.action, props.label);
		}
	}, {
		key: 'trigger',
		value: function trigger(element) {
			$(element).click();
		}
	}, {
		key: '_click',
		value: function _click(e) {
			var self = this;
			var target = $(e.target);
			var category = getProp('category', target);
			this.push({
				label: getProp('label', target, category),
				action: getProp('action', target, category),
				category: category,
				labelPrefix: getProp('label-prefix', target),
				actionPrefix: getProp('action-prefix', target),
				categoryPrefix: getProp('category-prefix', target)
			}, target);

			function getProp(name, target, restrictTo) {
				var prop = 'data-ga-' + name;
				var ret = self._hasAttr($(target), prop);
				if (!ret) {
					if (typeof restrictTo !== 'undefined') {
						ret = $(target).closest('*[' + prop + ']');
					} else {
						ret = $(target).closest('*[' + prop + ']', restrictTo);
					}
				}
				if (typeof restrictTo !== 'undefined' && !ret.length) {
					ret = restrictTo;
				}
				if (typeof ret === 'object') ret = $(ret).attr(prop);
				return ret;
			}
		}
	}, {
		key: '_fillBinding',
		value: function _fillBinding(str, element) {
			if (!str || typeof str === 'undefined' || !str.length) return false;

			for (var i in this.bindings) {
				if (str.indexOf('@' + this.bindings[i].keyword) > -1) {
					//matched keyword
					var replace = this.bindings[i]['function'].call(this, element);
					str = str.replace('@' + this.bindings[i].keyword, replace);
					if (!replace) this.log(this.bindings[i].keyword + ' bind callback returned an empty string');
				}
			}

			if (str.indexOf('@') > -1) {
				this.log('unrecognized binding in ' + str + ', ignoring', 2);
				return false;
			}

			return str;
		}
	}, {
		key: 'checkGALoaded',
		value: function checkGALoaded() {
			if (typeof ga === 'function') {
				this.enabled = true;
				return true;
			} else {
				this.enabled = false;
				this.log("push event received but ga has not been loaded", 2);
				return false;
			}
		}
	}, {
		key: 'log',
		value: function log(str) {
			var type = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];

			switch (type) {
				case 0:
					type = "WARNING";
					break;
				case 1:
					type = "INFO";
					break;
				case 2:
					type = "ERROR";
					break;
			}

			if (this._verbose || type == 2 || type == 0) console.log('gaw ' + type + ': ' + str);
		}
	}, {
		key: 'testMode',
		value: function testMode(set) {
			var self = this;
			if (typeof set === 'boolean') {
				if (set) {
					$('*').on('click', this._preventDefault);
					this._testMode = true;
				} else {
					$('*').off('click', this._preventDefault);
					this._testMode = false;
				}
			}
		}
	}, {
		key: 'verbose',
		value: function verbose(set) {
			if (typeof set === 'boolean') {
				this._verbose = set;
			}
		}
	}, {
		key: '_preventDefault',
		value: function _preventDefault(e) {
			e.preventDefault();
		}
	}, {
		key: '_hasAttr',
		value: function _hasAttr(e, a) {
			a = $(e).attr(a);if (typeof a !== typeof undefined && a !== false && a.length) {
				return a;
			} else {
				return false;
			}
		}
	}, {
		key: '_objHasEmptyValue',
		value: function _objHasEmptyValue(obj, ignore) {
			var cont = false;
			for (var i in obj) {
				if (typeof ignore == 'object') {
					for (var j in ignore) {
						if (ignore[j] == i) {
							cont = true;break;
						}
					}
				}
				if (cont) {
					cont = false;continue;
				}
				if (typeof obj[i] === 'undefined' || !obj[i].length) {
					return i;
				}
			}
			return false;
		}
	}]);

	return gaWrapper;
})();

var gaw = new gaWrapper();