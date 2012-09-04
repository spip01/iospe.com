// ==UserScript==
// @name          Planets.nu hide notes display on map
// @description   hide notes box drawn around planets.
// @include       http://planets.nu/home
// @include       http://planets.nu/games/*
// @homepage      http://planets.nu/discussion/utility-script-hide-notes-display
// @version 1.11
// ==/UserScript==

function wrapper () {
	
	var oldProcessLoad = vgaPlanets.prototype.processLoad;
    vgaPlanets.prototype.processLoad = function(f) {
    	
    	oldProcessLoad.apply(this,arguments);
    	
   };
	
	var oldShowSettings = vgapDashboard.prototype.showSettings;
	vgapDashboard.prototype.showSettings = function () {

		oldShowSettings.apply(this,arguments);

		var b = "";
		
		b += "<div id=playerColors'>";
		b += "<br><h3>Color Settings</h3><table>";

		for (var i=1; i<=vgap.game.slots; ++i) {
			b += "<tr><td>Player "+i+": "+vgap.races[i].shortname+"</td>";
			b +=   "<td><input id='color.S"+i+"' type='color' onchange='vgap.dash.setPlayerColors("+i+")' value=" + localStorage["colors.S"+i] + " /></td>";
			b +=   "<td><input id='color.E"+i+"' type='color' onchange='vgap.dash.setPlayerColors("+i+")' value=" + localStorage["colors.E"+i] + " /></td>";
			b +=   "<td><div id='showExample.S"+i+"' /></td></tr>";
		}
		
		// rotate colors on selection, set player n to blue and redistribute color wheel
		
		b += "</table></div>";
		
		$("#AccountSettings").replaceWith(b);
		
		this.showPlayerColors();
	};

	vgapDashboard.prototype.setPlayerColors = function(player) {
		localStorage[player] = $("#playerColors :contains("+player+")").val();
		this.showPlayerColors();
	};

	vgapDashboard.prototype.showPlayerColors = function() {
		
		for (var i=1; i<=vgap.game.slots; ++i) {
			if (vgap.dash.paper == undefined)
				vgap.dash.paper = [];
			
			if (vgap.dash.paper["colors.S"+i] == undefined)
				vgap.dash.paper["colors.S"+i] = Raphael(document.getElementById("showExample.S"+i), 70, 30);
			
			var paper = vgap.dash.paper["colors.S"+i];
			var canvas = paper.set();
			
		    var s = localStorage["colors.S"+i];
		    var e = localStorage["colors.E"+i];
	        var l = {fill:"0-"+s+"-"+e, "fill-opacity":1};
		    
		    canvas.clear();
	        canvas.push(paper.circle(15, 15, 8).attr(l));
	        
	    	d = {"stroke":s, "stroke-width":2, "arrow-end":"classic-wide-long", "stroke-opacity":1};
	        canvas.push(paper.path("M 30 15 L 65 15 Z").attr(d));
		}
	};

	var oldSaveSettings = vgapDashboard.prototype.saveSettings;
	vgapDashboard.prototype.saveSettings = function() {
		
//     	:color doesn't work yet
//		$("#notesOptions :color").each(function(b) {
//			localStorage[$(this).attr("id")] = $(this).val();
//		});
	    	
		for (var i=1; i<=vgap.game.slots; ++i) {
			localStorage["colors.S"+i] = $("#playerColors :contains('colors.S"+i+"')").val();
			localStorage["colors.E"+i] = $("#playerColors :contains('colors.E"+i+"')").val();
		}
		
	    oldSaveSettings.apply(this,arguments);
	};
		
}

var script = document.createElement("script");
script.type = "application/javascript";
script.textContent = "(" + wrapper + ")();";

document.body.appendChild(script);
