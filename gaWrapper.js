'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var gaWrapper = (function () {
	function gaWrapper() {
		var opts = arguments[0] === undefined ? {} : arguments[0];

		_classCallCheck(this, gaWrapper);

		this.prefix = opts.prefix ? opts.prefix : '';
		this.testMode = opts.testMode ? opts.testMode : false;
		this.verbose = opts.verbose ? opts.verbose : false;
		this.enabled = false;
		this.events = [];
		if (typeof ga === 'function') this.enabled = true;

		var self = this;
		$(document).click(function (e) {
			self._click(e);
		});
		this.log('init');

		if (this.testMode) {
			$('a').click(function (e) {
				e.preventDefault();
			});
		}
	}

	_createClass(gaWrapper, [{
		key: 'register',
		value: function register(dynamicType, match, fn) {
			if (typeof match !== 'object') return;
			if (!('action' in match) && !('category' in match) && !('label' in match) || dynamicType !== 'action' && dynamicType !== 'category' && dynamicType !== 'label' || typeof fn !== 'function') return;
			this.events.push({ 'dynamicType': dynamicType, 'match': match, 'function': fn });
		}
	}, {
		key: 'push',
		value: function push(category, action, label) {
			var _this = this;

			var element = arguments[3] === undefined ? false : arguments[3];

			if (!this.checkGALoaded()) return;

			if (!element) {
				this._push(category, action, label);
				return;
			}

			var hasEvent = false;
			for (var i in this.events) {
				if ('action' in this.events[i].match && action === this.events[i].match.action || 'category' in this.events[i].match && category === this.events[i].match.category || 'label' in this.events[i].match && label === this.events[i].match.label) {
					(function () {
						var self = _this;
						hasEvent = true;

						switch (_this.events[i].dynamicType) {
							case 'action':
								_this.events[i]['function'].call(_this, action, element, function (t) {
									if (t) self._push(category, t, label);
								});
								break;
							case 'category':
								_this.events[i]['function'].call(_this, category, element, function (t) {
									if (t) self._push(t, action, label);
								});
								break;
							case 'label':
								_this.events[i]['function'].call(_this, label, element, function (t) {
									if (t) self._push(category, action, t);
								});
								break;
							default:
								self._push(category, action, label);
								break;
						}
					})();
				}
			}

			if (!hasEvent) {
				this._push(category, action, label);
			}
		}
	}, {
		key: '_push',
		value: function _push(category, action, label) {
			if (!this.checkGALoaded()) return;
			if (!category) {
				this.log('push event received but category is undefined', 0);return;
			}
			if (!category.length) {
				this.log('push event received but category is of length 0', 0);return;
			}
			if (!action) {
				this.log('push event received but action is undefined', 0);return;
			}
			if (!action.length) {
				this.log('push event received but action is of length 0', 0);return;
			}
			if (!label) {
				this.log('push event received but label is undefined', 0);return;
			}
			if (!label.length) {
				this.log('push event received but label is of length 0', 0);return;
			}

			this.log('pushed event (category: \'' + this.prefix + category + '\', action: \'' + action + '\', label: \'' + label + '\')');
			if (!this.testMode) ga('send', 'event', this.prefix + category, action, label);
		}
	}, {
		key: '_click',
		value: function _click(e) {
			var target = $(e.target);
			var category = $(target).closest('*[data-ga-category]');
			var label = $(target).closest('*[data-ga-label]', category);
			var action = $(target).closest('*[data-ga-action]', category);
			if (!label.length) label = category;
			if (!action.length) action = category;

			label = $(label).attr('data-ga-label');
			action = $(action).attr('data-ga-action');
			category = $(category).attr('data-ga-category');

			this.push(category, action, label, target);
		}
	}, {
		key: 'checkGALoaded',
		value: function checkGALoaded() {
			if (typeof ga === 'function') {
				this.enabled = true;
				return true;
			} else {
				this.enabled = false;
				this.log('push event received but ga has not been loaded', 2);
				return false;
			}
		}
	}, {
		key: 'log',
		value: function log(str) {
			var type = arguments[1] === undefined ? 1 : arguments[1];

			switch (type) {
				case 0:
					type = 'WARNING';
					break;
				case 1:
					type = 'INFO';
					break;
				case 2:
					type = 'ERROR';
					break;
			}

			if (this.verbose || type == 2 || type == 0) console.log('gaw ' + type + ': ' + str);
		}
	}, {
		key: 'prefix',
		set: function (v) {
			this._prefix = v ? v + '-' : '';
		},
		get: function () {
			return this._prefix;
		}
	}]);

	return gaWrapper;
})();