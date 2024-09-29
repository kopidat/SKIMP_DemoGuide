(function(window, undefined) {


var 

UISlideView = UI.Class({
	name: "UISlideView",
	parent: UI.Class.UIView, // or "UIView"
	constructor: function( element ) {
		
		var _startY,
			_options;
		
		return {
			init: function() {
				var self = this._super().init();
				if (self) {
//					debug.log( this.name, "init", _options );
					
					_startY = $(element).position().top;
					_options = UISlideView.options();
					debug.log( this.name, "init", _options );
				};
				return this; // 반드시 this 를 리턴할 것.
			},
			
			options: function( options ) {
				if ( arguments.length == 0 ) {
					return _options;
				};
				
				for ( var key in _options ) {
					if ( options[key] != undefined ) {
						//TODO: 변수 타입 체크 필요
							
						_options[key] = options[key];
					};
				};
			},
			
			duration: function() {
				if ( ! _options.duration ) {
					return UISlideView.duration();
				};
			
				return _options.duration * 1000;
			},
			
			open: function( options ) {
				if ( options != undefined ) {
					this.options( options );
				};
				
				$(element).animate({
					top:0
				}, this.duration() );
			},
			
			close: function( options ) {
				if ( options != undefined ) {
					this.options( options );
				};
				
				$(element).animate({
					top:_startY
				}, this.duration() );
			}
		};
	},
	
	static: function() {
	
		var _options = {
			duration: 0.35
		};
		
		return {
			duration: function() {
				if ( ! _options.duration ) {
					return 0.34;	
				};
			
				return _options.duration * 1000;
			},
		
			options: function( options ) {
				if ( arguments.length == 0 ) {
					return UI.Helper.Object.clone( _options );
				};
				
				for ( var key in _options ) {
					if ( options[key] != undefined ) {
						//TODO: 변수 타입 체크 필요
							
						_options[key] = options[key];
					};
				};
			}
		};
	}
}),

UIDashboardItem = UI.Class({
	name : "UIDashboardItem",
	parent : UI.Class.UIView, // or "UIView"
	constructor: function( element, options ) {
		
		var _index;
		var _parent ;
		
		return {
			init: function() {
				var self = this._super().init();
				if (self) {
					_index = options.index;
					_parent = options.parent;
					
//					debug.log( _index, _parent );
					
					self = this;
					
					$(element).bind("click", function(e) {
						_parent.didSelect( self );
					});
				};
				
				return this;
			},
			
			index: function() {
				return _index;
			}
		};
	}
});
	
	
UIDashboard = UI.Class({
	name : "UIDashboard",
	parent : UI.Class.UIView, // or "UIView"
	constructor : function ( element, options){
//		var _options;
		var _items = [];
		
		return {
			init: function() {
				var self = this._super().init();
				if (self) {
					
//					this.options( options );
					var $items = $(element).find(options.itemSelector);
					
					for ( var i=0;i<$items.length;i++) {
						var item = $items.eq(i).instance(UIDashboardItem, {
							index:i,
							parent:this
						});
						
						_items.push( item );
					};
				};
				return this; // 반드시 this 를 리턴할 것.
			},
			
			didSelect: function( item ) {
				var index = item.index();
				
				debug.log(item, index);
				
				this.dispatchEvent("UIDashboardEvent.SELECT", index );
			},
			
			options: function( options ) {
				if ( arguments.length == 0 ) {
					return _options;
				};
				
				for ( var key in _options ) {
					if ( options[key] != undefined ) {
						//TODO: 변수 타입 체크 필요
							
						_options[key] = options[key];
					};
				};
			},
			
//			buttonClassName: function() {
//				return _options.button;
//			},
			
//			excute : function() {
//				var className = this.buttonClassName();
//			}
		}
	}
}),

UISideMenu = UI.Class({
	name : "UISideMenu",
	parent : UI.Class.UIView, // or "UIView"
	constructor : function ( element ){
		var _startY,
			 _isOpen,
			 _options;
		
		return {
			init: function() {
				var self = this._super().init();
				if (self) {
					debug.log( this.name, "init", _options );
					_startY = $(element).position().left;
					_isOpen = false;
					_options = UISlideView.options();
				};
				return this; // 반드시 this 를 리턴할 것.
			},
			
			options: function( ) {
				if ( arguments.length == 0 ) {
					return _options;
				};
				
				for ( var key in _options ) {
					if ( options[key] != undefined ) {
						//TODO: 변수 타입 체크 필요
							
						_options[key] = options[key];
					};
				};
			},
			
			duration: function() {
				if ( ! _options.duration ) {
					return UISlideView.duration();
				};
			
				return _options.duration * 1000;
			},
			
			toggle : function() {
				if(_isOpen == false){	// Side Menu가 닫혀 있을 경우
					$(element)
				}else{	// Side Menu가 열려 있을 경우
					
				}
			}
		}
	},
	
	static: function() {
		
		var _options = {
			duration: 0.35
		};
		
		return {
			duration: function() {
				if ( ! _options.duration ) {
					return 0.34;	
				};
			
				return _options.duration * 1000;
			},
		
			options: function( options ) {
				
				if ( arguments.length == 0 ) {
					return $.Helper.Object.clone( _options );
				};
				
				for ( var key in _options ) {
					if ( options[key] != undefined ) {
						//TODO: 변수 타입 체크 필요
							
						_options[key] = options[key];
					};
				};
			}
		};
	}
}),

UIAccordion  = UI.Class({
	name : "UIAccordion",
	parent : UI.Class.View,
	constructor : function(){
		
		return {
			init : function(){
				var self = this._super().init();
				if (self) {
					debug.log( this.name, "init", _options );
				};
				return this; // 반드시 this 를 리턴할 것.
			}
		}
	}
});

window.UISlideView = UISlideView;
window.UIDashboard = UIDashboard;
window.UISideMenu = UISideMenu;
window.UIAccordion = UIAccordion;

})(window);