function osCheck(){
	var agent = navigator.userAgent.toLowerCase();
	var agentInfos = agent.split(";");
	var obj = {};
	var regNumberOnly = /[^-\.0-9]/g;
	
	for ( var i in agentInfos ) {
		var info = agentInfos[i];
		if (info.indexOf('ipod') != -1){
			obj.os = 'ios';
			obj.version = info.replace(regNumberOnly, '');
			obj.versionMap = obj.version.split(".");
			break;
		}else if(info.indexOf('iphone') != -1){
			obj.os = 'ios';
			obj.version = info.replace(regNumberOnly, '');
			obj.versionMap = obj.version.split(".");
			break;
		}else if(info.indexOf('ipad') != -1){
			obj.os = 'ios';
			obj.version = info.replace(regNumberOnly, '');
			obj.versionMap = obj.version.split(".");
			break;
		}else if(info.indexOf('android') != -1){
			obj.os = 'android';
			obj.version = info.replace(regNumberOnly, '');
			obj.versionMap = obj.version.split(".");
			break;
		}
	}
	
	if ( ! obj.os ) {
		obj.os = "pc";
		obj.version = "1";
	}
	
	return obj;
}

function iscrollApply(element){
	var osInfo = osCheck();
	if((osInfo.os == "android" && osInfo.version < 4) || (osInfo.os == "ios" && osInfo.version <5)){
		document.write('<script defer type="text/javascript" src="../../js/iscroll.js"><\/script>');
		window.addEventListener('load', function(){
			var myScroll = new iScroll(element);
		}, false);
	}
}

$(function() {
	// 이전 버튼 클릭시
	$('.tbtn_prev').click(function(){
		M.page.back();
	});
});

// 도움말 위치 조정
M.onReady(function(){
	M.page.defer(true, 500);

	if(M.info.stack().length > 20){
		M.page.remove(M.info.stack()[2].key);
	}
	
	var osInfo = osCheck();
	if(osInfo.os == "android" && ( osInfo.versionMap[0] < "4" || osInfo.versionMap[1] < "1" ) ){
		// 예외 케이스만 아래 소스 실행
		$("#allmenu_scroll").addClass("hidden-scrollbar");
		$("#scroll").addClass("hidden-scrollbar");
		$(".scroll").addClass("hidden-scrollbar");
	
		$("#container").bind("touchstart", function(e) {
			return true;
		});
	}
	
	if($("[data-instance-class='info-cont']") != undefined && $("[data-instance-class='info-cont']") != ""){
		var infoTop = 0;
		infoTop = ($('body').height() - $("[data-instance-class='info-cont']").height())/2 - 40;
		$("[data-instance-class='info-cont']").css("marginTop", infoTop);
		infoTop = 0;
	}
});