(function(window, undefined) {

	var _$focusButton;
	
	// 사이트맵
	M.onReady(function(e) {
		$('#scroll').css('height', $('body').outerHeight() - $('#header').outerHeight() + "px");

		// 이전 버튼 클릭시
		// $('.tbtn_prev').bind("click", function(){
		// M.page.back();
		// });

		$('[data-function]').on('click', function(evt) {
			var code = $(this).next().text();
			eval(code);

			var $button = $(this);

			$button.text('⇒ ' + $button.text());

			_$focusButton = $button;
		});
	})

	.onRestore(function(e) {
		// _$focusButton.text( _$focusButton.text().replace('⇒ ', '') );
	})

	.onKey(function(e) {
		if (e.key === 'home' && e.events === 'keydown') {
			WNLog('');
		}
	})

	.onBack(function(e) {
		M.page.back();
	});

	// replace alert function
	var wasAlert = window.alert;
	window.alert = function(message) {
		var wasMessage = message;

		if (typeof message == "object") {
			try {
				message = JSON.stringify(message, null, 4);
			} 
			catch (e) {
				message = wasMessage;
			}
		}

		return wasAlert(message);
	};

	var BatchTest = function() {

		var _commandOption = {};
		var _commandQueue = [];
		var _starting = false;
		var _batchIndex = -1;
		var _maked = false;
		
		var munit = null;

		return {
			init : function() {

				M.tool.log("***** BatchTest.init *****");
				this.make();

				_stating = M.data.global("batch-starting") ? true : false;

				var command = M.data.param("batch-command");

				if (M.data.param("batch-back")) {
					setTimeout(function() {

						M.page.back({
							param : {
								"batch-command" : command
							}
						});

					}, 300);

					return;
				}

				if (_stating == true) {
					if (_commandOption[command] !== undefined) {

						_batchIndex = this.batchIndex(command);

						var func = M.data.param("batch-func");

						if (M.data.param("batch-func")
								&& _commandOption[command][func] !== undefined) {

							var context = this;

							_commandOption[command][func].call(context);
						} 
						else {
							this.execute(command);
						}
					} 
					else {
						this.finish();
					}
				}
			},

			start : function() {
				console.clear();

				M.tool.log("***** BatchTest.start ***** ");		
				
				munit = MUnit.sharedInstance();
				munit.initialize();				

				if (_maked === false) {
					this.make();
				}

				_starting = true;
				_batchIndex = -1;

				M.data.removeGlobal("batch-result");
				M.data.global("batch-starting", true);

				M.onRestore(function(e) {
					if (e.param["batch-command"]) {
						var command = e.param["batch-command"];

						BatchTest.next();
					}
				});

				this.next();
			},

			finish : function() {
				M.tool.log("***** BatchTest.finish ***** ");

				var globalData = M.data.global("batch-result");

				M.tool.log(globalData);

				//console.log("globalData", globalData);

				_stating = false;

				M.data.removeGlobal("batch-result");
				M.data.removeGlobal("batch-starting");
			},

			sendToMail : function() {
				var subject = 'Test Results';
				munit = MUnit.sharedInstance();
				var result = JSON.stringify(munit.summary());
				//alert(JSON.stringify(munit.summary()));
				//var result = "test result";
				M.sys.mail({
					to: ['test@uracle.co.kr'],
					subject: subject,
					content: result
				});
			},
			
			add : function(command, option) {

				var sameIndex = 0;
				var wasCommand = command;

				if (_commandOption[command]) {
					while (_commandOption[command]) {
						sameIndex = sameIndex + 1;
						command = wasCommand + "." + sameIndex;
					}
				}
				
				_commandOption[command] = option;
				_commandQueue.push(command);
			},

			option : function(command) {
				return _commandOption[command];
			},

			currentCommand : function() {
				return _commandQueue[_batchIndex];
			},

			applyOption : function(option) {
				if (typeof option.onBack == "function") {
					M.tool.log("applyOption::onBack");
					M.onBack(option.onBack);
				}

				if (typeof option.onHide == "function") {
					M.tool.log("applyOption::onHide");
					M.onHide(option.onHide);
				}

				if (typeof option.onRestore == "function") {
					M.tool.log("applyOption::onRestore");
					M.onRestore(option.onRestore);
				}

				if (typeof option.onPause == "function") {
					M.tool.log("applyOption::onPause");
					M.onPause(option.onPause);
				}

				if (typeof option.onResume == "function") {
					M.tool.log("applyOption::onResume");
					M.onResume(option.onResume);
				}
			},

			batchIndex : function(command) {
				var index = -1;

				for (var i = 0; i < _commandQueue.length; i++) {
					if (command === _commandQueue[i]) {
						index = i;
						break;
					}
				}

				return index;
			},

			execute : function(command) {
				M.tool.log("***** BatchTest.execute ***** ");

				M.tool.log(command);

				var option = this.option(command);

				this.applyOption(option);

				if (typeof option.onReady == "function") {
					$("#batch-source").html( option.onReady.toString() );

					option.onReady.call(this, M.info._event());
				}
			},

			back : function() {
				M.tool.log("***** BatchTest.back ***** ");

				var command = _commandQueue[_batchIndex];

				setTimeout(function() {

					M.page.back({
						param : {
							"batch-command" : command
						}
					});

				}, 300);
			},

			next : function(option) {
				M.tool.log("***** BatchTest.next ***** ");

				_batchIndex = _batchIndex + 1;

				if (_commandQueue[_batchIndex]) {
					var command = _commandQueue[_batchIndex];					

					M.page.html("batch-result.html", {
						delay : 300,
						action: "NO_HISTORY",
						param : {
							"batch-command" : command
						}
					});
				} else {
					this.finish();
				}
			},

			log : function() {
				M.tool.log.apply(this, arguments);

				var resultData = typeof M.data.global("batch-result") !== "object" ? {}
						: M.data.global("batch-result");
				var command = this.currentCommand();
				var args = Array.prototype.slice.call(arguments, 0);

				var data = resultData[command] || {
					result : []
				};
				data.result.push(args);

				resultData[command] = data;

				M.data.global("batch-result", resultData);
			},

			make : function() {
				M.tool.log("***** BatchTest.make ***** ");

				_maked = true;

				/*
				 * BatchTest.add("M.page.html", { onReady: function() { var
				 * command = BatchTest.currentCommand();
				 * 
				 * M.data.global("batch-stack-count", 1);
				 * 
				 * M.page.html('batch-stack.html', { delay:300,
				 * param:{"batch-command":command, "batch-func":"onReadyGroup" } } ); },
				 * 
				 * onReadyGroup: function() { var command =
				 * BatchTest.currentCommand(); var stackCount = parseInt(
				 * M.data.global("batch-stack-count") );
				 * 
				 * stackCount = stackCount + 1;
				 * 
				 * M.tool.log( "stackCount", stackCount );
				 * 
				 * M.data.global("batch-stack-count", stackCount);
				 * 
				 * if ( stackCount < 3 ) { M.page.html('batch-stack.html', {
				 * delay:300, param:{"batch-command":command,
				 * "batch-func":"onReadyGroup" } } ); } else {
				 * M.page.html('batch-result.html', { delay: 300,
				 * action:"CLEAR_TOP"}); } },
				 * 
				 * onRestore: function(e) {
				 * 
				 * M.data.removeGlobal("batch-stack-count");
				 * 
				 * BatchTest.back(); } });
				 * 
				 * BatchTest.add("M.page.html", { onReady: function() { var
				 * command = BatchTest.currentCommand();
				 * 
				 * M.page.html('batch-stack.html', { delay:300,
				 * action:"NO_HISTORY", param:{"batch-command":command,
				 * "batch-func":"onReadyGroup" } } ); },
				 * 
				 * onReadyGroup: function() {
				 * 
				 * var command = BatchTest.currentCommand();
				 * 
				 * M.page.html('batch-result.html', { delay: 300,
				 * param:{"batch-command":command, "batch-func":"onReadyGroup2" } } );
				 *  },
				 * 
				 * onReadyGroup2: function() {
				 * 
				 * BatchTest.back(); },
				 * 
				 * onRestore: function(e) {
				 * 
				 * BatchTest.back(); } });
				 * 
				 */
				
				BatchTest.add("M.page.native", {
					onReady : function() {

						//기본적으로 앱의 처음으로 돌아가므로 주석 처리
						//M.page.native();

						BatchTest.back();
					}
				});

				BatchTest.add("M.apps.info", {
					onReady : function() {
	
						var scheme = ( M.navigator.os('android') ) ? 'com.android.mms' : 'sms://';
						var info = M.apps.info(scheme);
	
						if (info.installed) {
							var app_name = info.name;
							var app_display_name = info.display_name;
							var app_version = info.version;
	
							munit = MUnit.sharedInstance();
							munit.assertEqual("message", app_display_name, "M.apps.info");
							
							BatchTest.log(info);
						} 
						else {
							BatchTest.log("Be not installed!!");
						}
	
						BatchTest.back();
					}
				});

				BatchTest.add("M.apps.info", {
					onReady : function() {

						var infos = M.apps.info();

						for (var idx in infos) {
							var info = infos[idx];
							var app_name = info.name;
							var app_display_name = info.display_name;
							var app_version = info.version;
							// TODO : get app_info process
							//munit = MUnit.sharedInstance();
							//munit.assertEqual('mms', app_name, "M.apps.info");
						}

						BatchTest.log(infos);

						BatchTest.back();

					}
				});

				BatchTest.add("M.apps.install", {
					onReady : function() {

						var appURL = ( M.navigator.os('android') )  ? 'http://sample.co.kr/sampleApp.apk'
								: 'https://sample.co.kr/sampleApp.plist';
						var appName = 'SampleApp';

						// Bad Token issue 라이브러리에서 수정
						M.apps.install(appURL, appName);

						BatchTest.back();

					}
				});

				BatchTest.add("M.apps.open", {
					onReady : function() {

						var scheme = ( M.navigator.os('android') )  ? 'com.android.sms' : 'sms://';
						var scheme = 'com.google.android.apps.maps';
						var result = M.apps.open(scheme);
						
						BatchTest.back();
					},

					onResume : function() {
						BatchTest.back();
					}
				});

				BatchTest.add("M.apps.remove", {
					onReady : function() {
						M.apps.remove('com.sample.app');

						BatchTest.back();
					}
				});

				BatchTest.add("M.apps.store", {
					onReady : function() {
						M.apps.store();
						
						BatchTest.back();
					}

					/*onResume : function() {
						BatchTest.back();
					}*/
				});

				BatchTest.add("M.apps.store", {
					onReady : function() {

						var appId = ( M.navigator.os('android') ) ? "com.sample.app" : "362057947";

						M.apps.store(appId);

						BatchTest.back();
					}
				});

				BatchTest.add("M.data.global", {
					onReady : function() {

						munit = MUnit.sharedInstance();
						M.data.global('koo', 'kov');

						var val = M.data.global('koo');
						munit.assertType(val, val, "M.data.global");
						BatchTest.log(typeof val, val);

						M.data.global({
							'koo' : 'kov',
							'boo' : 'bov',
							'foo' : 'fov',
							'arrayKey' : [ '1', '2', '3' ],
							'objectkey' : {
								'key' : 'value'
							}
						});

						var val = M.data.global('foo');
						
						munit.assertType(val, val, "M.data.global");
						BatchTest.log(typeof val, val);

						var result = M.data.global();
						munit.assert(result, "M.data.global");
						BatchTest.log(result);

						M.data.removeGlobal('koo');

						var val = M.data.global('koo');
						
						munit.assertType(val, val, "M.data.global");
						BatchTest.log(typeof val, val);

						BatchTest.back();
					}
				});

				BatchTest.add("M.data.param", {
					onReady : function() {

						munit = MUnit.sharedInstance();
						M.data.param('koo', 'kov');

						var val = M.data.param('koo');
						munit.assertType(val, val, "M.data.param");
						BatchTest.log(typeof val, val);

						M.data.param({
							'aoo' : 'aov',
							'boo' : 'bov',
							'foo' : 'fov',
							'arrayKey' : [ '1', '2', '3' ],
							'objectkey' : {
								'key' : 'value'
							}
						});

						var val = M.data.param('foo');
						munit.assertType(val, val, "M.data.param");
						BatchTest.log(typeof val, val);

						var result = M.data.param();
						munit.assert(result, "M.data.param");
						BatchTest.log(result);

						M.data.removeParam('aoo');

						var val = M.data.param('boo');
						munit.assertType(val, val, "M.data.param");
						BatchTest.log(typeof val, val);

						BatchTest.back();
					}
				});

				BatchTest.add("M.data.storage", {
					onReady : function() {

						munit = MUnit.sharedInstance();
						M.data.storage('koo', 'kov');

						var val = M.data.storage('koo');
						
						munit.assertType(val, val, "M.data.storage");
						BatchTest.log(typeof val, val);

						M.data.storage({
							'koo' : 'kov',
							'boo' : 'bov',
							'foo' : 'fov',
							'arrayKey' : [ '1', '2', '3' ],
							'objectkey' : {
								'key' : 'value'
							}
						});

						var val = M.data.storage('foo');
						munit.assertType(val, val, "M.data.storage");
						BatchTest.log(typeof val, val);

						var result = M.data.storage();
						munit.assert(result, "M.data.storage");
						BatchTest.log(result);

						M.data.removeStorage('koo');

						var val = M.data.storage('koo');
						munit.assertType(val, val, "M.data.storage");
						BatchTest.log(typeof val, val);

						M.data.removeStorage();

						var result = M.data.storage();
						munit.assert(result, "M.data.storage");
						BatchTest.log(result);

						BatchTest.back();
					}
				});

				BatchTest.add("M.db", {
					onReady : function() {

						munit = MUnit.sharedInstance();
						M.db.create('test', function(status, name) {
							//munit.assertType(val, val);
							BatchTest.log(status, name);
						});

						M.db.open('test', function(status, name) {
							BatchTest.log(status, name);
						});

						M.db.remove('test', function(status, name) {
							BatchTest.log(status, name);
						});

						M.db.close('test', function(status, name) {
							BatchTest.log(status, name);
						});

						BatchTest.back();
					}
				});

				BatchTest.add("M.file", {
					onReady : function() {

						var result = M.file.create({
							'type' : 'DIR',
							'path' : 'doc://temp'
						});

						BatchTest.log(result);

						var result = M.file.create({
							type : 'FILE',
							path : 'doc://temp/hello.txt'
						});

						BatchTest.log(result);

						M.file.write({
							path : 'doc://temp/hello.txt',
							data : '안녕하세요.'
						}, function(result) {
							BatchTest.log(result);
						});

						M.file.read({
							path : 'doc://temp/hello.txt'
						}, function(result) {
							BatchTest.log(result);
						});

						M.file.copy({
							type : 'FILE',
							source : 'doc://temp/hello.txt',
							destination : 'doc://temp/hello1.txt',
							progress : function(total, current, setting) {
								BatchTest.log(total, current);
							}
						}, function(result) {
							BatchTest.log(result);
						});

						M.file.move({
							type : 'FILE',
							source : 'doc://temp/hello1.txt',
							destination : 'doc://temp/hello2.txt',
							progress : function(total, current, setting) {
								BatchTest.log(total, current);
							}
						}, function(result) {
							BatchTest.log(result);
						});

						var result = M.file.info({
							type : 'FILE',
							path : 'doc://temp/hello.txt'
						});

						BatchTest.log(result);

						var result = M.file.info({
							path : 'doc://temp/'
						});

						BatchTest.log(result);

						var result = M.file.remove({
							type : 'FILE',
							path : 'doc://temp/hello.txt'
						});

						BatchTest.log(result);

						var result = M.file.remove({
							type : 'DIR',
							path : 'doc://temp/'
						});

						BatchTest.log(result);

						BatchTest.back();
					}
				});

				BatchTest.add("M.info", {
					onReady : function() {

						var result = M.info.app();
						BatchTest.log(result);

						var result = M.info.device();
						BatchTest.log(result);

						var result = M.info.memory();
						BatchTest.log(result);

						var result = M.info.stack();
						BatchTest.log(result);

						BatchTest.back();
					}
				});

				BatchTest.add("M.media.camera", {
					onReady : function() {

						M.media.camera({
							mode : "PHOTO",
							path : "/media"
						}, function(status, result, setting) {
							BatchTest.log(status, result);

							BatchTest.back();
						});
					}
				});

				BatchTest.add("M.media.camera", {
					onReady : function() {

						M.media.camera({
							mode : "VIDEO",
							path : "/media"
						}, function(status, result, setting) {
							BatchTest.log(status, result);

							BatchTest.back();
						});
					}
				});

				BatchTest.add("M.media.info", {
					onReady : function() {

						M.media.info({
							media : "PHOTO",
							path : "/media",
						}, function(status, result) {
							BatchTest.log(status, result);

							BatchTest.back();
						});
					}
				});

				BatchTest.add("M.media.info", {
					onReady : function() {

						M.media.info({
							media : "VIDEO",
							path : "/media",
						}, function(status, result) {
							BatchTest.log(status, result);

							BatchTest.back();
						});
					}
				});
				
				BatchTest.add("M.media.library", {
					onReady : function() {

						M.media.library({
							media : "VIDEO",
							choice : "SINGLE"
						}, function(status, result) {
							BatchTest.log(status, result);

							BatchTest.back();
						});
					}
				});

				/*BatchTest.add("M.media.library", {
					onReady : function() {

						M.media.library({
							media : "VIDEO",
							choice : "MULTI"
						}, function(status, result) {
							BatchTest.log(status, result);

							BatchTest.back();
						});
					}
				});*/

				BatchTest.add("M.media.library", {
					onReady : function() {

						M.media.library({
							media : "PHOTO",
							choice : "SINGLE"
						}, function(status, result) {
							BatchTest.log(status, result);

							BatchTest.back();
						});
					}
				});

				BatchTest.add("M.media.library", {
					onReady : function() {

						M.media.library({
							media : "PHOTO",
							choice : "MULTI"
						}, function(status, result) {
							BatchTest.log(status, result);

							BatchTest.back();
						});
					}
				});

				BatchTest.add("M.media.play", {
					onReady : function() {

						M.media.camera({
							mode : "VIDEO",
							path : "/media",
						}, function(status, result, option) {
							if (status == 'SUCCESS') {
								var video_path = result.path;
								var video_name = result.name;
								var video_thumb = video_name.substr(0,
										video_name.lastIndexOf('.'))
										+ ".png";

								M.media.play(video_path, 'NATIVE');
							}

							BatchTest.back();
						});
					}
				});

				/*BatchTest.add("M.media.record", {
					onReady : function() {

						 M.media.record({ url : 'media-record-complete.html',
						 path : '/voicelist', name : 'vocie001' });

						BatchTest.back();
					}
				});*/

				BatchTest.add("M.media.removeLibrary", {
					onReady : function() {

						M.media.info({
							media : "PHOTO",
							path : "/media",
						}, function(status, result) {
							if (status == 'SUCCESS') {
								BatchTest.log(status, result);

								M.media.removeLibrary({
									files : result,
									media : "PHOTO"
								}, function(status, setting) {
									BatchTest.log(status);
								});
							} else {
								BatchTest.log(status);

								BatchTest.back();
							}
						});

						BatchTest.back();
					}
				});

				BatchTest.add("M.media.removeLibrary", {
					onReady : function() {

						M.media.info({
							media : "VIDEO",
							path : "/media",
						}, function(status, result) {
							if (status == 'SUCCESS') {
								BatchTest.log(status, result);

								M.media.removeLibrary({
									files : result,
									media : "VIDEO"
								}, function(status, setting) {
									BatchTest.log(status);
								});
							} else {
								BatchTest.log(status);

								BatchTest.back();
							}
						});

						BatchTest.back();
					}
				});

				BatchTest .add("M.net.http.download", {
					onReady : function() {

						M.net.http.download("http://research.google.com/archive/bigtable-osdi06.pdf",
						{
							finish : function(status, header, fileinfo, setting) {
								// TODO : upload finished code here.
								BatchTest.log(status, JSON.stringify(header, null, 4),
												JSON.stringify(fileinfo, null, 4), setting);

								if (status == -1) {
									// 데이터 통신을 못한경우
								} else if (status != 200) {
									// TODO : 404, 500 error 등
								} else {
									// 성공한 경우
								}
							},
							progress : function(total, current, setting) {
								// TODO : web download progress event code here.
								BatchTest.log(total, current);
							}
						});

						BatchTest.back();
					}
				});

				BatchTest.add("M.net.http.download", {
					onReady : function() {

						M.net.http.download("http://211.241.199.234/groupware/mail_attache.jsp",
						{
							header : {},
							body : {
								'data' : '%7B%22url%22%3A%22http%3A%2F%2Fintra.uracle.co.kr%2Fwma%2Fopenapi.do%3Ftarget%3Dmail%26acton%3Dpart%26boxid%3Dnull%26mailid%3D2936%26seq%3D2%26key%3D00erW4Lq3%22%2C%22fileName%22%3A%22msp-push-r3-3.0.x_Receiver_API_%EC%A0%95%EC%9D%98%EC%84%9C_V1.2.docx%22%7D'
							},
							method : 'POST',
							finish : function(status, header, fileinfo, setting) {
								// TODO : upload finished code here.
								BatchTest.log(status, JSON.stringify(header, null, 4),
												JSON.stringify(fileinfo, null, 4), setting);

								if (status == -1) {
									// 데이터 통신을 못한경우
								} else if (status != 200) {
									// TODO : 404, 500 error 등
								} else {
									// 성공한 경우
								}
							},
							progress : function(total, current, setting) {
								// TODO : web download progress event code here.
								BatchTest.log(total, current);
							}
						});

						BatchTest.back();
					}
				});

				BatchTest.add("M.net.http.send", {
					onReady : function() {

						M.net.http.send({
							server : 'DEMO_SERVER',
							path : 'api/msp/sample/test',
							method : 'POST',
							data : {
								'deploy' : '0',
								'version' : '000000',
								'rsp' : '0b3235695f40f279ba3bda96497b894eb457ce73f8dcd6ec4d2c39d1fa622dac7b8e4c52f9b477e759343f07969bfe1d'
							},
							onSuccess : function(recevedData, setting) {
								BatchTest.log("onSuccess", recevedData);

								BatchTest.back();
							},
							onError : function(errorCode, errorMessage, setting) {
								BatchTest.log("onError", errorCode, errorMessage);

								BatchTest.back();
							}
						});
					}
				});

				BatchTest.add("M.net.http.send", {
					onReady : function() {

						M.net.http.send({
							server : 'DEMO_SERVER',
							path : 'api/msp/sample/test',
							method : 'POST',
							timeout : '1000',
							dummy : false,
							secure : false,
							message : 'Loading..',
							cancelable : false,
							data : {
								'deploy' : '0',
								'version' : '000000',
								'rsp' : '0b3235695f40f279ba3bda96497b894eb457ce73f8dcd6ec4d2c39d1fa622dac7b8e4c52f9b477e759343f07969bfe1d'
							},
							onSuccess : function(recevedData, setting) {
								BatchTest.log("onSuccess", recevedData);

								BatchTest.back();
							},
							onError : function(errorCode, errorMessage, setting) {
								BatchTest.log("onError", errorCode, errorMessage);

								BatchTest.back();
							}
						});
					}
				});

				BatchTest.add("M.net.http.upload", {
					onReady : function() {

						M.net.http.upload("http://localhost/upload.jsp", {
							header : {},
							body : [ {
								type : "FILE",
								name : "file1",
								content : "/var/..../Documents/image/abc.png",
							}, ],
							encoding : "UTF-8", // support UTF-8 or EUC-KR
							finish : function(status, header, body, setting) {
								BatchTest.log(status, header, body);

								BatchTest.back();
							},
							progress : function(total, current) {

								BatchTest.log(total, current);
							}
						});
					}
				});

				BatchTest.add("M.page.remove", {
					onReady : function() {

						M.page.remove('batch.html');

						BatchTest.back();
					}
				});

				BatchTest.add("M.pop.alert", {
					onReady : function() {

						M.pop.alert('message', {
							title : 'title',
							buttons : [ 'button0', 'button1', ],
						}, function(index, option) {
							BatchTest.log(index);

							BatchTest.back();
						});
					}
				});

				BatchTest.add("M.pop.date", {
					onReady : function() {

						M.pop.date({
							type : 'HM12',
							initDate : '1130PM'
						}, function(result, option) {
							BatchTest.log(result);

							BatchTest.back();
						});
					}
				});

				BatchTest.add("M.pop.date", {
					onReady : function() {

						M.pop.date({
							type : 'HM12',
							initDate : '1130PM',
							interval : 6
						}, function(result, option) {
							BatchTest.log(result);

							BatchTest.back();
						});
					}
				});

				BatchTest.add("M.pop.date", {
					onReady : function() {

						M.pop.date({
							type : 'HM24',
							initDate : '2330'
						}, function(result, option) {
							BatchTest.log(result);

							BatchTest.back();
						});
					}
				});

				BatchTest.add("M.pop.date", {
					onReady : function() {

						M.pop.date({
							type : 'HM12',
							initDate : '1130PM',
							interval : 30
						}, function(result, option) {
							BatchTest.log(result);

							BatchTest.back();
						});
					}
				});

				BatchTest.add("M.pop.date", {
					onReady : function() {

						M.pop.date({
							type : 'MMYYYY',
							initDate : '072013'
						}, function(result, option) {
							BatchTest.log(result);

							BatchTest.back();
						});
					}
				});

				BatchTest.add("M.pop.date", {
					onReady : function() {

						M.pop.date({
							type : 'YYYY',
							initDate : '2013'
						}, function(result, option) {
							BatchTest.log(result);

							BatchTest.back();
						});
					}
				});

				BatchTest.add("M.pop.date", {
					onReady : function() {

						M.pop.date({
							type : 'MM',
							initDate : '07'
						}, function(result, option) {
							BatchTest.log(result);

							BatchTest.back();
						});
					}
				});

				BatchTest.add("M.pop.date", {
					onReady : function() {

						M.pop.date({
							type : 'DD',
							initDate : '12'
						}, function(result, option) {
							BatchTest.log(result);

							BatchTest.back();
						});
					}
				});

				BatchTest.add("M.pop.date", {
					onReady : function() {

						M.pop.date({
							type : 'YMD',
							initDate : '20130723',
							startDate : '19790101',
							endDate : '21001231'
						}, function(result, setting) {
							BatchTest.log(result);

							BatchTest.back();
						});
					}
				});

				BatchTest.add("M.pop.date", {
					onReady : function() {

						M.pop.date({
							type : 'YM',
							initDate : '201307',
							startDate : '197901',
							endDate : '210012'
						}, function(result, setting) {
							BatchTest.log(result);

							BatchTest.back();
						});
					}
				});

				BatchTest.add("M.pop.instance", {
					onReady : function() {

						M.pop.instance("message");

						BatchTest.back();
					}
				});

				BatchTest.add("M.pop.list", {
					onReady : function() {

						M.pop.list({
							title : 'title',
							message : 'message',
							button : [ 'button0', 'button1', 'button2' ],
							list : [ {
								title : 'row0',
								value : 'value0'
							}, {
								title : 'row1',
								value : 'value1'
							}, {
								title : 'row2',
								value : 'value2'
							}, {
								title : 'row3',
								value : 'value3'
							}, {
								title : 'row4',
								value : 'value4'
							} ],
							mode : 'SINGLE',
							selected : 2,
						}, function(buttonIdx, rowInfo, setting) {
							BatchTest.log(buttonIdx, rowInfo);

							BatchTest.back();
						});

					}
				});

				BatchTest.add("M.pop.list", {
					onReady : function() {

						M.pop.list({
							title : 'title',
							message : 'message',
							button : [ 'button0', 'button1', 'button2' ],
							list : [ {
								title : 'row0',
								value : 'value0'
							}, {
								title : 'row1',
								value : 'value1'
							}, {
								title : 'row2',
								value : 'value2'
							}, {
								title : 'row3',
								value : 'value3'
							}, {
								title : 'row4',
								value : 'value4'
							} ],
							mode : 'MULTI',
							selected : [ 0, 2 ],
						}, function(buttonIdx, rowInfo, setting) {
							BatchTest.log(buttonIdx, rowInfo);

							BatchTest.back();
						});

					}
				});

				BatchTest.add("M.sec", {
					onReady : function() {

						var encrypt = M.sec.encrypt('Sample Text');
						BatchTest.log(encrypt);

						var decrypt = M.sec.decrypt(encrypt.result);
						BatchTest.log(decrypt);

						BatchTest.back();
					}
				});

				BatchTest.add("M.sys.call", {
					onReady : function() {

						M.sys.call('010-123-4567');

						BatchTest.back();
					},

					onResume : function() {
						BatchTest.back();
					}
				});

				BatchTest.add("M.sys.flash", {
					onReady : function() {

						var result = M.sys.flash();
						BatchTest.log(result);

						M.sys.flash('ON');

						M.sys.flash('OFF');

						BatchTest.back();
					}
				});

				BatchTest.add("M.sys.mail", {
					onReady : function() {

						M.sys.mail({
							to : [ 'test1@test.com', 'test2@test.com' ],
							cc : [ 'cc1@test.com', 'cc2@test.com' ],
							bcc : [ 'bcc1@test.com', 'bcc2@test.com' ],
							subject : '제목',
							content : '내용'
						});

						BatchTest.back();
					}

					/*onResume : function() {
						BatchTest.back();
					}*/
				});

				BatchTest.add("M.sys.sms", {
					onReady : function() {

						M.sys.sms({
							target : [ '010-123-4567', '0109876543' ],
							content : '안녕하세요.'
						});

						BatchTest.back();
					}

					/*onResume : function() {
						BatchTest.back();
					}*/
				});

				BatchTest.add("M.sys.vibration", {
					onReady : function() {

						M.sys.vibration(2000);

						setTimeout(function() {
							BatchTest.back();
						}, 1000);
					}
				});
				
				BatchTest.add("M.page.html", {
					onReady : function() {
						M.page.html('batch-result.html', {
							param : {
								"batch-back" : true
							}
						});
						
						BatchTest.back();
					},
	
					onRestore : function(e) {
						BatchTest.back();
					}
				});
				
				BatchTest.add("M.page.html", {
					onReady : function() {
						window.ANIMATION_INDEX = 0;
	
						M.page.html('batch-result.html', {
							param : {
								"batch-back" : true
							},
							animation : ANIMATION_INDEX
						});
						
						BatchTest.back();											
					},
	
					onRestore : function(e) {
						ANIMATION_INDEX = ANIMATION_INDEX + 1;
	
						if (ANIMATION_INDEX <= 8) {
							M.page.html('batch-result.html', {
								param : {
									"batch-back" : true
								},
								animation : ANIMATION_INDEX
							});
						} else {
							BatchTest.back();
						}
					}
				});
				
				BatchTest.add("M.page.html", {
					onReady : function() {
						M.page.html('batch-result.html', {
							param : {
								"batch-back" : true
							},
							orientation : "LAND"
						});
						
						BatchTest.back();
					},
	
					onRestore : function(e) {
						BatchTest.back();
					}
				});

				BatchTest.add("M.sys.exit", {
					onReady : function() {
						
						munit = MUnit.sharedInstance();
						
						M.tool.log(munit.summary());
						BatchTest.sendToMail();
						
						this.finish();
						
						BatchTest.back();
					},
					
					/*M.sys.exit();*/
				});

			}
		}

	}();

	window.BatchTest = BatchTest;

	M.onReady(function(e) {
		if (M.data.global("batch-starting")) {
			BatchTest.init();
		}
	});

})(window);