"use strict";function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var _createClass=function(){function e(e,t){for(var i=0;i<t.length;i++){var a=t[i];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(e,a.key,a)}}return function(t,i,a){return i&&e(t.prototype,i),a&&e(t,a),t}}(),gaWrapper=function(){function e(){var t=arguments.length<=0||void 0===arguments[0]?{}:arguments[0];_classCallCheck(this,e),this.testMode=t.testMode?t.testMode:!1,this.verbose=t.verbose?t.verbose:!1,this.enabled=!1,this.bindings=[],"function"==typeof ga&&(this.enabled=!0);var i=this;$(document).click(function(e){i._click(e)}),$(document).ready(function(){i.refresh()}),this.log("init"),this.testMode&&$("a").click(function(e){e.preventDefault()})}return _createClass(e,[{key:"bind",value:function(e,t){"function"==typeof t&&this.bindings.push({keyword:e,"function":t})}},{key:"refresh",value:function(){$("*[$ga-bind-label]").each(function(e,t){$(t).find("*[$ga-label]").each(function(e,i){$(i).attr("$ga-label").length||$(i).attr("$ga-label",$(t).attr("$ga-bind-label"))})}),$("*[$ga-bind-action]").each(function(e,t){$(t).find("*[$ga-action]").each(function(e,i){$(i).attr("$ga-action").length||$(i).attr("$ga-action",$(t).attr("$ga-bind-action"))})}),$("*[$ga-bind-category]").each(function(e,t){$(t).find("*[$ga-category]").each(function(e,i){$(i).attr("$ga-category").length||$(i).attr("$ga-category",$(t).attr("$ga-bind-category"))})})}},{key:"push",value:function(e){var t=arguments.length<=1||void 0===arguments[1]?!1:arguments[1];if(this.checkGALoaded()){if(!t)return void this._push(category,action,label);e.category=this._fillBinding(e.category,t),e.action=this._fillBinding(e.action,t),e.label=this._fillBinding(e.label,t),e.categoryPrefix=this._fillBinding(e.categoryPrefix),e.actionPrefix=this._fillBinding(e.actionPrefix),e.labelPrefix=this._fillBinding(e.labelPrefix),this._push(e)}}},{key:"_push",value:function(e){if(this.checkGALoaded()){if(!e.category)return void this.log("push event received but category is undefined",0);if(!e.category.length)return void this.log("push event received but category is of length 0",0);if(!e.action)return void this.log("push event received but action is undefined",0);if(!e.action.length)return void this.log("push event received but action is of length 0",0);if(!e.label)return void this.log("push event received but label is undefined",0);if(!e.label.length)return void this.log("push event received but label is of length 0",0);e.category=e.categoryPrefix?e.categoryPrefix+e.category:e.category,e.action=e.actionPrefix?e.actionPrefix+action:e.action,e.label=e.labelPrefix?e.labelPrefix+label:e.label,this.log("pushed event (category: '"+e.category+"', action: '"+e.action+"', label: '"+e.label+"')"),this.testMode||ga("send","event",e.category,e.action,e.label)}}},{key:"_click",value:function(e){var t=$(e.target),i=this._hasAttr($(t),"$ga-category"),a=this._hasAttr($(t),"$ga-label"),n=this._hasAttr($(t),"$ga-action"),o=this._hasAttr($(t),"$ga-category-prefix"),r=this._hasAttr($(t),"$ga-label-prefix"),l=this._hasAttr($(t),"$ga-action-prefix");i||(i=$(t).closest("*[$ga-category]")),a||(a=$(t).closest("*[$ga-label]",i)),n||(n=$(t).closest("*[$ga-action]",i)),o||(o=$(t).closest("*[$ga-category-prefix]")),r||(r=$(t).closest("*[$ga-label-prefix]")),l||(l=$(t).closest("*[$ga-action-prefix]")),a.length||(a=i),n.length||(n=i),o.length||(o=""),r.length||(r=""),l.length||(l=""),"object"==typeof a&&(a=$(a).attr("$ga-label")),"object"==typeof n&&(n=$(n).attr("$ga-action")),"object"==typeof i&&(i=$(i).attr("$ga-category")),"object"==typeof r&&(r=$(r).attr("$ga-label-prefix")),"object"==typeof l&&(l=$(l).attr("$ga-action-prefix")),"object"==typeof o&&(o=$(o).attr("$ga-category-prefix"));var c={label:a,action:n,category:i,labelPrefix:r,actionPrefix:l,categoryPrefix:o};this.push(c,t)}},{key:"_fillBinding",value:function(e,t){if(!e||"undefined"==typeof e||!e.length)return!1;for(var i in this.bindings)if(e.indexOf("{{"+this.bindings[i].keyword+"}}")>-1){var a=this.bindings[i]["function"].call(this,t);a?e=e.replace("{{"+this.bindings[i].keyword+"}}",a):this.log(e+" binding returned a string of length 0",0)}return e.indexOf("{{")>-1&&e.indexOf("}}")>-1&&this.log("unrecognized binding in "+e+", ignoring",2),e}},{key:"checkGALoaded",value:function(){return"function"==typeof ga?(this.enabled=!0,!0):(this.enabled=!1,this.log("push event received but ga has not been loaded",2),!1)}},{key:"log",value:function(e){var t=arguments.length<=1||void 0===arguments[1]?1:arguments[1];switch(t){case 0:t="WARNING";break;case 1:t="INFO";break;case 2:t="ERROR"}(this.verbose||2==t||0==t)&&console.log("gaw "+t+": "+e)}},{key:"_hasAttr",value:function(e,t){return t=$(e).attr(t),"undefined"!=typeof t&&t!==!1?t:!1}}]),e}();