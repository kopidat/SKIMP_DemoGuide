/*! Javascript UI Frameworks | Instance - 1.0.6 (6) */

(function(window, undefined) {

'use strict';

/* ----- UI ----- */
var

version = "1.0.6",

UI = {
	Constants: {
		NULL_FUNCTION: function() {},
		NULL_ELEMENT_FUNCTION: function() {
			return document.createElement("DIV");
		}	
	}
},

ScriptLoader = (function ScriptLoader() {
	var _head = document.getElementsByTagName("head")[0];
	var _baseElement = document.getElementsByTagName("base")[0];
	var _queue = [];
	var _queueing = false;
	
	if ( _baseElement ) {
		_head = baseElement.parentNode;
	}
	
	var _nextQueue = function() {
		
		var script = _queue.shift();
		
		if ( _baseElement ) {
			_head.insertBefore(script, _baseElement );
		}
		else {
			_head.appendChild(script);
		}
	};

	return {
		scriptPath: function( fileName ) {
			var elements = document.getElementsByTagName('script'),
				protocal = document.location.protocol,
				scriptPath = "",
				components;
			
			for (var i = 0; i < elements.length; i++) { 
				if (elements[i].src && elements[i].src.indexOf(fileName) != -1) { 
					scriptPath = elements[i].src.substring(0, elements[i].src.lastIndexOf('/') + 1); 
					break;
				}
			}
			
			scriptPath = scriptPath.replace(document.location.protocol + "//", '');
			components = scriptPath.split("/");
			
			if ( components.length > 0 && components[components.length-1] == "" ) {
				components.pop();
			}
			
			return protocal + "//" + components.join("/");
		},
	
		loadScript: function( path, rootPath, callback, useQueue ) {
			if ( arguments[0] != undefined && arguments[0].constructor === Array ) {
				var files = arguments[0];
				for ( var i in files ) {
					var file = files[i];
					this.loadScript( file, rootPath, callback, useQueue );
				}
				
				return files;
			}
			
			var src = ( rootPath !== "" ) ? ( rootPath + "/" + path ) : path;
			var loaded = false;
			var script = document.createElement("script");
			script.type = "text/javascript";
			script.src = src;
			script.charset = "utf-8";
			
		    if ( callback || useQueue ) {
				script.onreadystatechange = script.onload = function() {
					if ( loaded === false ) {
						if ( typeof callback === "function" ) {
							callback()
						}
					}
					
					loaded = true;
					
					if ( useQueue ) {
						
						if ( _queue.length == 0 ) {
							_queueing = false;
						}
						else {
							_nextQueue();
						}
					}
		        };
		    }
		    
		    if ( useQueue === true ) {
			    _queue.push( script );
			    
			    if ( _queueing === false ) {
				    _queueing = true;
				    _nextQueue();
			    }
		    }
			else {
				if ( _baseElement ) {
					_head.insertBefore(script, _baseElement );
				}
				else {
					_head.appendChild(script);
				}
			}
		},
		
		writeScript: function( path, rootPath ) {
			if ( arguments[0] != undefined && arguments[0].constructor === Array ) {
				var files = arguments[0];
				for ( var i in files ) {
					var file = files[i];
					this.writeScript( file, rootPath );
				}
				
				return files;
			}
			
			var src = ( rootPath !== "" ) ? ( rootPath + "/" + path ) : path;
			document.write( '<script type="text/javascript" src="' + src + '"></script>' );
		}
	};
	
})(),

Global = (function Global() {

	return {
		register: function( name, object, force ) {
			if ( window[name] !== undefined ) {
				debug.warn("Warning Glboal Extend: "+name+" is exists !!");
			}

			if ( window[name] === undefined || force === true ) {
				window[name] = object;
			}
		}
	};
})();

UI.register = function( name, object, force ) {
	if ( UI[name] !== undefined ) {
		debug.warn("Warning Extend: property ("+name+") of UI is exists !!");
	}

	if ( UI[name] === undefined || force === true ) {
		UI[name] = object;
	}
};

UI.register( "ScriptLoader", ScriptLoader );
UI.register( "Global", Global );
UI.Global.register( "UI", UI );

})(window);

(function(window, undefined) {

'use strict';
	
// debug 
window.debug_enabled = window.debug_enabled || false;


var 
/* ----- Debug ----- */

Debug = function() {
	
	var _microtime = function( get_as_float ) {
		var now = new Date().getTime() / 1000;
		var s = parseInt(now, 10); 
		return (get_as_float) ? now : (Math.round((now - s) * 1000) / 1000);
	};

	// Debugging 내용 출력 허용 여부
	// 전역 변수로 DebugEnabled 값을 true 로 하고 실행하면 출력 허용됨
	Debug.enabled = ( window['debug_enabled'] === true ) ? true : false;
	Debug.currentTime = _microtime(true);
	
	var _methods = ["log", "info", "warn", "error"];
	var _methodsPatch = function( handler, context ) {
		if (typeof handler != "function") {
			return;
		}
		
		for( var i in _methods ) {
			var method = _methods[i];
			handler.call( context, method );
		}
	};
	
	// IE bug Fixed
	if ( Function.prototype.bind && window.console != undefined && typeof window.console.log == "object" ) {
		_methodsPatch( function( method ) {
			if ( window.console[method] == undefined ) {
				window.console[method] = this.bind( window.console[method], window.console );
			}
		}, Function.prototype.call );
		
		return window.console;
	}
	
	_methods.push( "resetTime", "elapsedTime", "captureTrace", "message" );
	
	var _constructor = {
		filter:[],
		
		_execute: function( method, args ) {
			if ( method != "message" && method != "error" && ! Debug.enabled ) {
				return;
			}
			
			// force message
			if ( method == "message" ) {
				method = "log";
			}
			
			var params = Array.prototype.slice.call( args, 0 );
			
			if ( Function.prototype.bind && window.console != undefined ) {
			
				switch ( method ) {
					case "resetTime":
						Debug.currentTime = _microtime(true);
					break;
					
					case "captureTrace":
						var stack = "";
				
						try {
							var trace = {};
							
							if ( typeof Error.captureStackTrace == "function" ) {
								Error.captureStackTrace(trace, this ); // for Crome
							}
							else {
								var error = new Error();
								trace.stack = error.stack; // Firefox
							}
							
							var stack = trace.stack.split(/\n/);
							stack.shift();
							stack.shift();
							stack.shift();
							stack.shift();
							
							stack = stack[0];
						}
						catch(e) {
							console.log( e );
							stack = "";
						}
						
						window.console.log( stack );
					break;
	
					case "elapsedTime":
						params.push( method );
						params.push( (_microtime(true) - Debug.currentTime).toFixed(3) );
			
						var func = Function.prototype.bind.call( window.console["log"], window.console );
						func.apply( window.console, params );
					break;
	
					default:
						if ( _constructor.filter && _constructor.filter.length > 0 ) {
							if ( ! in_array( _constructor.filter, params[0] ) ) {
								break;
							}
						}
						
						var func = Function.prototype.bind.call( window.console[method], window.console );
						func.apply( window.console, params );
					break;
				}
			}
		}
	};
	
	_methodsPatch( function( method ) {
		if ( typeof _constructor["_execute"] == "function" ) {
			_constructor[method] = function( message ){ 
				_constructor._execute( method, arguments ); 
			};
		}
		
	}, _constructor );
	
	return _constructor;
};

Debug.type = function( type ) {
	var filter = ( window.debug ) ? window.debug.filter : [];

	window.debug = ( type == "console" ) ? window.console : new Debug();
	window.debug.filter = filter;
};

Debug.__ClassCreateLog = false;
	
Debug.filter = function( filter ) {
	window.debug.filter = arguments;
};

Debug.type( "debug" ); //( window.console ? "console" : 

UI.register("Debug", Debug);

})(window);
(function( window, undefined) {

'use strict';

var 
/* ----- Helper ----- */

Helper = function Helper( name, target, global ) {
	
	var options = ( typeof target == "function" ) ? target.call(target) : ( target || {} );
	var helper = ( window[name] === undefined ) ? (new Function( "return function "+name+"() {}"))() : window[name];

	Helper.register(helper, options);

	if ( global ) {
		for ( var key in global ) {
			var funcName = global[key];
			window[funcName] = window[funcName] || options[key];
		}
	}

	helper.toPrototype = function() {
		var fn = window[name].prototype;

		for ( var funcName in options ) {
			var camelName = funcName.replace(/[_|-](.)/g, function(_, c) {
				return c.toUpperCase();
			});

			if ( fn[camelName] == undefined ) {
				if ( camelName.charAt(0) !== "_" ) {
					fn[camelName] = function() {
						var args = Array.prototype.slice.call( arguments, 0 );
						args.unshift(this);

						return options[funcName].apply( helper, args );
					}
				}
			}
		}
	};

	Helper[name] = helper;
	
	return helper;
};

Helper.register = function(context, options, override ) {
	context = ( context == undefined ) ? {} : context;
	for ( var prop in options ) {
		// camelize
		var camelName = prop.replace(/[_|-](.)/g, function(_, c) {
			return c.toUpperCase();
		});

		if ( !!override || context[camelName] == undefined ) {
			if ( camelName.charAt(0) !== "_" ) {
				context[camelName] = options[prop];
			}
		}
	}
	
	return context;
};

// Object Helper
Helper( "Object", {
	is_object: function( object ) {
		return ( Object.prototype.toString.call( object ) === '[object Object]' );
	},
	
	is_equal: function( object, target, depth, strict ) {
		var bool = true;
	
		if  ( depth === true && typeof object == "object" && typeof object == "object") {
			for ( var key in object ) {
				if ( object[key] !== target[key] ) {
					bool = false;
					break;
				}
			}
		}
		else {
			bool = strict === true ? ( object === target ) : ( object == target );
		}
	
		return bool;
	},
	
	is_plain_object: function( object ) {
		if ( typeof object !== "object" || object.nodeType || object === window ) {
			return false;
		}

		try {
			if ( object.constructor && ! Object.prototype.hasOwnProperty.call( object.constructor.prototype, "isPrototypeOf" ) ) {
				return false;
			}
		} catch ( e ) {
			return false;
		}

		return true;
	},
	
	copy: function( object ) {
		var copyObj = {};
		Helper.Object.merge( copyObj, object, true );
		return copyObj;
	},
	
	extend: function( object, target ) {
		object = object || {};
	
		for (var key in target ) {
			var value = target[key];
			
			if ( typeof value == "object" ) {
				object[key] = Helper.Object.extend( object[key], value );
			}
			else {
				object[key] = value;
			}
		}
		
		return object;
	},
	
	clone: function( object ) {
		return Helper.Object.merge( {}, object, true );
	},
	
	merge: function( object, target, override ) {
		if ( override == true ) {
			object = object || {};
		
			for ( var key in target ) {
				var type = typeof target[key];
					
				if ( type == "object" ) {
					object[key] = Helper.Object.merge( object[key], target[key], override );
				}
				else {
					object[key] = target[key];
				}
			}
		}
		else {
			for ( var key in target ) {
				if ( object[key] != undefined ) {
					
					var type = typeof target[key];
					
					if ( type == "object" ) {
						object[key] = Helper.Object.merge( object[key], target[key], override );
					}
					else if ( type == "number" ) {
						if ( (''+object[key]).indexOf('.') !== -1 ) {
							object[key] = parseFloat(target[key]) || 0;
						}
						else {
							object[key] = parseInt(target[key]) || 0;
						}
					}
					else { // string
						object[key] = target[key];
					}
				}
			}
		}
		
		return object;
	}
});

// Array Helper
Helper( "Array", {
	is_array: function( array ) {
		return ( Object.prototype.toString.call( array ) === '[object Array]' );
	},
	
	in_array: function( array, needle, strict ) {
		for ( var key in array) {
			if ( Helper.Object.isEqual( array[key], needle, true, strict ) ) {
				return true;
			}
		}

		return false;
	},

	index_by_object: function( array, object ) {
		
		if ( ! Helper.Array.isArray(array) ) {
			return -1;
		}
		
		var index = -1;
		
		for (var i = 0; i < array.length; i++) {
			if (i in array) {
				if ( array[i] === object ) {
					index = i;
					break;
				}
			}
		}
		
		return index;
	},

	add: function( array, object ) {
		
		if ( ! Helper.Array.isArray(array) ) {
			array = new Array();
		}
		
		if ( object != null ) {
			array.push.call( array, object );
		}
		
		return array;
	},
	
	remove_at_index: function( array, index ) {
		
		if ( index < 0 || index > array.length - 1  ) {
			return array;
		}
	
		var rest = array.slice( index+1 || array.length );
		array.length = index;
		array.push.apply( array, rest );
		
		return array;
	},

	remove: function( array, object ) {
		if ( object == null || array.length == 0 ) {
			return -1;
		}

		var index = -1;
		for ( var i=0; i<array.length; i++ ) {
			if ( Helper.Object.isEqual( array[i], object, true ) ) {
				index = i;
				break;
			}
		}
		
		if ( index === -1 ) {
			return array;
		}
		
		return Helper.Array.removeAtIndex( array, index );
	},
	
	copy: function( array ) {
		return Array.prototype.slice.call(array, 0);
	},
	
	sort: function( array, handler, thisArg ) {
		if (typeof handler != "function") {
			return ;
		}
		
		var length = array && typeof array["length"] != undefined ? array.length : 0;
		var isBreak = false;
		
		for (var i=0; i<length; i++) {
			for (var j=0; j<length-1; j++) {
			
				var sortType = handler.call( thisArg, array[j], array[j+1] );
				
				if ( sortType === "ASC" ) {
					var tmp = array[j+1];
					array[j+1] = array[j];
					array[j] = tmp;
				}
				else if ( sortType === "DESC" ) {
					var tmp = array[j];
					array[j] = array[j+1];
					array[j+1] = tmp;
				}
				else if ( sortType === false ) {
					isBreak = true;
					break;
				}
			}
			
			if ( isBreak == true ) {
				break;
			}
		}
	},

	each: function( array, handler, thisArg ) {
		if (typeof handler != "function") {
			return ;
		}
		
		var length = array && typeof array["length"] != undefined ? array.length : 0;

		for (var i = 0; i < length; i++) {
			if (i in array) {
				if ( handler.call( thisArg, i, array[i] ) === false ) {
					break;
				}
			}
		}
	}
});

// Number Helper
Helper( "Number", {
	parse_int: function( number ) {
		var str = String(number).replace(/[,]/gi, '');
		var i = parseInt(str, 10);
		if ( isNaN( i ) ) {
			i = 0;
		}
		
		return i;
	},
	
	format: function( number ) {
		var str = String(number); 
		var reg = /(\-?\d+)(\d{3})($|\.\d+)/;
		
		if ( reg.test(str) ) {
			return str.replace(reg, function(str, p1, p2, p3) { return Hepler.Number.numberFormat(p1) + "," + p2 + "" + p3; } );
		}
		
		return str;
	},
	
	pad: function( number, totalDigits ) {
		var padding = "00000000000000";
		var rounding = 1.000000000001;
		var currentDigits = number > 0 ? 1 + Math.floor(rounding * (Math.log(number) / Math.LN10)) : 1;
		return (padding + number).substr(padding.length - (totalDigits - currentDigits));
	}
}, 
{
	'format': 'number_format',
	'pad': 'number_pad'
});

// XML Helper
Helper( "XML", {
	to_JSON: function( xml ) {
		// Create the return object
		var obj = {};
	
		if (xml.nodeType == 1) { // element
			// do attributes
			
			if (xml.attributes.length > 0) {
				obj["@attributes"] = {};
				
				for (var j = 0; j < xml.attributes.length; j++) {
					var attribute = xml.attributes.item(j);
					obj["@attributes"][attribute.nodeName] = attribute.value;
				}
			}
		}
		else if (xml.nodeType == 3 || xml.nodeType == 4 ) { // text or cdata-section
			return xml.nodeValue;
		}
		else if ( xml.nodeType == 8  ) { // comment
			return obj;		
		}
		else if ( xml.nodeType == 9 ) { // document
			
		}
	
		// do children
		if ( xml.hasChildNodes() ) {
			var onlyHashName = true;
			
			for(var i = 0; i < xml.childNodes.length; i++) {
				var item = xml.childNodes.item(i);
				
				if ( item.nodeType == 8 ) {
					//console.log( item );
					continue;
				}
				
				var nodeName = item.nodeName;
				var nodeValue = Helper.XML.toJSON(item);
				nodeValue = (typeof nodeValue == "string") ? trim(nodeValue) : nodeValue;
				
				var isHashName = nodeName.indexOf("#") !== -1;
				
				if ( ! isHashName ) {
					onlyHashName = false;
				}
				
				if ( typeof nodeValue !== "string" || trim(nodeValue) !== "" ) {
					if (obj[nodeName] === undefined) {
						obj[nodeName] = nodeValue;
					} 
					else {
					
						if (typeof(obj[nodeName].push) == "undefined") { // no array
							var old = obj[nodeName];
							obj[nodeName] = [];
							obj[nodeName].push(old);
						}
						
						obj[nodeName].push( nodeValue );
					}
				}
			}
		
			if ( onlyHashName === true ) {
				var returnString = "";
				
				for ( var nodeName in obj ) {
					if ( nodeName.indexOf("#") !== -1 ) {
						returnString += obj[nodeName];
					}
				}
				
				return returnString;
			}
		}
		
		return obj;
	}
});

// String Helper
Helper( "String", {
	guid: function( string ) {
		var format = ( string == undefined || typeof string !== "string" ) ? "xxxx-xxxx-xxxx-xxxx" : string;
		
		return format.replace( /[xy]/g, function(c) {
			var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		});
	},
	
	trim: window.trim || function( string ) {
		return string == null ? "" : ( string + "" ).replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	},
	
	lcfirst: function( string ) {
		string += '';
		var firstChar = string.charAt(0).toLowerCase();
		return firstChar + string.substr(1);
	},

	ucfirst: function (string) {
		string += '';
		var firstChar = string.charAt(0).toUpperCase();
		return firstChar + string.substr(1);
	},

	camelize: function(string) {
		return string.replace(/[_|-](.)/g, function(_, c) {
			return c.toUpperCase();
		});
	},

	/* 바-카멜 */
	decamelize: function(string) {
		return string.replace(/([a-z])([A-Z])/g,'$1-$2').toLowerCase();
	}
},{
	'trim': 'trim',
	'ucfirst': 'ucfirst'
});

// Cookie Helper
Helper( "Cookie", {
	set: function( cookieName, value, expireTime, path, domain, secure ) {
	
		expireTime = expireTime || 60*60*24*30*3;
	
		var expireDate = new Date();
		expireDate.setTime( expireDate.getTime() + expireTime );
		
		var cookieValue = escape( value ) + (( expireTime == undefined ) ? "" : "; expires=" + expireDate.toUTCString());
		
		if ( path ) {
			cookieValue += "; path=" + escape( path );
		}
		
		if ( domain ) {
			cookieValue += "; domain=" + escape( domain );
		}
		
		if ( secure ) {
			cookieValue += "; secure";
		}
		
		document.cookie = cookieName + "=" + cookieValue;
	},
	
	get: function( cookieName ) {
		var cookieValue = document.cookie;
		var start = cookieValue.indexOf(" " + cookieName + "=");
		
		if (start == -1) { 
			start = cookieValue.indexOf(cookieName + "=");
		}
		
		if (start == -1) { 
			cookieValue = null;	
		}
		else {
			start = cookieValue.indexOf("=", start) + 1;
			var end = cookieValue.indexOf(";", start);
			if (end == -1) {
				end = cookieValue.length;
			}
			
			cookieValue = unescape(cookieValue.substring(start, end));
		}
		
		return cookieValue;
	}
}, 
{
	"set":"set_cookie",
	"get":"get_cookie"
});

// Date Helper

/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

var dateFormat = function () {
	var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
		timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
		timezoneClip = /[^-+\dA-Z]/g,
		pad = function (val, len) {
			val = String(val);
			len = len || 2;
			while (val.length < len) val = "0" + val;
			return val;
		};

	// Regexes and supporting functions are cached through closure
	return function (date, mask, utc) {
		var dF = dateFormat;

		// You can't provide utc if you skip other args (use the "UTC:" mask prefix)
		if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
			mask = date;
			date = undefined;
		}

		// Passing date through Date applies Date.parse, if necessary
		date = date ? new Date(date) : new Date;
		if (isNaN(date)) throw SyntaxError("invalid date");

		mask = String(dF.masks[mask] || mask || dF.masks["default"]);

		// Allow setting the utc argument via the mask
		if (mask.slice(0, 4) == "UTC:") {
			mask = mask.slice(4);
			utc = true;
		}

		var	_ = utc ? "getUTC" : "get",
			d = date[_ + "Date"](),
			D = date[_ + "Day"](),
			m = date[_ + "Month"](),
			y = date[_ + "FullYear"](),
			H = date[_ + "Hours"](),
			M = date[_ + "Minutes"](),
			s = date[_ + "Seconds"](),
			L = date[_ + "Milliseconds"](),
			o = utc ? 0 : date.getTimezoneOffset(),
			flags = {
				d:    d,
				dd:   pad(d),
				ddd:  dF.i18n.dayNames[D],
				dddd: dF.i18n.dayNames[D + 7],
				m:    m + 1,
				mm:   pad(m + 1),
				mmm:  dF.i18n.monthNames[m],
				mmmm: dF.i18n.monthNames[m + 12],
				yy:   String(y).slice(2),
				yyyy: y,
				h:    H % 12 || 12,
				hh:   pad(H % 12 || 12),
				H:    H,
				HH:   pad(H),
				M:    M,
				MM:   pad(M),
				s:    s,
				ss:   pad(s),
				l:    pad(L, 3),
				L:    pad(L > 99 ? Math.round(L / 10) : L),
				t:    H < 12 ? "a"  : "p",
				tt:   H < 12 ? "am" : "pm",
				T:    H < 12 ? "A"  : "P",
				TT:   H < 12 ? "AM" : "PM",
				Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
				o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
				S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
			};

		return mask.replace(token, function ($0) {
			return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
		});
	};
}();

// Some common format strings
dateFormat.masks = {
	"default":      "ddd mmm dd yyyy HH:MM:ss",
	shortDate:      "m/d/yy",
	mediumDate:     "mmm d, yyyy",
	longDate:       "mmmm d, yyyy",
	fullDate:       "dddd, mmmm d, yyyy",
	shortTime:      "h:MM TT",
	mediumTime:     "h:MM:ss TT",
	longTime:       "h:MM:ss TT Z",
	isoDate:        "yyyy-mm-dd",
	isoTime:        "HH:MM:ss",
	isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
	isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
	dayNames: [
		"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
		"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
	],
	monthNames: [
		"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
		"January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
	]
};

Helper( "Date", {
	format: function( date, mask, utc ) {
		return dateFormat(date, mask, utc);
	}
});

UI.register("Helper", Helper);
	
})(window);

(function(window, undefined) {

'use strict';

var 
/* ----- Core ----- */

Debug = UI.Debug,

Core = function(/* */) {
	return {};
};

Core.prototype = {
	__construct: function() {},	// 생성시 실행 함수
	__destruct: function() {},	// 파괴시 실행 함수
	
	destroy: function() {	// 파괴자 함수
		this.__destruct.apply( this, arguments );
	},
	
	// TODO :
	toString: function() {
		if ( this["__name"] ) {
			return this.__name;
		}
		
		return "{" + "" + "}";	
	},
	
	__parent: Object,
	__class: Core,
	__ancestor: Core,
	constructor: Core
};

window.GLOBAL_VALUE = 1;

var 
/* ----- Class ----- */

Class = function( options ) {
	if ( typeof options == 'function' ) { // 익명함수를 Class 화 함, 관리하는 방법은 추후 구현
		options = {
			name:"__CLASS__",
			parent: IObject,
			constructor: options
		};
	}

	var _instance, _class, _parent, _constructor, _caller;
	var className = ( typeof options.name == "string" ) ? options.name.replace(/[^a-z_]/gi, '') : "__CLASS__";  
		
	//_class = function __CLASS__() { _instance = this; return _nativeCode.apply( _instance, arguments ); };
	_class = eval('function '+className+'() { _instance = this; return _nativeCode.apply( _nativeCode, arguments ); };'+className );
	//_class = new Type(className, function() { _instance = this; return _nativeCode.apply( _instance, arguments ); });
	
	_parent = ( typeof options.parent == "function" ) ? 
		// is Function
		function( parent ) {
			if ( Debug.__ClassCreateLog ) {
				debug.log( "Class create [", className, "] from [", parent.__name, "]" );
			}
			return parent;
		}( options.parent ) : 
		
		// is String
		function( parentName ) { 
			if ( Debug.__ClassCreateLog ) {
				debug.log( "Class create [", className, "] from [", parentName, "]" );
			}
			
			var parent = ( typeof window[parentName] == "function" && window[parentName].prototype.__ancestor === Core ) ? 
						window[parentName] : 
						( ( typeof Class[parentName] == "function" && Class[parentName].prototype.__ancestor === Core ) ? 
						Class[parentName] : Core );
			
			return parent;
			
		}( ( typeof options.parent == "string" ) ? options.parent : "Core" );

	_constructor = ( options.constructor == undefined ) ? function() {} : options.constructor;
	
	
	// Prototype
	_class.prototype.include = _class.include = Class.include;
	_class.prototype.extend = _class.extend = Class.extend;
	_class.include( _parent.prototype );
	
	_class.prototype.__class = _class;
	_class.prototype.__parent = _parent;
	_class.prototype.__ancestor = _parent.prototype.__ancestor;
	_class.prototype.constructor = _class;
	
	_class.extend( _parent, _class );
	
	_class.prototype.__name = className;
	
	var _nativeCode = function() {
	
		//console.log( "arguments", className, arguments );
		
		var parent = _parent.apply( _instance, arguments );
		var constructor = ((typeof _constructor == "function") ? _constructor.apply( _instance, arguments ) : _constructor);
		
		var _superClass = function __SUPER__() {
			return {};
		};
		
		var _super = new _superClass();
		
		for ( var name in parent ) {
			_super[name] = parent[name];
		}
		
		if ( typeof _instance.extend == "function" ) {
			_instance.extend( parent );
			_instance.extend( constructor );
		}
		
		_instance._super = function( method, args ) {
			if ( arguments.length === 0 ) {
				return _super;
			}
		
			if ( typeof _super[method] === "function" ) {
				return _super[method].apply( _super, args );
			}
			else {
				console.error( "parent is not has method(" + method + ")" );
			}
		};
		
		if ( ( this.constructor == Core || _instance.constructor == _class ) && typeof _instance.__construct == "function" ) {      
			_instance.__construct.apply( _instance, arguments );
		}
		
		return _instance;
	};

	Class.register( className, _class, options.force === true );
	
	if ( options["static"] != undefined ) {
		options["staticConstructor"] = options["static"];
	}
	
	if ( options["staticConstructor"] != undefined ) {
		var _staticInstance = ( typeof options.staticConstructor == "function" ) ? options.staticConstructor.apply(_class) : options.staticConstructor;
		
		Class.extend( _staticInstance, _class );
	}
	
	return _class;
};

Class.isClass = Core.isClass = function( constructor ) {
	if ( typeof constructor != "function" ) {
		return false;
	}
	
	if ( typeof constructor.prototype["__ancestor"] == undefined ) {
		return false;
	}
	
	return  ( constructor.prototype.__ancestor === Core );
};

Class.register = function( name, object, force ) {
	if ( Class[name] !== undefined ) {
		debug.warn("Warning Extend: property ("+name+") of Class is exists !!");
	}

	if ( Class[name] === undefined || force === true ) {
		Class[name] = object;
	}
};

Class.extend = function( prop, context, ignoreOverride, hidden ) { // 확장 함수
	context = ( context == undefined ) ? this : context;

	for ( var name in prop ) {
		if ( ! ignoreOverride || context[name] == undefined ) {
			if ( ! hidden || name.substr(0,1) !== "_" ) {
				context[name] = prop[name];
			}
		}
	}
};
	
Class.include = function( prop, context ) { // Prototype 확장 함수
	context = ( context == undefined ) ? this : context;
	
	var prototype = context.prototype;
	for ( var name in prop ) {
		prototype[name] = prop[name];
	}
};

UI.register( "Class", Class );

})(window);

(function( window, undefined) {

'use strict';
	
var 
/* ----- Data ----- */
Class = UI.Class,
Core = Class.Core,
IObject = Class.IObject,
Helper = UI.Helper,

UserDefaults = Class({
	name: "UserDefaults",
	parent: Class.IObject,
	constructor: function() {
		
		var _defaultKey;
		var _data = {};
		var _localStorage = window.localStorage;
		
		return {
			__construct: function( defaultKey ) {
				_defaultKey = defaultKey;
			
				var data = _localStorage.getItem( _defaultKey );
				
				_data = ( data && typeof data == "string" ) ? JSON.parse(data) : {};
				
				return this;
			},
			
			data: function() {
				return _data;	
			},
			
			get: function( key ) {
				if ( _data[key] == undefined ) {
					return undefined;
				};
				
				return _data[key];
			},
			
			set: function( key, value ) {
				_data[key] = value;
			},
			
			remove: function( key ) {
				_data[key] = undefined;
				delete _data[key];	
			},
			
			clear: function() {
				_data = {};	
			},
		
			keys: function() {
				var keys = [];
				for ( var key in _data ) {
					keys.push(key);
				}
			
				return keys;
			},
			
			synchronize: function() {
				var data = JSON.stringify( _data );
				
				_localStorage.setItem( _defaultKey, data )
			}
		};
	},
	'static': function() {
		// TODO : 다시 데이타를 복구 하는 부분 체크
		
		var _defaults = {};
		
		return {
			standardUserDefaults: function() {
				return UI.UserDefaults.userDefaultsWithKey( "__UIKIT_USER_DEFAULT__" );
			},
			
			userDefaultsWithKey: function(key) {
				if ( _defaults[key] != undefined ) {
					return _defaults[key];
				};
				
				_defaults[key] = new Class.UserDefaults(key);
				
				return _defaults[key];
			},
			
			resetStandardUserDefaults: function() {
				_standardUserDefaults.destroy();
				_standardUserDefaults = undefined;
				
				_standardUserDefaults = new Class.UserDefaults();
			}
		};
	}
}),

LocalStorage = Class({
	name: "LocalStorage",
	parent: IObject,
	constructor: function() {
	
		var localStorage = window.localStorage;
		
		return {
			init: function() {
				return this;
			},
			
			get: function( key ) {
				return localStorage.getItem( key );
			},
			
			set: function( key, value ) {
				localStorage.setItem( key, value );
			},
			
			remove: function( key ) {
				localStorage.removeItem( key );
			},
			
			clear: function() {
				localStorage.clear();
			},
			
			data: function() {
				return localStorage;
			},
		
			keys: function() {
				var keys = [];
				
				for ( var key in localStorage ) {
				
					if ( key != "length" ) {
						keys.push(key);
					}
				}
			
				return keys;
			},
		};
	},
	'static': function() {
		// TODO : 다시 데이타를 복구 하는 부분 체크
		
		var _sharedInstance = new Class.LocalStorage();
		
		return {
			sharedInstance: function() {
				return _sharedInstance;
			}
		};
	}
}),

DataMap = Class({
	name: "DataMap",
	parent: Core,
	constructor: function() {

		var _keys = [],
			_data = {};

		return {
			data: function( data ) {
				if ( arguments.length == 0 ) {
					return _data;
				};
				
				_data = data;
			},
		
			get: function( key ) {
				return _data[key];
			},
			
			put: function( key, value ) {
				if ( _data[key] == undefined ) {
					_keys.push(key);
				}
				
				_data[key] = value;
			},
			
			remove: function( key ) {
				_data[key] = undefined;
				delete _data[key];
				Array.remove( _keys, key );	
			},
			
			each: function( fn ) {
				if ( typeof fn != 'function' ) {
					return;
				}
				
				for ( var i=0, length=_keys.length; i<length; i ++ ) {
					var key = _keys[i];
					var value = _data[key];
					fn.call( this, key, value, i );
				}
			},
			
			// TODO: 함수명 리펙토링
			entrys: function() {
				var length = _keys.length;
			    var entrys = new Array(length);
			    for (var i = 0; i < length; i++) {
			        entrys[i] = {
			            key : _keys[i],
			            value : _data[i]
			        };
			    }
			    return entrys;
			},
			
			isEmpty: function() {
				return _keys.length == 0;
			},
			
			size: function() {
				return _keys.length;
			}
		};
	}
});

UI.register("UserDefaults", UserDefaults);
UI.register("LocalStorage", LocalStorage);
UI.register("DataMap", DataMap);
	
})(window);

(function(window, undefined) {

'use strict';
	
var 
/* ----- Dimention ----- */

UIPoint = function( x, y ) { 
	var _x = ( x == undefined || isNaN(parseFloat(x)) ) ? 0 : parseFloat( x );
	var _y = ( y == undefined || isNaN(parseFloat(y)) ) ? 0 : parseFloat( y );
	
	var point = { x:_x, y:_y }; 
	point.toString = function() {
		return JSON.stringify( rect );
	};
	
	return point;
},

UISize = function( width, height ) { 
	var _width = ( width == undefined || isNaN(parseFloat(width)) ) ? 0 : parseFloat(width);
	var _height = ( height == undefined || isNaN(parseFloat(height)) ) ? 0 : parseFloat(height);
	
	var size = { width:_width, height:_height };
	size.toString = function() {
		return JSON.stringify( rect );
	};
	
	return size;
},

UIRect = function( x, y, width, height ) {
	if ( arguments.length == 1 ) {
		var rect = x;
		
		return new UIRect( rect.origin.x, rect.origin.y, rect.size.width, rect.size.height );	
	}

	var _x = ( x == undefined || isNaN(parseFloat(x)) ) ? 0 : parseFloat( x );
	var _y = ( y == undefined || isNaN(parseFloat(y)) ) ? 0 : parseFloat( y );
	var _width = ( width == undefined || isNaN(parseFloat(width)) ) ? 0 : parseFloat(width);
	var _height = ( height == undefined || isNaN(parseFloat(height)) ) ? 0 : parseFloat(height);
	
	var rect = { origin:new UIPoint(_x, _y), size:new UISize(_width, _height) };
	rect.toString = function() {
		return JSON.stringify( rect );
	};
	
	return rect;
},

UIEdgeInsets = function( top, right, bottom, left ) {
	var _top = ( top == undefined || isNaN(parseFloat(top)) ) ? 0 : parseFloat( top );
	var _right = ( right == undefined || isNaN(parseFloat(right)) ) ? 0 : parseFloat( right );
	var _bottom = ( bottom == undefined || isNaN(parseFloat(bottom)) ) ? 0 : parseFloat( bottom );
	var _left = ( left == undefined || isNaN(parseFloat(left)) ) ? 0 : parseFloat( left );
	
	var edgeInsets = { 
		top: _top, 
		right: _right, 
		bottom: _bottom, 
		left: _left 
	};
	edgeInsets.toString = function() {
		return JSON.stringify( rect );
	};
	
	return edgeInsets;
};

var 

UIPointFromElement = function( element ) {

	var win, docElem, position, box = { top: 0, left: 0 }, offset = { top: 0, left: 0 };
	
	if ( ! document.documentElement.contains( element ) ) {
		return new UIPoint( offset.left, offset.top );
	}
	
	var style = element.ownerDocument.defaultView.getComputedStyle( element, null );
	
	position = style.position;
	box = ( ! ( position === "fixed" || position === "absolute" ) && element.getBoundingClientRect !== undefined ) ? element.getBoundingClientRect() : { top: element.offsetTop, left: element.offsetLeft };
	
	var docElem = document.documentElement;
	var win = element !== window ? window : ( element.nodeType === 9 ? element.defaultView || element.parentWindow : undefined );
	var windowOffset = {
		top: ( win.pageYOffset || docElem.scrollTop ),
		left: ( win.pageXOffset || docElem.scrollLeft )
	};
	var clientOffset = {
		top: ( docElem.clientTop  || 0 ),
		left: ( docElem.clientLeft || 0 )
	};
	
	offset = {
		top: box.top + windowOffset.top - clientOffset.top,
		left: box.left + windowOffset.left - clientOffset.left
	};
	
	return new UIPoint( offset.left, offset.top );
};

UIPoint.fromElement = UIPointFromElement;

UI.register("UIPoint", UIPoint);
UI.register("UISize", UISize);
UI.register("UIRect", UIRect);
UI.register("UIEdgeInsets", UIEdgeInsets);
	
})(window);

