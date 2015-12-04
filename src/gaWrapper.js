class gaWrapper {
	constructor(opts={}) { 
		this.testMode = opts.testMode ? opts.testMode : false;
		this.verbose = opts.verbose ? opts.verbose : false;
		this.enabled = false;
		this.clicked = false;
		this.bindings = [];
		if (typeof ga === 'function') this.enabled = true;

		var self = this;

		$(document).on('touchstart click', function (e) {
			if (!self.clicked) {
				self.clicked = true;
				setTimeout(function(){
					self.clicked = false;
				},100);
				self._click(e);
			}
		});

		$(document).ready(function() {
			self.refresh();
		});

		this.log('init');

		if (this.testMode) {
			$('a').attr('href','#');
			$('*').on('click', function(e) {
				e.preventDefault();
				self.log(`clicked on ${e.target} with classes ${$(e.target).attr('class')}`);
			});
		}
	}

	bind(keyword, fn) {
		if (typeof fn !== 'function') return;
		this.bindings.push({'keyword':keyword,'function':fn});
	}

	refresh() {
		$('*[data-ga-bind-label]').each(function(i,val) {
			$(val).find('*[data-ga-label]').each(function(j,val1) {
				if (!$(val1).attr('data-ga-label').length) {
					$(val1).attr('data-ga-label', $(val).attr('data-ga-bind-label'));
				}
			});
		});
		$('*[data-ga-bind-action]').each(function(i,val) {
			$(val).find('*[data-ga-action]').each(function(j,val1) {
				if (!$(val1).attr('data-ga-action').length) {
					$(val1).attr('data-ga-action', $(val).attr('data-ga-bind-action'));
				}
			});
		});
		$('*[data-ga-bind-category]').each(function(i,val) {
			$(val).find('*[data-ga-category]').each(function(j,val1) {
				if (!$(val1).attr('data-ga-category').length) {
					$(val1).attr('data-ga-category', $(val).attr('data-ga-bind-category'));
				}
			});
		});
	}

	push(props, element=false) {
		if (!this.checkGALoaded()) return;

		if (!element) {
			this._push(category, action, label);
			return;
		}

		for (var i in props) {
			props[i] = this._fillBinding(props[i],element);
			if (!props[i]) props[i] = undefined;
		}

		let propsCheck = this._objHasEmptyValue(props,['labelPrefix','categoryPrefix','actionPrefix']);
		if (propsCheck) {this.log(`push event received but ${propsCheck} is undefined`, 0); return;}
		
		props.category = props.categoryPrefix ? props.categoryPrefix+props.category : props.category;
		props.action = props.actionPrefix ? props.actionPrefix+props.action : props.action;
		props.label = props.labelPrefix ? props.labelPrefix+props.label : props.label;

		this.log("pushed event (category: '"+props.category+"', action: '"+props.action+"', label: '"+props.label+"')");
		if (!this.testMode) ga('send', 'event', props.category, props.action, props.label);
	}

	trigger(element) {
		$(element).click();
	}

	_click(e) {
		let self = this;
		let target = $(e.target);
		let category = getProp('category',target);
		this.push({
			label: getProp('label',target,category),
			action: getProp('action',target,category),
			category: category,
			labelPrefix: getProp('label-prefix',target),
			actionPrefix: getProp('action-prefix',target),
			categoryPrefix: getProp('category-prefix',target)
		}, target);

		function getProp(name,target,restrictTo) {
			let prop = `data-ga-${name}`;
			let ret = self._hasAttr($(target),prop);
			if (!ret) {
				if (typeof restrictTo !== 'undefined') {
					ret = $(target).closest(`*[${prop}]`);
				} else {
					ret = $(target).closest(`*[${prop}]`,restrictTo);
				}
			}
			if (typeof restrictTo !== 'undefined' && !ret.length) {
				ret = restrictTo;
			}
			if (typeof ret === 'object') ret = $(ret).attr(prop);
			return ret;
		}
	}

	_fillBinding(str,element) {
		if (!str || typeof str === 'undefined' || !str.length) return false;

		for (var i in this.bindings) {
			if (str.indexOf(`@${this.bindings[i].keyword}`) > -1) {
				//matched keyword
				var replace = this.bindings[i]['function'].call(this,element);
				str = str.replace(`@${this.bindings[i].keyword}`, replace);
				if (!replace) this.log(`${this.bindings[i].keyword} bind callback returned an empty string`);
			}
		}

		if (str.indexOf('@') > -1) {
			this.log(`unrecognized binding in ${str}, ignoring`,2);
			return false;
		}

		return str;
	}

	checkGALoaded() {
		if (typeof ga === 'function') {
			this.enabled = true;
			return true;
		} else {
			this.enabled = false;
			this.log("push event received but ga has not been loaded", 2);
			return false;
		}
	}

	log(str,type=1) {
		switch(type) {
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

		if (this.verbose || type == 2 || type == 0) console.log(`gaw ${type}: ${str}`);
	}

	_hasAttr(e,a) {
		a = $(e).attr(a); if (typeof a !== typeof undefined && a !== false && a.length) {return a} else {return false;}
	}

	_objHasEmptyValue(obj,ignore) {
		let cont = false;
		for (var i in obj) {
			if (typeof ignore == 'object') {
				for (var j in ignore) {
					if (ignore[j] == i) {cont = true; break;}
				}
			}
			if (cont) {cont = false; continue;}
			if (typeof obj[i] === 'undefined' || !obj[i].length) {
				return i;
			}
		}
		return false;
	}
}