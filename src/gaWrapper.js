class gaWrapper {
	constructor(opts={}) { 
		this.prefix = opts.prefix ? opts.prefix : "";
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
			console.log('inserted label');
			$(val).find('*[data-ga-label]').attr('data-ga-label', $(val).attr('data-ga-bind-label'));
		});
		$('*[data-ga-bind-action]').each(function(i,val) {
			$(val).find('*[data-ga-action]').attr('data-ga-action', $(val).attr('data-ga-bind-action'));
		});
		$('*[data-ga-bind-category]').each(function(i,val) {
			$(val).find('*[data-ga-category]').attr('data-ga-category', $(val).attr('data-ga-bind-category'));
		});
	}

	push(category, action, label, element=false) {
		if (!this.checkGALoaded()) return;

		if (!element) {
			this._push(category, action, label);
			return;
		}

		category = this._fillBinding(element,category);
		action = this._fillBinding(element,action);
		label = this._fillBinding(element,label);
		this._push(category, action, label);
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
		let category = this._hasAttr($(target),'data-ga-category');
		let label = this._hasAttr($(target),'data-ga-label');
		let action = this._hasAttr($(target),'data-ga-action');

		if (!category) category = $(target).closest('*[data-ga-category]');
		if (!label) label = $(target).closest('*[data-ga-label]', category);
		if (!action) action = $(target).closest('*[data-ga-action]', category);
		if (!label.length) label = category;
		if (!action.length) action = category

		if (typeof label == 'object') label = $(label).attr('data-ga-label');
		if (typeof action == 'object') action = $(action).attr('data-ga-action');
		if (typeof category == 'object') category = $(category).attr('data-ga-category');

		this.push(category, action, label, target);
	}

	_fillBinding(element,str) {
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

	_hasAttr(e,a) {
		a = $(e).attr(a); if (typeof a !== typeof undefined && a !== false) {return a} else {return false;}
	}
}