(function(window, undefined) {

'use strict';

var 
RGBColor = function RGBColor(color_string) {
    this.ok = false;

    // strip any leading #
    if (color_string.charAt(0) == '#') { // remove # if any
        color_string = color_string.substr(1,6);
    }

    color_string = color_string.replace(/ /g,'');
    color_string = color_string.toLowerCase();

    // before getting into regexps, try simple matches
    // and overwrite the input
    var simple_colors = {
        aliceblue: 'f0f8ff',
        antiquewhite: 'faebd7',
        aqua: '00ffff',
        aquamarine: '7fffd4',
        azure: 'f0ffff',
        beige: 'f5f5dc',
        bisque: 'ffe4c4',
        black: '000000',
        blanchedalmond: 'ffebcd',
        blue: '0000ff',
        blueviolet: '8a2be2',
        brown: 'a52a2a',
        burlywood: 'deb887',
        cadetblue: '5f9ea0',
        chartreuse: '7fff00',
        chocolate: 'd2691e',
        coral: 'ff7f50',
        cornflowerblue: '6495ed',
        cornsilk: 'fff8dc',
        crimson: 'dc143c',
        cyan: '00ffff',
        darkblue: '00008b',
        darkcyan: '008b8b',
        darkgoldenrod: 'b8860b',
        darkgray: 'a9a9a9',
        darkgreen: '006400',
        darkkhaki: 'bdb76b',
        darkmagenta: '8b008b',
        darkolivegreen: '556b2f',
        darkorange: 'ff8c00',
        darkorchid: '9932cc',
        darkred: '8b0000',
        darksalmon: 'e9967a',
        darkseagreen: '8fbc8f',
        darkslateblue: '483d8b',
        darkslategray: '2f4f4f',
        darkturquoise: '00ced1',
        darkviolet: '9400d3',
        deeppink: 'ff1493',
        deepskyblue: '00bfff',
        dimgray: '696969',
        dodgerblue: '1e90ff',
        feldspar: 'd19275',
        firebrick: 'b22222',
        floralwhite: 'fffaf0',
        forestgreen: '228b22',
        fuchsia: 'ff00ff',
        gainsboro: 'dcdcdc',
        ghostwhite: 'f8f8ff',
        gold: 'ffd700',
        goldenrod: 'daa520',
        gray: '808080',
        green: '008000',
        greenyellow: 'adff2f',
        honeydew: 'f0fff0',
        hotpink: 'ff69b4',
        indianred : 'cd5c5c',
        indigo : '4b0082',
        ivory: 'fffff0',
        khaki: 'f0e68c',
        lavender: 'e6e6fa',
        lavenderblush: 'fff0f5',
        lawngreen: '7cfc00',
        lemonchiffon: 'fffacd',
        lightblue: 'add8e6',
        lightcoral: 'f08080',
        lightcyan: 'e0ffff',
        lightgoldenrodyellow: 'fafad2',
        lightgrey: 'd3d3d3',
        lightgreen: '90ee90',
        lightpink: 'ffb6c1',
        lightsalmon: 'ffa07a',
        lightseagreen: '20b2aa',
        lightskyblue: '87cefa',
        lightslateblue: '8470ff',
        lightslategray: '778899',
        lightsteelblue: 'b0c4de',
        lightyellow: 'ffffe0',
        lime: '00ff00',
        limegreen: '32cd32',
        linen: 'faf0e6',
        magenta: 'ff00ff',
        maroon: '800000',
        mediumaquamarine: '66cdaa',
        mediumblue: '0000cd',
        mediumorchid: 'ba55d3',
        mediumpurple: '9370d8',
        mediumseagreen: '3cb371',
        mediumslateblue: '7b68ee',
        mediumspringgreen: '00fa9a',
        mediumturquoise: '48d1cc',
        mediumvioletred: 'c71585',
        midnightblue: '191970',
        mintcream: 'f5fffa',
        mistyrose: 'ffe4e1',
        moccasin: 'ffe4b5',
        navajowhite: 'ffdead',
        navy: '000080',
        oldlace: 'fdf5e6',
        olive: '808000',
        olivedrab: '6b8e23',
        orange: 'ffa500',
        orangered: 'ff4500',
        orchid: 'da70d6',
        palegoldenrod: 'eee8aa',
        palegreen: '98fb98',
        paleturquoise: 'afeeee',
        palevioletred: 'd87093',
        papayawhip: 'ffefd5',
        peachpuff: 'ffdab9',
        peru: 'cd853f',
        pink: 'ffc0cb',
        plum: 'dda0dd',
        powderblue: 'b0e0e6',
        purple: '800080',
        red: 'ff0000',
        rosybrown: 'bc8f8f',
        royalblue: '4169e1',
        saddlebrown: '8b4513',
        salmon: 'fa8072',
        sandybrown: 'f4a460',
        seagreen: '2e8b57',
        seashell: 'fff5ee',
        sienna: 'a0522d',
        silver: 'c0c0c0',
        skyblue: '87ceeb',
        slateblue: '6a5acd',
        slategray: '708090',
        snow: 'fffafa',
        springgreen: '00ff7f',
        steelblue: '4682b4',
        tan: 'd2b48c',
        teal: '008080',
        thistle: 'd8bfd8',
        tomato: 'ff6347',
        turquoise: '40e0d0',
        violet: 'ee82ee',
        violetred: 'd02090',
        wheat: 'f5deb3',
        white: 'ffffff',
        whitesmoke: 'f5f5f5',
        yellow: 'ffff00',
        yellowgreen: '9acd32'
    };
    for (var key in simple_colors) {
        if (color_string == key) {
            color_string = simple_colors[key];
        }
    }
    // emd of simple type-in colors

    // array of color definition objects
    var color_defs = [
        {
            re: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
            example: ['rgb(123, 234, 45)', 'rgb(255,234,245)'],
            process: function (bits){
                return [
                    parseInt(bits[1]),
                    parseInt(bits[2]),
                    parseInt(bits[3])
                ];
            }
        },
        {
            re: /^(\w{2})(\w{2})(\w{2})$/,
            example: ['#00ff00', '336699'],
            process: function (bits){
                return [
                    parseInt(bits[1], 16),
                    parseInt(bits[2], 16),
                    parseInt(bits[3], 16)
                ];
            }
        },
        {
            re: /^(\w{1})(\w{1})(\w{1})$/,
            example: ['#fb0', 'f0f'],
            process: function (bits){
                return [
                    parseInt(bits[1] + bits[1], 16),
                    parseInt(bits[2] + bits[2], 16),
                    parseInt(bits[3] + bits[3], 16)
                ];
            }
        }
    ];

    // search through the definitions to find a match
    for (var i = 0; i < color_defs.length; i++) {
        var re = color_defs[i].re;
        var processor = color_defs[i].process;
        var bits = re.exec(color_string);
        if (bits) {
            var channels = processor(bits);
            this.r = channels[0];
            this.g = channels[1];
            this.b = channels[2];
            this.ok = true;
        }

    }

    // validate/cleanup values
    this.r = (this.r < 0 || isNaN(this.r)) ? 0 : ((this.r > 255) ? 255 : this.r);
    this.g = (this.g < 0 || isNaN(this.g)) ? 0 : ((this.g > 255) ? 255 : this.g);
    this.b = (this.b < 0 || isNaN(this.b)) ? 0 : ((this.b > 255) ? 255 : this.b);

    // some getters
    this.toRGB = function () {
        return 'rgb(' + this.r + ', ' + this.g + ', ' + this.b + ')';
    }
    this.toHex = function () {
        var r = this.r.toString(16);
        var g = this.g.toString(16);
        var b = this.b.toString(16);
        if (r.length == 1) r = '0' + r;
        if (g.length == 1) g = '0' + g;
        if (b.length == 1) b = '0' + b;
        return '#' + r + g + b;
    }
};

UI.register( "RGBColor", RGBColor );
	
})(window);

(function( window, undefined ) {

'use strict';
	
var 
/* ----- Tween ----- */
Class = UI.Class,
Helper = UI.Helper,
RGBColor = UI.RGBColor,

Core = Class.Core,

Easing = {
	Linear: function( t, s, e, d ) {
		if ( t <= 0 ) {
			return s;
		}
		else if ( t >= 1 ) {
			return e;
		}
		
		return t * e + (1-t) * s;
	},
	
	Quad: {
		easeIn: function( t, s, e, d ) {
			return Easing.Linear( t * t, s, e );
		},
		
		easeOut: function( t, s, e, d ) {
			return Easing.Linear( ( 2 - t ) * t, s, e );
		},
		
		easeInOut: function( t, s, e, d ) {
			
			var wt = t;
			
			t /= d / 2;
			
			if ( t < 1 ) {
				return Easing.Linear( t * t, s, e + (s-e)*0.5 );
			}
			
			t = wt;
			
			return Easing.Linear( ( 2 - t ) * t, s-(s-e)*0.5, e );
		}
	},
	
	Bounce: {
		easeOut: function( t, s, e, d ) {
			debug.log( t );
		
			if ( t * 2 < 1 ) {
				return Easing.Linear( t * t, s, e );
			}
			
			return Easing.Linear( ( 2 - t ) * t * -1, s, e );
		}
	},
},

Tween = Class({
	name: "Tween",
	parent: Core,
	constructor: function(  ) {
		
		var _instance,
			_duration = 0,
			_defaultVars = {
				delay:0,
				top:undefined, left:undefined, right:undefined, bottom:undefined,
				width:undefined, height:undefined,
				scale:1,
				ease: Easing.Linear,
				
				transform: {
					rotation: {
						x:0, y:0, z:0
					},
					
					scale: {
						x:0, y:0, z:0
					},
					
					skew: {
						x:0, y:0
					},
					
					matrix: {
						x:0, x2:0, x3:0,
						y:0, y2:0, y3:0,
						z:0, z2:0, z3:0,
						d:0, d2:0, d3:0,
						
						tx:0, ty:0, tz:0, td:0
					}
				},
				
				shadow:0,
				opacity:1,
				
				css: {
					backgroundColor: new RGBColor("white")
				},
				
				onBefore: UI.Constants.NULL_FUNCTION,
				onStart: UI.Constants.NULL_FUNCTION,
				onUpdate: UI.Constants.NULL_FUNCTION,
				onComplete: UI.Constants.NULL_FUNCTION
			},
			_data = {
				top:0, left:0, right:0, bottom:0,
				width:0, height:0,	
				
				transform: {
					rotation: {
						x:0, y:0, z:0
					},
					
					scale: {
						x:0, y:0, z:0
					},
					
					skew: {
						x:0, y:0
					},
					
					matrix: {
						x:0, x2:0, x3:0,
						y:0, y2:0, y3:0,
						z:0, z2:0, z3:0,
						d:0, d2:0, d3:0,
						
						tx:0, ty:0, tz:0, td:0
					}
				},
				
				shadow:0,
				opacity:1,
				
				css: {
					backgroundColor: new RGBColor("white")
				}
			},
			_vars = {},
			_kill = false,
			_needToComplete = false,
			_beginTime = -1,
			_curveFunction = function() {},
			_requestAnimationFrame = function(func) { // window.requestAnimationFrame || function(func) {
				var timeStamp = +new Date;
				setTimeout( function() {
					func(timeStamp)
				}, 0);
			},
			_cancelAnimFrame = window.cancelAnimationFrame;
		
		return {
			_animationPosition: 0,
			
			instance: function() {
				return _instance;	
			},
		
			__construct: function( instance ) {
			
				_instance = instance;
				
				this.init.apply( this, arguments );
			},
			
			_render: function( timeStamp ) {
				//debug.log( "_render", timeStamp, _kill );
			
				if ( _kill === true ) {
					return false;
				}
			
				var self = this,
					beginTime = ( _beginTime == -1 ) ? (_beginTime = timeStamp) : _beginTime,
					currentTime = timeStamp,
					elapsedTime = currentTime - beginTime,
					animationPosition = ( _duration == 0 ) ? 1 : (( elapsedTime == 0 ) ? 0 : Math.min(1, elapsedTime / _duration ));
				
				this._animationPosition = animationPosition;
				
				this._onUpdate( animationPosition );
				
				return ( animationPosition === 1 );
			},
			
			_easingCurve: function( t, start, end ) {
				
			},
			
			_curve: function( timing, start, end ) {
				if ( timing <= 0 ) {
					return start;
				}
				else if ( timing >= 1 ) {
					return end;
				}
				
				return _curveFunction.call( this, timing, start, end, _duration );
			},
			
			_requestAnimationFrame: function() {
				var self = this;
				
				if ( _duration == 0 ) {
					self._render(-1);
					self._onComplete.call( self );
					
					return;
				}
				
				_requestAnimationFrame( function() {
					
					if ( ! self._render.apply( self, arguments ) ) {
						if ( _kill == false ) {
							self._requestAnimationFrame();
						}
						else {
							if ( _needToComplete == true ) {
								setTimeout(function() { self._onComplete.call( self ); }, 0);
							}
						}
					}
					else {
						setTimeout(function() { self._onComplete.call( self ); }, 0);
					}
				});	
			},
			
			_onBefore: function() {
				//debug.log( "onBefore" );
				
				if ( typeof _vars.onBefore == "function" ) {
					_vars.onBefore();
				}
			},
			
			_onStart: function() {
				//debug.log( "onStart" );
				
				_beginTime = -1;
				
				if ( typeof _vars.onStart == "function" ) {
					_vars.onStart();
				}
			},
			
			_draw: function( timing ) {
				var css = {};
				
				for ( var key in _vars ) {
					
					if ( Array.inArray( ["left", "right", "top", "bottom", "width", "height"], key ) && _vars[key] != undefined ) {
						/*
						if ( typeof _vars[key] === "string" && _vars[key].indexOf('%') ) {
							css[key] = this._curve( timing, parseInt(_data[key]), parseInt(_vars[key]) ) + "%";
						}
						else {
							css[key] = this._curve( timing, _data[key], _vars[key] ) + "px";
						}
						*/
						
						css[key] = this._curve( timing, _data[key], _vars[key] ) + "px";
					}
					else if ( _vars[key] != undefined && Helper.Array.inArray( ["opacity"], key ) ) {
						css[key] = this._curve( timing, _data[key], _vars[key] );
					}
					else if ( _vars[key] != undefined && Helper.Array.inArray( ["scale"], key ) ) {
						var value = this._curve( timing, _data[key], _vars[key] );
						_instance[key](value);
					}
					else if ( _vars[key] != undefined && Helper.Array.inArray( ["css"], key ) ) {
						
						for ( var subKey in _vars.css ) {
							if ( subKey == "backgroundColor" ) {
								var r = this._curve( timing, _data.css.backgroundColor.r, _vars.css.backgroundColor.r );
								var g = this._curve( timing, _data.css.backgroundColor.g, _vars.css.backgroundColor.g );
								var b = this._curve( timing, _data.css.backgroundColor.b, _vars.css.backgroundColor.b );
							
								css["background-color"] = "rgb(" + parseInt(r) + "," + parseInt(g) + "," + parseInt(b) +")";
							}
						}
						
					}
				}
			
				_instance.css(css);	
			},
			
			_onUpdate: function( timing ) {
				if ( _kill == true ) {
					return;
				}
			
				this._draw( timing );
				
				if ( typeof _vars.onUpdate == "function" ) {
					_vars.onUpdate( timing );
				}
			},
			
			_onComplete: function() {
				//debug.log( "onComplete", _instance );
				
				this._draw( 1 );
				
				if ( typeof _vars.onComplete == "function" ) {
					_vars.onComplete.call( _instance, this, _vars );
				}
				
				if ( typeof _instance.__didFinishToTween == "function" ) {
					_instance.__didFinishToTween.call( _instance, this );
				}
			},
			
			_vars: function( vars ) {
				_vars = {};//Helper.Object.copy( _defaultVars );
				
				for ( var key in _defaultVars ) {
				
					if ( vars[key] != undefined ) {
						var type = typeof _defaultVars[key];
						
						if ( type == "object" ) {
							if ( key === "css" && vars.css.backgroundColor != undefined ) {
								_vars.css = _vars.css || {};
								_vars.css.backgroundColor = new RGBColor(vars.css.backgroundColor);
							}
						}
						else if ( type == "number" ) {
							if ( (''+_defaultVars[key]).indexOf('.') !== -1 ) {
								_vars[key] = parseFloat(vars[key]) || 0;
							}
							else {
								_vars[key] = parseInt(vars[key]) || 0;
							}
						}
						else { 
							_vars[key] = vars[key];
						}
					}
				}
			},
			
			_data: function() {
				var element = _instance.element();
				var size = _instance.size();
				var backgroundColor = _instance.css("background-color");
				var width = size.width;
				var height = size.height;
				
				/*
				if ( element.style.width && typeof element.style.width === "string" && element.style.width.indexOf('%') !== -1 ) {
					width = element.style.width;
				}
				else {
					width = size.width;
				}
				
				if ( element.style.height && typeof element.style.height === "string" && element.style.height.indexOf('%') !== -1 ) {
					height = element.style.height;
				}
				else {
					height = size.height;
				}
				*/
				
				_data = {
					left: parseFloat(_instance.css("left")),
					top: parseFloat(_instance.css("top")),
					width: width,
					height: height,
					scale: _instance.scale(),
					opacity: ( element.style.opacity ) ? parseInt( element.style.opacity ) : 1,
					css: {
						backgroundColor: backgroundColor
					}
				};
				
				if ( _instance.css("right") !== "auto" && ! isNaN( parseInt(_instance.css("right") ) ) ) {
					_data.right = parseInt(_instance.css("right"));
				}
				
				if ( _instance.css("bottom") !== "auto" && ! isNaN( parseInt(_instance.css("bottom") ) ) ) {
					_data.bottom = parseInt(_instance.css("bottom"));
				}
			},
			
			init: function( instance ) {
					
				var a = ["ms","moz","webkit","o"];
				var i = a.length;
				
				while (--i > -1 && !_requestAnimationFrame) {
					//_requestAnimationFrame = window[a[i] + "RequestAnimationFrame"];
					//_cancelAnimFrame = window[a[i] + "CancelAnimationFrame"] || window[a[i] + "CancelRequestAnimationFrame"];
				}	
			},
			
			killTo: function( completed ) {
				//degug.log( "killTo", completed );
			
				_kill = true;
				_needToComplete = completed;
				
				if ( typeof _instance.__didFinishToTween == "function" ) {
					_instance.__didFinishToTween.call( _instance, this );
				}
			},
			
			set: function( duration, vars ) {
				
				_duration = duration * 1000;
				_curveFunction = _vars.ease || Easing.Linear;
				
				this._vars(vars);
			},
			
			to: function( duration, vars ) {
			
				_kill = false;
				_needToComplete = false;
			
				this.set( duration, vars );
				this.start();
			},
			
			start: function() {
				//debug.log( "start" );
				
				if ( Tween.slowAnimation === true ) {
					_duration = _duration * 10;
				}
			
				this._onBefore();
				this._onStart();
				this._data();
				this._requestAnimationFrame();
			}
		}
	},
	'static': function() {
		
		return {
			slowAnimation: false,
		
			set: function( target, duration, vars ) {
				var tween = new Tween( target );
				tween.set( duration, vars );
				return tween;
			},
		
			to: function( target, duration, vars ) {
				var tween = new Tween( target );
				tween.to( duration, vars );
				return tween;
			}
		};
	}
});

Tween.Easing = Easing;

UI.register( "Tween", Tween );

})(window);

(function( window, undefined) {

'use strict';

var 
/* ----- Event ----- */
Class = UI.Class,
Core = Class.Core,
IObject = Class.IObject,

Event = Class({
	name: "Event",
	parent: Core,
	constructor: function( touches, event ) {
		var touch = ( touches != undefined && touches[0] != undefined ) ? touches[0] : undefined;
		
		if ( touch != undefined && touch["pageX"] != undefined && touch["pageY"] != undefined ) {
			return {
				"offsetX":touch.pageX,
				"offsetY":touch.pageY
			};
		}
	
		var clientX = ( touches != undefined && touches["length"] > 0 ) ? touches[0].clientX : event.clientX;
		var clientY = ( touches != undefined && touches["length"] > 0 ) ? touches[0].clientY : event.clientY;
		var touches = [];
	
		var doc, docElem, body, win;
		var srcElement = event.target || event.srcElement;
	
		win = window;
		doc = srcElement && srcElement.ownerDocument;
		docElem = doc.documentElement;
		body = doc.body;
					
		var clientTop = docElem.clientTop || body.clientTop || 0;
		var clientLeft = docElem.clientLeft || body.clientLeft || 0;
		var scrollTop = win.pageYOffset || docElem.scrollTop;
		var scrollLeft = win.pageXOffset || docElem.scrollLeft;
	
		var phase = event.type;
	
		return {
			"phase": phase,
			"touches": touches,
			"clientX": clientX,
			"clientY": clientY,
			"offsetX": clientX + scrollLeft - clientLeft,
			"offsetY": clientY + scrollTop - clientTop
		};
	},
	'static': function() {
	
		var _manager;
	
		return {
			eventUID: 0,
			hasTouch: 'ontouchstart' in window,
			manager: function() {
				if ( ! _manager)  {
					_manager = new EventManager();
				}
				return _manager;
			}
		};
	}
}),

TouchEvent = {
	Start:		Event.hasTouch ? "touchstart" : "mousedown",
	Move:		Event.hasTouch ? "touchmove" : "mousemove",
	End:		Event.hasTouch ? "touchend" : "mouseup",
	Cancel:		"touchcancel",
},

EventHandler = function( instance, type ) {

	var _instance = instance;
	var _element = instance.element ? instance.element() : undefined;
	var _type = type;
	var _bindedHandlers = [];

	return {
		/*
		handler: function(e) {
			for ( var i in _bindedHandlers ) {
				var handler = _bindedHandlers[i];
				handler.apply( _element, e );
			}
		},
		*/
		
		bindedHandlers: function() {
			return _bindedHandlers;	
		},
	
		addEventListener: function( handler, options ) {
				
			if ( typeof handler != "function" ) {
				return;
			}
			
			_bindedHandlers[_bindedHandlers.length] = handler;
			
			/*
			for ( var i in _element ) {
				var bubbles = options;
				var element = _element[i];
				
				if ( element && element["nodeType"] != undefined && element["nodeType"] === 1 || element === window ) {
					element.addEventListener( _type, this.handler, false );
				}
			}
			*/
		},
		
		removeEventListener: function( handler, options ) {
			Array.remove( _bindedHandlers, handler );
			
			/*
			
//			for ( var i in _element ) {
				var bubbles = options;
				var element = _element;
				
				if ( element["nodeType"] != undefined && element["nodeType"] === 1 || element === window ) {
					element.addEventListener( _type, this.handler );
				}
//			}

			*/
		},
		
		dispatchEvent: function() {
			var args = arguments;
		
			Array.each( _bindedHandlers, function( index, handler ) {
				handler.apply( _instance, args );
			});
		}
	}	
},

EventManager = function() {
	var _bindedInstances = {};
	
	return {
	
		bindedEvent: function( instance, types ) {
			var type = types;
			var eventUID = instance.eventUID();
			
			_bindedInstances[eventUID] = (_bindedInstances[eventUID]) ? _bindedInstances[eventUID] : {};
			_bindedInstances[eventUID][type] = ( _bindedInstances[eventUID][type] ) ? _bindedInstances[eventUID][type]: new EventHandler( instance, type );
			
			return _bindedInstances[eventUID][type];
		},
		
		add: function( instance, types, handler, options ) {
			var type = types;
			var eventUID = instance.eventUID();
			
			_bindedInstances[eventUID] = (_bindedInstances[eventUID]) ? _bindedInstances[eventUID] : {};
			_bindedInstances[eventUID][type] = ( _bindedInstances[eventUID][type] ) ? _bindedInstances[eventUID][type]: new EventHandler( instance, type );
			_bindedInstances[eventUID][type].addEventListener( handler, options );
		},
		
		remove: function( instance, types, handler ) {
			var type = types;
			var eventUID = instance.eventUID();
			
			_bindedInstances[eventUID] = (_bindedInstances[eventUID]) ? _bindedInstances[eventUID] : {};
			_bindedInstances[eventUID][type] = ( _bindedInstances[eventUID][type] ) ? _bindedInstances[eventUID][type]: new EventHandler( instance, type );
			_bindedInstances[eventUID][type].removeEventListener(handler);
		},
		
		trigger: function( instance, types ) {
			var type = types;
			var eventUID = instance.eventUID();
			
			if ( _bindedInstances[eventUID][type] != undefined ) {
				_bindedInstances[eventUID][type].trigger
			}
		}
	};
};

UI.register("TouchEvent", TouchEvent);
UI.register("Event", Event);
	
})(window);

