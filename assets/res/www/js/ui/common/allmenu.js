M.onReady(function(){
	var url = window.location.href,
	substrIdx = url.indexOf('/html'),
	pageName = url.substring(substrIdx+6, url.length),
	pageFolder = pageName.substr(0, pageName.indexOf('/'));

	// 전체메뉴 호출
	$.ajax({
		url: '../common/allmenu.html',
		type : 'GET',
		contentType : 'UTF-8',
		success: function(data) {
			$("#popWrap").html(data);
			
			// 전체 메뉴 top 값 설정
			$("#popWrap").css("top", $(window).height());
			
			$("#allmenu_scroll").css('height', $(window).height() - $("#allmenu_header").height() - $('.tabArea>button:eq(0)').height() - parseInt($("#allmenu_header").css('paddingTop')));
			
			// 전체 메뉴 클릭시
			$(".tbtn_menu").click(function(){
				var initTab = pageName.substring(0, pageName.indexOf('/')),
					tabIdx = 0;
				switch(initTab){
					case 'uikit' :
						tabIdx = 0;
					break;
					
					case 'sample' :
						tabIdx = 1;
					break;
					
					case 'api' :
						tabIdx = 2;
					break;
				}
				$("[data-instance-class='tab']").each(function(idx, element){
					$(element).removeClass('on');
					$("[data-instance-class='tab-content']:eq(" + idx + ")").removeClass("menuOn");
				})
				$("[data-instance-class='tab']:eq("+tabIdx+")").addClass('on');
				$("[data-instance-class='tab-content']:eq("+tabIdx+")").addClass("menuOn");
				$("#popWrap").removeClass("none");
				
				$("#popWrap").animate({
					top:"0px"
				}, 500, function(){
					$("#container").css('display', 'none');
				});
			});
			
			// 전체 메뉴 닫기 버튼 클릭시
			$(".tbtn_close").click(function(){
				$("#container").css('display', 'block');
				$("#popWrap").animate({
					top: $(window).height() + "px"
				}, 500);
				$("#allmenu_scroll").scrollTop(0);
				setTimeout(function(){
					$("#popWrap").addClass("none");
				}, 500);
			});
			
			// 각 메뉴 클릭시 페이지 이동
			$("#allmenu_scroll [data-page-name] button").click(function(){
				var clickPage = $(this).parent().attr('data-page-name').substr(3,$(this).parent().attr('data-page-name').length-1);
				var clickFolder =clickPage.substr(0,clickPage.indexOf('/'));
				if(pageName != clickPage){
					$(".tbtn_close").click();
					if(pageFolder == clickFolder){
						var directPage = clickPage.substr(clickPage.indexOf('/')+1, clickPage.length-1)
					}else{
						var directPage = $(this).parent().attr('data-page-name');
					}
					var paramObj = {}
					if(directPage.indexOf('s0304_main_nds.html') > -1){
						if($(this).html() == "메인"){
							paramObj.page ="main";
						}else{
							paramObj.page ="navigation";
						}
					}
					setTimeout(function(){
						M.page.html(directPage,{
							action:"NEW_SCR",
							orient:"PORT",
							param : paramObj
						});
					}, 600);
				}else{
					$(".tbtn_close").click();
				}
			});
			
			// 탭 클릭시
			$("[data-instance-class='tab']").click(function(){
				$("[data-instance-class='tab']").each(function(idx, element){
					$(element).removeClass('on');
					$("[data-instance-class='tab-content']:eq(" + idx + ")").removeClass("menuOn");
				})
				$(this).addClass('on');
				$("[data-instance-class='tab-content']:eq(" + $(this).index() + ")").addClass("menuOn");
			});
			
			// 홈 버튼 클릭시
			$('.tbtn_home').click(function(){
				M.page.html('../common/main.html',{
					action:"CLEAR_TOP",
					orient:"PORT"
				});
			});
			
			var osInfo = osCheck();
			if(osInfo.os == "android" && ( osInfo.versionMap[0] < "4" || osInfo.versionMap[1] < "1" ) ){
				// 예외 케이스만 아래 소스 실행
				$("#allmenu_scroll").addClass("hidden-scrollbar");
				$("#scroll").addClass("hidden-scrollbar");
				$(".scroll").addClass("hidden-scrollbar");
	
				$("#scroll_container").bind("touchstart", function(e) {
					return true;
				});
			}
		}
	});
});

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