class gaWrapper {
	constructor(opts) {
		if (!opts) {opts = {};}
		this.prefix = opts.prefix ? opts.prefix : "";
		this.testMode = opts.testMode ? opts.testMode : false;
		this.verbose = opts.verbose ? opts.verbose : false;
		this.enabled = false;
		this.events = [];
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
		if ((!('action' in match) && !('category' in match) && !('label' in match)) || (dynamicType !== 'action' && dynamicType !== 'category' && dynamicType !== 'label')) return;
		this.events.push({'dynamicType':dynamicType, 'match':match, 'function':fn});
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
		
		this.log("pushed event (category: '"+this.prefix+'-'+category+"', action: '"+action+"', label: '"+label+"')");
		if (!this.testMode) ga('send', 'event', this.prefix+'-'+category, action, label);
	}

	_click(e) {
		let target = $(e.target);
		let category = $(target).closest('*[data-ga-category]');
		let label = $(target).closest('*[data-ga-label]', category);
		let action = $(target).closest('*[data-ga-action]', category);
		if (!label.length) label = category;
		if (!action.length) action = category

		label = $(label).attr('data-ga-label');
		action = $(action).attr('data-ga-action');
		category = $(category).attr('data-ga-category');

		this.push(category, action, label, target);
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
}