(function(window, undefined) {

'use strict';
	
var 
/* ----- Private UI Module ----- */
Class = UI.Class,
Helper = UI.Helper,
Core = Class.Core,
Event = Class.Event,
UIPoint = UI.UIPoint,
UISize = UI.UISize,
UIRect = UI.UIRect,
UIEdgeInsets = UI.UIEdgeInsets,
Tween = UI.Tween,
RGBColor = UI.RGBColor,

/**
 * IObject
 * @name IObject
 * @class
 */

IObject = Class({
	name: "IObject",
	parent: Core,
	constructor: function() {
	
		return {
			__construct: function() {
				this.init.apply( this, arguments );
			},
			
			init: function() {
				return this;
			}
		};
	}
}),

/**
 * Responder
 * @name Responder
 * @class
 */

Responder = Class({
	name: "Responder",
	parent: IObject,
	constructor: function() {
	
		
		var _eventUID;
		
		return {
			eventUID: function() {
				if ( ! _eventUID ) {
					_eventUID = "Event." + Element.guid ++;
				}
				
				return _eventUID;
			},
		
			context: function( func, context ) {
				var context = context || this;
				
				return (function() {
					return func.apply( context, arguments );
				});
			},
			
			eventHandlers: function( event ) {
				return Event.manager().bindedEvent( this, event).bindedHandlers();	
			},

			addEventListener: function( event, handler ) {
			
				if ( typeof handler != "function" ) {
					return;
				}
				
				var context = this;
				
				if ( typeof event == "array" ) {
					Array.each( event, function( i, e ) {
						this.addEventListener( e, handler );
					}, context);
					
					return;
				}
				
				Event.manager().add( this, event, handler );
			},
			
			removeEventListener: function( event, handler ) {
				
				var context = this;
				
				if ( Array.isArray( event ) ) {
					Array.each( event, function( i, e ) {
						this.removeEventListener( e, handler );
					}, context);
					
					return;
				}
				
				Event.manager().remove( this, event, handler );
			},
			
			dispatchEvent: function( event ) {
				
				var args = Array.prototype.slice.call( arguments, 0 );
				args.shift();
				
				var dispatcher = Event.manager().bindedEvent( this, event );
				dispatcher.dispatchEvent.apply( dispatcher, args );
			},
			
			bind: function( event, handler ) {
				this.addEventListener.apply( this, arguments );
				
				return this;
			},
			
			unbind: function( event, handler ) {
				this.removeEventListener.apply( this, arguments );
				
				return this;
			},
			
			trigger: function(){
				this.dispatchEvent.apply( this, arguments );
				
				return this;
			}
		};
	}
}),

/**
 * Element
 * @name Element
 * @class
 */
Element = Class({
	name: "Element",
	parent: Responder,
	constructor: function() {
	
		var 
			_element,
			_enabled = true,
			_instance = null,
			_animating = false,
			_tweens = [],
			_plugins = [],
			_scale = 1,
			_gestureRecognizers = [];
		
		return {
			__captureElement: function( element ) {
				var wasElement = element;
			
				if ( element == undefined ) {
					element = undefined;
				}
				else {
					if ( typeof element == "string" ) {
						element = document.createElement(element.toUpperCase());
					}
					else if ( typeof element == "object" ) {
						if ( element.jquery ) {
							element = element.get(0);
						}
					}
				}
				return element;
			},
			
			__isElement: function( element ) {
				if ( typeof element === "object" && element.nodeType !== undefined ) {
					return true;
				}
				
				return false;
			},
			
			__setElement: function( element ) {
				var element = this.__captureElement( element );
			
				if ( this.__isElement(element) ) {
					_element = element;
					
					this._addInstance();
				}
			},
		
			__construct: function( element ) {
				var args = Array.prototype.slice.call( arguments, 1 );
			
				_instance = this;
				
				this.__setElement(element);
				
				args.unshift(_element);
				
				this.init.apply( this, args );
			},

			__destruct: function() {
				if ( _element ) {
					_element = undefined;
				}
			},
			
			_addInstance: function() {
				var name, nameQueue;
				name = Helper.String.guid( "UIKit.xxxxxxxx" ) + "." + Element.guid ++;
				nameQueue = this.attribute("data-instance-id") ? ( " " + this.attribute("data-instance-id") + " " ).replace( /[\t\r\n\f]/g, " " ) : " ";
				
				if ( nameQueue ) {
					if ( nameQueue.indexOf( " " + name + " " ) < 0 ) {
						nameQueue += name + " ";
					}

					nameQueue = trim( nameQueue );
					
					this.attribute("data-instance-id", nameQueue);
				}
				
				this.instanceID = name;
				
				UI.manager.add( this );
			},
			
			_removeInstance: function( value ) {
				UI.manager.remove( this );
			
				var name, nameQueue;
				name = this.instanceID;
				nameQueue = this.attribute("data-instance-id") ? ( " " + this.attribute("data-instance-id") + " " ).replace( /[\t\r\n\f]/g, " " ) : " ";
				
				if ( nameQueue ) {
					while ( nameQueue.indexOf( " " + name + " " ) >= 0 ) {
						nameQueue = nameQueue.replace( " " + name + " ", " " );
					}

					nameQueue = trim( nameQueue );
					
					this.attribute("data-instance-id", nameQueue);
				}
			},
			
			_instance: function() {
				return _instance;
			},
			
			instanceID: 0,
		
			init: function( element ) {
				return this;
			},
			
			parent: function() {
				if ( ! this.hasElement() ) {
					return undefined;
				}
				
				return _element.parentNode;	
			},
			
			children: function() {
				if ( ! this.hasElement() ) {
					return [];
				}
			
				var children = [];
					
				Array.each( _element.children, function(i, element) {
					if ( element.nodeType === 1 ) {
						children.push( element );
					}
				});
				
				return children;
			},
			
			removeFromParent: function() {
				if ( ! this.hasElement() ) {
					return;
				}
			
				if ( this.parent() && _element ) {
					this.parent().removeChild( _element );
				}
			},

			destroy: function( withElement ) {
			
				this._removePlugins();
				this._removeInstance();
				
				if ( withElement === true ) {
					this.removeFromParent();
				}
				
				this._super( "destroy", arguments );
			},
			
			hasElement: function() {
				return this.__isElement(_element) ? true : false;
			},
			
			window: function() {
				return window;
			},
			
			element: function() {
				return _element;
			},
			
			_removePlugins: function() {
				
				for ( var i in _plugins ) {
					var plugin = _plugins[i];
					plugin.destroy();
				}
				
				_plugins = [];
			},
			
			plugins: function() {
				return _plugins;	
			},
			
			plugin: function( ) {
				for ( var i in arguments ) {
					var pluginName = "UIPlugin" + String.ucfirst(arguments[i]);
					if ( UI.Class[pluginName] !== undefined ) {
						var clazz = UI.Class[pluginName];
						var plugin = new clazz( this );
						
						_plugins.push( plugin );
					}
				}
				
				this._plugins = _plugins;
			},
			
			style: function( name, value ) {
				if ( ! this.hasElement() ) {
					return;
				}
				
				if ( name.indexOf("-") !== -1 ) {
					var nameComponents = name.split("-");
					var convertName = nameComponents.shift();
					Array.each( nameComponents, function( idx, name ) {
						convertName += String.ucfirst(name);
					});
					name = convertName;
				}
			
				var style = _element.style;
				var cssNumber = {
					"columnCount": true,
					"fillOpacity": true,
					"fontWeight": true,
					"lineHeight": true,
					"opacity": true,
					"order": true,
					"orphans": true,
					"widows": true,
					"zIndex": true,
					"zoom": true
				};
				
				if ( typeof value === "number" && ! cssNumber[ name ] ) {
					value += "px";
				}
	
				if ( value === "" && name.indexOf("background") === 0 ) {
					style[ name ] = "inherit";
				}
				else {
					style[ name ] = value;
				}
			},
			
			find: function( selector ) {
				if ( ! this.hasElement() ) {
					return [];
				}
			
				return _element.querySelectorAll(selector);
			},
			
			css: function( css ) {
				if ( ! this.hasElement() ) {
					return;
				}
				
				if ( Object.isObject(css) === true ) {
					for ( var name in css ) {
						this.style(name, css[name]);
					}
					return;
				}
				
				var curCss = {};
				var style = _element.ownerDocument.defaultView.getComputedStyle( _element, null );
				
				if ( typeof css === "string" ) {
					var value = style[css];
				
					if ( typeof value === "string" && ( value.indexOf("rgb") !== -1 || value.indexOf("#") !== -1 ) ) {
						value = new RGBColor( value );
					}
					
					return value;
				}
				
				for ( var name in style ) {
					if ( isNaN(parseInt(name)) && name !== "cssText" ) {
						var value = style[name];
						
						if ( typeof value === "string" && ( value.indexOf("rgb") !== -1 || value.indexOf("#") !== -1 ) ) {
							value = new RGBColor( value );
						}
						
						curCss[name] = value;
					}
				}
			
				return curCss;
			},
			
			hasClass: function( clazz ) {
				if ( ! this.hasElement() ) {
					return false;
				}
			
				var className = " " + clazz + " ";
				
				if ( _element.nodeType === 1 && (" " + _element.className + " ").replace(/[\t\r\n\f]/g, " ").indexOf( className ) >= 0 ) {
					return true;
				}
		
				return false;
			},
			
			addClass: function( value ) {
				if ( ! this.hasElement() ) {
					return;
				}
			
				var clazz, className, c;
				value = ( value || "" ).match( /\S+/g ) || [];
				className = _element.nodeType === 1 && ( _element.className ? ( " " + _element.className + " " ).replace( /[\t\r\n\f]/g, " " ) : " " );
				
				if ( className ) {
					c = 0;
					while ( (clazz = value[c++]) ) {
						if ( className.indexOf( " " + clazz + " " ) < 0 ) {
							className += clazz + " ";
						}
					}

					className = trim( className );
					
					if ( _element.className !== className ) {
						_element.className = className;
					}
				}
			},
			
			removeClass: function( value ) {
				if ( ! this.hasElement() ) {
					return;
				}
			
				var clazz, className, c;
				value = ( value || "" ).match( /\S+/g ) || [];
				className = _element.nodeType === 1 && ( _element.className ? ( " " + _element.className + " " ).replace( /[\t\r\n\f]/g, " " ) : " " );
				
				if ( className ) {
					c = 0;
					while ( (clazz = value[c++]) ) {
					
						while ( className.indexOf( " " + clazz + " " ) >= 0 ) {
							className = className.replace( " " + clazz + " ", " " );
						}
					}

					className = trim( className );
					
					if ( _element.className !== className ) {
						_element.className = className;
					}
				}
			},
			
			val: function( value ) {
				if ( ! this.hasElement() || _element["value"] === undefined ) {
					return;
				}
			
				if ( arguments.length === 0 ) {
					return _element.value || "";
				}
		
				_element.value = value;
			},
			
			/*
			enabled: function( enabled ) {
				if ( arguments.length == 0 ) {
					return _enabled;
				}

				_enabled = enabled;
			},
			*/
			
			isHidden: function( ) {
				if ( ! this.hasElement() ) {
					return true;
				}
			
				return ( this.css( "display" ) === "none" || ! _element.ownerDocument.contains( _element ) );
			},
			
			showHide: function( show ) {
			
				if ( ! this.hasElement() ) {
					return;
				}
			
				var display, hidden;
				
				display = _element.style.display;
					
				if ( show ) {
					if ( display === "none" ) {
						_element.style.display = "";
					}
				}
				else {				
					hidden = this.isHidden();
			
					if ( display && display !== "none" || !hidden ) {
						elem.style.display = "none";
					}
				}
			},
			
			show: function() {
				this.showHide( true );	
			},
			
			hide: function() {
				this.showHide( false );	
			},
			
			addGestureRecognizer: function( gestureRecognizer ) {
				if ( ! Array.inArray( _gestureRecognizers, gestureRecognizer  ) ) {

					if ( gestureRecognizer._gestureObject() ) {
						gestureRecognizer._gestureObject().removeGestureRecognizer.call( gestureRecognizer._gestureObject(), gestureRecognizer );
					}

					Array.add( _gestureRecognizers, gestureRecognizer );

					gestureRecognizer._gestureObject( this );
				}
			},

			removeGestureRecognizer: function( gestureRecognizer ) {
				if ( Array.inArray( _gestureRecognizers, gestureRecognizer  ) ) {
					gestureRecognizer._gestureObject( null );
					Array.remove( _gestureRecognizers, gestureRecognizer );
				}
			},
			
			scale: function( scale ) {
				if ( ! this.hasElement() ) {
					return _scale;
				}
			
				if ( arguments.length == 0 ) {
					return _scale;
				}
				
				_scale = scale;
				_element.style.cssText += "-webkit-transform:scale(" + _scale + ", " + _scale + ");";
			},
			
			width: function() {
				return this.size().width;	
			},
			
			height: function() {
				return this.size().height;	
			},
						
			size: function() {
				if ( ! this.hasElement() ) {
					return new UISize();
				}
			
				var width = this.css("width") || _element.offsetWidth;
				var height = this.css("height") || _element.offsetHeight;
					
				return new UISize( width, height );
			},
			
			offset: function() {
				if ( ! this.hasElement() ) {
					return new UIPoint();
				}	
				
				return UIPoint.fromElement(_element);
			},
			
			position: function() {
				if ( ! this.hasElement() ) {
					return new UIPoint();
				}
				
				var box, offset, parentStyle, parentOffset = {top:0, left:0}, offsetParent;
		
				offset = this.offset();
				offsetParent = _element.offsetParent;
				
				if ( this.css( "position" ) === "fixed" ) {
					parentOffset = UIPoint.fromElement(offsetParent);
					
					if ( this.parent() ) {
						parentStyle = _element.ownerDocument.defaultView.getComputedStyle( this.parent(), null );
						
						parentOffset.x = parentOffset.x + parseInt( parentStyle.borderLeftWidth );
						parentOffset.y = parentOffset.y + parseInt( parentStyle.borderTopWidth );
					}
				}
				else {
					parentOffset.x = 0;
					parentOffset.y = 0;
				}
				
			    box = {
			    	left: offset.x - parentOffset.x,
					top:  offset.y - parentOffset.y
				};
		
				return new UIPoint( box.left, box.top );
			},
			
			removeAttribute: function(key) {
				if ( ! this.hasElement() ) {
					return;
				}
			
				_element.removeAttribute( key );
			},
			
			attr: function() {
				this.attribute.apply( this, arguments );	
			},
			
			attribute: function(name, value) {
				if ( ! this.hasElement() ) {
					return;
				}
			
				if ( value == undefined ) {
					return _element.getAttribute(name);
				}
			
				return _element.setAttribute(name, value);
			},
			
			attributes: function() {
				if ( ! this.hasElement() ) {
					return [];
				}
				
				return _element.attributes;
			},
			
			cloneElement: function(deep) {
				if ( ! this.hasElement() ) {
					return null;
				}
				
				var cloneElement = _element.cloneNode(deep);
				cloneElement.removeAttribute("data-instance-id");
				
				function removeInstance( children ) {
					Array.each( children, function(i, element) {
						if ( element.nodeType === 1 ) {
							element.removeAttribute("data-instance-id");
							
							if ( element.children ) {
								removeInstance( element.children );
							}
						}
					});
				}
				
				removeInstance( cloneElement.children );
				
				cloneElement.innerHeight = cloneElement.innerHeight;
				
				return cloneElement;
			},
			
			insertBefore: function( child ) {
				var childElement = child.element();
				
				if ( childElement ) {
					childElement = ( childElement.length ) ? childElement[0] : childElement;
					
					if ( childElement.nodeType === 1 || childElement.nodeType === 11 || childElement.nodeType === 9 ) {
					
						this.parent().insertBefore(childElement, _element);
					
						return this;			
					}
				}
				
				return false;
			},
			
			insertAfter: function( child ) {
				var childElement = child.element();
				
				if ( childElement ) {
					childElement = ( childElement.length ) ? childElement[0] : childElement;
					
					if ( childElement.nodeType === 1 || childElement.nodeType === 11 || childElement.nodeType === 9 ) {
					
						this.parent().insertBefore(childElement, _element.nextSibling);
					
						return this;			
					}
				}
				
				return false;
			},
			
			append: function( child, option ) {
				if ( ! this.hasElement() ) {
					return;
				}
			
				var childElement = child.element();
				
				if ( childElement.nodeType === 1 || childElement.nodeType === 11 || childElement.nodeType === 9 ) {
					_element.appendChild( childElement );
				}
			},
			
			remove: function( child, option ) {
				if ( child === undefined ) {
					this.destroy(true);
					return;
				}
				
				if ( ! this.hasElement() ) {
					return;
				}
			
				var childElement = child.element();
				childElement = ( childElement && childElement.jquery ) ? childElement.get(0) : childElement;
				
				_element.removeChild( childElement );
			},
			
			empty: function() {
				if ( ! this.hasElement() ) {
					return;
				}
			
				_element.innerHTML = "";	
			},
			
			appendHTML: function( html ) {
				if ( ! this.hasElement() ) {
					return;
				}
			
				_element.innerHTML += html;	
			},
			
			html: function( html ) {
				if ( ! this.hasElement() ) {
					return;
				}
			
				_element.innerHTML = html;	
			},
			
			data: function( key, value ) {
				if ( key === undefined ) {
					var data = {}, dataAttr = /^data\-(.+)$/;
					
					Array.each( this.attributes(), function( idx, attr ) {
						if ( dataAttr.test( attr.nodeName ) ) {
							var key = attr.nodeName.match(dataAttr)[1];
							data[key] = attr.nodeValue;
						}
					});
					
					return data;
				}
			
				if ( value === undefined ) {
					return this.attribute("data-"+key);
				}
				
				this.attribute("data-"+key, value);
			},
			
			addEventListener: function( event, handler, bubbles ) {
				this._super("addEventListener", arguments );
				
				if ( ! this.hasElement() ) {
					return;
				}
				
				_element.addEventListener( event, handler, bubbles || false );
			},
			
			removeEventListener: function( event, handler, bubbles ) {
				this._super("removeEventListener", arguments );
				
				if ( ! this.hasElement() ) {
					return;
				}
				
				if ( typeof handler === "function" ) {
					_element.removeEventListener( event, handler, bubbles || false );
				}
				else {
					var handlers = this.eventHandlers( event );
					
					Array.each( handlers, function( idx, handler ) {
						
						_element.removeEventListener( event, handler, bubbles || false );	
						
					});
				}
				
			},
			
			killAnimation: function( completed ) {
				
				if ( _tweens.length.length == 0 ) {
					return;
				}
				
				var wasTweens = _tweens;
				
				_tweens = [];
				
				for ( var i=0; i<wasTweens.length;i++ ) {
					var tween = wasTweens[i];
					tween.killTo( ( i == wasTweens.length - 1 ) ? completed : false );
					
					TweenManager.remove( tween );
				}
			},
			
			animate: function( duration, vars ) {
				//debug.log( this.name, "animate", arguments );
				
				var tween = new Tween( this );
				tween.set( duration, vars );
				
				_tweens.push( tween );
				
				if ( vars.inQueue === true ) {
					TweenManager.push( tween );
					TweenManager.start();
				}
				else {
					tween.start();
				}
			},
			
			_tweens: function() {
				return _tweens;	
			},
			
			_firstTween: function() {
				if ( _tweens.length == 0 ) {
					return undefined;
				}
			
				return _tweens[0];
			},
			
			__didFinishToTween: function( tween ) {
				Array.remove( _tweens, tween );
			
				TweenManager.didFinishToTween( this, tween );
			}
		};
	},
	'static': function() {
		
		return {
			guid: 0,
			
			createElement: function(elem, option) {
				var appendEle = document.createElement(elem);
				
				for(var name in option) {
					if(name == 'text') {
						text = document.createTextNode( option[name] );
						appendEle.appendChild(text);
					} else if(name == 'html') {
						appendEle.innerHTML = option[name];
					}
				}
				
				return appendEle;
			}
		}
	}
});

var TweenManager = function() {
	var 
	_animating = false,
	_queue = [];

	return {
		
		didFinishToTween: function( instance, tween ) {
			if ( _queue.length > 0 && tween !== _queue.shift() ) {
				console.error( "what!!!", tween,  _queue, _animating );
				return;
			}
			
			if ( _animating && _queue.length == 0 ) {
				return this.killAll();
			}
			
			setTimeout(function() {	TweenManager.next(); }, 0);
		},
	
		push: function( tween ) {
			_queue.push( tween );
		},
		
		remove: function( tween ) {
			var currentTween = this.first();
			Array.remove( _queue, tween );
			
			if ( currentTween === tween ) {
				this.next();
			}
		},
		
		first: function() {
			if ( _queue.length == 0 ) {
				return undefined;
			}
		
			return _queue[0];
		},
		
		next: function() {
			var tween = this.first();
			
			if ( tween == undefined ) {
				return this.killAll();
			}
			
			if ( tween == undefined ) {
				return this.killAll();
			}
			
			tween.start();
		},
		
		killAll: function() {
			//debug.log( "killAll" );
		
			_animating = false;
			_queue = [];
		},
		
		start: function() {
			if ( _animating == true ) {
				//console.warn("animating !!");
				return;
			}
		
			_animating = true;
			
			this.next();
		}
	}
}();


/* ----- Instance Manager ----- */

var

/**
 * Javascript Instance Module
 * @name UIManager
 * @class
 */
UIManager = function() {
	var _instances = [];
	var _defined = {};
	
	return {
		add: function( instance ) {
			if ( ! instance.element() || instance.element().length == 0 ||  ! instance.element().nodeType || instance.element().nodeType !== 1 ) {
				debug.warn( "instance is null", instance );
				return;
			}
		
			var instanceID = instance.instanceID;
			var instanceIndex = parseInt( instanceID.split(".")[2] );
			
			_defined[instanceID] = _instances[instanceIndex] = instance;
		},
		
		remove: function( instance ) {
			if ( instance.element().length == 0 ) {
				debug.warn( "instance is null", instance );
				return;
			}
		
			var instanceID = instance.instanceID;
			
			_defined[instanceID] = undefined;
			delete _defined[instanceID];
		},
		
		// 찾은 Element들 반환, callback 함수 가능
		find: function( selector, callback, context ) {
			var factory, items = [], canCallback = ( typeof callback == "function" );
			
			context = context || this;
			
			if ( typeof selector === "string" ) {
				items = document.querySelectorAll(selector);
			}
			else if ( selector.length > 0 && selector[0].nodeType != undefined ) { // element 배열
				items = selector;
			}
			else if ( selector.nodeType != undefined ) {
				items.push( selector );
			}
			else if ( Array.isArray( selector ) ) {
				
				Array.each( selector, function(idx, item) {
					if ( Class.isClass(item.constructor) ) {
						items.push( item.element() );
					}
				});
			}
			
			if ( canCallback ) {
				Array.each( items, function( index, element ) {
					callback.call( this, index, element );
				}, context);
			}
			
			return items;
		},
		
		isInstance: function( instance, constructor ) {
				
			if ( instance === undefined ) {
				return false;
			}
			
			// instance 는 존재하나 constructor 가 다른 경우
			if ( instance.constructor != undefined && constructor != undefined ) {
				if ( instance.constructor !== constructor ) {
					//debug.warn( "different constructor", item.constructor.name, constructor.name );
					return false;
				}
			}
			
			return true;
		},
		
		instance: function( element, constructor, params ) { 
			
			var instance, instances, that, hasInstance = false;
			
			that = this;
			instances = UI.manager.withElement( element );
			constructor =  typeof constructor === "string" ? ( Class[constructor] ) : constructor;
			params = params || [];
			
			Array.each( instances, function( index, instance ) {
				if ( that.isInstance(instance, constructor) === true ) {
					hasInstance = true;
					return false;
				}
			});
			
			// 이미 Instance 가 되어 있거나, constructor 가 다른 경우
			if ( element != undefined && constructor != undefined && ! hasInstance ) {
				
				if ( typeof constructor == "function"  ) {
					// is not class
					if ( ! Class.isClass( constructor ) ) {
						var className = ( typeof element["selector"] == "string" ? function( name ) {
								return name.replace(/[\.\-]/gi, "_");
							}(element["selector"]) : undefined );
						
						constructor = Class({
							"name": className,
							"parent": Element,
							"constructor": constructor
						});
					}
				}
				
				instance = new constructor( element, params[0], params[1], params[2], params[3] );
			}
			else if ( instances.length > 0 ) {
				instance = instances[instances.length-1];
			}
			
			return instance;
		},
		
		// 
		get: function( selector, constructor/*, ...args */ ) {
			
			if ( constructor === undefined ) {
				//return [];
			}
			
			var context = this;
			var items = this.find(selector);
			var params = Array.prototype.slice.call( arguments, 2 );
			var instances = [];
			
			Array.each( items, function( index, element ) {
				var instance = this.instance( element, constructor, Array.copy( params ) );
				instances.push( instance );
			}, context);
			
			return instances;
		},
		
		byID: function( instanceID ) {
			return _defined[instanceID];
		},
		
		atIndex: function( index ) {
			return _instances[index];
		},
		
		withElement: function( element ) {
			var nameQueue = ( $(element).attr("data-instance-id") || "" ).match( /\S+/g ) || [];
			var that = this;
			var instances = [];
			
			Array.each( nameQueue, function( index, instanceID ) {
				var instance = that.byID( instanceID );
				
				instances.push( instance );
			});
			
			return instances;
		},
		
		countOf: function() {
			return _instances.length;
		}
	};
};

UI.register("manager", new UIManager());

// jQuery Instance Plugin
// jQuery Instance Plugin
if ( jQuery !== undefined ) {
	$.fn.instance = function( constructor/*, ...args */ ) {
		var items = [];
		
		this.each( function(idx, element) {
			items.push(element);
		});
	
		var args = Array.prototype.slice.call( arguments, 0 ); args.unshift( items );
		var manager = UI.manager;
		var instances = manager.get.apply( manager, args );
		
		if ( instances.length == 1 ) {
			return instances[0];
		}
		
		return $(instances);
	};
	
	$.instance = UI.manager;
}
	
})(window);

(function(window, undefined) {

'use strict';
	
var
/* ----- Public Module ----- */

Class = UI.Class,
Element = Class.Element,
TouchEvent = UI.TouchEvent,

/**
 * EventDispatcher
 * @name EventDispatcher
 * @class
 */
EventDispatcher = Class({
	name: "EventDispatcher",
	parent: Element,
	constructor: function() {
	
		var _binded = false;
		var _pressed = false;
		
		return {
			_shouldAttemptToRecognize: function() {
				return this.enabled();
			},
			
			_recognizeEvents: function( e ) {
				var bubbling = true;
				var event = e;//new UIEvent( e );
				
				//sdebug.log( "event", event );
			
				if ( this._shouldAttemptToRecognize() ) {
					switch ( event.type ) {
						case TouchEvent.Start:
							_pressed = true;
							
							bubbling = this.eventStart( event );
							break;

						case TouchEvent.Move:
							if ( _pressed == true ) {
								bubbling = this.eventDrag( event );
							}
							else {
								bubbling = this.eventMove( event );
							}
							
							break;

						case TouchEvent.End:
							_pressed = false;
							
							bubbling = this.eventEnd( event );
							break;

						/*
						case TouchEvent.Enter:
							_pressed = false;
							
							bubbling = this.eventEnter( event );
							break;

						case TouchEvent.Leave:
							_pressed = false;
							
							bubbling = this.eventLeave( event );
							break;
						*/
						
						case TouchEvent.Cancel:
							_pressed = false;
							
							bubbling = this.eventCancel( event );
							break;

						default:
							_pressed = false;
							
							break;
					}
				}
				
				return bubbling;
			},
			
			_bindEvents: function() {
				if ( _binded == true ) {
					return;	
				}
				
				_binded = true;
				
				var instance = this._instance();
				
				if ( this.hasElement() ) { 
					this.bind( TouchEvent.Start, function(e) {
						return instance._recognizeEvents( e );
					});
					
					this.bind( TouchEvent.Move, function(e) {
						return instance._recognizeEvents( e );
					});
					
					this.bind( TouchEvent.End, function(e) {
						return instance._recognizeEvents( e );
					});
					
					if ( ! Event.hasTouch ) {
						// this.bind( TouchEvent.Enter, function(e) {
						//	return instance._recognizeEvents( e );
						// });
					
						// this.bind( TouchEvent.Leave, function(e) {
						// 	return instance._recognizeEvents( e );
						// });
					}
					else {
						this.bind( TouchEvent.Cancel, function(e) {
							return instance._recognizeEvents( e );
						});
					}
				}
			},
			
			init: function() {
				var self = this._super("init", arguments);
				if (self) {
					
					//this._bindEvents();
					return this;
				}
			},
			
			destroy: function() {

				if ( _binded == true ) {
					this.unbind( TouchEvent.Start );
					this.unbind( TouchEvent.Move );
					this.unbind( TouchEvent.End );
					this.unbind( TouchEvent.Cancel );
					
					/*
					this.unbind( TouchEvent.Enter );
					this.unbind( TouchEvent.Leave );
					*/
					
					_binded = false;
				}

				this._super().destroy.apply( this._super(), arguments );
			},

			eventMove: function( event ) {
				return true;
			},
			
			eventStart: function( event ) {
				return true;
			},

			eventDrag: function( event ) {
				return true;
			},

			eventEnd: function( event ) {
				return true;
			},

			eventEnter: function( event ) {
				return true;
			},

			eventLeave: function( event ) {
				return true;
			},

			eventCancel: function( event ) {
				return true;
			}
		};
	}
}),

/**
 * UIView
 * @name UIView
 * @class
 */
UIView = Class({
	name: "UIView",
	parent: EventDispatcher,
	constructor: function() {
		
		var _subviews = [];
		
		return {
			addSubview: function( view ) {
				
				_subviews.push( view );
				
				this.element().appendChild( view.element() );
				
				this.needsDisplay();
			},
			
			superview: function() {
				return this.parent;
			},
			
			removeFromSuperview: function() {
				var superview = this.superview();
				
				this.remove();
				
				superview.needsDisplay();
			},
			
			needsDisplay: function() {
				
			}
		};
	}
});

})(window);
(function(window, undefined) {

'use strict';
	
var 

Class = UI.Class,
Responder = Class.Responder,
	
/**
 * UIController
 * @name UIController
 * @class
 */
UIController = Class({
	name: "UIController",
	parent: Responder,
	constructor: function() {
		
		var _instance;
		
		return {
			__construct: function( ) {
				_instance = this;
				
				this.init.apply( this, arguments );
			},

			__destruct: function() {
				_instance = undefined;
			},
			
			init: function() {
				return this;
			}
		};
	}
}),


/**
 * UIMacroController
 * @name UIMacroController
 * @class
 */
UIMacroController = Class({
	name: "UIMacroController",
	parent: UIController,
	constructor: function() {
		
		
		return {
			init: function() {
				var self = this._super("init", arguments);
				if (self) {
					
					return this;
				}
			}
		};
	}
});

})(window);

(function(window, undefined) {

'use strict';
	
var
/* ----- UI Gesture ----- */

Class = UI.Class,
Helper = UI.Helper,
IObject = Class.IObject,

UIGestureRecognizerState = {
	Possible:			10,
	Began:				21,
	Changed:			22,
	Ended:				23,
	Recognized:			23, // GestureRecognizerState.Ended
	Cancelled:			41,
	Failed:				44
},

AllowedTransitions = [
	// discrete gestures
	[UIGestureRecognizerState.Possible,		UIGestureRecognizerState.Recognized,	 	true,		true],
	[UIGestureRecognizerState.Possible,		UIGestureRecognizerState.Failed,			false,		true],

	// continuous gestures
	[UIGestureRecognizerState.Possible,		UIGestureRecognizerState.Began,				true,		false],
	[UIGestureRecognizerState.Began,		UIGestureRecognizerState.Changed,			true,		false],
	[UIGestureRecognizerState.Began,		UIGestureRecognizerState.Cancelled,			true,		true],
	[UIGestureRecognizerState.Began,		UIGestureRecognizerState.Ended,				true,		true],
	[UIGestureRecognizerState.Changed,		UIGestureRecognizerState.Changed,			true,		false],
	[UIGestureRecognizerState.Changed,		UIGestureRecognizerState.Cancelled,			true,		true],
	[UIGestureRecognizerState.Changed,		UIGestureRecognizerState.Ended,				true,		true]
],

StateTransition = function( index ) {
	var transition = AllowedTransitions[index];

	return {
		fromState: transition[0],
		toState: transition[1],
		shouldNotify: transition[2],
		shouldReset: transition[3] 
	};
},

UIAction = function( target, action ) {
	this.target = target;
	this.action = action;
},

UIGestureRecognizer = Class({
	name: "UIGestureRecognizer",
	parent: IObject,
	constructor: function() {
		
		var _delegate = null;
		var _delegateCan = {
			shouldBegin: false,
			shouldReceiveTouch: false,
			shouldRecognizeSimultaneouslyWithGestureRecognizer: false 
		};

		var _state = UIGestureRecognizerState.Possible;

		var _registeredActions  = [];
		var _allowedTransitions = [];

		for ( var t in AllowedTransitions ) {
			_allowedTransitions[t] = new StateTransition( t );
		}
		
		var _pressed = false;

		var _gestureObject = null;

		return {
			cancelsTouchesInView : true,
			delaysTouchesBegan  : false,
			delaysTouchesEnded  : true,
			
			_recognizeTouches: function( touches, event ) {
				//debug.error( this, "_recognizeTouches", UIControlEventString(event), touches, event );

				var bool = true;

				if ( this._shouldAttemptToRecognize() ) {
					_trackingTouches = touches;

					switch ( event.type ) {
						case TouchEvent.Start:
							_pressed = true;
							bool = this._gesturesBegan( touches, event );
							break;

						case TouchEvent.Move:
							
							// MouseEvent Bug
							if ( ! Event.hasTouch ) {
								if ( _pressed == false ) {
									return false;
								}
							}

							bool = this._gesturesMoved( touches, event );
							break;

						case TouchEvent.End:
							_pressed = false;
							bool = this._gesturesEnded( touches, event );
							break;

						case TouchEvent.Cancel:
							_pressed = false;
							bool = this._discreteGestures( touches, event );
							break;

						default:
							_pressed = false;
							break;
					}
				}

				return bool;
			},

			_gestureObject: function( instance ) {
				if ( arguments.length == 0 ) { 
					return _gestureObject
				}
				
				var self = this;

				_gestureObject = instance;
				
				_gestureObject.bind( TouchEvent.Start, function(e) {
					return self._recognizeTouches( e.touches, e );
				});
				
				_gestureObject.bind( TouchEvent.Move, function(e) {
					return self._recognizeTouches( e.touches, e );
				});
				
				_gestureObject.bind( TouchEvent.End, function(e) {
					return self._recognizeTouches( e.touches, e );
				});
				
				_gestureObject.bind( TouchEvent.Cancel, function(e) {
					return self._recognizeTouches( e.touches, e );
				});
			},

			_init: function() {
				
				_state = UIGestureRecognizerState.Possible;
				
				this.cancelsTouchesInView = true;
				this.delaysTouchesBegan = false;
				this.delaysTouchesEnded = true;
				
				_registeredActions = [];
				_trackingTouches = [];
				
				this.init();
			},
			
			init: function() {
					
			},

			destroy: function() {
			
				if ( _gestureObject ) {
					_gestureObject.unbind( TouchEvent.Start );
					_gestureObject.unbind( TouchEvent.Move );
					_gestureObject.unbind( TouchEvent.End );
					_gestureObject.unbind( TouchEvent.Cancel );
				}

				this._super("destroy", arguments);
			},

			delegate: function( delegate ) {
				if ( arguments.length == 0 ) {
					return _delegate;
				}

				_delegate = delegate;
				_delegateCan.shouldBegin = ( typeof _delegate["shouldBegin"] == "function" );
				_delegateCan.shouldReceiveTouch = ( typeof _delegate["shouldReceiveTouch"] == "function" );
				_delegateCan.shouldRecognizeSimultaneouslyWithGestureRecognizer = ( typeof _delegate["shouldRecognizeSimultaneouslyWithGestureRecognizer"] == "function" );
			},

			addTarget: function( target, action ) {
				var actionRecord = new UIAction();
				actionRecord.target = target;
				actionRecord.action = action || target["_recognizeTouches"] || function() {};

				Array.add( _registeredActions, actionRecord );
			},

			removeTarget: function( target, action ) {
				var actionRecord = new UIAction();
				actionRecord.target = target;
				actionRecord.action = action || target["_recognizeTouches"] || function() {};

				Array.remove( _registeredActions, actionRecord );
			},

			numberOfTouches: function() {
				return _trackingTouches.length;
			},

			state: function( state, silence ) {
				if ( arguments.length == 0 ) {
					return _state;
				}

				var transition = null;

				for ( var i=0; i<_allowedTransitions.length; i++ ) {
					if ( _allowedTransitions[i].fromState == _state && _allowedTransitions[i].toState == state ) {
						transition = _allowedTransitions[i];
						break;
					}
				}

				if ( transition ) {
					_state = transition.toState;
					
					if ( !silence && transition.shouldNotify ) {
						for ( var a in _registeredActions) {
							var actionRecord = _registeredActions[a];
		
							if ( typeof actionRecord.action == "function" ) {
								actionRecord.action.call( actionRecord.target, this );
							}
						}
					}
					
					if ( transition.shouldReset ) {
						this.reset();
					}
				}
			},

			isContainedView: function( event ) {
				
				var $element = $(event.srcElement);
				var $view = $( _gestureObject.element() );
				var $parent = $view;

				var isContained = false;

				if ( $parent[0] == $element[0] ) {
					return true;
				}

				var i = 0;

				while ( $parent.length > 0 && i < 20 ) {
					if ( $parent[0] === $element[0] ) {
						isContained = true;
						break;
					}

					$parent = $parent.parent();
					i = i + 1;
				}


				if ( isContained == false ) {
					$element = $( _gestureObject.element() );
					$view = $(event.srcElement);
					$parent = $view;

					i = 0;

					while ( $parent.length > 0 && i < 20 ) {
						if ( $parent[0] === $element[0] ) {
							isContained = true;
							break;
						}

						$parent = $parent.parent();
						i = i + 1;
					}
				}

				return isContained;
			},

			reset: function() {
				_state = UIGestureRecognizerState.Possible;
				_trackingTouches = [];
			},

			canPreventGestureRecognizer: function( preventedGestureRecognizer ) {
				return true;
			},

			canBePreventedByGestureRecognizer: function( preventedGestureRecognizer ) {
				return true;
			},

			ignoreTouch: function( touch, event ) {

			},

			_shouldAttemptToRecognize: function() {
				return ( _gestureObject && _gestureObject.enabled() &&
						_state != UIGestureRecognizerState.Failed &&
						_state != UIGestureRecognizerState.Cancelled && 
						_state != UIGestureRecognizerState.Ended );
			},

			_gesturesBegan: function( touches, event ) {
				return true;
			},

			_gesturesMoved: function( touches, event ) {
				return true;
			},

			_gesturesEnded: function( touches, event ) {
				return true;
			},

			_discreteGestures: function( touches, event ) {
				return true;
			}
		};
	},
	'static': {
		State: UIGestureRecognizerState
	}
}),

UITapGestureRecognizer = Class({
	name: "UITapGestureRecognizer",
	parent: UIGestureRecognizer,
	constructor: function(  ) {
	
		var _tapCount = 0;
		var _timestamp = new Date();
	
		return {
			
			init: function( view, enableInteraction ) {
				
			},
			
			_gesturesBegan: function( touches, event ) {
				
				
				
				return true;
			},

			_gesturesMoved: function( touches, event ) {
				_tapCount = 0;
				
				return true;
			},

			_gesturesEnded: function( touches, event ) {
				
				var timestamp = new Date();
				var difftime = (timestamp.getTime()*0.001) - (_timestamp.getTime()*0.001);
				
				_timestamp = timestamp;
				
				if ( difftime > 0.3 ) {
					_tapCount = 0;
				}
				
				_tapCount = _tapCount + 1;
				
				if ( _tapCount >= 2 ) {
					_tapCount = 0;
					
					return false;
				}
				
				return true;
			},

			_discreteGestures: function( touches, event ) {
				_tapCount = 0;
				
				return true;
			}
		};
	}
}),

UIPanInteraction = {
	Unknown:	1,
	Portrat:	2,
	Landscape: 	3,
	All:		4
},

UIPanGestureRecognizer = Class({
	name: "UIPanGestureRecognizer",
	parent: UIGestureRecognizer,
	constructor: function(  ) {

		var _minimumNumberOfTouches  = 1;
		var _maximumNumberOfTouches = 10;
		var _translation = { x:0, y: 0 };
		
		var _currentPoint = { x:0, y: 0 };
		var _currentTouch = null;

		var _enableInteraction = UIPanInteraction.Landscape;
		var _panningInteraction = UIPanInteraction.Unknown;
		var _checkInteraction = false;
		var _slideAngle = 60;

		return {
			
			_gesturesBegan: function( touches, event ) {
				var touch = new Event( touches, event );

				_currentTouch = touch;
				_currentPoint = { x: touch.offsetX, y: touch.offsetY };
				_panningInteraction = UIPanInteraction.Unknown;
				_checkInteraction = false;

				if ( ! Event.hasTouch ) {
					return false;
				}

				return true;
			},

			_gesturesMoved: function( touches, event ) {
				var touch = new Event( touches, event );
				var state = this.state();

				var point = { x: touch.offsetX, y: touch.offsetY };
				var delta = { x: point.x - _currentPoint.x, y:point.y - _currentPoint.y };

				_currentPoint = point;
				_currentTouch = touch;

				if ( _checkInteraction == false ) {
					var M_PI = 3.1415926535898;
					var ratio = Math.atan2( delta.y, delta.x );
					var angle = ( ratio == 0 ) ? 0 : ( ratio *180 / M_PI );

					_panningInteraction = ( Math.abs( angle ) > _slideAngle && Math.abs( angle ) < ( 180 - _slideAngle ) ) ? UIPanInteraction.Portrat : UIPanInteraction.Landscape;
					_checkInteraction = true;
				}

				if (  _enableInteraction == UIPanInteraction.Unknown || _enableInteraction == _panningInteraction ) {
					var isContains = this.isContainedView( event );

					if ( state == UIGestureRecognizerState.Possible && touch && isContains ) {
						this.translation( delta );
						
						_lastMovementTime = event.timeStamp;

						this.state( UIGestureRecognizerState.Began );

					}
					else if ( state == UIGestureRecognizerState.Began || state == UIGestureRecognizerState.Changed ) {
						if ( touch ) {
							if ( this._translate( delta, event ) ) {
								this.state( UIGestureRecognizerState.Changed );
							}
						} else {
							this.state( UIGestureRecognizerState.Cancelled );
						}
					}
					else {
						this.state( UIGestureRecognizerState.Cancelled );
					}

					return false;
				}

				if ( ! Event.hasTouch ) {
					return false;
				}

				return true;
			},

			_gesturesEnded: function( touches, event ) {
				var state = this.state();

				if ( state == UIGestureRecognizerState.Began || state == UIGestureRecognizerState.Changed ) {
					var touch = _currentTouch;
					var delta = { x: 0, y:0 };
					
					if ( touch ) {
						this._translate( delta, event );
						this.state( UIGestureRecognizerState.Ended );
					} else {
						this.state( UIGestureRecognizerState.Cancelled );
					}
				}
				else {
					this.state( UIGestureRecognizerState.Cancelled );
				}

				var bubbleEvent = ( _enableInteraction === _panningInteraction ) ? false : true;

				_currentTouch = null;
				_panningInteraction = UIPanInteraction.Unknown;
				_checkInteraction = false;

				if ( ! Event.hasTouch ) {
					return false;
				}

				return bubbleEvent;
			},

			_discreteGestures: function( touches, event ) {

				_currentTouch = null;
				_panningInteraction = UIPanInteraction.Unknown;
				_checkInteraction = false;

				return true;
			},
		
			init: function( view, enableInteraction, angle ) {
				_enableInteraction = ( enableInteraction == undefined ) ? _enableInteraction : enableInteraction;
				_slideAngle =  ( angle == undefined ) ? _slideAngle : parse_int(angle);
				
				return this;
			},
			
			destroy: function() {
				this._super("destroy", arguments );
			},

			translationInView: function( view ) {
				return _translation;
			},

			_translate: function( delta, event ) {
				var timeDiff = event.timeStamp - _lastMovementTime;

				if ( ! (delta.x == 0 && delta.y == 0)  && timeDiff > 0) {
					_translation.x += delta.x;
					_translation.y += delta.y;
					_velocity.x = delta.x / timeDiff;
					_velocity.y = delta.y / timeDiff;
					_lastMovementTime = event.timeStamp;

					return true;
				}

				return true;
			},

			translation: function( translation, view ) {
				_velocity = { x:0, y: 0 };
				_translation = translation;
			},

			reset: function() {
				this._super().reset();

				_translation = { x:0, y: 0 };
				_velocity = { x:0, y: 0 };
			},

			velocityInView: function( view ) {
				return _velocity;
			}
		};
	},
	'static': {
		Interaction: UIPanInteraction
	}
}),

UISwipeGestureRecognizerDirection = {
	Right:	1 << 0,
	Left:	1 << 1,
	Up:		1 << 2,
	Down:	1 << 3	
},

UISwipeGestureRecognizer = Class({
	name: "UISwipeGestureRecognizer",
	parent: UIGestureRecognizer,
	constructor: function(  ) {

		var _minimumNumberOfTouches  = 1;
		var _maximumNumberOfTouches = 10;
		var _translation = { x:0, y: 0 };
		var _velocity = { x:0, y: 0 };

		var _currentPoint = { x:0, y: 0 };
		var _currentTouch = null;

		var _enableInteraction = UIPanInteraction.Landscape;
		var _panningInteraction = UIPanInteraction.Unknown;
		var _checkInteraction = false;
		var _slideAngle = 60;
		var _direction = UISwipeGestureRecognizerDirection.Right;

		return {
		
			direction: function( direction ) {
				if ( arguments.length == 0 ) {
					return _direction;
				}
				
				_direction = direction;
			},
			
			_gesturesBegan: function( touches, event ) {
				var touch = new Event( touches, event );

				_currentTouch = touch;
				_currentPoint = { x: touch.offsetX, y: touch.offsetY };
				_panningInteraction = UIPanInteraction.Unknown;
				_checkInteraction = false;

				if ( ! Event.hasTouch ) {
					return false;
				}

				return true;
			},

			_gesturesMoved: function( touches, event ) {
				var touch = new Event( touches, event );
				var state = this.state();

				var point = { x: touch.offsetX, y: touch.offsetY };
				var delta = { x: point.x - _currentPoint.x, y:point.y - _currentPoint.y };

				_currentPoint = point;
				_currentTouch = touch;

				if ( _checkInteraction == false ) {
					var M_PI = 3.1415926535898;
					var ratio = Math.atan2( delta.y, delta.x );
					var angle = ( ratio == 0 ) ? 0 : ( ratio *180 / M_PI );

					_panningInteraction = ( Math.abs( angle ) > _slideAngle && Math.abs( angle ) < ( 180 - _slideAngle ) ) ? UIPanInteraction.Portrat : UIPanInteraction.Landscape;
					_checkInteraction = true;
				}

				if (  _enableInteraction == UIPanInteraction.Unknown || _enableInteraction == _panningInteraction ) {
					var isContains = this.isContainedView( event );

					if ( state == UIGestureRecognizerState.Possible && touch && isContains ) {
						this.translation( delta );
						
						_lastMovementTime = event.timeStamp;

						this.state( UIGestureRecognizerState.Began, true );

					}
					else if ( state == UIGestureRecognizerState.Began || state == UIGestureRecognizerState.Changed ) {
						if ( touch ) {
							if ( this._translate( delta, event ) ) {
								this.state( UIGestureRecognizerState.Changed, true );
							}
						} else {
							this.state( UIGestureRecognizerState.Cancelled, true );
						}
					}
					else {
						this.state( UIGestureRecognizerState.Cancelled, true );
					}

					return false;
				}

				if ( ! Event.hasTouch ) {
					return false;
				}

				return true;
			},

			_gesturesEnded: function( touches, event ) {
				var state = this.state();
				
				if ( state == UIGestureRecognizerState.Began || state == UIGestureRecognizerState.Changed ) {
					var touch = _currentTouch;
					var delta = { x: 0, y:0 };
					var silence = true;
					
					if ( touch ) {
						this._translate( delta, event );
						
						if ( Math.abs( _translation.x ) > 10 ) {
							if ( _translation.x > 0 && _direction == UISwipeGestureRecognizerDirection.Right ) {
								silence = false;
							}
							else if ( _translation.x < 0 && _direction == UISwipeGestureRecognizerDirection.Left ) {
								silence = false;
							}
						}
						
						this.state( UIGestureRecognizerState.Ended, silence );
					} else {
						this.state( UIGestureRecognizerState.Cancelled, true );
					}
				}
				else {
					this.state( UIGestureRecognizerState.Cancelled, true );
				}

				var bubbleEvent = ( _enableInteraction === _panningInteraction ) ? false : true;

				_currentTouch = null;
				_panningInteraction = UIPanInteraction.Unknown;
				_checkInteraction = false;

				if ( ! Event.hasTouch ) {
					return false;
				}

				return bubbleEvent;
			},

			_discreteGestures: function( touches, event ) {

				_currentTouch = null;
				_panningInteraction = UIPanInteraction.Unknown;
				_checkInteraction = false;

				return true;
			},

			translation: function( translation, view ) {
				_translation = translation;
			},

			_translate: function( delta, event ) {
				var timeDiff = event.timeStamp - _lastMovementTime;

				if ( ! (delta.x == 0 && delta.y == 0)  && timeDiff > 0) {
					_translation.x += delta.x;
					_translation.y += delta.y;
					_lastMovementTime = event.timeStamp;

					return true;
				}

				return true;
			},
		
			init: function( view, enableInteraction, angle ) {
				_enableInteraction = ( enableInteraction == undefined ) ? _enableInteraction : enableInteraction;
				_slideAngle =  ( angle == undefined ) ? _slideAngle : parse_int(angle);
				
				return this;
			},
			
			destroy: function() {
				this._super("destroy", arguments);
				
			}
		};
	},
	'static': {
		Direction: UISwipeGestureRecognizerDirection
	}
});
	
})(window);

