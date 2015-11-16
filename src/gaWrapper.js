class gaWrapper {
	constructor(opts={}) { 
		this.testMode = opts.testMode ? opts.testMode : false;
		this.verbose = opts.verbose ? opts.verbose : false;
		this.enabled = false;
		this.bindings = [];
		if (typeof ga === 'function') this.enabled = true;

		var self = this;
		$(document).click(function(e) {
			self._click(e);
		});

		$(document).ready(function() {
			self.refresh();
		});

		this.log('init');

		if (this.testMode) {
			$('a').click(function(e) {e.preventDefault();})
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

		props.category = this._fillBinding(props.category,element);
		props.action = this._fillBinding(props.action,element);
		props.label = this._fillBinding(props.label,element);
		props.categoryPrefix = this._fillBinding(props.categoryPrefix);
		props.actionPrefix = this._fillBinding(props.actionPrefix);
		props.labelPrefix = this._fillBinding(props.labelPrefix);
		this._push(props);
	}

	_push(props) {
		if (!this.checkGALoaded()) return;
		if (!props.category) {this.log("push event received but category is undefined", 0); return;}
		if (!props.category.length) {this.log("push event received but category is of length 0", 0); return;}
		if (!props.action) {this.log("push event received but action is undefined", 0); return;}
		if (!props.action.length) {this.log("push event received but action is of length 0", 0); return;}
		if (!props.label) {this.log("push event received but label is undefined", 0); return;}
		if (!props.label.length) {this.log("push event received but label is of length 0", 0); return;}
		
		props.category = props.categoryPrefix ? props.categoryPrefix+props.category : props.category;
		props.action = props.actionPrefix ? props.actionPrefix+action : props.action;
		props.label = props.labelPrefix ? props.labelPrefix+label : props.label;

		this.log("pushed event (category: '"+props.category+"', action: '"+props.action+"', label: '"+props.label+"')");
		if (!this.testMode) ga('send', 'event', props.category, props.action, props.label);
	}

	_click(e) {
		let target = $(e.target);
		let category = this._hasAttr($(target),'data-ga-category');
		let label = this._hasAttr($(target),'data-ga-label');
		let action = this._hasAttr($(target),'data-ga-action');

		let categoryPrefix = this._hasAttr($(target),'data-ga-category-prefix');
		let labelPrefix = this._hasAttr($(target),'data-ga-label-prefix');
		let actionPrefix = this._hasAttr($(target),'data-ga-action-prefix');

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
		}

		this.push(props, target);
	}

	_fillBinding(str,element) {
		if (!str || typeof str === 'undefined' || !str.length) return false;

		for (var i in this.bindings) {
			if (str.indexOf(`{{${this.bindings[i].keyword}}}`) > -1) {
				//matched keyword
				var replace = this.bindings[i]['function'].call(this,element);
				if (replace) str = str.replace(`{{${this.bindings[i].keyword}}}`, replace);
				else this.log(`${str} binding returned a string of length 0`,0);
			}
		}

		if (str.indexOf('{{') > -1 && str.indexOf('}}') > -1) {
			this.log(`unrecognized binding in ${str}, ignoring`,2);
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
		a = $(e).attr(a); if (typeof a !== typeof undefined && a !== false) {return a} else {return false;}
	}
}