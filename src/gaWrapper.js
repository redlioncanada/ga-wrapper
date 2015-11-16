class gaWrapper {
	constructor(opts={}) { 
		this.prefix = opts.prefix ? opts.prefix : "";
		this.testMode = opts.testMode ? opts.testMode : false;
		this.verbose = opts.verbose ? opts.verbose : false;
		this.enabled = false;
		this.events = [];
		this.bindings = [];
		if (typeof ga === 'function') this.enabled = true;

		let self = this;
		$(document).click(function(e) {
			self._click(e);
		});
		this.log('init');

		if (this.testMode) {
			$('a').click(function(e) {e.preventDefault();})
		}
	}

	register(dynamicType, match, fn) {
		if (typeof match !== 'object') return;
		if ((!('action' in match) && !('category' in match) && !('label' in match)) || (dynamicType !== 'action' && dynamicType !== 'category' && dynamicType !== 'label') || typeof fn !== 'function') return;
		this.events.push({'dynamicType':dynamicType, 'match':match, 'function':fn});
	}

	bind(keyword, fn) {
		if (typeof fn !== 'function') return;
		this.bindings.push({'keyword':keyword,'function':fn});
	}

	push(category, action, label, element=false) {
		if (!this.checkGALoaded()) return;

		if (!element) {
			this._push(category, action, label);
			return;
		}

		let hasEvent = false;
		for (var i in this.events) {
			if (('action' in this.events[i].match && action === this.events[i].match.action) || ('category' in this.events[i].match && category === this.events[i].match.category) || ('label' in this.events[i].match && label === this.events[i].match.label)) {
				let self = this;
				hasEvent = true;

				switch (this.events[i].dynamicType) {
					case 'action':
						this.events[i].function.call(this, action, element, function(t) {if (t) self._push(category,t,label)});
						break;
					case 'category':
						this.events[i].function.call(this, category, element, function(t) {if (t) self._push(t,action,label)});
						break;
					case 'label':
						this.events[i].function.call(this, label, element, function(t) {if (t) self._push(category,action,t)});
						break;
					default:
						self._push(category,action,label);
						break;
				}
			}
		}

		category = this._fillBindings(element,category);
		action = this._fillBindings(element,action);
		label = this._fillBindings(element,label);

		if (!hasEvent) {
			this._push(category, action, label);
		}
	}

	_push(category, action, label) {
		if (!this.checkGALoaded()) return;
		if (!category) {this.log("push event received but category is undefined", 0); return;}
		if (!category.length) {this.log("push event received but category is of length 0", 0); return;}
		if (!action) {this.log("push event received but action is undefined", 0); return;}
		if (!action.length) {this.log("push event received but action is of length 0", 0); return;}
		if (!label) {this.log("push event received but label is undefined", 0); return;}
		if (!label.length) {this.log("push event received but label is of length 0", 0); return;}
		
		this.log("pushed event (category: '"+this.prefix+category+"', action: '"+action+"', label: '"+label+"')");
		if (!this.testMode) ga('send', 'event', this.prefix+category, action, label);
	}

	_click(e) {
		let target = $(e.target);
		let category = hasAttr($(target),'data-ga-category');
		let label = hasAttr($(target),'data-ga-label');
		let action = hasAttr($(target),'data-ga-action');

		if (!category) category = $(target).closest('*[data-ga-category]');
		if (!label) label = $(target).closest('*[data-ga-label]', category);
		if (!action) action = $(target).closest('*[data-ga-action]', category);
		if (!label.length) label = category;
		if (!action.length) action = category

		if (typeof label == 'object') label = $(label).attr('data-ga-label');
		if (typeof action == 'object') action = $(action).attr('data-ga-action');
		if (typeof category == 'object') category = $(category).attr('data-ga-category');

		this.push(category, action, label, target);
		function hasAttr(e,a) {a = $(e).attr(a); if (typeof a !== typeof undefined && a !== false) {return a} else {return false;}}
	}

	_fillBindings(element,str) {
		if (!str || !element) return false;

		for (var i in this.bindings) {
			if (str.indexOf(`{{${this.bindings[i].keyword}}}`) > -1) {
				//matched keyword
				console.log(this.bindings[i]['function'].call(this,element));
				str = str.replace(`{{${this.bindings[i].keyword}}}`, this.bindings[i]['function'].call(this,element));
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

	set prefix(v) {
		this._prefix = v ? v + '-' : '';
	}

	get prefix() {
		return this._prefix;
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
}