(function(window, undefined) {

'use strict';

var 
/* ----- Notification ----- */
Class = UI.Class,

Notification = function( info, args ) {
	
	return {
		userInfo: info,
		arguments: args
	};
},

NotificationObserver = function( target, handler ) {

	return {
		post: function() {
			handler.apply( target, arguments );
		}
	};
},

NotificationCenter = function() {

	var _observers = {};
	
	return {
		addObserver: function( target, name, handler ) {
			if ( name.indexOf( "" ) !== -1 ) {
				var someNames = name.split(" ");
				var self = this;
				if ( someNames.length > 1 ) {
					Array.each( someNames, function( index, someName ) {
						self.addObserver( target, someName, handler );
					});
					
					return;
				}
			}
		
			if ( _observers[name] == undefined ) {
				_observers[name] = [];
			}
			
			var observer = new NotificationObserver( target, handler );
			
			_observers[name].push( observer );
		},
		
		postNotification: function( name, info ) {
			//debug.log( this, "postNotification", name, info );
		
			if ( _observers[name] == undefined ) {
				return;
			}
		
			var args = Array.prototype.slice.call( arguments, 0 ); args.shift();
			var notification = new Notification( info, args );
			var objservers = _observers[name];
			
			Array.each( objservers, function( index, observer ) {
				observer.post.call( observer, notification );
			});
		}
	};
};

Notification.defaultCenter = new NotificationCenter();

if ( UI.Notification === undefined ) {
	UI.Notification = Notification;
}

})(window);
(function(window, undefined) {

'use strict';

var 

EscapeStrings = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': '&quot;',
	"'": '&#39;',
	"/": '&#x2F;'
},

ReqularExpression = {
	white: /\s*/,
	space: /\s+/,
	equals: /\s*=/,
	curly: /\s*\}/,
	nonSpace: /\S/,
	variable: /\$[\w'-]*/,
	command: /if|loop|\=|\//
},

Config = {
	tags: ["{{", "}}"]
},

Context = function Context( data, parent ) {
	var 
	_data = data,
	_parent = parent;

	return {
		get: function( key ) {
			if ( isVariable(key) ) {
				key = getVariable(key);
			}

			if ( key === 'this' ) {
				return _data;
			}

			return _data[key];
		},

		convert: function( string ) {
			var match = string.match(/\$[\w'-]*/g);
			
			if ( match && match.length > 0 ) {
				var i, key, value;

				for ( i in match ) {
					key = getVariable(match[i]);
					value = this.get(key);

					if ( key === 'this' ) {
						value = _data;
					}

					if ( typeof value === 'string' ) {
						string = string.replace(match[i], "'" + value + "'");
					}
					else if ( typeof value === 'number' ) {
						string = string.replace(match[i], value );
					}
					else if ( typeof value === 'object' ) {
						
					}
				}
			}
			
			return string;
		},

		parent: function() {
			return _parent;
		},

		data: function() {
			return _data;
		},

		child: function( value ) {
			return new Context( value, this );
		}
	}
},

Template = function Template( html ) {

	var _tokens = [];

	return {
		parse: function( html, tags ) {
			// TODO: Cache
			_tokens = parseHTML(html, tags);
		},

		render: function( data ) {
			var context = new Context(data);
			return this.renderTokens( _tokens, context, 0 );
		},

		renderTokens: function( tokens, context, depth ) {
			var buffer = '';
			var self = this;
			var token, value;

			for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
				token = tokens[i];
				
				switch (token.type) {
					case 'loop':
						value = context.get(token.value);

						if (!value) {
							continue;
						}

						if (Array.isArray(value)) {
							for (var j = 0, valueLength = value.length; j < valueLength; ++j) {
								buffer += this.renderTokens(token.data, context.child(value[j]), depth + 1);
							}
						} 
						else if (typeof value === 'object' || typeof value === 'string') {
							buffer += this.renderTokens(token.data, context.child(value), depth + 1);
						} 
						else if (isFunction(value)) {
							//if (typeof originalTemplate !== 'string') {
							//	throw new Error('Cannot use higher-order sections without the original template');
							//}

							// Extract the portion of the original template that the section contains.
							//value = value.call(context.view, originalTemplate.slice(token[3], token[5]), subRender);

							//if (value != null) {
							//	buffer += value;
							//}
						} 
						else {
							buffer += this.renderTokens(token.data, context, depth + 1);
						}
						
						break;
					
					case 'if':
						value = context.convert(token.value);

						if ( eval(value) === true ) {
							buffer += this.renderTokens(token.data, context, depth + 1);
						}

						break;

					case '=':
					case 'name':
						value = context.get(token.value);

						if ( typeof value === 'object' ) {
							value = JSON.stringify( value );
						}

						if (value != null) {
							buffer += escapeHTML(value);
						}

					break;

					case 'text':
						buffer += token.value;

					break;
				}
			}

			return buffer;
		},

		tokens: function() {
			return _tokens;
		}
	};
},

TemplateManager = (function TemplateManager() {

	return {

		parse: function( html ) {
			var template = new Template();
			template.parse( html );
			return template;
		},

		render: function( template, data ) {
			if ( typeof template === "string" ) {
				template = this.parse( template );
			}

			return template.render( data );
		}
	};
})();

// Functions
function parseHTML( html, tags ) {
	if ( !html ) {
		return [];
	}

	var sections = [];
	var tokens = [];
	var spaces = [];
	var hasTag = false;
	var nonSpace = false;
	var regExp = {}

	function stripSpace() {
		if (hasTag && !nonSpace) {
			while (spaces.length) {
				delete tokens[spaces.pop()];
			}
		} else {
			spaces = [];
		}

		hasTag = false;
		nonSpace = false;
    }

	function compileTags(tags) {
		if (typeof tags === 'string') {
			tags = tags.split(ReqularExpression.space, 2);
		}

		if ( !Array.isArray(tags) || tags.length !== 2) {
			throw new Error('Invalid tags: ' + tags);
		}

		regExp.openingTag = new RegExp(escapeRegExp(tags[0]) + '\\s*');
		regExp.closingTag = new RegExp('\\s*' + escapeRegExp(tags[1]));
		regExp.closingCurly = new RegExp('\\s*' + escapeRegExp('}' + tags[1]));
	}

    compileTags(tags || Config.tags);

    var scanner = new Scanner(html);
    var start, type, value, chr, token, openSection;

    while (!scanner.eos()) {
		start = scanner.pos;

		// Match any text between tags.
		value = scanner.scanUntil(regExp.openingTag);

		if (value) {
			for (var i = 0, valueLength = value.length; i < valueLength; ++i) {
				chr = value.charAt(i);

				if (isWhitespace(chr)) {
					spaces.push(tokens.length);
				} 
				else {
					nonSpace = true;
				}
				
				tokens.push({
					'type': 'text',
					'value': chr,
					'start': start,
					'end': start+1
				});
			}

			start = start + 1;

			// Check for whitespace on the current line.
			if (chr === '\n') {
				stripSpace();
			}
		}

		// Match the opening tag.
		if (!scanner.scan(regExp.openingTag)) {
			break;
		}

		hasTag = true;

		// Get the tag type.
		type = scanner.scan(ReqularExpression.command) || 'name';
		scanner.scan(ReqularExpression.white);

		// Get the tag value.
		value = scanner.scanUntil(regExp.closingTag);
		
		// Match the closing tag.
		if (!scanner.scan(regExp.closingTag)) {
			throw new Error('Unclosed tag at ' + scanner.pos);
		}

		token = { 'type': type, 'value': value, 'start': start, 'end': scanner.pos };
		tokens.push(token);

		if (type === 'loop' || type === 'if') {
			sections.push(token);
		} else if (type === '/') {
			openSection = sections.pop();
		}
	}

	// Make sure there are no open sections when we're done.
	openSection = sections.pop();

	if (openSection) {
		throw new Error('Unclosed section "' + openSection[1] + '" at ' + scanner.pos);
	}

	return nestTokens(squashTokens(tokens));
}

function Scanner(string) {
	this.string = string;
	this.tail = string;
	this.pos = 0;
}

Scanner.prototype.eos = function () {
	return this.tail === "";
};

Scanner.prototype.scan = function (re) {
	var match = this.tail.match(re);

	if (!match || match.index !== 0)
	  return '';

	var string = match[0];

	this.tail = this.tail.substring(string.length);
	this.pos += string.length;

	return string;
};

Scanner.prototype.scanUntil = function (re) {
	var index = this.tail.search(re), match;

	switch (index) {
		case -1:
			match = this.tail;
			this.tail = "";
			break;

		case 0:
			match = "";
			break;

		default:
		  	match = this.tail.substring(0, index);
		  	this.tail = this.tail.substring(index);
	}

	this.pos += match.length;

	return match;
};

function isFunction(object) {
	return typeof object === 'function';
}

function isWhitespace(string) {
	return ! RegExp.prototype.test.call(ReqularExpression.nonSpace, string);
}

function isVariable(string) {
	return RegExp.prototype.test.call(ReqularExpression.variable, string);
}

function getVariable(string) {
	var index = string.search(/\$/);
	if ( index > -1 ) {
		return string.substring(index+1);
	}
	return string;
}

function escapeRegExp(string) {
	return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
}

function escapeHTML(string) {
	return String(string).replace(/[&<>"'\/]/g, function (s) {
		return EscapeStrings[s];
	});
}

function nestTokens(tokens) {
	var nestedTokens = [];
	var collector = nestedTokens;
	var sections = [];
	var token, section;

	for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
		token = tokens[i];

		switch (token.type) {
			case 'loop':
			case 'if':
				collector.push(token);
				sections.push(token);
				collector = token.data = [];
				break;

			case '/':
				section = sections.pop();

				if ( section ) {
					section.offset = token.start;
					collector = sections.length > 0 ? sections[sections.length - 1].data : nestedTokens;
				}
				break;

			default:
				collector.push(token);
		}
	}

	return nestedTokens;
}

function squashTokens(tokens) {
	var squashedTokens = [];
	var token, lastToken;

	for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
		token = tokens[i];

		if (token) {
			if (token.type === 'text' && lastToken && lastToken.type === 'text') {
				lastToken.value += token.value;
				lastToken.end = token.end;
			} else {
				squashedTokens.push(token);
				lastToken = token;
			}
		}
	}

	return squashedTokens;
}

UI.register("Template", TemplateManager );

})(window);/*! UIKit & UIComponent */

(function(window, undefined) {

'use strict';

var 
Class = UI.Class,
Responder = Class.Responder,

UIPluginDragDelegate = function UIPluginDragDelegate() {
	return {
		didStartDrag: 	false,
		didDrag:		false,
		didEndDrag:		false
	};
},

UIPluginDrag = Class({
	name: "UIPluginDrag",
	parent: Responder,
	constructor: function() {
	
		var _instance, _info, _delegate, _delegateCan;
		
		_info = {
			element: undefined,
			eventHandler: undefined,
			
			interaction: {
				hasTouch: ('ontouchstart' in window) ? true : false,
				startTime: 0,
				beginPoint: {x:0, y:0},
				currentPoint: {x:0, y:0},
				dragOffset: {x:0, y:0},
				dragging: false,
				startInteraction: false,
				globalUp: false,
				globalMove: false
			}
		};
		
		_delegate = undefined;
		_delegateCan = new UIPluginDragDelegate();
		
		return {
			_event: function( e ) {
				var pageX = 0, pageY = 0, timeStamp = 0;
	
				if ( e.originalEvent && e.originalEvent.touches != undefined ) {
					var touch = e.originalEvent.touches[0];
					if ( touch ) {
						timeStamp = touch.timeStamp;
						pageX = touch.clientX;
						pageY = touch.clientY;
					}
					else {
						//console.log( e, e.originalEvent );
					
						timeStamp = e.timeStamp;
						pageX = e.pageX;
						pageY = e.pageY;
					}
				}
				else if (  e.touches != undefined ) {
					var touch = e.touches[0];
					if ( touch ) {
						timeStamp = touch.timeStamp;
						pageX = touch.clientX;
						pageY = touch.clientY;
					}
					else {
						timeStamp = e.timeStamp;
						pageX = e.pageX;
						pageY = e.pageY;
					}
				}
				else {
					timeStamp = e.timeStamp;
					pageX = e.pageX;
					pageY = e.pageY;
				}
				
				return {
					timeStamp: timeStamp || (new Date()).getTime(),
					pageX: pageX,
					pageY: pageY	
				};	
			},
		
			_timeStamp: function() {
				return (new Date()).getTime();
			},
			
			_start: function(e) {
				var event = this._event(e);
				
				_info.interaction.startTime = this._timeStamp();		
				_info.interaction.beginPoint.x = _info.interaction.currentPoint.x = event.pageX;
				_info.interaction.beginPoint.y = _info.interaction.currentPoint.y = event.pageY;
				
				_info.interaction.clickable = true;
				_info.interaction.startInteraction = true;
				_info.interaction.dragOffset.x = 0;
				_info.interaction.dragOffset.y = 0;
				_info.interaction.globalUp = true;
				
				document.body.addEventListener(_info.interaction.hasTouch ? "touchend" : "mouseup", _info.eventHandler, false);
				
				return true;
			},
			
			_move: function(e) {
			
				e.preventDefault();
			
				if ( _info.interaction.startInteraction ) {
					var point, wasPoint, moveX, moveY, toX, toY, event = this._event(e),
					point = {x:event.pageX, y:event.pageY};
					wasPoint = {x:_info.interaction.currentPoint.x, y:_info.interaction.currentPoint.y};
					
					if ( _info.interaction.dragging == false ) {
						if ( _delegateCan.didStartDrag ) {
							_delegate.didStartDrag( this );
						}
						
						this.dispatchEvent( "startDragging", this );
					}
					
					_info.interaction.clickable = false;
					_info.interaction.dragging = true;
					_info.interaction.currentPoint.x = event.pageX;
					_info.interaction.currentPoint.y = event.pageY;
					
					if ( _info.interaction.dragging == true ) {
						moveX = point.x - wasPoint.x;
						moveY = point.y - wasPoint.y;
						
						_info.interaction.dragOffset.x += moveX;
						_info.interaction.dragOffset.y += moveY;
						
						if ( _info.interaction.globalMove == false ) {
							_info.interaction.globalMove = true;
							document.body.addEventListener(_info.interaction.hasTouch ? "touchmove" : "mousemove", _info.eventHandler, true);
						}
						
						if ( _delegateCan.didDrag ) {
							_delegate.didDrag( this, moveX, moveY );
						}
						
						this.dispatchEvent( "dragging", this );
					}
				}
				
				return true;
			},
			
			_end: function(e, leave) {
			
				if ( _info.interaction.globalMove === true ) {
					_info.interaction.globalMove = false;
					document.body.removeEventListener(_info.interaction.hasTouch ? "touchmove" : "mousemove", _info.eventHandler, true);
				}
				
				if ( _info.interaction.globalUp === true ) {
					_info.interaction.globalUp = false;
					document.body.removeEventListener(_info.interaction.hasTouch ? "touchend" : "mouseup", _info.eventHandler, false);
				}
			
				if ( _info.interaction.startInteraction ) {
					var duration, point, wasPoint, moveX, moveY, event = this._event(e);
					duration = (event.timeStamp || this._timeStamp()) - _info.interaction.startTime;
					
					if ( _info.interaction.dragging == true ) {
						_info.interaction.dragging = false;
						
						if ( _delegateCan.didEndDrag ) {
							_delegate.didEndDrag( this );
						}
						
						this.dispatchEvent( "endDragging", this, duration, leave );
					}
					
					_info.interaction.startInteraction = false;
				}
				
				return true;	
			},

		
			_eventHandler: function(e) {
				var result = true;
				
				switch (e.type) {
					case "mousedown":
					case "touchstart":
						result = this._start( e );
					break;
					
					case "mousemove":
					case "touchmove":
						result = this._move( e );
					break;
					
					case "mouseup":
					case "mouseleave":
					case "touchend":
					case "touchcancel":
						result = this._end( e, ( e.type === "mouseleave" ) );
					break;
				}
				
				return result;	
			},
			
			delegate: function( delegate ) {
				if ( delegate === undefined ) {
					return;
				}
			
				_delegate = delegate;
				
				_delegateCan.didStartDrag	= (typeof _delegate.didStartDrag === "function" );
				_delegateCan.didDrag		= (typeof _delegate.didDrag === "function" );
				_delegateCan.didEndDrag		= (typeof _delegate.didEndDrag === "function" );
			},
			
			setupElements: function() {
				this.delegate( _instance );
			},
			
			setupEvents: function() {
				_info.element = _instance.element();
				_info.eventHandler = this.context(this._eventHandler, this);
			
				_instance.addEventListener(_info.interaction.hasTouch ? "touchstart" : "mousedown", _info.eventHandler, true);
				_instance.addEventListener(_info.interaction.hasTouch ? "touchmove" : "mousemove", _info.eventHandler, true);
				_instance.addEventListener(_info.interaction.hasTouch ? "touchend" : "mouseup", _info.eventHandler, true);
				
				if ( _info.interaction.hasTouch ) {
					_instance.addEventListener("touchcancel", _info.eventHandler, true);
				}
				else {
					$(_info.element).bind("mousewheel", _info.eventHandler );
					$(document).bind("mouseleave", _info.eventHandler );
				}
			},
			
			destroy: function() {
				
				_instance.removeEventListener("mousedown", _info.eventHandler, true);
				_instance.removeEventListener("mousemove", _info.eventHandler, true);
				_instance.removeEventListener("mouseup", _info.eventHandler, true);
				
				_instance.removeEventListener("touchstart", _info.eventHandler, true);
				_instance.removeEventListener("touchmove", _info.eventHandler, true);
				_instance.removeEventListener("touchend", _info.eventHandler, true);
				_instance.removeEventListener("touchcancel", _info.eventHandler, true);
				
				document.body.removeEventListener("mouseup", _info.eventHandler, false);
				document.body.removeEventListener("touchend", _info.eventHandler, false);
				
				$(_info.element).unbind("mousewheel");
				$(document).unbind("touchstart" );
				$(document).unbind("mouseleave" );
				
				this._super("destroy", arguments);
			},
		
			init: function( instance ) {
				var self = this._super("init", arguments);
				if (self) {
					_instance = instance;
				
					this.setupElements();
					this.setupEvents();
					
					return this;
				}
			}
		}
	}
});

})(window);


(function(window, undefined) {

'use strict';
	
var 

Class = UI.Class,
Core = UI.Core,
Element = Class.Element,
Tween = Class.Tween,

UICore = Class({
	name:"UICore",
	parent:Element,
	constructor: function() {
		
		return {
			init: function( element ) {
				var self = this._super("init", arguments);
				if (self) {
					
					return this;
				}
			}
		};
	}
});


})(window);


