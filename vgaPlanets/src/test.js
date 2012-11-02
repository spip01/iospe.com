//==UserScript==
//@name          planets.nu test script
//@description   test script
// @include       http://planets.nu/*
// @include       http://*.planets.nu/*
//@version 0.0
//==/UserScript==

function wrapper () { // test.js

	var oldLoadControls = vgapMap.prototype.loadControls; 
	vgapMap.prototype.loadControls = function () {

		oldLoadControls.apply(this, arguments);
           
        var b = "";
        b += "<li onclick='vgap.resetTurn();'>Reset Turn</li>";
        
        $("#MapTools li:contains('Clear')").after(b);
	};
    

}
	
var script = document.createElement("script");
script.type = "application/javascript";
script.textContent = "(" + wrapper + ")();";

document.body.appendChild(script);
