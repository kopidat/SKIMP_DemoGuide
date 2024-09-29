
(function(window, undefined) {

var 
thisFileName = "mcore.extends.js",

importFiles = [
	"libs/jquery/jquery-2.1.0.js",
	"libs/instance/instance.ui.js",
	"ui/common/allmenu.js",
	"ui/common/common.js"
];

M.ScriptLoader.writeScript( importFiles, M.ScriptLoader.scriptPath(thisFileName) );

})(window);