(function(window, undefined) {

'use strict';

var 
Class = UI.Class,
UICore = Class.UICore,

UIGraph = Class({
	name: "UIGraph",
	parent: UICore,
	constructor: function(  ) {
		
		var _canvas, _context;
		
		return {
			_createCanvas: function() {
				var canvas, elements = this.element().getElementsByTagName('canvas');
				if ( elements.length > 0 ) {
					canvas = elements[0];
				}
				
				if ( canvas == undefined ) {
					canvas = document.createElement("canvas");
				}
				
				var size = this.size();
				canvas.setAttribute( "width", size.width * 2);
				canvas.setAttribute( "height", size.height * 2);
				
				$(canvas).css({
					width: size.width,
					height: size.height
				});
				
				canvas.imageSmoothingEnabled= true;
				
				return canvas;
			},
			
			canvasSize: function() {
				return {
					width: _canvas.width,
					height: _canvas.height
				};
			},
		
			canvas: function() {
				return _canvas;	
			},
			
			context: function() {
				return _context;	
			},
		
			init: function( element ) {
				var self = this._super("init", arguments);
				if ( self ) {
					
					_canvas = this._createCanvas();
					_context = _canvas.getContext("2d");
					
					if ( ! this.element().contains( _canvas ) ) {					
						this.element().appendChild(_canvas);
					}
					
					_context.clearRect(0, 0, _canvas.width, _canvas.height);
					
					return this;
				};
			},
			
			clear: function() {
				_context.clearRect(0, 0, _canvas.width, _canvas.height);
			},
			
			drawRect: function() {
				
			}
		}
	}
}),

UIGraphLine = Class({
	name: "UIGraphLine",
	parent: UIGraph,
	constructor: function() {
		
		var graphData, range, 
			config = {
				scaleLineColor: "rgba(0,0,0,.05)",
				scaleLineWidth: 2,
				scaleFontStyle: "normal",
				scaleFontSize: 16,
				scaleFontFamily: "'Arial'",
				scaleFontColor: "rgba(0,0,0,.5)",
				bezierCurve: true,
				strokeWidth: 4,
				pointSize: 8,
				pointStrokeWidth: 4,
				margin: {
					top: 20,
					right: 30,
					bottom: 40,
					left: 60
				},
				scaleStepCount: 20
			}, 
			stepLabels = [];
		
		return {
			
			calculateSegments: function( data ) {
				var segments = [];
				var xHop = Math.ceil(range.size.width/(data.length-1));
			
				for ( var i=0; i<data.length; i++ ) {
					var segment = {
						cx:(i==0) ? range.min.x : range.min.x + xHop * (i-0.5), 
						cy:(i==0) ? range.min.y : range.min.y + range.size.height - range.size.height * ((data[i-1]-range.minValue)/(range.maxValue-range.minValue)),
						x:range.min.x + (i*xHop),
						y:range.min.y + range.size.height - range.size.height * ((data[i]-range.minValue)/(range.maxValue-range.minValue))
					};
				
					segments.push( segment );
				}
				
				return segments;
			},
		
			drawRect: function() {
				var ctx = this.context();
				var yHop = range.size.height/(stepLabels.length-1);
				
				for (var i=0; i<graphData.datasets.length; i++){
					var segment;
					var dataset = graphData.datasets[i];
					var segments = this.calculateSegments( dataset.data );
					var lineColor, lineWidth, bezierCurve, fillColor, pointSize, pointColor;
					var valueHop = Math.ceil((range.size.width)/(segments.length-1));
					
					lineColor = dataset.strokeColor;
					lineWidth = config.strokeWidth;
					bezierCurve = config.bezierCurve;
					fillColor = dataset.fillColor;
					pointSize = config.pointSize;
					pointColor = dataset.pointColor;
					
					ctx.beginPath();
					
					segment = segments[0];
					ctx.moveTo(segment.x, segment.y);
					ctx.stroke();
					
					for (var j=1; j<segments.length; j++) {
						segment = segments[j];
						
						ctx.strokeStyle = lineColor;
						ctx.lineWidth = lineWidth;
						
						if ( bezierCurve === true ) {
							ctx.bezierCurveTo(segment.cx, segment.cy, segment.cx, segment.y, segment.x, segment.y);
						}
						else {
							ctx.lineTo(segment.x, segment.y);
						}
						
						ctx.stroke();
					}
					
					if ( fillColor !== undefined ) {
						ctx.lineTo(segment.x, range.max.y);
						ctx.lineTo(range.min.x, range.max.y);
						ctx.closePath();
					
						ctx.fillStyle = fillColor;
						ctx.fill();
					}
					else {
						ctx.closePath();
					}
						
					ctx.fillStyle = pointColor;
					ctx.strokeStyle = "rgba(255,255,255,1)";
					ctx.lineWidth = config.pointStrokeWidth;
					
					for (var j=0; j<segments.length; j++) {
						segment = segments[j];
						
						ctx.beginPath();
						ctx.arc(segment.x, segment.y, pointSize, 0, Math.PI*2, false);
						ctx.fill();
						ctx.stroke();
					}
					
					ctx.closePath();
				}
			},
			
			drawScale: function() {
				var size = this.canvasSize();
				var ctx = this.context();
				var xHop = Math.ceil(range.size.width/(graphData.labels.length-1));
				var yHop = range.size.height/(stepLabels.length-1);
				
				//X axis
				ctx.fillStyle = config.scaleFontColor;
				ctx.font = config.scaleFontStyle + " " + config.scaleFontSize + "px " + config.scaleFontFamily;
				ctx.textAlign = "center";
				
				for (var i=0; i<graphData.labels.length; i++) {
				
					ctx.fillText(graphData.labels[i], range.min.x + i*xHop, range.max.y + (config.margin.bottom-config.scaleFontSize));
	
					ctx.beginPath();
					ctx.moveTo(range.min.x + i*xHop, range.min.y);
					ctx.lineWidth = config.scaleLineWidth;
					ctx.strokeStyle = config.scaleLineColor;
					ctx.lineTo(range.min.x + i*xHop, range.max.y + 8);
					
					ctx.stroke();
					
				}
				
				//Y axis
				ctx.fillStyle = config.scaleFontColor;
				ctx.font = config.scaleFontStyle + " " + config.scaleFontSize + "px " + config.scaleFontFamily;
				ctx.textAlign = "right";
				ctx.textBaseline = "middle";
				
				for (var j=0; j<stepLabels.length; j++) {
				
					if ( j < stepLabels.length) {
						ctx.fillText(stepLabels[j], range.min.x - (config.pointSize+5), range.max.y-j*yHop);
					}
					
					ctx.beginPath();
					ctx.moveTo(range.min.x - 8, range.max.y-j*yHop);
					ctx.lineWidth = config.scaleLineWidth;
					ctx.strokeStyle = config.scaleLineColor;
					ctx.lineTo(range.max.x, range.max.y-j*yHop);
					ctx.stroke();
				}
				
				ctx.closePath();
			},
			
			calculate: function() {
				var size = this.canvasSize();
				var minValue = 0;
				var maxValue = 100;
				
				if ( graphData.range !== undefined && graphData.range.minValue !== undefined ) {
					minValue = graphData.range.minValue;
				}
				else {
					for (var i=0; i<graphData.datasets.length; i++) {
						var dataset = graphData.datasets[i];
						minValue = Math.min( Math.min.apply( dataset.data, dataset.data ), minValue );
					}
					
					minValue = Math.floor( minValue / config.scaleStepCount ) * config.scaleStepCount;
					minValue = Math.floor(minValue * 0.01) * 100;
				}
				
				if ( graphData.range !== undefined && graphData.range.maxValue !== undefined ) {
					maxValue = graphData.range.maxValue;
				}
				else {
					for (var i=0; i<graphData.datasets.length; i++) {
						var dataset = graphData.datasets[i];
						maxValue = Math.max( Math.max.apply( dataset.data, dataset.data ), maxValue );
					}
					
					maxValue = Math.ceil( maxValue / config.scaleStepCount ) * config.scaleStepCount;
					maxValue = Math.ceil(maxValue * 0.01) * 100;
				}
				
				range = {
					min: {
						x: config.margin.left,
						y: config.margin.top,
					},
					max: {
						x: size.width - config.margin.right,
						y: size.height - config.margin.bottom
					},
					size: {
						width: size.width - config.margin.left - config.margin.right,
						height: size.height - config.margin.bottom - config.margin.top
					},
					
					minValue: minValue,
					maxValue: maxValue
				};
				
				var scaleStepHop = (maxValue-minValue) / config.scaleStepCount;
				
				stepLabels = [];
				
				for (var i=0; i<=config.scaleStepCount; i++) {
					stepLabels[i] = Math.ceil(minValue + i*scaleStepHop);
				}
			},
		
			init: function(  element, data  ) {
				var self = this._super("init", arguments );
				if ( self ) {
					graphData = data;
					
					this.clear();
					this.calculate();
					this.drawScale();
					this.drawRect();
					
					return this;
				};
			}
		}
	}
}),

UIGraphBar = Class({
	name: "UIGraphBar",
	parent: UIGraph,
	constructor: function() {
	
		var graphData, range, 
			config = {
				scaleLineColor: "rgba(0,0,0,.05)",
				scaleLineWidth: 2,
				scaleFontFamily: "'Arial'",
				scaleFontStyle: "normal",
				scaleFontSize: 16,
				scaleFontColor: "rgba(0,0,0,.5)",
				strokeWidth : 2,
				pointSize: 8,
				pointStrokeWidth: 4,
				margin: {
					top: 20,
					right: 30,
					bottom: 40,
					left: 60
				},
				scaleStepCount: 10
			},
			stepLabels = [];
		
		return {
			calculateSegments: function( data, dataIndex ) {
				var segments = [];
				var size = this.canvasSize();
				var xHop = Math.ceil(range.size.width/(data.length));
				var barWidth = Math.ceil(((xHop-config.scaleLineWidth*2)*0.8-((config.strokeWidth*2+4)*graphData.datasets.length)) / graphData.datasets.length);
				var barHop = (xHop - (barWidth*graphData.datasets.length)) / graphData.datasets.length;
				
				for ( var i=0; i<data.length; i++ ) {
					var segment = [
						{
							x:range.min.x + (i*xHop) + barHop + (4 + barWidth)*dataIndex,
							y:range.max.y
						},
					
						{
							x:range.min.x + (i*xHop) + barHop + (4 + barWidth)*dataIndex,
							y:range.max.y - range.size.height * (data[i]/range.maxValue)
						},
							
						{
							x:range.min.x + (i*xHop) + barHop + (4 + barWidth)*dataIndex + barWidth,
							y:range.max.y - range.size.height * (data[i]/range.maxValue)
						},
					
						{
							x:range.min.x + (i*xHop) + barHop + (4 + barWidth)*dataIndex + barWidth,
							y:range.max.y
						}
					];
				
					segments.push(segment);
				}
				
				return segments;
			},
		
			drawRect: function() {
				var ctx = this.context();
				
				for (var i=0; i<graphData.datasets.length; i++){
					var segment;
					var dataset = graphData.datasets[i];
					var segments = this.calculateSegments( dataset.data, i );
					var strokeColor, lineWidth, fillStyle;
					
					strokeColor = dataset.strokeColor;
					lineWidth = config.strokeWidth;
					fillStyle = dataset.fillColor;
					
					for (var j=0; j<segments.length; j++) {
						ctx.beginPath();
						
						segment = segments[j][0];
						ctx.moveTo(segment.x, segment.y);
						
						for ( var k=1; k<segments[j].length; k++ ) {
							segment = segments[j][k];
							ctx.lineTo(segment.x, segment.y);
						}
						
						if ( strokeColor ){
							ctx.strokeStyle = strokeColor;
							ctx.lineWidth = lineWidth;
							ctx.stroke();
						}
						
						ctx.fillStyle = fillStyle;
						ctx.closePath();
						ctx.fill();
					}
				}	
			},
			
			drawScale: function() {
				var size = this.canvasSize();
				var ctx = this.context();
				
				//X axis
				ctx.fillStyle = config.scaleFontColor;
				ctx.font = config.scaleFontStyle + " " + config.scaleFontSize + "px " + config.scaleFontFamily;
				ctx.textAlign = "center";
				
				var xHop = Math.ceil(range.size.width/(graphData.labels.length));
				for (var i=0; i<=graphData.labels.length; i++) {
				
					if ( i < graphData.labels.length ) {
						ctx.fillText(graphData.labels[i], range.min.x + i*xHop + xHop*0.5, range.max.y + (config.margin.bottom-config.scaleFontSize));
					}
	
					ctx.beginPath();
					ctx.moveTo(range.min.x + i*xHop, range.min.y);
					ctx.lineWidth = config.scaleLineWidth;
					ctx.strokeStyle = config.scaleLineColor;
					ctx.lineTo(range.min.x + i*xHop, range.max.y);
					
					ctx.stroke();
					
				}
				
				//Y axis
				ctx.fillStyle = config.scaleFontColor;
				ctx.font = config.scaleFontStyle + " " + config.scaleFontSize + "px " + config.scaleFontFamily;
				ctx.textAlign = "right";
				ctx.textBaseline = "middle";
				
				var yHop = range.size.height/(stepLabels.length-1);
				for (var j=0; j<stepLabels.length; j++) {
				
					if ( j > 0 ) {
						ctx.fillText(stepLabels[j], range.min.x - (config.pointSize+5), range.max.y-j*yHop);
					}
					
					ctx.beginPath();
					ctx.moveTo(range.min.x, range.max.y-j*yHop);
					ctx.lineWidth = config.scaleLineWidth;
					ctx.strokeStyle = config.scaleLineColor;
					ctx.lineTo(range.max.x, range.max.y-j*yHop);
					ctx.stroke();
				}
				
				ctx.closePath();
			},
			
			calculate: function() {
				var size = this.canvasSize();
				var maxValue = 100;
					
				for (var i=0; i<graphData.datasets.length; i++) {
					var dataset = graphData.datasets[i];
					maxValue = Math.max( Math.max.apply( dataset.data, dataset.data ), maxValue );
				}
				
				maxValue = Math.ceil( maxValue / config.scaleStepCount ) * config.scaleStepCount;
			
				range = {
					min: {
						x: config.margin.left,
						y: config.margin.top,
					},
					max: {
						x: size.width - config.margin.right,
						y: size.height - config.margin.bottom
					},
					size: {
						width: size.width - config.margin.left - config.margin.right,
						height: size.height - config.margin.bottom - config.margin.top
					},
					maxValue: maxValue
				};
				
				stepLabels = [];
				
				var scaleStepHop = Math.ceil(maxValue / config.scaleStepCount);
				for (var i=0; i<=config.scaleStepCount; i++) {
					stepLabels[i] = i * scaleStepHop;
				}
			},
		
			init: function( element, data ) {
				var self = this._super("init", arguments);
				if ( self ) {
					
					graphData = data;
					
					this.clear();
					this.calculate();
					this.drawScale();
					this.drawRect();
					
					return this;
				};
			}
		}
	}
}),

UIGraphPie = Class({
	name: "UIGraphPie",
	parent: UIGraph,
	constructor: function() {
		
		var graphData, config = {
			strokeWidth : 4
		};
		
		return {
			calculateSegments: function( data ) {
				var segments = [];
				var size = this.canvasSize();
				var totalValue, cumulativeAngle;
				
				totalValue = 0;
				
				for (var i=0; i<data.length; i++){
					totalValue += data[i].value;
				}
				
				cumulativeAngle = -Math.PI/2;
			
				for ( var i=0; i<data.length; i++ ) {
					var segmentAngle = (data[i].value/totalValue) * (Math.PI*2);
					var segmentStrokeWidth = config.strokeWidth;
					var segmentStrokeColor = "rgba(255,255,255,1)";
					
					segments.push({
						x: size.width * 0.5,
						y: size.height * 0.5,
						cumulativeAngle: cumulativeAngle,
						segmentAngle: segmentAngle,
						segmentStrokeWidth: segmentStrokeWidth,
						segmentStrokeColor: segmentStrokeColor,
						fillColor: data[i].color
					});
					
					cumulativeAngle += segmentAngle;
				}
				
				return segments;
			},
		
			drawRect: function() {
				var ctx = this.context();
				
				var dataset = graphData;
				var size = this.canvasSize();
				var segments = this.calculateSegments( dataset.data );
				var segment, pieRadius, fillStyle;
				
				pieRadius = Math.min(size.height*0.5, size.width*0.5) - 5;
				
				for (var i=0; i<segments.length; i++) {
					segment = segments[i];
					
					ctx.beginPath();
					ctx.arc(segment.x, segment.y, pieRadius, segment.cumulativeAngle, segment.cumulativeAngle + segment.segmentAngle);
					ctx.lineTo(segment.x, segment.y);
					ctx.closePath();
					ctx.fillStyle = segment.fillColor;
					ctx.fill();
					
					if (segment.segmentStrokeWidth){
						ctx.lineWidth = segment.segmentStrokeWidth;
						ctx.strokeStyle = segment.segmentStrokeColor;
						ctx.stroke();
					}
				}
			},
		
			init: function( element, data ) {
				var self = this._super("init", arguments);
				if ( self ) {
					
					graphData = data;
					
					this.clear();
					this.drawRect();
					
					return this;
				};
			}
		}
	}
}),

UIGraphRadar = Class({
	name: "UIGraphRadar",
	parent: UIGraph,
	constructor: function() {
		
		var graphData, range, config = {
			strokeWidth : 2,
			pointSize: 8,
			scaleFontFamily: "'Arial'",
			scaleFontStyle: "normal",
			scaleFontSize: 12,
			scaleFontColor: "rgba(0,0,0,.5)",
			scaleLineColor: "rgba(0,0,0,.05)",
			scaleLineWidth: 2,
			scaleBackgroundColor: "rgba(255,255,255,1)",
			pointLabelFontFamily: "'Arial'",
			pointLabelFontStyle: "normal",
			pointLabelFontColor: "rgba(0,0,0,.5)",
			pointLabelFontSize: 14,
			angleShowLineOut: true,
			angleLineColor: "rgba(0,0,0,.1)",
			angleLineWidth: 1,
			scaleStepCount: 10,
			paddingSize: {
				width: 160,
				height: 160
			}
		},
		stepLabels = [];
		
		return {
			
			calculateSegments: function( data ) {
				var segments = [];
				var totalValue = 0;
				
				for (var i=0; i<data.length; i++){
					totalValue += data[i];
				}
			
				for ( var i=0; i<data.length; i++ ) {
					
					segments.push({
						x: 0,
						y: (range.size.width*0.5) * (data[i]/100)*-1
					});
				}
				
				return segments;
			},
			
			drawScale: function() {
				var ctx = this.context();
				
				ctx.save();
			    ctx.translate(range.center.x, range.center.y);
				
				if (config.angleShowLineOut){
					ctx.strokeStyle = config.angleLineColor;		    	    
					ctx.lineWidth = config.angleLineWidth;
					for (var h=0; h<range.count; h++){
					    ctx.rotate(range.rotationDegree);
						ctx.beginPath();
						ctx.moveTo(0,0);
						ctx.lineTo(0,-range.maxSize);
						ctx.stroke();
					}
				}
				
				var scaleHop = range.maxSize/config.scaleStepCount;
				
				for (var i=0; i<config.scaleStepCount; i++){
					ctx.beginPath();
					
					ctx.strokeStyle = config.scaleLineColor;
					ctx.lineWidth = config.scaleLineWidth;
					ctx.moveTo(0,-scaleHop * (i+1));					
					
					for (var j=0; j<range.count; j++){
					    ctx.rotate(range.rotationDegree);
						ctx.lineTo(0,-scaleHop * (i+1));
					}
					
					ctx.closePath();
					ctx.stroke();
					
					ctx.textAlign = 'center';
					ctx.font = config.scaleFontStyle + " " + config.scaleFontSize+"px " + config.scaleFontFamily; 
					ctx.textBaseline = "middle";
					
					var textWidth = ctx.measureText(stepLabels[i+1]).width;
					ctx.fillStyle = config.scaleBackgroundColor;
					ctx.beginPath();
					ctx.rect(
						Math.round(- textWidth/2 - 2),     //X
						Math.round((-scaleHop * (i+1)) - config.scaleFontSize*0.5 - 2),//Y
						Math.round(textWidth + (2*2)), //Width
						Math.round(config.scaleFontSize + (2*2)) //Height
					);
					ctx.fill();
								
					ctx.fillStyle = config.scaleFontColor;
					ctx.fillText(stepLabels[i+1],0,-scaleHop*(i+1));
				}
				
				for (var k=0; k<graphData.labels.length; k++){				
					ctx.font = config.pointLabelFontStyle + " " + config.pointLabelFontSize+"px " + config.pointLabelFontFamily;
					ctx.fillStyle = config.pointLabelFontColor;
					
					var opposite = Math.sin(range.rotationDegree*k) * (range.maxSize + config.pointLabelFontSize);
					var adjacent = Math.cos(range.rotationDegree*k) * (range.maxSize + config.pointLabelFontSize);
					
					if(range.rotationDegree*k == Math.PI || range.rotationDegree*k == 0){
						ctx.textAlign = "center";
						adjacent = adjacent + config.scaleFontSize;
					}
					else if(range.rotationDegree*k > Math.PI){
						ctx.textAlign = "right";
					}
					else{
						ctx.textAlign = "left";
					}
					
					ctx.textBaseline = "middle";
					
					ctx.fillText(graphData.labels[k], opposite, -adjacent);
					
				}
				
				ctx.restore();
			},
		
			drawRect: function() {
				var ctx = this.context();
				var size = this.canvasSize();
				
				ctx.translate(range.center.x, range.center.y);
				
				for (var i=0; i<graphData.datasets.length; i++){
					var segment;
					var dataset = graphData.datasets[i];
					var segments = this.calculateSegments( dataset.data );
					
					ctx.save();
					
					ctx.beginPath();
					
					segment = segments[0];
					//ctx.rotate(rotationDegree);
					ctx.moveTo(0,segment.y);
					
					//We accept multiple data sets for radar charts, so show loop through each set
					for (var j=1; j<segments.length; j++){
						segment = segments[j];
						
						ctx.rotate(range.rotationDegree);
						ctx.lineTo(0, segment.y);
					}
					
					ctx.closePath();
					
					ctx.fillStyle = dataset.fillColor;
					ctx.strokeStyle = dataset.strokeColor;
					ctx.lineWidth = config.strokeWidth;
					
					ctx.fill();
					ctx.stroke();
					
					ctx.fillStyle = dataset.strokeColor;
					ctx.strokeStyle = "rgba(255,255,255,1)";
					ctx.lineWidth = 4;
					
					for (var j=0; j<segments.length; j++){
						segment = segments[j];
						
						ctx.rotate(range.rotationDegree);
						ctx.beginPath();
						ctx.arc(0, segment.y, config.pointSize, 2*Math.PI, false);
						ctx.fill();
						ctx.stroke();
					}
					
					ctx.closePath();
					
					ctx.rotate(range.rotationDegree);
					
					ctx.restore();
				}
			},
			
			calculate: function() {
				var size = this.canvasSize();
				
				size.width = size.width - config.paddingSize.width;
				size.height = size.height - config.paddingSize.height;
				
				var maxValue = 100;
				var maxCount = 0;
				var maxSize = 0;
				var rotationDegree;
					
				for (var i=0; i<graphData.datasets.length; i++) {
					var dataset = graphData.datasets[i];
					maxValue = Math.max( Math.max.apply( dataset.data, dataset.data ), maxValue );
					maxCount = Math.max( maxCount, dataset.data.length );
				}
				
				maxValue = Math.ceil( maxValue / config.scaleStepCount ) * config.scaleStepCount;
				maxSize = (Math.min(size.width,size.height)*0.5);
				rotationDegree = (2*Math.PI)/maxCount;
			
				range = {
					center: {
						x: size.width*0.5+config.paddingSize.width*0.5,
						y: size.height*0.5+config.paddingSize.height*0.5,
					},
					size: {
						width: size.width,
						height: size.height
					},
					rotationDegree: rotationDegree,
					count: maxCount,
					maxValue: maxValue,
					maxSize: maxSize
				};
				
				stepLabels = [];
				
				var scaleStepHop = Math.ceil(maxValue / config.scaleStepCount);
				for (var i=0; i<=config.scaleStepCount; i++) {
					stepLabels[i] = i * scaleStepHop;
				}
			},
		
			init: function( element, data ) {
				var self = this._super("init", arguments);
				if ( self ) {
					
					graphData = data;
					
					this.clear();
					this.calculate();
					this.drawScale();
					this.drawRect();
					
					return this;
				};
			}
		}
	}
}),

UIGraphDoughnut = Class({
	name: "UIGraphDoughnut",
	parent: UIGraph,
	constructor: function() {
	
		var graphData, config = {
			strokeWidth : 4,
			percentageInnerCutout : 50
		};
		
		return {
			calculateSegments: function( data ) {
				var segments = [];
				var size = this.canvasSize();
				var totalValue, cumulativeAngle;
				
				totalValue = 0;
				
				for (var i=0; i<data.length; i++){
					totalValue += data[i].value;
				}
				
				cumulativeAngle = -Math.PI/2;
			
				for ( var i=0; i<data.length; i++ ) {
					var segmentAngle = (data[i].value/totalValue) * (Math.PI*2);
					var segmentStrokeWidth = config.strokeWidth;
					var segmentStrokeColor = "rgba(255,255,255,1)";
					
					segments.push({
						x: size.width * 0.5,
						y: size.height * 0.5,
						cumulativeAngle: cumulativeAngle,
						segmentAngle: segmentAngle,
						segmentStrokeWidth: segmentStrokeWidth,
						segmentStrokeColor: segmentStrokeColor,
						fillColor: data[i].color
					});
					
					cumulativeAngle += segmentAngle;
				}
				
				return segments;
			},
		
			drawRect: function() {
				var ctx = this.context();
				
				var dataset = graphData;
				var size = this.canvasSize();
				var segments = this.calculateSegments( dataset.data );
				var segment, cutoutRadius, doughnutRadius, fillStyle;
				
				doughnutRadius = Math.min(size.height*0.5, size.width*0.5) - 5;
				cutoutRadius = doughnutRadius * (config.percentageInnerCutout/100);
				
				for (var i=0; i<segments.length; i++) {
					segment = segments[i];
					
					ctx.beginPath();
					ctx.arc(segment.x, segment.y, doughnutRadius, segment.cumulativeAngle, segment.cumulativeAngle + segment.segmentAngle, false);
					ctx.arc(segment.x, segment.y, cutoutRadius, segment.cumulativeAngle + segment.segmentAngle, segment.cumulativeAngle, true);
					ctx.closePath();
					ctx.fillStyle = segment.fillColor;
					ctx.fill();
					
					if (segment.segmentStrokeWidth){
						ctx.lineWidth = segment.segmentStrokeWidth;
						ctx.strokeStyle = segment.segmentStrokeColor;
						ctx.stroke();
					}
				}
			},
			
			init: function( element, data ) {
				var self = this._super("init", arguments);
				if ( self ) {
					
					graphData = data;
					
					this.clear();
					this.drawRect();
					
					return this;
				};
			}
		}
	}
}),

UIGraphPolarArea = Class({
	name: "UIGraphPolarArea",
	parent: UIGraph,
	constructor: function() {
		
		var graphData, range, config = {
			strokeColor: "rgba(255,255,255,1)",
			strokeWidth: 4,
			scaleFontFamily: "'Arial'",
			scaleFontStyle: "normal",
			scaleFontSize: 12,
			scaleFontColor: "rgba(0,0,0,.5)",
			scaleLineColor: "rgba(0,0,0,.05)",
			scaleLineWidth: 2,
			scaleShowLine: true,
			scaleShowLabels: true,
			scaleBackgroundColor: "rgba(255,255,255,0.5)",
			pointLabelFontFamily: "'Arial'",
			pointLabelFontStyle: "normal",
			pointLabelFontColor: "rgba(0,0,0,.5)",
			pointLabelFontSize: 14,
			scaleStepCount: 10,
			paddingSize: {
				width: 100,
				height: 100
			}
		},
		stepLabels = [];
		
		return {
			
			calculateSegments: function( data ) {
				var segments = [];
				var startAngle, radius, angle;
				
				startAngle = -Math.PI/2;
				angle = (Math.PI*2) / data.length;
				
				for ( var i=0; i<data.length; i++ ) {
					radius = data[i].value * (range.size.height/100/2);
					
					segments.push({
						x: range.center.x,
						y: range.center.y,
						radius: radius,
						fromAngle: startAngle,
						toAngle: startAngle + angle,
						fillColor: data[i].color
					});
					
					startAngle += angle;
				}
				
				return segments;
			},
			
			drawScale: function() {
				var ctx = this.context();
				var scaleHop = range.maxSize/config.scaleStepCount;
				
				for (var i=0; i<config.scaleStepCount; i++){
				
					if (config.scaleShowLine){
						ctx.beginPath();
						ctx.arc(range.center.x, range.center.y, scaleHop * (i + 1), 0, (Math.PI * 2), true);
						ctx.strokeStyle = config.scaleLineColor;
						ctx.lineWidth = config.scaleLineWidth;
						ctx.stroke();
					}
	
					if (config.scaleShowLabels){
						ctx.textAlign = "center";
						ctx.font = config.scaleFontStyle + " " + config.scaleFontSize + "px " + config.scaleFontFamily;
	 					var label = stepLabels[i+1];
						
						var textWidth = ctx.measureText(label).width;
						ctx.fillStyle = config.scaleBackgroundColor;
						ctx.beginPath();
						ctx.rect(
							Math.round(range.center.x - textWidth/2 - 2),     //X
							Math.round(range.center.y - (scaleHop * (i + 1)) - config.scaleFontSize*0.5 - 2),//Y
							Math.round(textWidth + (2*2)), //Width
							Math.round(config.scaleFontSize + (2*2)) //Height
						);
						ctx.fill();
						
						ctx.textBaseline = "middle";
						ctx.fillStyle = config.scaleFontColor;
						ctx.fillText(label, range.center.x, range.center.y - (scaleHop * (i + 1)));
					}
				}
			},
		
			drawRect: function() {
				var ctx = this.context();
				var size = this.canvasSize();
				
				var segments = this.calculateSegments( graphData.data );
				var maxSize, scaleHop, steps, segment, rotationDegree = (2*Math.PI)/graphData.data.length;
				
				maxSize = Math.min(size.width, size.height) * 0.5;
				steps = config.scaleStepCount;
				scaleHop = maxSize/steps;
				
				for ( var i=0; i<segments.length; i++ ) {
					segment = segments[i];
				
					ctx.beginPath();
					ctx.arc(segment.x, segment.y, segment.radius, segment.fromAngle, segment.toAngle, false);
					ctx.lineTo(segment.x, segment.y);
					ctx.closePath();
					
					ctx.fillStyle = segment.fillColor;
					ctx.fill();
					
					ctx.strokeStyle = config.strokeColor;
					ctx.lineWidth = config.strokeWidth;
					ctx.stroke();
				}
				
			},
			
			calculate: function() {
				var size = this.canvasSize();
				
				size.width = size.width - config.paddingSize.width;
				size.height = size.height - config.paddingSize.height;
				
				var maxValue = 100;
				var maxSize = 0;
					
				for (var i=0; i<graphData.data.length; i++) {
					var data = graphData.data[i];
					maxValue = Math.max( data.value, maxValue );
				}
				
				maxValue = Math.ceil( maxValue / config.scaleStepCount ) * config.scaleStepCount;
				maxSize = (Math.min(size.width,size.height)*0.5);
			
				range = {
					center: {
						x: size.width*0.5+config.paddingSize.width*0.5,
						y: size.height*0.5+config.paddingSize.height*0.5,
					},
					size: {
						width: size.width,
						height: size.height
					},
					count: graphData.data.length,
					maxValue: maxValue,
					maxSize: maxSize
				};
				
				stepLabels = [];
				
				var scaleStepHop = Math.ceil(maxValue / config.scaleStepCount);
				for (var i=0; i<=config.scaleStepCount; i++) {
					stepLabels[i] = i * scaleStepHop;
				}
			},
		
			init: function( element, data ) {
				var self = this._super("init", arguments);
				if ( self ) {
					
					graphData = data;
					
					this.clear();
					this.calculate();
					this.drawRect();
					this.drawScale();
					
					return this;
				};
			}
		}
	}
});


})(window);
(function(window, undefined) {

'use strict';
	
var 

Class = UI.Class,
Element = Class.Element,
Tween = Class.Tween,
UICore = Class.UICore,

UIScrollContainer = Class({
	name: "UIScrollContainer",
	parent: Element,
	constructor: function() {
		
		return {
			
		};
	}
}),

UIScrollInfo = function UIScrollInfo( target ) {
	var info = {
		contentInset: {top:0, left:0, right:0, bottom:0},
		contentOffset: {x:0, y:0},
		contentSize: {width:0, height:0},
		frameSize: {width:0, height:0},
		pagingSize: {width:0, height:0}, 
		allowScrollOffset: {minX:0, minY:0, maxX:0, maxY:0},
		
		scrolling: false,
		scrollBounceVertical: false,
		scrollBounceHorizontal: false,
		
		usePaging: false,
		
		useScrollBounceVertical: false,
		useScrollBounceHorizontal: false,
		useScrollBar: false,
		useWheelMouse: false,
		useMouseLeave: false,
		useDecelerating: false,
		
		resizable: false,
		
		interaction: {
			hasTouch: ('ontouchstart' in window) ? true : false,
			target: target,
			startTime: 0,
			beginPoint: {x:0, y:0},
			currentPoint: {x:0, y:0},
			dragOffset: {x:0, y:0},
			dragging: false,
			startInteraction: false,
			clickable: false,
			globalUp: false,
			globalMove: false,
			wheelTimeout: null
		}
	};
	
	return info;
},

UIScrollBar = Class({
	name: "UIScrollBar",
	parent: UICore,
	constructor: function(  ) {
		var _thumb, _scrollInfo, _orientation;
		
		_thumb = new Element( "SPAN" );
		
		return {
			init: function(element, orientation) {
				var self = this._super("init", arguments);
				if (self) {
				
					_orientation = ( typeof orientation === "string" && orientation.toLowerCase() === "horizontal" ) ? "horizontal" : "vertical";
				
					UIScrollBar.makeCSS();
					
					this.addClass("UIScrollBar");
					this.addClass(_orientation);
				
					_thumb.addClass("UIScrollBarThumb");
					
					this.append( _thumb );
					
					return this;
				}
			},
			
			scroll: function( to, scrollInfo ) {
				_scrollInfo = scrollInfo;
			
				if ( _orientation === "horizontal" ) {
					this.thumbCss({
						left: (to / ( _scrollInfo.contentSize.width - _scrollInfo.frameSize.width )) * ( _thumb.width() - this.width() ) * -1
					});
				}
				else if ( _orientation === "vertical" ) {
					this.thumbCss({
						top: (to / ( _scrollInfo.contentSize.height - _scrollInfo.frameSize.height )) * ( _thumb.height() - this.height() ) * -1
					});
				}
			},
			
			tintColor: function( color ) {
				_thumb.css({
					"background-color": color
				});
			},
			
			update: function( scrollInfo ) {
				_scrollInfo = scrollInfo;
				
				if ( _orientation === "horizontal" ) {
					var left = (_scrollInfo.contentOffset.x / ( _scrollInfo.contentSize.width - _scrollInfo.frameSize.width )) * ( _thumb.width() - this.width() ) * -1;
					var ratio = Math.min( Math.max( (_scrollInfo.frameSize.width / _scrollInfo.contentSize.width), 0.1 ), 1 );
					var width = ratio * this.width();
				
					this.thumbCss({
						opacity: ( ratio === 1 ) ? 0 : 1,
						left: left,
						width: width
					});
				}
				else if ( _orientation === "vertical" ) {
					var top = (_scrollInfo.contentOffset.y / ( _scrollInfo.contentSize.height - _scrollInfo.frameSize.height )) * ( _thumb.height() - this.height() ) * -1;
					var ratio = Math.min( Math.max( (_scrollInfo.frameSize.height / _scrollInfo.contentSize.height), 0.1 ), 1 );
					var height = ratio * this.height();
					
					this.thumbCss({
						opacity: ( ratio === 1 ) ? 0 : 1,
						top: top,
						height: height
					});
				}
			},
			
			thumbCss: function( css ) {
				_thumb.css( css );
			}
		}
	},
	staticConstructor: function() {
		
		var _makedCSS = false;
		
		return {
			makeCSS: function() {
			
				if ( _makedCSS === true ) {
					return;
				}
			
				_makedCSS = true;
				
				var head, style, css;
				head = document.head || document.getElementsByTagName('head')[0],
				style = document.createElement('style');
				style.type = 'text/css';
				
				css = ".UIScrollBar {}";
				css += ".UIScrollBar.vertical { width:8px; height:100%; position: absolute; top:0; right:0; background-clip: content-box; border-right: 2px solid transparent; }";
				css += ".UIScrollBar.vertical .UIScrollBarThumb {width:100%; height:100%; background-color: rgba(95,95,95,0.5); position: absolute; display: block; opacity:0; }";
				css += ".UIScrollBar.vertical .UIScrollBarThumb { -webkit-transition: opacity 0.1s ease-in-out; }";
				
				css += ".UIScrollBar.horizontal { width:100%; height:8px; position: absolute; bottom:0; left:0; background-clip: content-box; border-bottom: 2px solid transparent; }";
				css += ".UIScrollBar.horizontal .UIScrollBarThumb { width:100%; height:100%; background-color: rgba(95,95,95,0.5); position: absolute; display: block; opacity:0; }";
				css += ".UIScrollBar.horizontal .UIScrollBarThumb { -webkit-transition: opacity 0.1s ease-in-out; }";
				
				if (style.styleSheet){
					style.styleSheet.cssText = css;
				} else {
					style.appendChild(document.createTextNode(css));
				}
				
				head.appendChild(style);
			}
		}
	}
}),

UIScroll = Class({
	name: "UIScroll",
	parent: UICore,
	constructor: function() {
	
		var _delegate, _delegateCan, _flexable, _container, _eventHandler, _scrollVerticalBar, _scrollHorizontalBar, _scrollContainer, _scrollInfo;
		
		_delegate = undefined;
		_delegateCan = {
			scrolling: false,
			dragging: false,
			didStartDragging: false,
			didEndDragging: false,
			didFinishScrollingAnimation: false
		};
		
		_flexable = {vertical:false, horizontal:false};
		_scrollInfo = new UIScrollInfo();
		_scrollVerticalBar = new UIScrollBar( document.createElement("DIV"), "vertical" );
		_scrollHorizontalBar = new UIScrollBar( document.createElement("DIV"), "horizontal" );
		
		return {
		
			_event: function( e ) {
				var pageX = 0, pageY = 0, timeStamp = 0;
	
				if ( e.originalEvent && e.originalEvent.touches != undefined ) {
					var touch = e.originalEvent.touches[0];
					if ( touch ) {
						timeStamp = touch.timeStamp;
						pageX = touch.clientX;
						pageY = touch.clientY;
					}
					else {
						timeStamp = e.timeStamp;
						pageX = e.pageX;
						pageY = e.pageY;
					}
				}
				else if (  e.touches != undefined ) {
					var touch = e.touches[0];
					if ( touch ) {
						timeStamp = touch.timeStamp;
						pageX = touch.clientX;
						pageY = touch.clientY;
					}
					else {
						timeStamp = e.timeStamp;
						pageX = e.pageX;
						pageY = e.pageY;
					}
				}
				else {
					timeStamp = e.timeStamp;
					pageX = e.pageX;
					pageY = e.pageY;
				}
				
				return {
					timeStamp: timeStamp || (new Date()).getTime(),
					pageX: pageX,
					pageY: pageY	
				};	
			},
			
			_momentum: function (currentPoint, beginPoint, time, position) {
				var 
				deceleration = 0.0006,
				momentumInfo = {
					horizontal: {
						distance: 0,
						speed: 0,
						time: 0,
						decelerating: false
					},
					vertical: {
						distance: 0,
						speed: 0,
						time: 0,
						decelerating: false
					}
				};
				
				// top
				
				momentumInfo.vertical.distance = currentPoint.y - beginPoint.y;
				momentumInfo.vertical.speed = Math.abs(momentumInfo.vertical.distance) / time * 0.1;
				momentumInfo.vertical.to = (momentumInfo.vertical.speed * momentumInfo.vertical.speed) / (2 * deceleration) * ( momentumInfo.vertical.distance > 0 ? 1 : -1);
				momentumInfo.vertical.time = Math.round(momentumInfo.vertical.speed / deceleration);
				
				momentumInfo.top = position.y + momentumInfo.vertical.to;
				
				if ( _scrollInfo.scrollBounceVertical === false ) {
					momentumInfo.vertical.time = 0;
					momentumInfo.top = Math.min( Math.max( momentumInfo.top*-1, _scrollInfo.allowScrollOffset.minY ), _scrollInfo.allowScrollOffset.maxY );
					momentumInfo.vertical.decelerating = false;
				}
				else if ( momentumInfo.top * -1 < _scrollInfo.allowScrollOffset.minY ) {
					momentumInfo.vertical.time = 100;
					momentumInfo.top = momentumInfo.vertical.to - _scrollInfo.allowScrollOffset.minY;
					momentumInfo.vertical.decelerating = false;
				} 
				else if ( momentumInfo.top * -1 > _scrollInfo.allowScrollOffset.maxY ) {
					momentumInfo.vertical.time = 100;
					momentumInfo.top = (_scrollInfo.allowScrollOffset.maxY - momentumInfo.vertical.to) * -1;
					momentumInfo.vertical.decelerating = false;
				}
				else {
					momentumInfo.top = position.y + momentumInfo.vertical.to;
					momentumInfo.vertical.decelerating = true;
				}
				
				momentumInfo.top = ( _scrollInfo.usePaging === true ) ? Math.round(Math.round(momentumInfo.top / _scrollInfo.pagingSize.height) * _scrollInfo.pagingSize.height) : Math.round(momentumInfo.top);
				
				if ( _scrollInfo.useScrollBounceVertical === false ) {
					var top = Math.min( Math.max(momentumInfo.top*-1, _scrollInfo.allowScrollOffset.minY), _scrollInfo.allowScrollOffset.maxY ) * -1;
					if ( momentumInfo.top !== top ) {
						momentumInfo.top = top;
						momentumInfo.vertical.decelerating = false;
					}
				}
				
				// left
				
				momentumInfo.horizontal.distance = currentPoint.x - beginPoint.x;
				momentumInfo.horizontal.speed = Math.abs(momentumInfo.horizontal.distance) / time * 0.1;
				momentumInfo.horizontal.to = (momentumInfo.horizontal.speed * momentumInfo.horizontal.speed) / (2 * deceleration) * ( momentumInfo.horizontal.distance > 0 ? 1 : -1);
				momentumInfo.horizontal.time = Math.round(momentumInfo.horizontal.speed / deceleration);
				
				momentumInfo.left = position.x + momentumInfo.horizontal.to;
				
				if ( _scrollInfo.scrollBounceHorizontal === false ) {
					momentumInfo.horizontal.time = 0;
					momentumInfo.left = Math.min( Math.max(momentumInfo.left*-1, _scrollInfo.allowScrollOffset.minX), _scrollInfo.allowScrollOffset.maxX );
					momentumInfo.horizontal.decelerating = false;
				}
				else if ( momentumInfo.left * -1 < _scrollInfo.allowScrollOffset.minX ) {
					momentumInfo.horizontal.time = 100;
					momentumInfo.left = momentumInfo.horizontal.to - _scrollInfo.allowScrollOffset.minX;
					momentumInfo.horizontal.decelerating = false;
				} 
				else if ( momentumInfo.left * -1 > _scrollInfo.allowScrollOffset.maxX ) {
					momentumInfo.horizontal.time = 100;
					momentumInfo.top = (_scrollInfo.allowScrollOffset.maxX - momentumInfo.horizontal.to) * -1;
					momentumInfo.horizontal.decelerating = false;
				}
				else {
					momentumInfo.left = position.x + momentumInfo.horizontal.to;
					momentumInfo.horizontal.decelerating = true;
				}
				
				momentumInfo.left = ( _scrollInfo.usePaging === true ) ? Math.round(Math.round(momentumInfo.left / _scrollInfo.pagingSize.width) * _scrollInfo.pagingSize.width) : Math.round(momentumInfo.left);
				
				if ( _scrollInfo.useScrollBounceHorizontal === false ) {
					var left = Math.min( Math.max(momentumInfo.left*-1, _scrollInfo.allowScrollOffset.minX), _scrollInfo.allowScrollOffset.maxX ) * -1;
					
					if ( momentumInfo.left !== left ) {
						momentumInfo.left = left;
						momentumInfo.horizontal.decelerating = false;
					}
				}
		
				return momentumInfo;
			},
			
			_timeStamp: function() {
				return (new Date()).getTime();
			},
			
			_start: function(e) {
				var event = this._event(e);
				
				_scrollInfo.interaction.startTime = this._timeStamp();		
				_scrollInfo.interaction.beginPoint.x = _scrollInfo.interaction.currentPoint.x = event.pageX;
				_scrollInfo.interaction.beginPoint.y = _scrollInfo.interaction.currentPoint.y = event.pageY;
				
				_scrollInfo.interaction.clickable = true;
				_scrollInfo.interaction.startInteraction = true;
				_scrollInfo.interaction.dragOffset.x = 0;
				_scrollInfo.interaction.dragOffset.y = 0;
				
				_scrollContainer.killAnimation( false );
				_scrollInfo.interaction.globalUp = true;
				
				document.body.addEventListener(_scrollInfo.interaction.hasTouch ? "touchend" : "mouseup", _eventHandler, true);
				
				return true;
			},
			
			_move: function(e) {
			
				e.preventDefault();
			
				if ( _scrollInfo.interaction.startInteraction ) {
					var point, wasPoint, moveX, moveY, toX, toY, event = this._event(e),
					point = {x:event.pageX, y:event.pageY};
					wasPoint = {x:_scrollInfo.interaction.currentPoint.x, y:_scrollInfo.interaction.currentPoint.y};
					
					if ( _scrollInfo.interaction.dragging == false ) {
						this.dispatchEvent( "startDragging", this );
					}
					
					_scrollInfo.interaction.clickable = false;
					_scrollInfo.interaction.dragging = true;
					_scrollInfo.interaction.currentPoint.x = event.pageX;
					_scrollInfo.interaction.currentPoint.y = event.pageY;
					
					if ( _scrollInfo.interaction.dragging == true ) {
						moveX = wasPoint.x - point.x;
						moveY = wasPoint.y - point.y;
						
						if ( _scrollInfo.contentOffset.x < _scrollInfo.allowScrollOffset.minX || _scrollInfo.contentOffset.x > _scrollInfo.allowScrollOffset.maxX ) {
							moveX = moveX * 0.5;
						}
						
						if ( _scrollInfo.contentOffset.y < _scrollInfo.allowScrollOffset.minY || _scrollInfo.contentOffset.y > _scrollInfo.allowScrollOffset.maxY ) {
							moveY = moveY * 0.5;
						}
						
						toX = _scrollInfo.contentOffset.x + moveX;
						toY = _scrollInfo.contentOffset.y + moveY;
						
						this.contentOffset( toX, toY, {overflowX:_scrollInfo.useScrollBounceHorizontal, overflowY:_scrollInfo.useScrollBounceVertical} );
						
						_scrollInfo.interaction.dragOffset.x += moveX;
						_scrollInfo.interaction.dragOffset.y += moveY;
						
						if ( _scrollInfo.interaction.globalMove == false ) {
							_scrollInfo.interaction.globalMove = true;
							document.body.addEventListener(_scrollInfo.interaction.hasTouch ? "touchmove" : "mousemove", _eventHandler, true);
						}
						
						this.dispatchEvent( "dragging", this );
					}
				}
				
				return true;
			},
			
			_end: function(e, leave) {
			
				if ( _scrollInfo.interaction.globalMove === true ) {
					_scrollInfo.interaction.globalMove = false;
					document.body.removeEventListener(_scrollInfo.interaction.hasTouch ? "touchmove" : "mousemove", _eventHandler, true);
				}
				
				if ( _scrollInfo.interaction.globalUp === true ) {
					_scrollInfo.interaction.globalUp = false;
					document.body.removeEventListener(_scrollInfo.interaction.hasTouch ? "touchend" : "mouseup", _eventHandler, true);
				}
			
				if ( _scrollInfo.interaction.startInteraction ) {
					var duration, point, wasPoint, moveX, moveY, event = this._event(e);
					duration = (event.timeStamp || this._timeStamp()) - _scrollInfo.interaction.startTime;
					
					if ( _scrollInfo.interaction.dragging == true ) {
						_scrollInfo.interaction.dragging = false;
						
						this.dispatchEvent( "endDragging", this );
						
						if ( _scrollInfo.useDecelerating === true && duration <= 500 ) {
							var position = _scrollContainer.position();
							var momentumInfo = this._momentum(_scrollInfo.interaction.currentPoint, _scrollInfo.interaction.beginPoint, duration, position );
							var duration = momentumInfo.vertical.time || momentumInfo.horizontal.time;
							
							if ( momentumInfo.vertical.decelerating == true || momentumInfo.horizontal.decelerating == true ) {
							
								_scrollContainer.animate( duration * 0.001, {
									top: momentumInfo.top,
									left: momentumInfo.left,
									inQueue: true
								});
								
								var left = Math.min( Math.max(_scrollInfo.contentOffset.x, _scrollInfo.allowScrollOffset.minX), _scrollInfo.allowScrollOffset.maxX );
								var top = Math.min( Math.max(_scrollInfo.contentOffset.y, _scrollInfo.allowScrollOffset.minY), _scrollInfo.allowScrollOffset.maxY );
								
								this.scrollToAnimation( left, top, {duration:100, inQueue:true} );
								
							}
							else {
				
								if ( _scrollInfo.contentOffset.x == (momentumInfo.left * -1) && _scrollInfo.contentOffset.y == (momentumInfo.top * -1) ) {
									duration = 0;
								}
								
								var left = Math.min( Math.max(momentumInfo.left*-1, _scrollInfo.allowScrollOffset.minX), _scrollInfo.allowScrollOffset.maxX );
								var top = Math.min( Math.max(momentumInfo.top*-1, _scrollInfo.allowScrollOffset.minY), _scrollInfo.allowScrollOffset.maxY );
								
								this.scrollToAnimation( left, top, {duration:duration} );
							}
						}
						else {
							//if ( leave !== true ) {
								var cx = ( _scrollInfo.usePaging === true ) ? (Math.round(_scrollInfo.contentOffset.x / _scrollInfo.pagingSize.width) * _scrollInfo.pagingSize.width) : _scrollInfo.contentOffset.x;
								var cy = ( _scrollInfo.usePaging === true ) ? (Math.round(_scrollInfo.contentOffset.y / _scrollInfo.pagingSize.height) * _scrollInfo.pagingSize.height) : _scrollInfo.contentOffset.y;
								
								var left = Math.min( Math.max(cx, _scrollInfo.allowScrollOffset.minX), _scrollInfo.allowScrollOffset.maxX );
								var top = Math.min( Math.max(cy, _scrollInfo.allowScrollOffset.minY), _scrollInfo.allowScrollOffset.maxY );
								
								this.scrollToAnimation( left, top, {duration:100} );
							//}
							//else {
								
							//}
						}
					}
					
					_scrollInfo.interaction.startInteraction = false;
				}
				
				return true;	
			},
			
			_eventHandler: function(e) {
				if ( _scrollInfo.scrollBounceVertical == false && _scrollInfo.scrollBounceHorizontal == false ) {
					return true;
				}
			
				var result = true;
				
				switch (e.type) {
					case "mousedown":
					case "touchstart":
						result = _scrollInfo.interaction.target._start.call( _scrollInfo.interaction.target, e );
					break;
					
					case "mousemove":
					case "touchmove":
						result = _scrollInfo.interaction.target._move.call( _scrollInfo.interaction.target, e );
					break;
					
					case "mouseup":
					case "mouseleave":
					case "touchend":
					case "touchcancel":
						result = _scrollInfo.interaction.target._end.call( _scrollInfo.interaction.target, e, ( e.type === "mouseleave" ) );
					break;
					
					case "mousewheel":
					
						if ( ! _scrollInfo.interaction.startInteraction ) {
						
							var moveX = e.originalEvent.deltaX;
							var moveY = e.originalEvent.deltaY;
							
							_scrollInfo.interaction.target.contentOffset( _scrollInfo.contentOffset.x + moveX, _scrollInfo.contentOffset.y + moveY );
							//_scrollInfo.interaction.beginPoint = _scrollInfo.interaction.currentPoint;
							
							if ( _scrollInfo.usePaging ) {
							
								if ( _scrollInfo.interaction.wheelTimeout ) {
									clearTimeout( _scrollInfo.interaction.wheelTimeout );
									_scrollInfo.interaction.wheelTimeout = null;
								}
				
								_scrollInfo.interaction.wheelTimeout = setTimeout( function() {
									_scrollInfo.interaction.wheelTimeout = null;
									
									var cx = Math.round(_scrollInfo.contentOffset.x / _scrollInfo.frameSize.width) * _scrollInfo.frameSize.width;
									var cy = Math.round(_scrollInfo.contentOffset.y / _scrollInfo.frameSize.height) * _scrollInfo.frameSize.height;
									
									var left = Math.min( Math.max(cx, _scrollInfo.allowScrollOffset.minX), _scrollInfo.allowScrollOffset.maxX );
									var top = Math.min( Math.max(cy, _scrollInfo.allowScrollOffset.minY), _scrollInfo.allowScrollOffset.maxY );
									
									_scrollInfo.interaction.target.scrollToAnimation( left*-1, top*-1, {duration:100} );
									
								}, 100);
							}
						}
						else {
							if ( _scrollInfo.interaction.wheelTimeout ) {
								clearTimeout( _scrollInfo.interaction.wheelTimeout );
								_scrollInfo.interaction.wheelTimeout = null;
							}
						}
						
						if ( _scrollInfo.scrollBounceHorizontal && Math.abs(moveX) > 0 && ( _scrollInfo.contentOffset.x == _scrollInfo.allowScrollOffset.minX || _scrollInfo.contentOffset.x == _scrollInfo.allowScrollOffset.maxX ) ) {
							result = true;
						}
						else if ( _scrollInfo.scrollBounceVertical && Math.abs(moveY) > 0 && ( _scrollInfo.contentOffset.y == _scrollInfo.allowScrollOffset.minY || _scrollInfo.contentOffset.y == _scrollInfo.allowScrollOffset.maxY ) ) {
							result = true;
						}
						else {
							result = false;
						}
						
					break;
					
					case "click":
						if ( _scrollInfo.interaction.clickable == false ) {
							e.stopPropagation();
							return false;
						}
					break;
				}
				
				return result;	
			},
			
			container: function( container ) {
				if ( arguments.length == 0 ) {
					return _container;	
				}
				
				_container = container;
				_scrollContainer = new UIScrollContainer( _container );
				
				this.css({
					"width": _flexable.horizontal == false ? _scrollInfo.frameSize.width : "100%",
					"height": _flexable.vertical == false ? _scrollInfo.frameSize.height : "100%",
					"position":"relative",
					"overflow": "hidden"
				});
				
				_scrollContainer.css({
					"position":"absolute"
				});
				
				this.refresh( false );
			},
			
			scrollContainer: function() {
				return _scrollContainer;	
			},
			
			scrollInfo: function() {
				return _scrollInfo;	
			},
			
			destroy: function() {
			
				this.element().removeEventListener("click", _eventHandler, true);
				this.element().removeEventListener("mousedown", _eventHandler, true);
				this.element().removeEventListener("mousemove", _eventHandler, true);
				this.element().removeEventListener("mouseup", _eventHandler, true);
				
				this.element().removeEventListener("touchstart", _eventHandler, true);
				this.element().removeEventListener("touchmove", _eventHandler, true);
				this.element().removeEventListener("touchend", _eventHandler, true);
				this.element().removeEventListener("touchcancel", _eventHandler, true);
				
				$(this.element()).unbind("mousewheel");
				
				$(document).unbind("touchstart" );
				$(document).unbind("mouseleave" );
				
				_scrollContainer.destroy.apply( _scrollContainer, arguments );
				_scrollVerticalBar.destroy(true);
				_scrollHorizontalBar.destroy(true);
				
				this._super("destroy", arguments );
			},
			
			pagingEnabled: function( pagingEnabled, pagingSize ) {
			
				
				_scrollInfo.usePaging = ( pagingEnabled === false ) ? false : true;	
				
				_scrollInfo.pagingSize.width = ( pagingSize && pagingSize.width ) ? pagingSize.width : _scrollInfo.frameSize.width;
				_scrollInfo.pagingSize.height = ( pagingSize && pagingSize.height ) ? pagingSize.height : _scrollInfo.frameSize.height;
				
			},
			
			useWheelMouse: function( useWheelMouse ) {
				_scrollInfo.useWheelMouse = useWheelMouse;	
				
				if ( _scrollInfo.useWheelMouse === true ) {
					$(this.element()).bind("mousewheel", _eventHandler );
				}
				else {
					$(this.element()).unbind("mousewheel");
				}
			},
			
			useMouseLeave: function( useMouseLeave ) {
				_scrollInfo.useMouseLeave = useMouseLeave;	
			
				$(this.element()).bind("mouseleave", _eventHandler );
				$(document).bind("mouseleave", _eventHandler );
			},
			
			useDecelerating: function( useDecelerating ) {
				
				_scrollInfo.useDecelerating = useDecelerating;	
			},
			
			useScrollBar: function( useScrollBar ) {
				
				if ( useScrollBar === false ) {
					_scrollInfo.useScrollBar = false;
					
					this.remove( _scrollVerticalBar );
					this.remove( _scrollHorizontalBar );
					
					return;
				}
				
				_scrollInfo.useScrollBar = true;
				
				var head, style, css;
				head = document.head || document.getElementsByTagName('head')[0],
				style = document.createElement('style');
				style.type = 'text/css';
				css = ".scrollbar-hidden::-webkit-scrollbar {display:none}";
				
				if (style.styleSheet){
					style.styleSheet.cssText = css;
				} else {
					style.appendChild(document.createTextNode(css));
				}
				
				head.appendChild(style);
					
				this.addClass("scrollbar-hidden");
				
				this.append( _scrollVerticalBar );
				this.append( _scrollHorizontalBar );
			},
			
			scrollBounce: function( scrollBounce ) {
				_scrollInfo.useScrollBounceVertical = ( scrollBounce === true ) ? true : false;	
				_scrollInfo.useScrollBounceHorizontal = ( scrollBounce === true ) ? true : false;	
			},
			
			scrollBounceVertical: function( scrollBounce ) {
				_scrollInfo.useScrollBounceVertical = ( scrollBounce === true ) ? true : false;	
			},
			
			scrollBounceHorizontal: function( scrollBounce ) {
				_scrollInfo.useScrollBounceHorizontal = ( scrollBounce === true ) ? true : false;	
			},
			
			scrollBarTintColor: function( color ) {
				_scrollVerticalBar.tintColor( color );	
				_scrollHorizontalBar.tintColor( color );	
			},
			
			init: function( element ) {
				var self = this._super("init", arguments);
				if ( self ) {
					
					_scrollInfo.interaction.target = this;
					_scrollInfo.frameSize.width = this.width();
				
					this.css({position:"absolute"});
					
					_scrollInfo.frameSize.height = this.height();
					
					_container = $(element).find("[scroll-container]").first().get(0) || $(element).children().get(0);
					
					this.container( _container );
					
					_eventHandler = this.context( this._eventHandler );
					
					this.element().addEventListener("click", _eventHandler, true);
					this.element().addEventListener(_scrollInfo.interaction.hasTouch ? "touchstart" : "mousedown", _eventHandler, true);
					this.element().addEventListener(_scrollInfo.interaction.hasTouch ? "touchmove" : "mousemove", _eventHandler, true);
					this.element().addEventListener(_scrollInfo.interaction.hasTouch ? "touchend" : "mouseup", _eventHandler, true);
					
					if ( _scrollInfo.interaction.hasTouch ) {
						this.element().addEventListener("touchcancel", _eventHandler, true);
					}
					
					this.bind("startDragging", function() {
						if ( _delegateCan.didStartDragging ) {
							_delegate.didStartDragging.call( _delegate, _scrollInfo.interaction.target, Object.clone(_scrollInfo) );
						}
					});
					
					this.bind("endDragging", function() {
						if ( _delegateCan.didEndDragging ) {
							_delegate.didEndDragging.call( _delegate, _scrollInfo.interaction.target, Object.clone(_scrollInfo) );
						}
					});
					
					this.bind("finishScrollAnimation", function() {
						if ( _delegateCan.didFinishScrollingAnimation ) {
							_delegate.didFinishScrollingAnimation.call( _delegate, _scrollInfo.interaction.target, Object.clone(_scrollInfo) );
						}
					});
					
					this.bind("scrolling", function() {
						if ( _delegateCan.scrolling ) {
							_delegate.scrolling.call( _delegate, _scrollInfo.interaction.target, Object.clone(_scrollInfo) );
						}
					});
					
					this.bind("dragging", function() {
						if ( _delegateCan.dragging ) {
							_delegate.dragging.call( _delegate, _scrollInfo.interaction.target, Object.clone(_scrollInfo) );
						}
					});
					
					this.useScrollBar(true);
					this.useWheelMouse(true);
					this.useMouseLeave(true);
					
					return this;
				}
			},
			
			currentSize: {},
			
			resizable: function( resizable ) {
				if ( resizable === true ) {
					_scrollInfo.resiable = false;
					return;
				}
				
				_scrollInfo.resiable = true;
				
				this.currentSize = _scrollContainer.size();
				
				this.autoResizeHandler();
			},
			
			autoResizeHandler: function() {
				
				var wasSize = this.currentSize;
				
				this.currentSize = _scrollContainer.size();
				
				if ( wasSize.width != this.currentSize.width || wasSize.height != this.currentSize.height ) {
					this.dispatchEvent( "resize" );	
				}
			
				setTimeout( this.context(function() {
					if ( _scrollInfo.resiable ) {
						this.autoResizeHandler();
					}
				}), 30);
			},
			
			flexable: function( flexable ) {
				_flexable.vertical = ( flexable.vertical === true ) ? true : false;
				_flexable.horizontal = ( flexable.horizontal === true ) ? true : false;
				
				this.css({
					"width": _flexable.horizontal == false ? _scrollInfo.frameSize.width : "100%",
					"height": _flexable.vertical == false ? _scrollInfo.frameSize.height : "100%",
				});
			},
			
			autoSize: function( autoSize, animated ) {
				
				if ( autoSize === false ) {
					this.resizable(false);
					this.unbind("resize");
					return;
				}
				
				animated = ( animated === false ) ? false : true;
				
				this.resizable();
				this.bind("resize", this.context(function() {
					this.refresh(animated);
				}));
				
				this.refresh(animated);
			},
			
			_allowContentOffset: function() {
				_scrollInfo.scrollBounceHorizontal = ( _scrollInfo.frameSize.width < ( _scrollInfo.contentSize.width + _scrollInfo.contentInset.left ) ) ? true : false;
				_scrollInfo.scrollBounceVertical = ( _scrollInfo.frameSize.height < ( _scrollInfo.contentSize.height + _scrollInfo.contentInset.top ) ) ? true : false;
				
				_scrollInfo.allowScrollOffset.minX = _scrollInfo.scrollBounceHorizontal === false ? _scrollInfo.contentInset.left * -1 : ( _scrollInfo.contentInset.left * -1 );
				_scrollInfo.allowScrollOffset.maxX = _scrollInfo.scrollBounceHorizontal === false ? _scrollInfo.allowScrollOffset.minX : Math.max( _scrollInfo.allowScrollOffset.minX, ( ( _scrollInfo.contentSize.width - _scrollInfo.frameSize.width ) + _scrollInfo.contentInset.right ) );
				_scrollInfo.allowScrollOffset.minY = _scrollInfo.scrollBounceVertical === false ? _scrollInfo.contentInset.top * -1 : ( _scrollInfo.contentInset.top * -1 );
				_scrollInfo.allowScrollOffset.maxY = _scrollInfo.scrollBounceVertical === false ? _scrollInfo.allowScrollOffset.minY : Math.max( _scrollInfo.allowScrollOffset.minY, ( ( _scrollInfo.contentSize.height - _scrollInfo.frameSize.height ) + _scrollInfo.contentInset.bottom ) );					
			},
			
			contentInset: function( contentInset ) {
				if ( arguments.length == 0 ) {
					return Object.clone( _scrollInfo.contentInset );
				}
				
				for ( var key in contentInset ) {
					
					if ( _scrollInfo.contentInset[key] != undefined && ! isNaN(parseInt(contentInset[key])) ) {
						_scrollInfo.contentInset[key] = parseInt(contentInset[key]);
					}
				}
				
				this._allowContentOffset();
			},

			contentOffset: function( x, y, options ) {
			
				if ( _scrollInfo.interaction.wheelTimeout ) {
					clearTimeout( _scrollInfo.interaction.wheelTimeout );
					_scrollInfo.interaction.wheelTimeout = null;
				}
								
				if ( arguments.length == 0 ) {
					return Object.clone( _scrollInfo.contentOffset );
				}
				
				if ( ! options || ! options.overflowX === true ) {
					x = Math.min( Math.max(x, _scrollInfo.allowScrollOffset.minX), _scrollInfo.allowScrollOffset.maxX );
				}
				
				if ( ! options || ! options.overflowY === true ) {
					y = Math.min( Math.max(y, _scrollInfo.allowScrollOffset.minY), _scrollInfo.allowScrollOffset.maxY );
				}
				
				if ( this.element() && this.element().scrollTop ) {
					this.element().scrollTop = 0;
				}
				
				if ( this.element() && this.element().scrollLeft ) {
					this.element().scrollLeft = 0;
				}
				
				_scrollContainer.css({
					"left": Math.round(x*-1) + "px",
					"top": Math.round(y*-1) + "px"
				});
				
				_scrollInfo.contentOffset.x = x;
				_scrollInfo.contentOffset.y = y;
				
				_scrollVerticalBar.update( _scrollInfo );
				_scrollHorizontalBar.update( _scrollInfo );
				
				this.dispatchEvent( "scrolling", this );
			},
			
			scrollTo: function( x, y, options ) {
				this.contentOffset( x*-1, y*-1, options );	
			},
			
			scrollTop: function( options ) {
				this.scrollTo( _scrollInfo.contentInset.left, _scrollInfo.contentInset.top );
			},
			
			scrollToAnimation: function( x, y, options ) {
			
				if ( ! _scrollInfo.interaction.target ) {
					return;
				}
				
				var self = this;
				var inQueue = true;
				var duration = ( options && ! isNaN(parseInt(options["duration"])) ) ? parseInt(options["duration"]) : 300;
				
				if ( this.element().scrollTop ) {
					this.element().scrollTop = 0;
				}
				
				if ( this.element().scrollLeft ) {
					this.element().scrollLeft = 0;
				}
				
				x = Math.round(x);
				y = Math.round(y);
				
				if ( ! options || options.inQueue !== true ) {
					_scrollContainer.killAnimation( false );
					inQueue = false;
				}
				
				_scrollContainer.animate( duration*0.001, {
					left: x * -1,
					top: y * -1,
					inQueue: inQueue,
					onUpdate: function() {
					
						var cx = parseInt( _scrollContainer.css("left") ) * -1;
						var cy = parseInt( _scrollContainer.css("top") ) * -1;
						
						_scrollVerticalBar.scroll( cy, _scrollInfo );
						_scrollHorizontalBar.scroll( cx, _scrollInfo );
						
						self.dispatchEvent( "scrolling", self );
					},
					onComplete: function() {
						_scrollVerticalBar.update( _scrollInfo );
						_scrollHorizontalBar.update( _scrollInfo );
				
						_scrollInfo.interaction.target.dispatchEvent( "finishScrollAnimation", _scrollInfo.interaction.target );
					}
				});
				
				_scrollInfo.contentOffset.x = x;
				_scrollInfo.contentOffset.y = y;
			},
			
			frameSize: function( width, height ) {
				if ( arguments.length == 0 ) {
					return _scrollInfo.frameSize;
				}
				
				_scrollInfo.frameSize.width = width;
				_scrollInfo.frameSize.height = height;
			},
			
			showScrollbar: function( bool ) {
				if ( arguments.length == 0 ) {
					return _scrollInfo.showScrollbar;
				}
			
				_scrollInfo.showScrollbar = bool;
			},
			
			refresh: function( animated ) {
				
				var size = this.size();
				size.width = ( size.width == 0 ) ? _scrollContainer.width() : size.width;
				size.height = ( size.height == 0 ) ? _scrollContainer.height() : size.height;
				
				_scrollInfo.frameSize.width = this.width();
				_scrollInfo.frameSize.height = this.height();
				
				_scrollInfo.contentSize.width = _scrollContainer.width();
				_scrollInfo.contentSize.height = _scrollContainer.height();
				
				this._allowContentOffset();
				
				var left = Math.min( Math.max(_scrollInfo.contentOffset.x, _scrollInfo.allowScrollOffset.minX), _scrollInfo.allowScrollOffset.maxX );
				var top = Math.min( Math.max(_scrollInfo.contentOffset.y, _scrollInfo.allowScrollOffset.minY), _scrollInfo.allowScrollOffset.maxY );
				
				if ( animated === false ) {
					this.scrollTo( left*-1, top*-1 );
				}
				else {
				
					var diff = {
						x: _scrollInfo.allowScrollOffset.minX, y: _scrollInfo.allowScrollOffset.minY,
						vtime:0, htime: 0
					};
					
					diff.x = Math.abs(_scrollInfo.contentOffset.x - left);
					diff.y = Math.abs(_scrollInfo.contentOffset.y - top);
					
					diff.htime = diff.x * 10;
					diff.vtime = diff.y * 10;
					
					var duration = Math.min( 300, Math.max(diff.htime, diff.vtime) );
					
					if ( duration < 10 ) {
						this.scrollTo( left*-1, top*-1 );
					}
					else {
						this.scrollToAnimation( left*-1, top*-1, {duration:duration} );
					}
				}
				
				_scrollVerticalBar.update( _scrollInfo );
				_scrollHorizontalBar.update( _scrollInfo );
			},
			
			delegate: function( delegate ) {
				_delegate = delegate;
				
				_delegateCan.scrolling = (typeof _delegate["scrolling"] == "function" );
				_delegateCan.dragging = (typeof _delegate["dragging"] == "function" );
				_delegateCan.didStartDragging = (typeof _delegate["didStartDragging"] == "function" );
				_delegateCan.didEndDragging = (typeof _delegate["didEndDragging"] == "function" );
				_delegateCan.didFinishScrollingAnimation = (typeof _delegate["didFinishScrollingAnimation"] == "function" );
			}
		}
	}
});
	
})(window);


