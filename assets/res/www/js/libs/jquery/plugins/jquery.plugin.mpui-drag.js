/*! 
jQuery plugin Morpheus UI Drag 
date : 2013-12-10	
*/

(function(window, undefined) {

var dragOption = {},
	target,
	hasTouch = 'ontouchstart' in window || false,
	startEvt = hasTouch ? 'touchstart' : 'mousedown',
	moveEvt = hasTouch ? 'touchmove' : 'mousemove',
	endEvt = hasTouch ? 'touchend' : 'mouseup',
	cancelEvt = hasTouch ? 'touchcancel' : 'mouseup',
	prefix,
	pointer;
	
var UIDrag = {

	init: function(evt) {
	
		if ( ! hasTouch )  {
			pointer = evt;
		}
		else {
			if ( evt.touches.length > 0 ) {
				pointer = evt.touches[0];
			}
			else {
				pointer = evt;
			}
		}
		
		switch (evt.type) {
			case 'mousedown': 
			case 'touchstart':
				UIDrag.dragStart(evt);
			break;
			case 'mousemove': 
			case 'touchmove':
				UIDrag.dragMove(evt);
			break;
			case 'mouseup': 
			case 'touchend':
				UIDrag.dragEnd(evt);
			break;
		}
	},

	dragStart: function(evt) {
		evt.preventDefault();
		
		el = evt.currentTarget,
		target = evt.currentTarget.target,
		option = el.option,
		firstDirction = null,
		dragOption = {
			 'vertical'		: option.vertical	=== undefined ? true 	: option.vertical
			,'horizon'		: option.horizon 	=== undefined ? true 	: option.horizon
			,'scale'		: option.scale		=== undefined ? 1 		: option.scale
			,'opacity'		: option.opacity 	=== undefined ? 1 		: option.opacity
			,'css'			: option.css 		=== undefined ? null 	: option.css
			,'oneway'		: option.oneway 	=== undefined ? false 	: option.oneway
			,'left'			: option.left 		=== undefined ? null 	: option.left
			,'right'		: option.right 		=== undefined ? null 	: option.right
			,'top'			: option.top 		=== undefined ? null 	: option.top
			,'bottom'		: option.bottom 	=== undefined ? null 	: option.bottom
			,'translate'	: option.translate 	=== undefined ? false 	: option.translate
			,'onStart'		: option.onStart 	=== undefined ? null 	: option.onStart
			,'onMove'		: option.onMove 	=== undefined ? null 	: option.onMove
			,'onEnd'		: option.onEnd 		=== undefined ? null 	: option.onEnd
		},
		startX = evt.startX = pointer.pageX,
		startY = evt.startY = pointer.pageY,
		centerX = dragOption.translate ? parseInt(target.css('x'), 10) : parseInt(target.css('left'), 10) || 0,
		centerY = dragOption.translate ? parseInt(target.css('y'), 10) : parseInt(target.css('top'), 10) || 0;
		
		if (target.css('position') === 'static') {
			target.css('position', 'relative');
		};
		target.css('cursor', 'move');

		document.addEventListener(moveEvt, UIDrag.init, false);
		document.addEventListener(endEvt, UIDrag.init, false);
		
		// scale
		if (dragOption.scale != 1) {
			target.css('scale', dragOption.scale);
		}
		// opacity
		if (dragOption.opacity != 1) {
			target.css('opacity', dragOption.opacity);
		}
		// css
		if (dragOption.css) {
			target.addClass(dragOption.css);
		}
		// callback
		if (dragOption.onStart) {
			dragOption.onStart.call(target, evt, target);
		}
	},

	dragMove: function(evt) {
		//evt.preventDefault();
		evt.endX = pointer.pageX;
		evt.endY = pointer.pageY;
		evt.distanceX = Math.abs(startX - evt.endX);
		evt.distanceY = Math.abs(startY - evt.endY);
		evt.direction = startX > evt.endX ? -1 : startX < evt.endX ? 1 : 0;
		evt.updown = startY > evt.endY ? -1 : startY < evt.endY ? 1 : 0;
		
		var moveX = evt.endX - startX + centerX;
		var moveY = evt.endY - startY + centerY;
		
		// left, right, top, bottom limit
		if (dragOption.left !== null && parseInt(dragOption.left, 10) > moveX) {
			moveX = parseInt(dragOption.left, 10);
		}
		if (dragOption.right !== null && parseInt(dragOption.right, 10) < moveX) {
			moveX = parseInt(dragOption.right, 10);
		}
		if (dragOption.top !== null && parseInt(dragOption.top, 10) > moveY) {
			moveY = parseInt(dragOption.top, 10);
		}
		if (dragOption.bottom !== null && parseInt(dragOption.bottom, 10) < moveY) {
			moveY = parseInt(dragOption.bottom, 10);
		}

		// oneway
		if (dragOption.oneway) {
			if (evt.distanceX > evt.distanceY && !firstDirction) {
				firstDirction = 'horizon';
				dragOption.horizon = false;
			}
			if (evt.distanceX < evt.distanceY && !firstDirction) {
				firstDirction = 'vertical';
				dragOption.vertical = false;
			}
		}

		if (dragOption.vertical) {
			if (dragOption.translate) {
				target.css('x', moveX + 'px');
			} else {
				target.css('left', moveX + 'px');
			}
		}
		if (dragOption.horizon) {
			if (dragOption.translate) {
				target.css('y', moveY + 'px');
			} else {
				target.css('top', moveY + 'px');
			}
		}

		// callback
		if (dragOption.onMove) {
			dragOption.onMove.call( target, evt, target);
		}
	},

	dragEnd: function(evt) {
		
		evt.endX = pointer.pageX;
		evt.endY = pointer.pageY;
		evt.distanceX = Math.abs(startX - evt.endX);
		evt.distanceY = Math.abs(startY - evt.endY);
		evt.direction = startX > evt.endX ? -1 : startX < evt.endX ? 1 : 0;
		evt.updown = startY > evt.endY ? -1 : startY < evt.endY ? 1 : 0;

		document.removeEventListener(moveEvt, UIDrag.init, false);
		document.removeEventListener(endEvt, UIDrag.init, false);
		target.css('cursor', '');

		// reset
		if (dragOption.scale != 1) {
			target.css('scale', 1);
		}
		if (dragOption.opacity != 1) {
			target.css('opacity', 1);
		}
		if (dragOption.css != 1) {
			target.removeClass(dragOption.css);
		}

		// callback
		if (dragOption.onEnd) {
			dragOption.onEnd.call(target, evt, target);
		}
	}
};
	
$ = jQuery;

$.fn.extend({
	
	/* drag and drop */
 	drag: function( opt ) {
 		var	elem = this,
 			that = this,
 			option = opt || {};
		
 		dragOption.handler = !option.handler ? elem : document.querySelectorAll(option.handler);
 		
 		if ( ! hasTouch ) {
			dragOption.handler[0].addEventListener('mousedown', UIDrag.init, false);
		} 
		else {
			dragOption.handler[0].addEventListener('touchstart', UIDrag.init, false);
		};
		
		dragOption.handler[0].option = arguments[0] || {};
		dragOption.handler[0].target = that;
		
		return this;
 	},

 	stopDrag: function() {
 		var elem = this.get(0);
 		
		if ( ! hasTouch ) {
			elem[0].removeEventListener('mousedown', UIDrag.init, false);
		} else {
			elem[0].removeEventListener('touchstart', UIDrag.init, false);
		};
		
		return this;
 	}
 
});
	
})(window);