/*! Morpheus API Unit Test | MUnit - 1.0.0 (1) */

(function(window, undefined) {

var Class = UI.Class;

MUnit = Class({
	name: "MUnit",
	constructor: function() {
		
		return {
			initialize : function() {
				this.passes = 0;
				this.failures = 0;
				this.errors = 0;
				this.messages = [];
				
				M.data.removeGlobal("test-result");
			},
			summary : function() {
				//return (this.passes + " passes, " + this.failures
				//		+ " failures, " + this.errors + " errors" + "\n" + this.messages.join("\n"));
				var globalData = M.data.global("test-result");
				return globalData;
			},
			push : function(command, message) {
				var resultData = typeof M.data.global("test-result") !== "object" ? {}
					: M.data.global("test-result");
			
				var data = resultData[command] || {
					result : []
				};
				data.result.push(message);
			
				resultData[command] = data;
			
				M.data.global("test-result", resultData);
			},
			pass : function(command, message) {
				this.passes++;
				this.push(command, "Pass: " + message);
			},
			fail : function(command, message) {
				this.failures++;
				this.push(command, "Failure: " + message);
			},
			info : function(command, message) {
				this.push(command, "Info: " + message);
			},
			error : function(command, error) {
				this.errors++;
				this.push(command, error.name + ": " + error.message + "("
						+ JSON.stringify(error) + ")");
			},
			status : function() {
				if (this.failures > 0) return 'failed';
				if (this.errors > 0) return 'error';
				return 'passed';
			},
			assert : function(expression) {
				var command = arguments[1];
				var message = arguments[1] || 'assert: got "'
						+ JSON.stringify(expression) + '"';
				try {
					expression ? this.pass(command, message) : this.fail(command, message);
				} catch (e) {
					this.error(e);
				}
			},
			assertEqual : function(expected, actual) {
				var command = arguments[2] || "assertEqual";
				try {
					(expected == actual) ? this.pass(command, command + ": passed") : this.fail(command, command
							+ ': expected "' + JSON.stringify(expected)
							+ '", actual "' + JSON.stringify(actual) + '"');
				} catch (e) {
					this.error(e);
				}
			},
			assertInspect : function(expected, actual) {
				var command = arguments[2] || "assertInspect";
				try {
					(expected == JSON.stringify(actual)) ? this.pass(command, "pass") : this.fail(command, command
							+ ': expected "' + JSON.stringify(expected)
							+ '", actual "' + JSON.stringify(actual) + '"');
				} catch (e) {
					this.error(e);
				}
			},
			assertNotEqual : function(expected, actual) {
				var message = arguments[2] || "assertNotEqual";
				try {
					(expected != actual) ? this.pass() : this.fail(message + ': got "'
							+ JSON.stringify(actual) + '"');
				} catch (e) {
					this.error(e);
				}
			},
			assertIdentical : function(expected, actual) {
				var message = arguments[2] || "assertIdentical";
				try {
					(expected === actual) ? this.pass() : this.fail(message
							+ ': expected "' + JSON.stringify(expected)
							+ '", actual "' + JSON.stringify(actual) + '"');
				} catch (e) {
					this.error(e);
				}
			},
			assertNotIdentical : function(expected, actual) {
				var message = arguments[2] || "assertNotIdentical";
				try {
					!(expected === actual) ? this.pass() : this.fail(message
							+ ': expected "' + JSON.stringify(expected)
							+ '", actual "' + JSON.stringify(actual) + '"');
				} catch (e) {
					this.error(e);
				}
			},
			assertNull : function(obj) {
				var message = arguments[1] || 'assertNull';
				try {
					(obj == null) ? this.pass() : this.fail(message + ': got "'
							+ JSON.stringify(obj) + '"');
				} catch (e) {
					this.error(e);
				}
			},
			assertMatch : function(expected, actual) {
				var message = arguments[2] || 'assertMatch';
				var regexp = new RegExp(expected);
				try {
					(regexp.exec(actual)) ? this.pass() : this.fail(message
							+ ' : regexp: "' + JSON.stringify(expected)
							+ ' did not match: ' + JSON.stringify(actual) + '"');
				} catch (e) {
					this.error(e);
				}
			},
			assertNotNull : function(object) {
				var message = arguments[1] || 'assertNotNull';
				this.assert(object != null, message);
			},
			assertType : function(expected, actual) {
				var command = arguments[2] || 'assertType';
				try {
					(typeof actual == typeof expected) ? this.pass(command, command + ": passed") : this.fail(command, command
							+ ': expected "' + JSON.stringify(expected)
							+ '", actual "' + (actual.constructor) + '"');
				} catch (e) {
					this.error(e);
				}
			},
			assertNotOfType : function(expected, actual) {
				var message = arguments[2] || 'assertNotOfType';
				try {
					(actual.constructor != expected) ? this.pass() : this.fail(message
							+ ': expected "' + JSON.stringify(expected)
							+ '", actual "' + (actual.constructor) + '"');
				} catch (e) {
					this.error(e);
				}
			},
			assertInstanceOf : function(expected, actual) {
				var message = arguments[2] || 'assertInstanceOf';
				try {
					(actual instanceof expected) ? this.pass() : this.fail(message
							+ ": object was not an instance of the expected type");
				} catch (e) {
					this.error(e);
				}
			},
			assertNotInstanceOf : function(expected, actual) {
				var message = arguments[2] || 'assertNotInstanceOf';
				try {
					!(actual instanceof expected) ? this.pass() : this.fail(message
							+ ": object was an instance of the not expected type");
				} catch (e) {
					this.error(e);
				}
			},
			assertRespondsTo : function(method, obj) {
				var message = arguments[2] || 'assertRespondsTo';
				try {
					(obj[method] && typeof obj[method] == 'function') ? this.pass()
							: this.fail(message + ": object doesn't respond to ["
									+ method + "]");
				} catch (e) {
					this.error(e);
				}
			},
			assertReturnsTrue : function(method, obj) {
				var message = arguments[2] || 'assertReturnsTrue';
				try {
					var m = obj[method];
					if (!m)
						m = obj['is' + method.charAt(0).toUpperCase() + method.slice(1)];
					m() ? this.pass() : this.fail(message + ": method returned false");
				} catch (e) {
					this.error(e);
				}
			},
			assertReturnsFalse : function(method, obj) {
				var message = arguments[2] || 'assertReturnsFalse';
				try {
					var m = obj[method];
					if (!m)
						m = obj['is' + method.charAt(0).toUpperCase() + method.slice(1)];
					!m() ? this.pass() : this.fail(message + ": method returned true");
				} catch (e) {
					this.error(e);
				}
			},
			assertRaise : function(exceptionName, method) {
				var message = arguments[2] || 'assertRaise';
				try {
					method();
					this.fail(message + ": exception expected but none was raised");
				} catch (e) {
					((exceptionName == null) || (e.name == exceptionName)) ? this
							.pass() : this.error(e);
				}
			},
			benchmark : function(operation, iterations) {
				var startAt = new Date();
				(iterations || 1).times(operation);
				var timeTaken = ((new Date()) - startAt);
				this.info((arguments[2] || 'Operation') + ' finished ' + iterations
						+ ' iterations in ' + (timeTaken / 1000) + 's');
				return timeTaken;
			}
		}
	},
	staticConstructor: function() {
		var _instance;

		return {
			sharedInstance: function() {
				if ( _instance === undefined ) {
					_instance = new MUnit();
				}
				return _instance;
			}
		}
	}
});

window.MUnit = MUnit;

})(window);