(function(window, undefined) {

'use strict';
	
var 

Class = UI.Class,
Element = Class.Element,
UICore = Class.UICore,

UIControlEvent = {
	ChangeProperty: "UIControlEvent.ChangeProperty"
},

UIControl = Class({
	name: "UIControl",
	parent: UICore,
	constructor: function() {
	
		var _currentEvent;
		var _propertyChangeEventTimeout;
		
		return {
			_didChangeProperty: function(e) {
				var self = this;
				
				if ( _propertyChangeEventTimeout ) {
					clearTimeout(_propertyChangeEventTimeout);
					_propertyChangeEventTimeout = null;
				}
			
				_propertyChangeEventTimeout = setTimeout(function() {
					self.dispatchEvent( UIControlEvent.ChangeProperty );
					_propertyChangeEventTimeout = null;
				}, 10);
			},
			
			destroy: function() {
				
				$(this.element()).unbind("propertychange.UIControl keydown.UIControl keyup.UIControl input.UIControl paste.UIControl change.UIControl click.UIControl UIControlEvent.ChangeProperty");
				
				this._super("destroy", arguments );
			},
			
			init: function( element ) {
				var self = this._super("init", arguments);
				if ( self ) {
					var $element = $(element);
					
					$element.bind("propertychange.UIControl keydown.UIControl keyup.UIControl input.UIControl paste.UIControl change.UIControl click.UIControl UIControlEvent.ChangeProperty", this.context(function(e) {
						return this._didChangeProperty(e);
					}));
					
					return this;
				}
			},
			
			isDisabled: function() {
				return this.element().disabled;
			},
			
			disabled: function( flag ) {
				this.element().disabled = flag;
				
				$(this.element()).attr("disabled", flag);
				
				this._didChangeProperty();
			}
		}
	}
}),

UIButton = Class({
	name: "UIButton",
	parent: UIControl,
	constructor: function() {
		
		return {
			init: function( element ) {
				var self = this._super("init", arguments);
				if ( self ) {
					if ( ! this.hasClass("UIButton") ) {
						this.addClass("UIButton");
					}
					
					return this;
				}
			}
		}
	}
}),

UICheckBox = Class({
	name: "UICheckBox",
	parent: UIControl,
	constructor: function() {
	
		var UICheckBoxStatus = {
			UNSET:	0,
			NONE:	1,
			PART:	2,
			ALL:	3
		};
	
		var _group = "";
		var _whole = false;
		
		return {
			init: function( element ) {
				var self = this._super("init", arguments);
				
				if ( self ) {
					if ( ! this.hasClass("UICheckBox") ) {
						this.addClass("UICheckBox");
					}
					
					if ( $(element).data("group") ) {
						_group = $(element).data("group");
						
						UICheckBox.group(_group, this);
					}
					
					if ( $(element).data("group-whole") ) {
						_group = $(element).data("group-whole");
						_whole = true;
						
						UICheckBox.groupWhole(_group, this);
					}
					
					this.bind(UIControlEvent.ChangeProperty, this.context(function(e) {
						this.didChangeProperty();
					}));
					
					if ( _whole === false ) {
						UICheckBox.groupWhole(_group).delegate()._didUpdateGroupWhole();
					}
				}
				return this
			},
			
			_status: function() {
				var groupWhole, allClear = true, allChecked = true;
				
				groupWhole = UICheckBox.groupWhole(_group);
				
				//console.log( 'groupWhole.group().list()', groupWhole.group().list() );
			
				$( groupWhole.group().list() ).each(function(idx, instance) {
					//console.log( 'instance.isChecked()', instance.isChecked() );
				
					if ( ! instance.isDisabled() ) {
						if ( instance.isChecked() ) {
							allClear = false;
						}
						else {
							allChecked = false;
						}
					}
				});
				
				//console.log( "allClear", allClear, "allChecked", allChecked );
				
				if ( allClear === true ) {
					return UICheckBoxStatus.NONE;
				}
				else if ( allChecked === true ) {
					return UICheckBoxStatus.ALL;
				}
				
				return UICheckBoxStatus.PART;
			},
			
			_didUpdateGroupWhole: function() {
				if ( _whole === false ) {
					return;
				}
				
				var status, groupWhole;
				
				status = this._status();
				groupWhole = UICheckBox.groupWhole(_group);
				
				switch( status ) {
					default:
					case UICheckBoxStatus.UNSET:
					case UICheckBoxStatus.NONE:
						
						this.checked( false, {ignoreEvent:true, isPart:false} );
					
						break;
					
					case UICheckBoxStatus.PART:
					
						this.checked( false, {ignoreEvent:true, isPart:true} );
					
						break;
					
					case UICheckBoxStatus.ALL:
					
						this.checked( true, {ignoreEvent:true, isPart:false} );
					
						break;
				}
			},
			
			didChangeProperty: function() {
				
				var checked, groupWhole;
				
				checked = this.isChecked();
				groupWhole = UICheckBox.groupWhole(_group);
					
				if ( _whole === true ) {
					this.removeClass("part");
				
					$( groupWhole.group().list() ).each(function(idx, instance) {
						instance.checked( checked, {ignoreEvent:true} );
					});
				}
				else {
					groupWhole.delegate()._didUpdateGroupWhole();
				}
			},
			
			isChecked: function() {
				return this.element().checked;	
			},
			
			checked: function( flag, options ) {
				if ( arguments.length == 0 ) {
					return this.isChecked();	
				}
				
				if ( this.isDisabled() ) {
					return;
				}
				
				this.element().checked = flag;
				this.attribute("checked", flag);
				
				if ( options && options.isPart !== undefined ) {
					if ( options.isPart === true ) {
						this.addClass("part");
					}
					else if ( options.isPart === false ) {
						this.removeClass("part");
					}
				}
				
				if ( ! options || options.ignoreEvent !== true ) {
					$(this.element()).trigger("UIControlEvent.ChangeProperty");
				}
			}
		}
	},
	
	'static': function() {
		
		var UICheckBoxGroup = function( whole ) {
			
			var _list = [], _whole = whole;
			
			return {
				add: function( instance ) {
					Array.add( _list, instance );
				},
				
				remove: function( instance ) {
					Array.remove( _list, instance );
				},
				
				list: function() {
					return _list;
				}
			}
		};
		
		var UICheckBoxGroupWhole = function() {
			
			var _group, _delegate;
			
			_delegate = {
				_didUpdateGroupWhole: function() {
					
				}
			};
			
			return {
				init: function() {
					_group = new UICheckBoxGroup( this );
				},
			
				group: function() {
					return _group;
				},
				
				delegate: function( delegate ) {
					if ( arguments.length == 0 ) {
						return _delegate;
					}
					
					_delegate = delegate;
				}
			};
		};
		
		var _groupData = {};
	
		return {
			group: function( key, instance ) {
				if ( arguments.length == 0 ) {
					return _groupData;
				}
				
				var groupWhole = _groupData[key];
				
				if ( ! groupWhole ) {
					groupWhole = new UICheckBoxGroupWhole(key);
					groupWhole.init();
					
					_groupData[key] = groupWhole;
				}
				
				if ( ! instance ) {
					return groupWhole.group();
				}
				
				groupWhole.group().add( instance );
			},
			
			groupWhole: function( key, instance ) {
				if ( arguments.length == 0 ) {
					return _groupData;
				}
				
				var groupWhole = _groupData[key];
				
				if ( ! groupWhole ) {
					groupWhole = new UICheckBoxGroupWhole(key);
					groupWhole.init();
					
					_groupData[key] = groupWhole;
				}
				
				if ( ! instance ) {
					return groupWhole;
				}
				
				groupWhole.delegate( instance );
			}
		}
	}
}),

UIRadio = Class({
	name: "UIRadio",
	parent: UIControl,
	constructor: function() {
		
		return {
			init: function(element) {
				var self = this._super("init", arguments);
				if ( self ) {
					if ( ! this.hasClass("UIRadio") ) {
						this.addClass("UIRadio");
					}
				}
				return this
			}
		}
	}
}),

UISwitch = Class({
	name: "UISwitch",
	parent: UIControl,
	constructor: function() {
	
		var _track, _thumb, _on, _eventHandler;
		
		_on = false;
		
		return {
			_eventHandler: function(e) {
				this.on( ( _on ? false : true ), true );
			},
		
			init: function( element ) {
				var self = this._super("init", arguments);
				if ( self ) {
				
					if ( ! this.hasClass("UISwitch") ) {
						this.addClass("UISwitch");
					}
					
					_track = $(element).find(".UISwitchTrack").instance(Element);
					_thumb = $(element).find(".UISwitchThumb").instance(Element);
					
					_eventHandler = this.context( this._eventHandler );
					
					$(element).bind("click", _eventHandler);
					
					if ( this.attribute("data-status") == "on" ) {
						this.on(true);
					}
				}
				return this
			},
			
			on: function( flag, animated ) {
				
				_on = flag;
				
				this.attribute("data-status", _on === true ? "on" : "off");
				
				var duration = ( animated === true ) ? 250 : 0;
				var toX = _on ? ( (this.width() - _thumb.width() - 1) ) : 1;
				var toBackgroundColor = _on ? "#e42c5e" : "#e5e5e5";
				
				this.killAnimation( false );
				this.animate(duration*0.001, {
					css: {
						backgroundColor: toBackgroundColor,
					},
					
					onUpdate: function() {
						
					},
					onComplete: function() {
						
					}
				});
				
				_track.killAnimation( false );
				_track.animate(duration*0.001, {
					left: toX,
					onUpdate: function() {
						
					},
					onComplete: function() {
						
					}
				});
			}
		}
	}
}),

UITab = Class({
	name: "UITab",
	parent: UIControl,
	constructor: function() {
		var _$items;
		
		return {
			init: function( element ) {
				var self = this._super("init", arguments);
				if ( self ) {
					_$items = $(element).find("a");
					_$items.bind("click", function(e) {
						_$items.removeClass("on").eq( $(this).index() ).addClass("on");
					});
				}
				return this
			}
		}
	}
}),

UISegment = Class({
	name: "UISegment",
	parent: UIControl,
	constructor: function(  ) {
	
		var _$items;
		
		return {
			init: function( element ) {
				var self = this._super("init", arguments);
				if ( self ) {
					_$items = $(element).find("a");
					_$items.bind("click", function(e) {
						_$items.removeClass("on").eq( $(this).index() ).addClass("on");
					});
				}
				return this
			}
		}
	}
}),

UISliderInfo = (function ( target ) {
	var info = function UISliderInfo() {};
	info.fn = info.prototype = {
		trackOffset: {x:0, y:0},
		allowTrackOffset: {minX:0, minY:0, maxX:0, maxY:0},
		stepGapSize: {width:0, height:0},
		
		interaction: {
			hasTouch: ('ontouchstart' in window) ? true : false,
			target: target,
			startTime: 0,
			beginPoint: {x:0, y:0},
			currentPoint: {x:0, y:0},
			dragOffset: {x:0, y:0},
			dragging: false,
			startInteraction: false,
			globalMove: false
		}
	};
	
	return info;
})(),

UISlider = Class({
	name: "UISlider",
	parent: UIControl,
	constructor: function() {
		
		var _maximumTrack, _minimumTrack, _minimumValue, _maximumValue, _track, _thumb, _thumbValue, _info, _eventHandler;
		
		
		return {
		
			_event: function( e ) {
				var pageX = 0, pageY = 0, timeStamp = 0;
	
				if ( e.originalEvent && e.originalEvent.touches != undefined ) {
					var touch = e.originalEvent.touches[0];
					if ( touch ) {
						timeStamp = touch.timeStamp;
						pageX = touch.clientX;
						pageY = touch.clientY;
					}
					else {
						//console.log( e, e.originalEvent );
					
						timeStamp = e.timeStamp;
						pageX = e.pageX;
						pageY = e.pageY;
					}
				}
				else if (  e.touches != undefined ) {
					var touch = e.touches[0];
					if ( touch ) {
						timeStamp = touch.timeStamp;
						pageX = touch.clientX;
						pageY = touch.clientY;
					}
					else {
						timeStamp = e.timeStamp;
						pageX = e.pageX;
						pageY = e.pageY;
					}
				}
				else {
					timeStamp = e.timeStamp;
					pageX = e.pageX;
					pageY = e.pageY;
				}
				
				return {
					timeStamp: timeStamp || (new Date()).getTime(),
					pageX: pageX,
					pageY: pageY	
				};	
			},
			
			_timeStamp: function() {
				return (new Date()).getTime();
			},
			
			_start: function(e) {
				var event = this._event(e);
				
				_info.interaction.target = e.target || e.srcElement;
				
				_info.interaction.startTime = this._timeStamp();		
				_info.interaction.beginPoint.x = _info.interaction.currentPoint.x = event.pageX;
				_info.interaction.beginPoint.y = _info.interaction.currentPoint.y = event.pageY;
				
				_info.interaction.clickable = true;
				_info.interaction.startInteraction = true;
				_info.interaction.dragOffset.x = 0;
				_info.interaction.dragOffset.y = 0;
				
				_track.killAnimation( false );
				
				return true;
			},
			
			_move: function(e) {
			
				e.preventDefault();
			
				if ( _info.interaction.startInteraction ) {
					var point, wasPoint, moveX, moveY, toX, toY, event = this._event(e),
					point = {x:event.pageX, y:event.pageY};
					wasPoint = {x:_info.interaction.currentPoint.x, y:_info.interaction.currentPoint.y};
					
					if ( _info.interaction.dragging == false ) {
						this.dispatchEvent( "startDragging", this );
					}
					
					_info.interaction.clickable = false;
					_info.interaction.dragging = true;
					_info.interaction.currentPoint.x = event.pageX;
					_info.interaction.currentPoint.y = event.pageY;
					
					if ( _info.interaction.dragging == true ) {
						moveX = ( wasPoint.x - point.x ) * -1;
						moveY = ( wasPoint.y - point.y ) * -1;
						
						if ( _info.trackOffset.x < _info.allowTrackOffset.minX || _info.trackOffset.x > _info.allowTrackOffset.maxX ) {
							moveX = 0;
						}
						
						if ( _info.trackOffset.y < _info.allowTrackOffset.minY || _info.trackOffset.y > _info.allowTrackOffset.maxY ) {
							moveY = 0;
						}
						
						toX = _info.trackOffset.x + moveX;
						toY = _info.trackOffset.y + moveY;
						
						this.trackOffset( toX, toY, {overflowY:true} );
						
						_info.interaction.dragOffset.x += moveX;
						_info.interaction.dragOffset.y += moveY;
						
						
						if ( _info.interaction.globalMove == false ) {
							_info.interaction.globalMove = true;
							document.body.addEventListener(_info.interaction.hasTouch ? "touchmove" : "mousemove", _eventHandler, true);
						}
						
						this.dispatchEvent( "dragging", this );
					}
				}
				
				return true;
			},
			
			_end: function(e, leave) {
			
				if ( _info.interaction.globalMove == true ) {
					_info.interaction.globalMove = false;
					document.body.removeEventListener(_info.interaction.hasTouch ? "touchmove" : "mousemove", _eventHandler, true);
				}
			
				if ( _info.interaction.startInteraction ) {
					
					if ( _info.interaction.dragging == true ) {
						_info.interaction.dragging = false;
						
						this.dispatchEvent( "endDragging", this );
					}
					
					_info.interaction.target = undefined;
					_info.interaction.startInteraction = false;
				}
				
				return true;	
			},
			
			_eventHandler: function(e) {
				//console.log( 'e', e );
				
				var result = undefined;
				switch (e.type) {
					case "mousedown":
					case "touchstart":
						result = this._start.call( this, e );
					break;
					
					case "mousemove":
					case "touchmove":
						result = this._move.call( this, e );
					break;
					
					case "mouseup":
					case "mouseleave":
					case "touchend":
					case "touchcancel":
						result = this._end.call( this, e, ( e.type === "mouseleave" ) );
					break;
					
					case "mousewheel":
						if ( ! _info.interaction.startInteraction ) {
						
							var moveX = e.originalEvent.deltaX;
							var moveY = e.originalEvent.deltaY;
							
							this.contentOffset( _info.contentOffset.x + moveX, _info.contentOffset.y + moveY );
						}
						
						result = false;
					break;
				}
				
				return result;	
			},
			
			_info: function() {
				return _info;	
			},
			
			_updateValue: function() {
				$(_thumbValue).text( Math.round(this.value()) );	
			},
			
			destroy: function() {
			
				_thumb.removeEventListener(_info.interaction.hasTouch ? "touchstart" : "mousedown", _eventHandler, true);
				_thumb.removeEventListener(_info.interaction.hasTouch ? "touchmove" : "mousemove", _eventHandler, true);
				_thumb.removeEventListener(_info.interaction.hasTouch ? "touchend" : "mouseup", _eventHandler, true);
				
				if ( _info.interaction.hasTouch ) {
					_thumb.removeEventListener("touchcancel", _eventHandler, true);
				}
				else {
					$(document).unbind("mouseup" );
					$(document).unbind("mouseleave" );
				}
				
				_track.destroy(true);
				
				this._super("destroy", arguments );
			},
		
			init: function( element ) {
				var self = this._super().init();
				if ( self ) {
				
					if ( ! this.hasClass("UISlider") ) {
						this.addClass("UISlider");
					}
					
					_minimumTrack = $(element).find(".UISliderMinimumTrack").get(0);
					_maximumTrack = $(element).find(".UISliderMaximumTrack").get(0);
					
					_minimumValue = $(element).find(".UISliderMinimumValue").get(0);
					_maximumValue = $(element).find(".UISliderMaximumValue").get(0);
					
					_track = new Element( _minimumTrack );
					_thumb = $(element).find(".UISliderThumb").get(0);
					_thumbValue = $(element).find(".UISliderValue").get(0);
					
					_info = new UISliderInfo();
					
					if ( $(element).data("width") ) {
						$(_maximumTrack).css({
							width:$(element).data("width")
						});
					}
					
					_info.trackOffset.x = $(_minimumTrack).width();
					_info.trackOffset.y = 0;
					
					_info.allowTrackOffset.minX = 0;
					_info.allowTrackOffset.maxX = $(_maximumTrack).width();
					_info.allowTrackOffset.minY = 0;
					_info.allowTrackOffset.maxY = 0;
					
					_eventHandler = this.context(this._eventHandler);
					
					_thumb.addEventListener(_info.interaction.hasTouch ? "touchstart" : "mousedown", _eventHandler, true);
					_thumb.addEventListener(_info.interaction.hasTouch ? "touchmove" : "mousemove", _eventHandler, true);
					_thumb.addEventListener(_info.interaction.hasTouch ? "touchend" : "mouseup", _eventHandler, true);
					
					if ( _info.interaction.hasTouch ) {
						_thumb.addEventListener("touchcancel", _eventHandler, true);
					}
					else {
						$(document).bind("mouseup", _eventHandler );
						$(document).bind("mouseleave", _eventHandler );
					}
				}
				return this
			},

			trackOffset: function( x, y, options ) {
				if ( this.isDisabled() ) {
					return;
				}
			
				if ( arguments.length == 0 ) {
					return Object.clone( _info.contentOffset );
				}
				
				if ( ! options || ! options.overflowX === true ) {
					x = Math.min( Math.max(x, _info.allowTrackOffset.minX), _info.allowTrackOffset.maxX );
				}
				
				if ( ! options || ! options.overflowY === true ) {
					y = Math.min( Math.max(y, _info.allowTrackOffset.minY), _info.allowTrackOffset.maxY );
				}
				
				_track.css({
					width: x
				});
			
				_info.trackOffset.x = x;
				_info.trackOffset.y = y;
				
				this._updateValue();
				
				this.dispatchEvent( "tracking", this );
			},
			
			trackTo: function( x, y ) {
				if ( this.isDisabled() ) {
					return;
				}
			
				this.trackOffset( x, y );
			},
			
			trackToAnimation: function( x, y, options ) {
				if ( this.isDisabled() ) {
					return;
				}
				
				var duration = ( options && ! isNaN(parseInt(options["duration"])) ) ? parseInt(options["duration"]) : 300;	
				
				_track.killAnimation( false );
				
				_track.animate( duration*0.001, {
					width: x,
					onUpdate: function() {
						//_scrollInfo.contentOffset.y = parseInt( _scrollContainer.css("top") ) * -1;
					},
					onComplete: function() {
						this.dispatchEvent( "finishTrackAnimation", this );
					}
				});
				
				_info.trackOffset.x = x;
				
				this._updateValue();
			},
			
			value: function( value, animated ) {
				if ( arguments.length == 0 ) {
					return ( _info.allowTrackOffset.maxX == 0 ) ? 0 : (_info.trackOffset.x / _info.allowTrackOffset.maxX * 100);
				}
			
				var ratio = Math.min( Math.max( value / 100, 0 ), 1 );
				
				if ( animated === true ) {
					this.trackToAnimation( _info.allowTrackOffset.maxX * ratio, 0, {duration:300} );	
				}
				else {
					this.trackTo( _info.allowTrackOffset.maxX * ratio, 0 );	
				}
			}
			
		}
	}
}),

UITwinSliderInfo = (function ( target ) {
	var info = function UITwinSliderInfo() {};
	info.fn = info.prototype = {
		trackOffset: {
			minimum: {x:0, y:0},
			maximum: {x:0, y:0}
		},
		allowTrackOffset: {
			minimum: {minX:0, minY:0, maxX:0, maxY:0},
			maximum: {minX:0, minY:0, maxX:0, maxY:0}
		},
		stepGapSize: {width:0, height:0},
		
		interaction: {
			hasTouch: ('ontouchstart' in window) ? true : false,
			target: target,
			startTime: 0,
			beginPoint: {x:0, y:0},
			currentPoint: {x:0, y:0},
			dragOffset: {x:0, y:0},
			dragging: false,
			startInteraction: false,
			globalMove: false
		}
	};
	
	return info;
})(),

UITwinSlider = Class({
	name: "UITwinSlider",
	parent: UIControl,
	constructor: function() {
	
		var _maximumTrack, _minimumTrack, _minimumThumb, _maximumThumb, _minimumThumbValue, _maximumThumbValue, _minimumValue, _maximumValue, _track, _info, _eventHandler;
		
		return {
		
			_event: function( e ) {
				var pageX = 0, pageY = 0, timeStamp = 0;
	
				if ( e.originalEvent && e.originalEvent.touches != undefined ) {
					var touch = e.originalEvent.touches[0];
					if ( touch ) {
						timeStamp = touch.timeStamp;
						pageX = touch.clientX;
						pageY = touch.clientY;
					}
					else {
						//console.log( e, e.originalEvent );
					
						timeStamp = e.timeStamp;
						pageX = e.pageX;
						pageY = e.pageY;
					}
				}
				else if (  e.touches != undefined ) {
					var touch = e.touches[0];
					if ( touch ) {
						timeStamp = touch.timeStamp;
						pageX = touch.clientX;
						pageY = touch.clientY;
					}
					else {
						timeStamp = e.timeStamp;
						pageX = e.pageX;
						pageY = e.pageY;
					}
				}
				else {
					timeStamp = e.timeStamp;
					pageX = e.pageX;
					pageY = e.pageY;
				}
				
				return {
					timeStamp: timeStamp || (new Date()).getTime(),
					pageX: pageX,
					pageY: pageY	
				};	
			},
			
			_timeStamp: function() {
				return (new Date()).getTime();
			},
			
			_start: function(e) {
				var event = this._event(e);
				
				_info.interaction.startTime = this._timeStamp();		
				_info.interaction.beginPoint.x = _info.interaction.currentPoint.x = event.pageX;
				_info.interaction.beginPoint.y = _info.interaction.currentPoint.y = event.pageY;
				
				_info.interaction.clickable = true;
				_info.interaction.startInteraction = true;
				_info.interaction.dragOffset.x = 0;
				_info.interaction.dragOffset.y = 0;
				
				_track.killAnimation( false );
				
				return true;
			},
			
			_move: function(e) {
			
				e.preventDefault();
			
				if ( _info.interaction.startInteraction ) {
					var point, wasPoint, moveX, moveY, toX, toY, target, trackOffset, allowTrackOffset, event = this._event(e),
					point = {x:event.pageX, y:event.pageY};
					wasPoint = {x:_info.interaction.currentPoint.x, y:_info.interaction.currentPoint.y};
					
					if ( _info.interaction.dragging == false ) {
						this.dispatchEvent( "startDragging", this );
					}
					
					_info.interaction.clickable = false;
					_info.interaction.dragging = true;
					_info.interaction.currentPoint.x = event.pageX;
					_info.interaction.currentPoint.y = event.pageY;
					
					if ( _info.interaction.dragging == true ) {
						moveX = ( wasPoint.x - point.x ) * -1;
						moveY = ( wasPoint.y - point.y ) * -1;
						target = ( _info.interaction.target === _minimumThumb ) ? "minimum" : "maximum";
						trackOffset = _info.trackOffset[target];
						allowTrackOffset = _info.allowTrackOffset[target];
						
						if ( trackOffset.x < allowTrackOffset.minX || trackOffset.x > allowTrackOffset.maxX ) {
							moveX = 0;
						}
						
						if ( trackOffset.y < allowTrackOffset.minY || trackOffset.y > allowTrackOffset.maxY ) {
							moveY = 0;
						}
						
						toX = trackOffset.x + moveX;
						toY = trackOffset.y + moveY;
				
						this.trackOffset( target, toX, toY, {overflowY:true} );
						
						_info.interaction.dragOffset.x += moveX;
						_info.interaction.dragOffset.y += moveY;
						
						if ( _info.interaction.globalMove == false ) {
							_info.interaction.globalMove = true;
							document.body.addEventListener(_info.interaction.hasTouch ? "touchmove" : "mousemove", _eventHandler, true);
						}
						
						this.dispatchEvent( "dragging", this );
					}
				}
				
				return true;
			},
			
			_end: function(e, leave) {
			
				if ( _info.interaction.globalMove == true ) {
					_info.interaction.globalMove = false;
					document.body.removeEventListener(_info.interaction.hasTouch ? "touchmove" : "mousemove", _eventHandler, true);
				}
			
				if ( _info.interaction.startInteraction ) {
					
					if ( _info.interaction.dragging == true ) {
						_info.interaction.dragging = false;
						
						this.dispatchEvent( "endDragging", this );
					}
					
					_info.interaction.target = undefined;
					_info.interaction.startInteraction = false;
				}
				
				return true;	
			},
			
			_eventHandler: function(e) {
				
				var result = undefined;
				switch (e.type) {
					case "mousedown":
					case "touchstart":
					
						if ( ! _info.interaction.target ) {
							_info.interaction.target = e.currentTarget;
						}
					
						result = this._start.call( this, e );
					break;
					
					case "mousemove":
					case "touchmove":
						result = this._move.call( this, e );
					break;
					
					case "mouseup":
					case "mouseleave":
					case "touchend":
					case "touchcancel":
						result = this._end.call( this, e, ( e.type === "mouseleave" ) );
					break;
					
					case "mousewheel":
						if ( ! _info.interaction.startInteraction ) {
						
							var moveX = e.originalEvent.deltaX;
							var moveY = e.originalEvent.deltaY;
							
							this.contentOffset( _info.contentOffset.x + moveX, _info.contentOffset.y + moveY );
						}
						
						result = false;
					break;
				}
				
				return result;	
			},
			
			_info: function() {
				return _info;	
			},
			
			_updateValue: function() {
				$(_thumbValue).text( Math.round(this.value()) );	
			},
			
			destroy: function() {
			
				_minimumThumb.removeEventListener(_info.interaction.hasTouch ? "touchstart" : "mousedown", _eventHandler, true);
				_minimumThumb.removeEventListener(_info.interaction.hasTouch ? "touchmove" : "mousemove", _eventHandler, true);
				_minimumThumb.removeEventListener(_info.interaction.hasTouch ? "touchend" : "mouseup", _eventHandler, true);
				
				_maximumThumb.removeEventListener(_info.interaction.hasTouch ? "touchstart" : "mousedown", _eventHandler, true);
				_maximumThumb.removeEventListener(_info.interaction.hasTouch ? "touchmove" : "mousemove", _eventHandler, true);
				_maximumThumb.removeEventListener(_info.interaction.hasTouch ? "touchend" : "mouseup", _eventHandler, true);
				
				if ( _info.interaction.hasTouch ) {
					_minimumThumb.removeEventListener("touchcancel", _eventHandler, true);
					_maximumThumb.removeEventListener("touchcancel", _eventHandler, true);
				}
				else {
					$(document).unbind("mouseup" );
					$(document).unbind("mouseleave" );
				}
				
				_track.destroy(true);
				
				this._super().destroy.apply( this._super(), arguments );
			},
		
			init: function(element) {
				var self = this._super("init", arguments);
				if ( self ) {
					if ( ! this.hasClass("UTwinISlider") ) {
						this.addClass("UITwinSlider");
					}
					
					_minimumTrack = $(element).find(".UITwinSliderMinimumTrack").get(0);
					_maximumTrack = $(element).find(".UITwinSliderMaximumTrack").get(0);
					
					_minimumThumbValue = $(element).find(".UITwinSliderMinimumThumbValue").get(0);
					_maximumThumbValue = $(element).find(".UITwinSliderMaximumThumbValue").get(0);
					
					_minimumValue = $(element).find(".UITwinSliderMinimumValue").get(0);
					_maximumValue = $(element).find(".UITwinSliderMaximumValue").get(0);
					
					_minimumThumb = $(element).find(".UITwinSliderMinimumThumb").get(0);
					_maximumThumb = $(element).find(".UITwinSliderMaximumThumb").get(0);
					
					_track = new Element(_minimumTrack);
					_info = new UITwinSliderInfo();
					
					_info.trackOffset.minimum.x = $(_minimumTrack).position().left;
					_info.trackOffset.minimum.y = 0;
					
					_info.trackOffset.maximum.x = $(_minimumTrack).width();
					_info.trackOffset.maximum.y = 0;
					
					_info.allowTrackOffset.minimum.minX = 0;
					_info.allowTrackOffset.minimum.maxX = $(_minimumTrack).position().left + $(_minimumTrack).outerWidth();
					_info.allowTrackOffset.minimum.minY = 0;
					_info.allowTrackOffset.minimum.maxY = 0;
					
					_info.allowTrackOffset.maximum.minX = 0;
					_info.allowTrackOffset.maximum.maxX = $(_maximumTrack).outerWidth() - $(_minimumTrack).position().left;
					_info.allowTrackOffset.maximum.minY = 0;
					_info.allowTrackOffset.maximum.maxY = 0;
					
					_eventHandler = this.context(this._eventHandler);
					
					_minimumThumb.addEventListener(_info.interaction.hasTouch ? "touchstart" : "mousedown", _eventHandler, true);
					_minimumThumb.addEventListener(_info.interaction.hasTouch ? "touchmove" : "mousemove", _eventHandler, true);
					_minimumThumb.addEventListener(_info.interaction.hasTouch ? "touchend" : "mouseup", _eventHandler, true);
					
					_maximumThumb.addEventListener(_info.interaction.hasTouch ? "touchstart" : "mousedown", _eventHandler, true);
					_maximumThumb.addEventListener(_info.interaction.hasTouch ? "touchmove" : "mousemove", _eventHandler, true);
					_maximumThumb.addEventListener(_info.interaction.hasTouch ? "touchend" : "mouseup", _eventHandler, true);
					
					if ( _info.interaction.hasTouch ) {
						_minimumThumb.addEventListener("touchcancel", _eventHandler, true);
						_maximumThumb.addEventListener("touchcancel", _eventHandler, true);
					}
					else {
						$(document).bind("mouseup", _eventHandler );
						$(document).bind("mouseleave", _eventHandler );
					}
				}
				return this
			},
			
			trackOffset: function( target, x, y, options ) {
			
				if ( this.isDisabled() ) {
					return;
				}
			
				if ( arguments.length == 0 ) {
					return Object.clone( _info.contentOffset );
				}
				
				var allowTrackOffset = _info.allowTrackOffset[target];
				
				if ( ! options || ! options.overflowX === true ) {
					x = Math.min( Math.max(x, allowTrackOffset.minX), allowTrackOffset.maxX );
				}
				
				if ( ! options || ! options.overflowY === true ) {
					y = Math.min( Math.max(y, allowTrackOffset.minY), allowTrackOffset.maxY );
				}
				
				if ( target === "maximum" ) {
					_track.css({
						width: x
					});
					
					_info.allowTrackOffset.minimum.minX = 0;
					_info.allowTrackOffset.minimum.maxX = $(_minimumTrack).position().left + $(_minimumTrack).outerWidth();
					_info.allowTrackOffset.minimum.minY = 0;
					_info.allowTrackOffset.minimum.maxY = 0;
					
					_info.trackOffset[target].x = x;
					_info.trackOffset[target].y = y;
					
					//_info.trackOffset.minimum.x = $(_minimumTrack).offset().left;
					//_info.trackOffset.minimum.y = 0;
				}
				else if ( target === "minimum" ) {
				
					_track.css({
						left: x,
						width: (_info.allowTrackOffset.minimum.maxX - x)
					});
					
					_info.allowTrackOffset.maximum.minX = 0;
					_info.allowTrackOffset.maximum.maxX = $(_maximumTrack).outerWidth() - $(_minimumTrack).position().left;
					_info.allowTrackOffset.maximum.minY = 0;
					_info.allowTrackOffset.maximum.maxY = 0;
					
					_info.trackOffset[target].x = x;
					_info.trackOffset[target].y = y;
					
					_info.trackOffset.maximum.x = $(_minimumTrack).width();
					_info.trackOffset.maximum.y = 0;
				}
				
				//this._updateValue();
				
				//this.dispatchEvent( "tracking", this );
			},
			
			trackTo: function( x, y ) {
				if ( this.isDisabled() ) {
					return;
				}
			
				this.trackOffset( x, y );
			},
			
			trackToAnimation: function( x, y, options ) {
				if ( this.isDisabled() ) {
					return;
				}
				
				var duration = ( options && ! isNaN(parseInt(options["duration"])) ) ? parseInt(options["duration"]) : 300;	
				
				_track.killAnimation( false );
				
				_track.animate( duration*0.001, {
					width: x,
					onUpdate: function() {
						//_scrollInfo.contentOffset.y = parseInt( _scrollContainer.css("top") ) * -1;
					},
					onComplete: function() {
						this.dispatchEvent( "finishTrackAnimation", this );
					}
				});
				
				_info.trackOffset.x = x;
				
				this._updateValue();
			}
		}
	}
});
	
})(window);



