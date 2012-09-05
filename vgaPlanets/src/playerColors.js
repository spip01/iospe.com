// ==UserScript==
// @name          Planets.nu set player colors
// @description   set player colors on option screen. shows sample planet gradient and sample waypoint.
// @include       http://planets.nu/home
// @include       http://planets.nu/games/*
// @homepage      http://planets.nu/discussion/
// @version 1.00
// ==/UserScript==

function wrapper () {
	
	var oldShowSettings = vgapDashboard.prototype.showSettings;
	vgapDashboard.prototype.showSettings = function () {

		oldShowSettings.apply(this,arguments);
		
		this.buildPlayerColors();
		this.showPlayerColors();
	};

	vgapDashboard.prototype.buildPlayerColors = function() {
		var b = "";
		
		b += "<div id=AccountSettings'>";
		b += "<br><h3>Color Settings</h3><table>";

		for (var i=1; i<=vgap.game.slots; ++i) {
			b += "<tr><td>Player "+i+": "+vgap.races[i].shortname+"</td>";
			b +=   "<td><input id='colors.S"+i+"' type='color' onchange='vgap.dash.setPlayerColors()' value=" + localStorage["colors.S"+i] + " /></td>";
			b +=   "<td><input id='colors.E"+i+"' type='color' onchange='vgap.dash.setPlayerColors()' value=" + localStorage["colors.E"+i] + " /></td>";
			b +=   "<td><div id='showExample.S"+i+"' /></td></tr>";
		}
		
		b += "<tr><td colspan=2><button type='button' onmousedown='vgap.dash.resetPlayerColors()'>Reset Player Colors</button></td></tr></table></div>";
		
		$("#AccountSettings").replaceWith(b);
	};
	
	vgapDashboard.prototype.setPlayerColors = function() {
		$("#AccountSettings,input[type='color']").each(function(b) {
			localStorage[$(this).attr("id")] = $(this).val();
		});

		this.showPlayerColors();
	};

	vgapDashboard.prototype.resetPlayerColors = function() {
		vgap.map.setColors();
		
		$("#AccountSettings,input[type='color']").each(function(b) {
			$(this).val(localStorage[$(this).attr("id")]);
		});
		
		vgap.dash.showPlayerColors();
	};
	
	vgapDashboard.prototype.showPlayerColors = function() {
		
		for (var i=1; i<=vgap.game.slots; ++i) {
			if (vgap.dash.paper == undefined)
				vgap.dash.paper = [];
			
			if (vgap.dash.paper["colors.S"+i] == undefined)
				vgap.dash.paper["colors.S"+i] = Raphael(document.getElementById("showExample.S"+i), 90, 30);
			
			var paper = vgap.dash.paper["colors.S"+i];
			var canvas = paper.set();
		    canvas.clear();
			
		    var s = localStorage["colors.S"+i];
		    var e = localStorage["colors.E"+i];
	        var a = {fill:"0-"+s+"-"+e, "fill-opacity":1};
	        canvas.push(paper.circle(15, 15, 8).attr(a));
	        
            a = {stroke:s, "stroke-width":1, "stroke-opacity":0.5, fill:s, "fill-opacity":0.2};
            canvas.push(paper.circle(35, 15, 8).attr(a));
	        
	        
	    	a = {stroke:s, "stroke-width":2, "arrow-end":"classic-wide-long", "stroke-opacity":1};
	        canvas.push(paper.path("M 50 15 L 85 15 Z").attr(a));
		}
	};

}

var script = document.createElement("script");
script.type = "application/javascript";
script.textContent = "(" + wrapper + ")();";

document.body.appendChild(script);

