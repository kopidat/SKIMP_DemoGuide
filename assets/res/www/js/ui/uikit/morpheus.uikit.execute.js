
$(function() {

	$("[data-component]").each( function(index, element) {
		
		var $element = $(element),
			component = $element.data("component"),
			instance,
			constructor;
			
		switch( component ) {
			case "slide-view":
				constructor = $.Class.UISlideView;
			break;
		};
		
		if ( constructor == undefined ) {
			return true;	
		};
		
		$element.instance(constructor);
		
	});
});