(function(window, undefined) {

'use strict';
	
var 

Class = UI.Class,
UICore = Class.UICore,

UIInput = Class({
	name: "UIInput",
	parent: UICore,
	constructor: function() {
		
		return {
			init: function( element ) {
				var self = this._super("init", arguments);
				if ( self ) {
				
					return this;
				};
			},
			
			focus: function() {
				this.element().focus();
			}
		}
	}
}),

UITextArea = Class({
	name: "UITextArea",
	parent: UICore,
	constructor: function(  ) {
		
		return {
			init: function( element ) {
				var self = this._super("init", arguments);
				if ( self ) {
					
					return this;
				};
			}
		}
	}
}),

UISpin = Class({
	name: "UISpin",
	parent: UICore,
	constructor: function() {
		
		var _minusButton, _plusButton, _input;
		var _value = 0;
		var _minValue = 0;
		var _maxValue = 10;
		
		return {
			init: function( element ) {
			
				var self = this._super("init", arguments);
				if ( self ) {
				
					_minusButton = $(element).find(".UISpinButton.Minus").get(0);
					_plusButton = $(element).find(".UISpinButton.Plus").get(0);
					_input = $(element).find(".UISpinInput").get(0);
				
					_value = parseInt( _input.value );
					_value = ( isNaN( _value ) ) ? 0 : _value;
					
					$(_minusButton).bind("click", function(e) {
						_value = Math.min( Math.max( (_value - 1), _minValue ), _maxValue );
						_input.value = _value;
					});
					
					$(_plusButton).bind("click", function(e) {
						_value = Math.min( Math.max( (_value + 1), _minValue ), _maxValue );
						_input.value = _value;
					});
					
					return this;
				};
			}
		}
	}
});

})(window);

(function(window, undefined) {

'use strict';
	
var 

Class = UI.Class,
Element = Class.Element,
UICore = Class.UICore,
UIControl = Class.UIControl,

UISelectOption = Class({
	name: "UISelectOption",
	parent: Element,
	constructor: function() {
	
		var _option, _selected;
	
		return {
			init: function( element, option, label, value, selectBox ) {
				var self = this._super("init", arguments );
				if (self) {
				
					var that = this;
					
					_option = option;
				
					this.html(label);
					this.data("value", value);
					this.addClass("UISelectOption");
					
					this.bind("click", function(e) {
						selectBox.selectOption( that );
						
						e.stopPropagation();
						return false;
					});
				
					return this;	
				}
			},
			
			destroy: function() {
				this.unbind("click");
				
				this._super("destroy", arguments);
			},
			
			option: function() {
				return _option;	
			},
			
			label: function() {
				return this.element.html();	
			},
			
			value: function( value ) {
				if ( arguments.length === 0 ) {
					return this.data("value");
				}
				
				this.data("value", value);
			},
			
			selected: function( selected ) {
				_selected = selected;
				
				if ( _selected == true ) {
					$(_option).attr("selected", true);
					
					this.addClass("selected");
				}
				else {
					$(_option).removeAttr("selected");
					
					this.removeClass("selected");
				}
			}
		}
	}
}),

UISelectBox = Class({
	name: "UISelectBox",
	parent: Element,
	constructor: function() {
	
		var _currentSelect, _that, _content, _container, _items = [];
		
		return {
			init: function( element ) {
				var self = this._super("init", arguments );
				if (self) {
					
					_that = this;
					
					if ( $(element).find("DIV.UISelectContent").get(0) ) {
						_content = new Element($(element).find("DIV.UISelectContent").get(0));
					}
					else {
						_content = new Element("DIV");
						_content.addClass("UISelectContent");
					}
					
					if ( $(element).find("UL.UISelectOptions").get(0) ) {
						_container = new Element($(element).find("UL.UISelectOptions").get(0));
					}
					else {
						_container = new Element("UL");
						_container.addClass("UISelectOptions");
					}
					
					//this.attr("id", "__UISelectBox__" + time());
					this.addClass("UISelectBox");
					
					_content.append( _container );
					
					this.append(_content);
					
					$(document).bind("click", function(e) {
						_that.close();
					});
					
					return this;
				}
			},
			
			destroy: function() {
			
				$(document).unbind("click.UISelect");
				
				_container.destroy(true);
				_content.destroy(true);
				
				this._super("destroy", arguments);		
			},
			
			clear: function() {
				while( _items.length > 0 ) {
					var item = _items.shift();
					item.destroy(true);
				}
				
				_items = [];
			
				_container.empty();	
			},
			
			selectOption: function( option ) {
				Array.each( _items, function( index, item ) {
					item.selected( ( item === option ) ? true : false );
				});
				
				if ( _currentSelect ) {
					
					$(_currentSelect.element()).trigger("change");
				
					var selectedTitle = _currentSelect.selectedTitle();
					_currentSelect.label().html( selectedTitle );
					_currentSelect.dispatchEvent( "change", _currentSelect );
					_currentSelect.close();
				}
			},
			
			open: function( select ) {
				_currentSelect = select;
								
				this.clear();
				
				var options = select.options();
				var selectedIndex = select.selectedIndex();
				var selectElement = this;
				
				Array.each( options, function( index, option ) {
					var label = option.innerHTML;
					var value = option.getAttribute("value");
				
					var item = new UISelectOption( "LI", option, label, value, selectElement);
					item.selected( (( selectedIndex === index ) ? true : false) );
					
					_items.push( item );
					_container.append( item );
				});
				
				// TODO : scroll
				this.addClass("open");
			},
			
			close: function( select ) {
				this.removeClass("open");
			}
		}	
	}
}),

UISelectLink = Class({
	name: "UISelectLink",
	parent: Element,
	constructor: function() {
	
		var _select, _label, _arrow;
		
		return {
			
		
			init: function( element, select ) {
				var self = this._super("init", arguments);
				if (self) {
				
					_select = select;
					
					if ( $(element).find("span.UISelectLabel").get(0) ) {
						_label = new Element($(element).find("span.UISelectLabel").get(0));
					}
					else {
						_label = new Element("span");
						_label.addClass("UISelectLabel");
					}
					
					if ( $(element).find("span.UISelectArrow").get(0) ) {
						_label = new Element($(element).find("span.UISelectArrow").get(0));
					}
					else {
						_arrow = new Element("span");
						_arrow.addClass("UISelectArrow");
					}
					
					this.addClass("UISelect");
					this.attr("href", "javascript:void(0);");
					
					this.append(_label);
					this.append(_arrow);
					
					this.bind("click", function(e) {
						_select.open();
						e.stopPropagation();
						return false;
					});
					
					return this;
				}
			},
			
			label: function() {
				return _label;	
			},
			
			outerHeight: function() {
				return $(this.element()).outerHeight();	
			},
			
			destroy: function() {
				this.unbind("click");
			
				_label.destroy(true);
				_arrow.destroy(true);
				
				this._super("destroy", arguments);	
			}
		};
	}
}),

UISelect = Class({
	name: "UISelect",
	parent: UIControl,
	constructor: function() {
		
		var _selectBox;
		var _selectLink;
		
		return {
			options: function() {
				return this.find("option");
			},
			
			selectedIndex: function() {
				return this.element().selectedIndex;	
			},
			
			selectedTitle: function() {
				var options = this.options();
				var selectedIndex = this.selectedIndex();
			
				if ( options[selectedIndex] ) {
					return options[selectedIndex].innerHTML;
				}
				
				return undefined;
			},
			
			clear: function() {
				this.empty();
			},
			
			addOption: function( text, value ) {
				var option = document.createElement("OPTION");
				option.text = text;
				option.value = value;
				
				this.element().appendChild( option );
			},
			
			label: function() {
				return _selectLink.label();	
			},
			
			open: function() {
			
				var position = {
					x:_selectLink.offset().x,
					y:(_selectLink.offset().y + _selectLink.outerHeight())
				};
			
				_selectBox.css({
					//"-webkit-transform": "translateX(" + _selectLink.offset().x + "px) translateY(" + (_selectLink.offset().y + _selectLink.outerHeight()) + "px) translateZ(0px)"
					left: position.x, 
					top: position.y
				});
				
				_selectBox.open( this );
			},
			
			close: function() {
				
				_selectBox.close( this );	
			},
			
			val: function() {
				var options = this.options();	
				var selectedIndex = this.selectedIndex();
			
				if ( options[selectedIndex] && options[selectedIndex].value ) { 
					return options[selectedIndex].value;
				}
				
				return null;
			},
			
			destroy: function() {
			
				_selectLink.destroy(true);
				
				this._super("destroy", arguments );	
			},
		
			init: function( element ) {
				var self = this._super("init", arguments);
				if ( self ) {
					if ( ! this.hasClass("UISelect") ) {
						this.addClass("UISelect");
					}
					
					var selectBoxClass = $(element).attr("data-class-select-box");
					var selectBoxSelector = $(element).attr("data-selector-select-target");
					
					if ( selectBoxSelector && $(selectBoxSelector).get(0) ) {
					
						if ( $(selectBoxSelector).instance() ) {
							_selectBox = $(selectBoxSelector).instance();
						}
						else {
							_selectBox = new UISelectBox( $(selectBoxSelector).get(0) );
						}
					}
					else if ( selectBoxClass !== "UISelect" ) {
						_selectBox = new UISelectBox( "DIV" );
					}
					else {
						_selectBox = UISelect.selectBox();
					}
					
					_selectBox.addClass(selectBoxClass);
					
					_selectLink = new UISelectLink("A", this);
					_selectLink.label().html( this.selectedTitle() );
					
					this.insertAfter( _selectLink );
					
					_selectLink.addClass( this.element().className );
					if ( $(element).attr("style") ) {
						_selectLink.attr("style", $(element).attr("style"));
					}

					
					//if ( $(document.body).contains( _selectBox.element() ) ) {
						$(document.body).append( _selectBox.element() );
					//}
					
					return this;
				};
			}
		}
	},
	'static': function() {
	
		var _selectBox;
		
		return {
			selectBox: function() {
				if ( _selectBox === undefined ) {
					_selectBox = new UISelectBox("DIV");
				}
				
				return _selectBox;
			}
		}
	}
});
	
})(window);

(function(window, undefined) {

'use strict';

var
Class = UI.Class,
Element = Class.Element,
UICore = Class.UICore,

UIIndicator = Class({
	name: "UIIndicator",
	parent: UICore,
	constructor: function() {
		
		return {
			init: function( element ) {
				var self = this._super("init", arguments);
				if ( self ) {
					
					return this;
				}
			}
		}
	}
}),

UIProgressBar = Class({
	name: "UIProgressBar",
	parent: UICore,
	constructor: function(  ) {
	
		var _value = 0;
		var _track;
		
		return {
			init: function( element ) {
				var self = this._super("init", arguments);
				if ( self ) {
					_track = $(element).children().first().instance( Element );
					
					return this;
				}
			},
			
			value: function( value, animated ) {
				if ( typeof value === "string" && value.indexOf('%') !== -1 ) {
					value = parseFloat(value);
					value = isNaN(value) ? 0 : value;
					value = (value/100);
				}
				
				_value = Math.min( Math.max( value, 0 ), 1 );
				
				var duration = ( animated ) ? 0.35 : 0;
				
				_track.killAnimation(false);
				_track.animate(duration, {
					width: (this.width()*_value)
				});
			}
		}
	}
}),

UIMultiProgressBar = Class({
	name: "UIMultiProgressBar",
	parent: UICore,
	constructor: function() {
	
		var _totalIndicator;
		var _currentIndicator;
		var _count = 0;
		var _total = 0;
		
		return {
			init: function( element ) {
				var self = this._super("init", arguments);
				if ( self ) {
					_totalIndicator = $(element).find("[data-total]").first().instance( UIProgressBar );
					_currentIndicator = $(element).find("[data-current]").first().instance( UIProgressBar );
					
					_count = 0;
					_total = parseInt( _totalIndicator.attribute("data-total") );
					
					return this;
				}
			},
			
			value: function( value ) {
				_currentIndicator.value( value );
			},
			
			total: function() {
				return _total;
			},
			
			count: function( count ) {
				if ( arguments.length == 0 ) {
					return _count;
				}
				
				_count = count;
				
				var value = ( _count == 0 || _total == 0 ) ? 0 : (_count / _total * 100);
				
				_totalIndicator.value( value + "%", true );
			}
		}
	}
}),

UIPageIndicator = Class({
	name: "UIPageIndicator",
	parent: UICore,
	constructor: function(  ) {
		
		var _container;
		var _numberOfPages = 0;
		var _currentPage = 0;
		var _items = [];
		var _delegate = undefined;
		var _delegateCan = {
			didSelectPage: false	
		};
		
		return {
			init: function( element, container ) {
				var self = this._super("init", arguments);
				if (self) {
				
					_container = new Element( "UL" );
					this.append( _container );
					
					return this;
				}
			},
			
			destroy: function() {
				_container.destroy(true);
				
				this._super("destroy", arguments );
			},
			
			delegate: function( delegate ) {
				_delegate = delegate;
				_delegateCan.didSelectPage = ( typeof _delegate["didSelectPage"] === "function" );	
			},
			
			setNeedsDisplay: function() {
			
				var self = this;
				
				_container.empty();
				_items = [];
			
				for ( var page=1; page<=_numberOfPages; page++ ) {
					
					var element = document.createElement("LI");
					var span = document.createElement("SPAN");
					span.innerHTML = page;
					element.appendChild( span );
					
					var item = new Element( element );
					item.data("page", page);
					item.bind("click", this.context(function(e) { 
						_currentPage = this.data("page");
						
						if ( _delegateCan.didSelectPage ) {
							_delegate.didSelectPage( self, _currentPage );
						}
					}, item));
					
					if ( _currentPage === page ) {
						item.addClass("active");
					}
					
					_container.append(item);
					
					_items.push( item );
				}
			},
			
			currentPage: function( page ) {
				_currentPage = Math.min(Math.max(0, page), _numberOfPages);
				
				Array.each( _items, function( page, item ) {
					if ( _currentPage === page ) {
						item.addClass("active");
					}
					else {
						item.removeClass("active");
					}
				});
			},
			
			numberOfPages: function( count ) {
				_numberOfPages = count;
				
				this.setNeedsDisplay();
			}
		};
	}
});


})(window);


(function(window, undefined) {

'use strict';

var
Class = UI.Class,
UICore = Class.UICore,
UIScroll = Class.UIScroll,

UISwipe = Class({
	name: "UISwipe",
	parent: UIScroll,
	constructor: function() {
		
		return {
			init: function( element ) {
				var self = this._super("init", arguments);
				if ( self ) {
					var _super = this._super();
					_super.pagingEnabled( true );
					_super.useScrollBar( false );
					_super.scrollBounceVertical(false);
					_super.scrollBounceHorizontal(false);
					
					this.constructor.prototype.pagingEnabled = this.pagingEnabled = undefined;
					this.constructor.prototype.scrollBounceVertical = this.scrollBounceVertical = undefined;
					this.constructor.prototype.scrollBounceHorizontal = this.scrollBounceHorizontal = undefined;
					this.constructor.prototype.useScrollBar = this.useScrollBar = undefined;
					
					$(this.element()).unbind("mousewheel");
					
					// TODO: last duplication 
					
					return this;
				};
			},
			
			useMouseWheel: function() {
				$(this.element()).bind("mousewheel", this._eventHandler );
			},
			
			currentPage: function() {
				var scrollInfo = this.scrollInfo();
				var pageWidth = scrollInfo.frameSize.width;
				return Math.floor((scrollInfo.contentOffset.x - pageWidth / 2) / pageWidth) + 1;
			}
		}
	}
});

})(window);
(function(window, undefined) {

'use strict';

var
Class = UI.Class,
UICore = Class.UICore,

UILayerContent = Class({
	name: "UILayerContent",
	parent: UICore,
	constructor: function(  ) {
	
		var _layer;
		
		return {
			init: function( element, layer ) {
				var self = this._super("init", arguments);
				if ( self ) {
				
					_layer = layer;
					
					var data = this.data();
					var contentSize = {
						width: parseInt(data["width"]),
						height: parseInt(data["height"])
					}
					
					this.css({
						marginLeft: contentSize.width * -0.5,
						marginTop: 100,
						width: contentSize.width,
						height: contentSize.height
					});
					
					return this;
				}
			}
		}
	}
}),

UILayer = Class({
	name: "UILayer",
	parent: UICore,
	constructor: function(  ) {
	
		var _modal;
		var _content;
		
		return {
			init: function( element ) {
				var self = this._super("init", arguments);
				if ( self ) {
				
					_modal = $(element).find(".UIModal").instance(UIModal);
					_content = $(element).find(".UILayerContent").instance(UILayerContent, this);
					
					return this;
				}
			},
			
			show: function() {
				_modal.show();
				
				$( this.element() ).show();
			},
			
			hide: function() {
				_modal.hide();
				
				$( this.element() ).hide();
			},
			
			content: function() {
				return _content;	
			},
			
			modal: function(){
				return _modal;
			}
		}
	}
}),

UIModal = Class({
	name: "UIModal",
	parent: UILayer,
	constructor: function(  ) {
		
		return {
			init: function( element ) {
				var self = this._super("init", arguments);
				if ( self ) {
					
				
					return this;
				}
			},
			
			show: function() {
				this._super("show", arguments);
				
				$("body").css({
					height:"100%",
					overflow:"hidden"
				});
			},
			
			hide: function() {
				this._super("hide", arguments);
				
				$("body").css({
					height:"",
					overflow:""
				});
			}
		}
	}
});

})(window);


(function(window, undefined) {

'use strict';
	
var 

Class = UI.Class,
Responder = Class.Responder,

UIComponent = Class({
	name:"UIComponent",
	parent:Responder,
	constructor: function() {
	
		var _view;
		
		return {
			init: function() {
				var self = this._super().init();
				if (self) {
				
					return this;	
				}
			},
			
			view: function( view ) {
				if ( arguments.length === 0 ) {
					return _view;
				}
				
				_view = view;
			}
		};
	}
});

})(window);

