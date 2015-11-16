'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var gaWrapper = (function () {
	function gaWrapper() {
		var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		_classCallCheck(this, gaWrapper);

		this.testMode = opts.testMode ? opts.testMode : false;
		this.verbose = opts.verbose ? opts.verbose : false;
		this.enabled = false;
		this.bindings = [];
		if (typeof ga === 'function') this.enabled = true;

		var self = this;
		$(document).click(function (e) {
			self._click(e);
		});

		$(document).ready(function () {
			self.refresh();
		});

		this.log('init');

		if (this.testMode) {
			$('a').click(function (e) {
				e.preventDefault();
			});
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

			props.category = this._fillBinding(props.category, element);
			props.action = this._fillBinding(props.action, element);
			props.label = this._fillBinding(props.label, element);
			props.categoryPrefix = this._fillBinding(props.categoryPrefix);
			props.actionPrefix = this._fillBinding(props.actionPrefix);
			props.labelPrefix = this._fillBinding(props.labelPrefix);
			this._push(props);
		}
	}, {
		key: '_push',
		value: function _push(props) {
			if (!this.checkGALoaded()) return;
			if (!props.category) {
				this.log("push event received but category is undefined", 0);return;
			}
			if (!props.category.length) {
				this.log("push event received but category is of length 0", 0);return;
			}
			if (!props.action) {
				this.log("push event received but action is undefined", 0);return;
			}
			if (!props.action.length) {
				this.log("push event received but action is of length 0", 0);return;
			}
			if (!props.label) {
				this.log("push event received but label is undefined", 0);return;
			}
			if (!props.label.length) {
				this.log("push event received but label is of length 0", 0);return;
			}

			props.category = props.categoryPrefix ? props.categoryPrefix + props.category : props.category;
			props.action = props.actionPrefix ? props.actionPrefix + action : props.action;
			props.label = props.labelPrefix ? props.labelPrefix + label : props.label;

			this.log("pushed event (category: '" + props.category + "', action: '" + props.action + "', label: '" + props.label + "')");
			if (!this.testMode) ga('send', 'event', props.category, props.action, props.label);
		}
	}, {
		key: '_click',
		value: function _click(e) {
			var target = $(e.target);
			var category = this._hasAttr($(target), 'data-ga-category');
			var label = this._hasAttr($(target), 'data-ga-label');
			var action = this._hasAttr($(target), 'data-ga-action');

			var categoryPrefix = this._hasAttr($(target), 'data-ga-category-prefix');
			var labelPrefix = this._hasAttr($(target), 'data-ga-label-prefix');
			var actionPrefix = this._hasAttr($(target), 'data-ga-action-prefix');

			if (!category) category = $(target).closest('*[data-ga-category]');
			if (!label) label = $(target).closest('*[data-ga-label]', category);
			if (!action) action = $(target).closest('*[data-ga-action]', category);
			if (!categoryPrefix) categoryPrefix = $(target).closest('*[data-ga-category-prefix]');
			if (!labelPrefix) labelPrefix = $(target).closest('*[data-ga-label-prefix]');
			if (!actionPrefix) actionPrefix = $(target).closest('*[data-ga-action-prefix]');
			if (!label.length) label = category;
			if (!action.length) action = category;
			if (!categoryPrefix.length) categoryPrefix = '';
			if (!labelPrefix.length) labelPrefix = '';
			if (!actionPrefix.length) actionPrefix = '';

			if (typeof label == 'object') label = $(label).attr('data-ga-label');
			if (typeof action == 'object') action = $(action).attr('data-ga-action');
			if (typeof category == 'object') category = $(category).attr('data-ga-category');
			if (typeof labelPrefix == 'object') labelPrefix = $(labelPrefix).attr('data-ga-label-prefix');
			if (typeof actionPrefix == 'object') actionPrefix = $(actionPrefix).attr('data-ga-action-prefix');
			if (typeof categoryPrefix == 'object') categoryPrefix = $(categoryPrefix).attr('data-ga-category-prefix');

			var props = {
				label: label,
				action: action,
				category: category,
				labelPrefix: labelPrefix,
				actionPrefix: actionPrefix,
				categoryPrefix: categoryPrefix
			};

			this.push(props, target);
		}
	}, {
		key: '_fillBinding',
		value: function _fillBinding(str, element) {
			if (!str || typeof str === 'undefined' || !str.length) return false;

			for (var i in this.bindings) {
				if (str.indexOf('{{' + this.bindings[i].keyword + '}}') > -1) {
					//matched keyword
					var replace = this.bindings[i]['function'].call(this, element);
					if (replace) str = str.replace('{{' + this.bindings[i].keyword + '}}', replace);else this.log(str + ' binding returned a string of length 0', 0);
				}
			}

			if (str.indexOf('{{') > -1 && str.indexOf('}}') > -1) {
				this.log('unrecognized binding in ' + str + ', ignoring', 2);
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

			if (this.verbose || type == 2 || type == 0) console.log('gaw ' + type + ': ' + str);
		}
	}, {
		key: '_hasAttr',
		value: function _hasAttr(e, a) {
			a = $(e).attr(a);if (typeof a !== typeof undefined && a !== false) {
				return a;
			} else {
				return false;
			}
		}
	}]);

	return gaWrapper;
})();