(function(window, undefined) {

'use strict';

var 

Class = UI.Class,

UIDatePickerView= Class({
	name: "UIDatePickerView",
	parent: "UIView",
	constructor: function() {
	
		var _$element, _picker;
	
		return {
			init: function( element, picker ) {
				var self = this._super("init", [element]);
				if (self) {
				
					_picker = picker;
					
					this.setupElements( element );
					this.setupEvents();
					
					this.addClass("UIDatePicker");
					
					return this;
				}
			},
			
			setupElements: function(element, input) {
				_$element = $(element);
			},
			
			setupEvents: function() {
				_$element.bind("mouseenter", function(e) {
					$(this).attr("data-enter", "Y");
				});
				
				_$element.bind("mouseleave", function(e) {
					$(this).attr("data-enter", "N");
				});
			}
		}	
	}
}),

UIDatePickerRelatedInput = function( input, picker ) {
	
	var view = picker.view();
	var $view = $(view.element());
	var $input = $(input);
	
	var focusing = false;
	
	var constructor = {
	
		init: function() {
			$input.attr("maxlength", 8);
			
			if ( $input.val().length == 8 ) {
				picker.calendar().select( $(this).val().substr(6,2), $(this).val().substr(4,2), $(this).val().substr(0,4) );
			}
			
			if ( $input.attr("data-current-date") ) {
				$input.val( picker.calendar().info().date );
			}
		},
		
		focus: function() {
			if ( focusing == true ) {
				return;
			}
			
			focusing = true;
			
			var position = {
				x:parseInt($input.offset().left),
				y:(parseInt($input.offset().top) + $(input).outerHeight())
			};
	
			if ( (position.x + $view.width()) > $(window).width() ) {
				position.x = position.x + $input.width() - $view.width();
			}
			
			if ( (position.y + $view.height()) > $(window).height() ) {
				position.y = position.y - $view.height() - $input.outerHeight();
			}
		
			$input.val( $input.val().replace(/\-/gi, '') );
			$view.css({
				left: position.x, 
				top: position.y
			}).addClass("open");
			
			picker.currentInput( input );
		},
		
		blur: function() {
			
			if ( focusing == false ) {
				return;
			}
			
			focusing = false;
			
			if ( view.data("enter") !== "Y" ) {
				$view.removeClass("open");
				$input.val( picker.calendar().info().date );
			}
			else {
				$input.focus();
			}
		}
	};
	
	$input.bind("focus", function(e) {
		constructor.focus();
	});
	
	$input.bind("blur", function(e) {
		if ( focusing == true ) {
			constructor.blur();
		}
	});
	
	$input.bind("keydown", function(e) {
		if ( e.keyCode == 13 ) {
			$(this).blur();
		}
		
		if( ( e.keyCode >=  48 && e.keyCode <=  57 ) ||   //숫자열 0 ~ 9 : 48 ~ 57
		      ( e.keyCode >=  96 && e.keyCode <= 105 ) ||   //키패드 0 ~ 9 : 96 ~ 105
		        e.keyCode ==   8 ||    //BackSpace
		        e.keyCode ==  46 ||    //Delete
		        e.keyCode ==  37 ||    //좌 화살표
		        e.keyCode ==  39 ||    //우 화살표
		        e.keyCode ==  35 ||    //End 키
		        e.keyCode ==  36 ||    //Home 키
		        e.keyCode ==   9       //Tab 키
		     ) {
			 
			 
		 }
		 else {
		 	e.returnValue = false;
			 return false;
		 }
	});
	
	$input.bind("keyup", function(e) {
		if ( $(this).val().length == 8 ) {
			picker.calendar().select( $(this).val().substr(6,2), $(this).val().substr(4,2), $(this).val().substr(0,4) ); 
		}	 
	});
	
	constructor.init();
	
	return constructor;
},

UIDatePicker = Class({
	name: "UIDatePicker",
	parent: "UIComponent",
	constructor: function() {
	
		var _view, _calendar, _inputs = [], _currentInput = null;
		
		return {
			init: function( delegate ) {
				
				this.setupElements();
				this.setupEvents();
				
				return this;
			},
			
			setupElements: function() {
				var picker = this;
			
				_view = new UIDatePickerView( "DIV", picker );
				_calendar = new UICalendar( "DIV" );
				_calendar.currentDate();
				
				_view.append( _calendar );
				
				document.body.appendChild(_view.element());
			},
			
			currentInput: function( input ) {
				_currentInput = input;	
			},
			
			view: function() {
				return _view;
			},
			
			setupEvents: function() {
				var picker = this;
			
				_calendar.bind("select", function( data ) {
					if ( $(_currentInput).length > 0 ) {
						$(_currentInput).val( ( $(_currentInput).is(":focus") ? data.date.replace(/\-/gi, '') : data.date ) );
					}
				});
				
				_calendar.bind("change", function( data ) {
					
				});
			},
			
			relate: function( input ) {
				if ( ! Array.inArray( _inputs, input ) ) {
					
					_inputs.push( input );
					
					var item = new UIDatePickerRelatedInput( input, this );
					
					
				}
			},
			
			calendar: function() {
				return _calendar;	
			},
			
			change: function( date ) {
				
				this.dispatchEvent( "change", this, date );	
			}
		}
	},
	'staticConstructor': function () {
	
		var _sharedInstance;
		
		return {
			sharedInstance: function() {
				if ( _sharedInstance !== null ) {
					_sharedInstance = new UIDatePicker();
				}
				
				return _sharedInstance;
			},
		
			relate: function( input ) {
				this.sharedInstance().relate( input );
			}
		}
	}
}),

UICalendar = Class({
	name: "UICalendar",
	parent: "UICore",
	constructor: function() {
		
		var _$element, _$header, _$content, _calendarInfo = {
			today: new Date(),
			day: new Date().getDate(),
			date: "",
			lastDay: 0,
			year: (new Date()).getFullYear(),
			month: (new Date()).getMonth()+1,
			weekNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], 
			monthNames: ["January","February","March","April","May","June", "July","August","September","October","November","December"]
		};
	
		return {
			init: function( element ) {
				var self = this._super("init", [element]);
				if (self) {
				
					this.setupElements( element );
					this.setupEvents();
					
					this.addClass("UICalendar");
					
					return this;
				}
			},
			
			currentDate: function() {
				var date = new Date();
				//console.log( date.getFullYear() );
			
				this.change( date.getFullYear(), date.getMonth()+1 );
				this.select( date.getDate() );
			},
			
			prevMonth: function() {
				if ( _calendarInfo.month <= 1 ) {
					_calendarInfo.month = 12;
					_calendarInfo.year = parseInt(_calendarInfo.year) - 1;
				}
				else {
					_calendarInfo.month = parseInt(_calendarInfo.month) - 1;
				}
				
				this.change( _calendarInfo.year, _calendarInfo.month );	
			},
			
			nextMonth: function() {
				if ( _calendarInfo.month >= 12 ) {
					_calendarInfo.month = 1;
					_calendarInfo.year = parseInt(_calendarInfo.year) + 1;
				}
				else {
					_calendarInfo.month = parseInt(_calendarInfo.month) + 1;
				}
				
				this.change( _calendarInfo.year, _calendarInfo.month );
			},
			
			isToday: function( year, month, day ) {
				return (_calendarInfo.today.getFullYear() == year && _calendarInfo.today.getMonth() == (month-1) && _calendarInfo.today.getDate() == day) ? true : false;
			},
			
			info: function() {
				return _calendarInfo;	
			},
			
			select: function( day, month, year ) {
				//console.log( "select", day, month, year );
			
				if ( arguments.length == 3 ) {
					if ( _calendarInfo.month !== month || _calendarInfo.year !== year ) {
						this.change( year, month );
					}
				}
			
				var date = [];
				var year = _calendarInfo.year.toString();
				var month = _calendarInfo.month.toString();
				var day = day.toString();
				date.push( year );
				date.push( (month.length == 1 ? ("0"+month) : month) );
				
				var hasSelect = false;
				
				_$content.find("TBODY TD[data-day]").removeClass("select").each( function( idx, item ) {
					if ( $(item).data("day") == day ) {
						$(item).addClass("select");
						hasSelect = true;
						return false;
					}
				});
				
				if ( hasSelect == true ) {
					date.push( (day.length == 1 ? ("0"+day) : day) );
					
					_calendarInfo.day = day;
				}
				else {
					day = _calendarInfo.lastDay.toString()
					date.push( (day.length == 1 ? ("0"+day) : day) );
					
					_$content.find("TBODY TD[data-day='"+day+"']").addClass("select");
					
					_calendarInfo.day = _calendarInfo.lastDay;
				}
				
				_calendarInfo.date = date.join("-");
				
				this.dispatchEvent( "select", _calendarInfo);
			},
			
			change: function( year, month ) {
				//console.log( "change", year, month );
				
				_calendarInfo.year = year;
				_calendarInfo.month = month;
				
				var that = this;
				var day = 0;
				var lastDay = (new Date(_calendarInfo.year, month, 0)).getDate();
				var firstWeek = (new Date(_calendarInfo.year, month-1, 1)).getDay();
				
				_calendarInfo.lastDay = lastDay;
				
				_$content.find("TBODY").empty();
				
				for ( var i=0; i<6; i++ ) {
					var $tableRow = $("<TR></TR>");
					var hasLastDay = false;
					
					$(_calendarInfo.weekNames).each(function( idx, name ) {
						
						if ( day == 0 ) {
							if ( idx >= firstWeek ) {
								day = 1;
							}
						}
						else {
							
							if ( day < lastDay ) {
								day = day + 1;
							}
							else {
								hasLastDay = true;
							}
						}
						
						var $day = $("<TD><A></A></TD>");
						
						if ( day == 0 || hasLastDay) {
							$day.find("a").html("&nbsp;");
							$day.attr("data-action", "none");
						}	
						else {
							$day.find("a").html( day );
							$day.attr("data-action", "day");
							$day.attr("data-day", day);
							
							if ( that.isToday( _calendarInfo.year, _calendarInfo.month, day ) ) {
								$day.addClass("today");
							}
							
							$day.bind("click", function(e) {
								var day = parseInt( $(this).data("day") );
								that.select( day );
							});
						}
					
						$tableRow.append( $day );
					});
					
					_$content.find("TBODY").append( $tableRow );
				}
				
				var monthName = _calendarInfo.monthNames[month-1];
				
				_$header.find(".UICalendarMonth").html( monthName );
				_$header.find(".UICalendarYear").html( year );
				
				this.dispatchEvent( "change", {
					year: year,
					month: month,
					monthName: monthName
				});
			},
			
			setupElements: function( element ) {
				
				_$element = $(element);
				
				_$header = $('<div class="UICalendarHeader"></div>');
				_$header.append('<a data-action="prev" title="Prev"><span>Prev</span></a>');
				_$header.append('<a data-action="next" title="Next"><span>Next</span></a>');
				_$header.append('<div class="UICalendarHeaderTitle"><span class="UICalendarMonth"></span>&nbsp;<span class="UICalendarYear"></span></div>');
				
				_$content = $('<DIV class="UICalendarContent"><TABLE><THEAD><TR></TR></THEAD><TBODY></TBODY></TABLE></DIV>');
				
				$(_calendarInfo.weekNames).each(function( idx, title ) {
					var $week = $("<TH><SPAN></SPAN></TH>");
					$week.find("span").attr("title", title).html( title.substr(0,3) );
				
					_$content.find("THEAD TR").append( $week );	
				});
				
				_$element.append(_$header);
				_$element.append(_$content);
			},
			
			setupEvents: function() {
				var that = this;
			
				_$header.find("[data-action='prev']").bind("click", function(e) {
					that.prevMonth();
				});
				
				_$header.find("[data-action='next']").bind("click", function(e) {
					that.nextMonth();
				});
			}
		
		}
	}
});

})(window);
(function(window, undefined) {

'use strict';

var 
Class = UI.Class,
Element = Class.Element,
UIComponent = UI.Class.UIComponent,

UITreeData = function( __data, parent, depth, rootTree ) {

	var _data, _itemName, _tree, _parent, _options, _depth = depth, _rootTree = rootTree;
	
	_data = __data.data || {};
	_itemName = __data.itemName;
	_parent = parent;
	_options = {
		foldering: ( __data.foldering === true ) ? true : false,
		closed: ( __data.closed === false ) ? false : true
	};
	_tree = new UITree( parent, _depth + 1, _rootTree );
	
	if ( Array.isArray( __data.subTree ) ) {
		Array.each( __data.subTree, function( idx, item ) {
			_tree.add( item );
		});
	}
	
	return {
		itemName: _itemName,
		
		data: function(key, value) {
			if ( arguments.length == 0 ) {
				return _data;
			}
			
			if ( value === undefined ) {
				return _data[key];
			}
			
			_data[key] = value;
		},
		
		depth: function() {
			return _depth;	
		},
		
		options: function() {
			return _options;	
		},
		
		parent: function() {
			return _parent;	
		},
		
		rootTree: function() {
			return _rootTree;
		},
		
		tree: function() {
			return _tree;
		},
		
		toJSON: function() {
			var subTree = [];
			
			_tree.each( function( idx, treeData ) {
				subTree.push( treeData.toJSON() );
			});
		
			return {
				itemName: this.itemName,
				data: _data,
				subTree: subTree
			};
		}
	};
},

UITree = Class({
	name: "UITree",
	parent: UIComponent,
	constructor: function(  ) {
	
		var _container, _dataItems, _parent, _rootTree, _depth, _delegate, _delegateCan;
		
		_container = new Element( "UL" );
		_container.addClass("UITree");
		
		_parent;
		_rootTree;
		_depth = 0;
		_dataItems = [];
		
		_delegate = {};
		_delegateCan = {
			didSelectTreeItem: false
		};
		
		return {
			init: function( parent, depth, rootTree ) {
				var self = this._super("init", arguments );
			
				if ( self ) {
					_parent = parent;
					_depth = depth || 0;
					_rootTree = rootTree;
				
					if ( _parent === undefined && _rootTree === undefined ) {
						_parent = _rootTree = this;
					}
				
					return this;
				}
			},
			
			destroy: function() {
			
				_container.destroy.apply( _container, arguments );
				
				this._super().destroy.apply( this._super(), arguments );	
			},
			
			element: function() {
				return _container.element();
			},
			
			make: function( listData ) {
				var that = this;
			
				Array.each( listData, function( index, data ) {
					that.add( data );
				});
			},
			
			add: function( data ) {
				if ( Array.isArray( data.subTree ) ) {
					if ( data.foldering === undefined ) {
						data.foldering = true;
					}
					
					if ( data.closed === undefined ) {
						data.closed = true;
					}
				}
				
				var treeData = new UITreeData( data, this, _depth, _rootTree );
				var error = {};
				
				_dataItems = Array.add( _dataItems, treeData, error );
				
				return treeData;
			},
			
			remove: function( treeData ) {
				_dataItems = Array.remove( _dataItems, treeData );
			},
			
			removeAtIndex: function( index ) {
				var error = {};
				
				_dataItems = Array.removeAtIndex( _dataItems, index, error );
				
				if ( error.code ) {
					
				}
			},
			
			dataItems: function() {
				return _dataItems;	
			},
			
			each: function( handler ) {
				Array.each( _dataItems, handler, this );	
			},
			
			load: function() {
				
				$(_container.element()).empty();
			
				this.each( function( idx, itemData ){
					
					// TODO : use UITreeItem and manager event
					// TODO : Template
					var $item = $("<LI />");
					var $itemBullet = $("<span class='item-bullet'></span>");
					var $itemName = $("<span class='item-name'></span>").text( itemData.itemName );
					var hasSubTree = false;
					
					itemData.tree().delegate( _delegate );
					itemData.tree().load();
					
					$item.append( $itemBullet );
					$item.append( $itemName );
					$item.data( itemData.data() );
					
					if ( itemData.tree().dataItems().length > 0 ) {
						hasSubTree = true;
					}
					
					if ( hasSubTree === true || itemData.options().foldering === true ) {
						
						$item.get(0).appendChild( itemData.tree().element() );
						$item.addClass("list");
						
						if ( itemData.options().closed === true ) {
							$item.addClass("closed");
						}
					}
					
					$item.bind("click", function(e) {
						if ( _delegate.didSelectTreeItem ) {
							_delegate.didSelectTreeItem.call( _delegate, itemData.tree(), _depth, idx, itemData );
						}
					
						if ( itemData.tree().dataItems().length > 0 ) {
							hasSubTree = true;
						}
						
						//if ( hasSubTree == true ) {	
							if ( $item.hasClass("closed") ) {
								$item.removeClass("closed");
							}
							else {
								$item.addClass("closed");
							}
						//}
						
						return false;
					});
					
					_container.element().appendChild( $item.get(0) );
				});
				
				
			},
			
			parent: function() {
				return _container.parent();	
			},
			
			container: function() {
				return _container;
			},
			
			delegate: function( delegate ) {
				_delegate = delegate;
			}
		}
	}
});

})(window);

(function(window, undefined) {

'use strict';

var 
Class = UI.Class,
Template = UI.Template,
Element = Class.Element,
UIButton = Class.UIButton,
UIComponent = Class.UIComponent,
UIScroll = Class.UIScroll,

UITableColumnGroup = function( table ) {

	var _table = table, _data = {}, _keys = [];

	return {
		_setData: function( data ) {
			Array.each( data, function(idx, info) {
				var colInfo = {
					key: info.key,
					title: info.title,
					width: info.width
				};
				
				_keys.push( info.key );
				_data[info.key] = colInfo;
			});
		},
		
		_set: function( key, data ) {	
			_keys.push( key );
			_data[key] = data;
		},
	
		data: function( key ) {
		
			if ( _data[key] ) {
				return _data[key];
			}
			
			return _data;
		},
		
		keys: function() {
			return _keys;	
		},
		
		count: function() {
			return _keys.length;	
		},
		
		title: function( key ) {
			return this.data(key).title;	
		},
		
		width: function( key ) {
			var width = this.data(key).width;	
			var defaultCount = 0;
			var totalCount = 0;
			var fixedWidth = 0;
			var ratioWidth = 0;
			var ratioCount = 0;
			
			this.each( function( idx, key, option ) {
				if ( option.width === "default" || option.width === "auto" ) {
					defaultCount = defaultCount + 1;
				}
				else if ( option.width.indexOf('%') !== -1 ) {
					ratioWidth = ratioWidth + parseInt(option.width);
					ratioCount = ratioCount + 1;
				}
				else {
					fixedWidth = fixedWidth + parseInt( option.width );
				}
				
				totalCount = totalCount + 1;
			});
			
			var tableWidth = $(_table.element()).parent().width();
			var defaultWidth = (tableWidth - fixedWidth - ((ratioWidth / 100) * tableWidth)) / defaultCount;
			
			if ( width === "default" || width === "auto" ) {
				return defaultWidth; //( / tableWidth) * 100 + "%";
			}
			else if ( width.indexOf('%') !== -1 ) {
				return width;
			}
			
			return parseInt(width); //( parseInt(width) / tableWidth) * 100 + "%";
		},
		
		resizeInfo: function() {
			var resizeInfo = {};
			var that = this;
			
			Array.each( _keys, function( idx, key ) {
				resizeInfo[key] = that.width( key );
			});	
			
			return resizeInfo;
		},

		keyAtIndex: function( index ) {
			return _keys[index];
		},
		
		each: function( handler, context ) {
			context = context || this;
		
			Array.each( _keys, function( idx, key ) {
				handler.call( context, idx, key, _data[key] );
			}, context);
		}
	};	
},

UITableColumn = Class({
	name: "UITableColumn",
	parent: Element,
	constructor: function() {
	
		var _key, _group, _span;
	
		return {
			init: function( element, key, html, group ) {
				var self = this._super("init", arguments);
				if ( self ) {

					_key = key;
					_group = group;

					this.html(html);

					return this;
				}
			},
			
			key: function() {
				return _key;	
			},
			
			resize: function(resizeInfo) {
				var width = resizeInfo[_key];
				
				this.css({
					width: width
				});
			}
		};
	}
}),

UITableRow = Class({
	name: "UITableRow",
	parent: Element,
	constructor: function( ) {
		
		var _cols = [], _group, _width;
		
		return {
			init: function( element, group ) {
				var self = this._super("init", arguments);
				if ( self ) {
					_group = group;
					
					return this;
				}
			},
			
			resize: function(resizeInfo) {
				Array.each( _cols, function( idx, column ) {
					column.resize(resizeInfo);
				});
			},
			
			columns: function() {
				return _cols;	
			},
			
			each: function( handler, context ) {
				context = context || this;
			
				Array.each( _cols, function( idx, column ) {
					handler.call( context, idx, column );
				}, context);
			},
			
			addColumn: function( key, value ) {
				var td = document.createElement("TD");
				var column = new UITableColumn( td, key, value, _group );
				
				_cols.push( column );
				
				this.append(column);
				
				return column;
			},

			loadDOM: function() {
				var that = this;
				$(this.element()).find("th,td").each( function( idx, col ) {
					var key = _group.colgroup().keyAtIndex(idx);
					var column = new UITableColumn( col, key, $(col).html(), _group );

					_cols.push( column );
				});
			}
		};
	}
}),

UITableGroup = Class({
	name: "UITableGroup",
	parent: Element,
	constructor: function(  ) {
		
		var _that;
		var _rows = [];
		var _table;
		
		return {
			init: function(element, table) {
				var self = this._super("init", arguments);
				if ( self ) {
				
					_that = this;
					_table = table;
					
					return this;
				}
			},
			
			resize: function(resizeInfo) {
				Array.each( _rows, function( idx, row ) {
					row.resize(resizeInfo);
				});
			},
			
			table: function() {
				return _table;	
			},
			
			colgroup: function() {
				return _table.colgroup();	
			},
			
			firstRow: function() {
				return _rows.length > 0 ? _rows[0] : null;	
			},
			
			rows: function() {
				return _rows;	
			},
			
			each: function( handler, context ) {
				context = context || this;
			
				Array.each( _rows, function( idx, row ) {
					handler.call( context, idx, row );
				}, context);
			},
			
			addBlankRow: function( message ) {
				var tr = document.createElement("TR");
				var row = new UITableRow( tr, this );
				var colgroup = _table.colgroup();
				var td = document.createElement("TD");
				var column = new UITableColumn( td, "", message, this );
				column.attr("colspan", colgroup.count() );
				
				row.addClass("blank");
				
				row.append( column );
				this.append( row );
				
				return row;
			},
			
			addRow: function( rowData ) {
				var tr = document.createElement("TR");
				var row = new UITableRow( tr, this );
				var colgroup = _table.colgroup();
				
				colgroup.each( function( idx, key, option ) {
					row.addColumn( key, rowData[key] || "" );
				});
				
				_rows.push( row );
				
				this.append(row);
				
				return row;
			},

			loadDOM: function() {
				var that = this;

				$(this.element()).find("tr").each( function( idx, row ) {
					var row = new UITableRow( row, that );
					row.loadDOM();

					_rows.push( row );
				});
			}
		}
	}
}),

UITableHead = Class({
	name: "UITableHead",
	parent: UITableGroup,
	constructor: function( ) {
		
		return {
			init: function(element, table) {
				var self = this._super("init", arguments);
				if ( self ) {
					
					return this;
				}
			},
			
			addRow: function( rowData ) {
				var row = this._super("addRow", [rowData] );
				var colgroup = this.colgroup();
					
				if ( row === this.firstRow() ) {
					row.each( function( idx, column ) {
						var colKey = column.key();
						var data = colgroup.data(colKey);
						
						for ( var key in data ) {
							column.data( key, data[key] );
						}
					});
				}
				
				return row;
			},
			
			headData: function() {
				var headData = {};
				
				this.colgroup().each( function( idx, key, option ) {
					headData[key] = option.title;
				});
				
				return headData;
			}
		}
	}
}),

UITableBody = Class({
	name: "UITableBody",
	parent: UITableGroup,
	constructor: function( ) {
		
		return {
			init: function(element, table) {
				var self = this._super("init", arguments);
				if ( self ) {
					
					return this;
				}
			}
		}
	}
}),

UITable = Class({
	name: "UITable",
	parent: Element,
	constructor: function() {
		
		var _head, _body, _colgroup, _timeout;
		
		return {
			init: function(element) {
				var self = this._super("init", arguments);
				if ( self ) {
				
					var that = this;
				
					_colgroup = new UITableColumnGroup( this );
					_head = new UITableHead( $(element).find("thead").first().get(0) || "THEAD", this );
					_body = new UITableBody( $(element).find("tbody").first().get(0) || "TBODY", this );
				
					this.append( _head );
					this.append( _body );
					
					$(window).on("resize", function() {
						if ( _timeout ) {
							clearTimeout(_timeout);
							_timeout = null;
						}
					
						_timeout = setTimeout( function() {
							_timeout = null;
							
							that.resize();
							
						}, 100 );
					});
					
					return this;
				}
			},
		
			head: function() {
				return _head;
			},
			
			body: function() {
				return _body;
			},
			
			resize: function() {
				var resizeInfo = _colgroup.resizeInfo();
				
				_head.resize( resizeInfo );
				_body.resize( resizeInfo );	
			},
			
			colgroup: function( data ) {
				if ( arguments.length === 0 ) {
					return _colgroup;
				}
				
				_colgroup._setData( data );
			},
			
			clear: function() {
				_body.empty();
			},
			
			makeRows: function( listData ) {
				Array.each( listData, function( idx, rowData ) {
					_body.addRow( rowData );
				});
			}
		};
	}
}),

UIGrid = Class({
	name: "UIGrid",
	parent: UIComponent,
	constructor: function() {
		
		var _scroll,
			_table,
			_template,
			_delegate,
			_delegateCan = {
				didChangePage: false
			},
			_listData = [], _sortKey = "", _sortType = "", _sort, _page = 1, _totalPage = 1, _pageSize = 10;
		
		return {
			_loadFromHead: function( fields ) {
				var that = this;
				var $rows = $( _table.head().element() ).find("tr");
				
				$rows.each( function( idx, rowElement ) {
					var $row = $(rowElement);
					
					var row = $row.instance(UITableRow, _table.head());
					_table.head().rows().push( row );
					
					if ( $row.children().length > 0 ) {
						var $cols = $row.children();
						$cols.each( function( idx, colElement ) {
							var $col = $(colElement);
							var field = fields[idx];
							var data = $col.data();
							var key = data["key"];

							for ( var fieldKey in field ) {
								data[fieldKey] = field[fieldKey];
							}
							
							_table.head().colgroup()._set(key, data);

							var column = $col.instance(UITableColumn, key, data["title"], _table.head());
							column.bind("click", function(e) {
								var key = column.key();
								that.sortByKey( key );
							});
							
							row.columns().push( column );
						});
					}
				});
			},

			_loadFromBody: function() {

				var that = this;
				var $rows = $( _table.body().element() ).find("tr");
				var listData = [];
				
				$rows.each( function( idx, rowElement ) {
					var $row = $(rowElement);
					
					var row = $row.instance(UITableRow, _table.body());
					_table.body().rows().push( row );
					
					var rowData = {};
					
					if ( $row.find("td").first() ) {
						var $cols = $row.find("td");
						_table.colgroup().each( function( idx, key, option ) {
							var $col = $cols.eq(idx);
							var value = $col.html();
							var column = $col.instance(UITableColumn, key, value, _table.body());
						
							rowData[key] = value;
							
							row.columns().push( column );
						});
					}
					
					listData.push(rowData);
				});
				
				this.data( listData );
			},

			_createHead: function( fields ) {
				var that = this;
				var $row = $("<TR></TR>");
				var row = $row.instance(UITableRow, _table.head());

				$( _table.head().element() ).append( $row );
				
				_table.head().rows().push( row );
				
				$(fields).each( function( indx, field ) {
					var $th = $("<TH></TH>");
					
					for ( var k in field ) {
						$th.attr( "data-"+k, field[k] );
					}
					
					var rowData = {};
					var column = $th.instance(UITableColumn, field.key, field.title, _table.head());
					
					column.bind("click", function(e) {
						var key = column.key();
						that.sortByKey( key );
					});
					
					$row.append( $th );
					
					row.columns().push( column );
					
					_table.head().colgroup()._set( field.key, field );
				});
			},

			_createScroll: function( element ) {
				var scroll = new UIScroll(element);
				scroll.container( _table.body().element() );
				scroll.flexable( {horizontal:true} );
				scroll.useMouseLeave( true );
				scroll.useWheelMouse( true );
				scroll.scrollBounceVertical( true );
				scroll.useScrollBar( true );

				return scroll;
			},

			init: function( element, gridData ) {
				var self = this._super("init", arguments);
				if ( self ) {
					var that = this;
				
					_sort = new Element("SPAN");
					_sort.addClass("sort-arrow");
					
					_table = new UITable( ($(element).find("table").first().get(0) || "TABLE") );
					_table.body().attribute ("scroll-container", "");

					var fields = gridData.scheme.fields;
					
					if ( $( _table.head().element() ).find("tr").get(0) ) {
						this._loadFromHead( fields );
					}
					else {
						this._createHead( fields );
					}
					
					_scroll = this._createScroll( element );
				
					this.view( _scroll );
					this.view().append( _table );

					_scroll.contentInset( {
						top: _table.head().height()
					});

					_table.head().css({
						"position": "absolute",
						"z-index": 2
					});
					
					_table.addClass("animation");

					_scroll.refresh(false);
					
					_page = 1;
					
					if ( gridData.pageSize ) {
						_pageSize = gridData.pageSize;
					}
					
					if ( gridData.columns ) {
						this.colgroup( gridData.columns );
					}
					
					// N/T
					if ( gridData.height ) {
						_scroll.css({
							height: gridData.height
						});
						
						_table.resize();
					}
					
					// 
					if ( gridData.delegate ) {
						this.delegate( gridData.delegate );
					}
					
					this.dispatchEvent( "ready", this );
					
					if ( _delegateCan.didReady ) {
						_delegate.didReady.call( _delegate, this );
					}
					
					if ( gridData.data ) {
						this.data( gridData.data );
					}
					else {
						if ( $( _table.body().element() ).find("tr").first() ) {
							this._loadFromBody();
						}
					}
					
					_table.resize();
					
					// todo: no-data
					
					return this;
				}
			},

			delegate: function( delegate ) {
				if ( arguments.length === 0 ) {
					return _delegate;
				}

				_delegate = delegate;
				_delegateCan = ( typeof _delegate["didChangePage"] === "function");
			},
			
			table: function() {
				return _table;
			},
			
			colgroup: function( colgroup ) {
				var row, that = this;
				
				_table.colgroup( colgroup );
					
				_table.head().addRow( _table.head().headData() ).each( function( idx, column ) {
					column.bind("click", function(e) {
						var key = column.key();
						that.sortByKey( key );
					});
				});
			},
			
			sortByKey: function( key ) {
			
				if ( _sortKey === key ) {
					if ( _sortType === "" ) {
						_sortType = "ASC";
					}
					else if ( _sortType === "ASC" ) {
						_sortType = "DESC";
					}	
					else if ( _sortType === "DESC" ) {
						_sortType = "";
					}
				}
				else {
					_sortKey = key;
					_sortType = "ASC";
				}
				
				this.render();
			},

			listData: function() {
				if ( _listData.length === 0 ) {
					return [];
				}

				var listData = [];

				if ( _sortType !== "" ) {
					var sortedListData = Array.copy( _listData );
				
					Array.sort( sortedListData, function( targetData, nextData ) {
						var targetValue = targetData[_sortKey];
						var nextValue = nextData[_sortKey];
						
						if ( ! isNaN(parseInt(targetValue)) && ! isNaN(parseInt(nextValue)) ) {
							targetValue = parseInt( targetValue );
							nextValue = parseInt( nextValue );
						}
					
						if ( _sortType == "DESC" && targetValue < nextValue ) {
							return _sortType;
						}
						else if ( _sortType == "ASC" && targetValue > nextValue ) {
							return _sortType;
						}
					});

					listData = sortedListData;
				}
				else {
					listData = _listData;
				}

				return listData;
			},
			
			render: function( html ) {
				var headRow = _table.head().firstRow();
				if ( headRow ) {
					var columns = headRow.columns();

					Array.each( columns, function( idx, column ) {
					
						if ( column.key() === _sortKey ) {
							_sort.removeClass("DESC ASC");
							_sort.addClass( _sortType );
							
							column.append( _sort );
							return false;
						}
					});
				}

				var listData = this.listData();
				var dataItems = [];
				
				Array.each( listData, function( idx, itemData ) {
					if ( idx < ( _page * _pageSize ) && idx >= ( (_page - 1) * _pageSize ) ) {
						dataItems.push( itemData );
					}
				});

				_table.clear();
				
				if ( html || _template ) {
					if ( html !== undefined ) {
						_template = Template.parse(html);
					}

					var html = _template.render( {list_items: dataItems} );

					_table.body().html(html);
					_table.body().loadDOM();
				}
				else {
					_table.makeRows( dataItems );	
				}
				
				_scroll.refresh(false);
				_scroll.scrollTop();
				
				_table.resize();
				
				this.dispatchEvent( "change", this );
				
				if ( _delegateCan.didChangePage ) {
					_delegate.didChangePage.call( _delegate, this, _page );
				}
			},
			
			pageSize: function( pageSize ) {
				_pageSize = pageSize;	
			},
			
			page: function() {
				return _page;	
			},
			
			totalPage: function() {
				return _totalPage;	
			},
			
			nextPage: function() {
				this.movePage( _page + 1 );	
			},
			
			prevPage: function() {
				this.movePage( _page - 1 );	
			},
			
			movePage: function( page ) {
			
				page = Math.min( Math.max( page, 1), _totalPage );
			
				if ( _page === page ) {
					return;
				}
			
				_page = page;
				
				this.render();
			},
			
			data: function( data, html ) {
				
				_listData = data;
				_totalPage = ( _listData.length == 0 ) ? 1 : Math.ceil(_listData.length / _pageSize);
				
				if ( html === true ) {
					this.render( html );
				}
			}
		}
	}
}),

UIPageBox = Class({
	name: "UIPageBox",
	parent: Element,
	constructor: function() {
	
		var _list = [], _that, _page, _totalPage,
			_delegate,
			_delegateCan = {
				didChangePage: false
			};
	
		return {
			_page: function( page ) {
				
				if ( page === "first" ) {
					page = 1;
				}
				else if ( page === "prev" ) {
					page = _page - 1;
				}
				else if ( page === "next" ) {
					page = _page + 1;
				}
				else if ( page === "last" ) {
					page = _totalPage;
				}
				else {
					page = parseInt( page );
				}
				
				if ( ! isNaN(page) ) {
					this.page( page, true );
				}
				else {
					console.error( page );
				}
			},
			
			makeButtons: function() {
				var button;
				
				button = new UIButton("BUTTON");
				button.html("&lt;&lt;");
				button.data("page", "first");
				button.addClass("page first");
				this.append( button );
				
				button = new UIButton("BUTTON");
				button.html("&lt;");
				button.data("page", "prev");
				button.addClass("page prev");
				this.append( button );
				
				for ( var page=_page; page<=_totalPage; page++ ) {
				
					button = new UIButton("BUTTON");
					button.html(page);
					button.data("page", page);
					button.addClass("page");
					this.append( button );
				}
				
				button = new UIButton("BUTTON");
				button.html("&gt;");
				button.data("page", "next");
				button.addClass("page next");
				this.append( button );
				
				button = new UIButton("BUTTON");
				button.html("&gt;&gt;");
				button.data("page", "last");
				button.addClass("page last");
				this.append( button );	
			},
		
			init: function( element, options ) {
				var self = this._super("init", arguments);
				if ( self ) {
				
					var button;
				
					_that = this;
					_page = options.page;
					_totalPage = options.totalPage;
					
					if ( options.makeButtons === true ) {
						this.makeButtons();
					}
					
					$(element).find("[data-page]").click( function(e) {
						var page = $(this).data("page");
						_that._page(page);
					});
				
					if ( options.delegate ) {
						_delegate = options.delegate;
						_delegateCan.didChangePage = ( typeof _delegate["didChangePage"] === "function");
					}
					
					this.page( options.page );
				
					return this;
				}
			},
			
			page: function( page, force ) {
			
				var wasPage = _page;
				_page = Math.min( Math.max( page, 1 ), _totalPage );
				
				$(this.element()).find("[data-page]").removeClass("active");
				$(this.element()).find("[data-page="+_page+"]").addClass("active");
				
				if ( force === true || wasPage !== _page ) {
					this.dispatchEvent( "change", this, _page );	
				}
				
				if ( _delegateCan.didChangePage ) {
					_delegate.didChangePage.call( _delegate, this, _page );
				}
			}
		}	
	}
});

})(window);