// ==UserScript==
// @name          Planets.nu better hyperjump circles
// @description   Circles planets that can be jumped to.  Gets rid of ribbon that covered up other objects.
// @include       http://planets.nu/home
// @include       http://planets.nu/games/*
// @homepage      http://planets.nu/discussion/better-hyperjump-circles
// @version 1.10
// ==/UserScript==

function wrapper () {	// hyperJump.js
	
	var oldProcessLoad = vgaPlanets.prototype.processLoad;
    vgaPlanets.prototype.processLoad = function(f) {
    	
    	oldProcessLoad.apply(this,arguments);
    	
    	if(typeof(Storage)!=="undefined") {
	    	if (localStorage.hyperjumpRing == null) {
	    		localStorage.hyperjumpRing = "true";
	    		localStorage.hyperjumpPlanets = "true";
	    		localStorage.ringColor = "#80ffff";
	    	}
    	}
    };
	
	var oldShowSettings = vgapDashboard.prototype.showSettings;
	vgapDashboard.prototype.showSettings = function () {

		oldShowSettings.apply(this,arguments);
   
		var b = "<br><h3>HyperJump Circles</h3>";
		
		b += "<div id='hyperjumpOptions'><table>";
		b += "<tr><td><input id='hyperjumpPlanets' type='checkbox'" + (localStorage.hyperjumpPlanets == "true" ? "checked='true'" : "") + "/></td><td>Mark planets in jump range</tr>";
		b += "<tr><td><input id='hyperjumpRing' type='checkbox'" + (localStorage.hyperjumpRing == "true" ? "checked='true'" : "") + "/></td><td>Draw double ring at jump radius</td>";
		b += "<td><input id='ringColor' type='color' value=" + localStorage.ringColor + " /></td><td>Ring color</td></tr>";
		b += "</table></div>";
   
		$('[onclick="vgap.resetTurn();"]').after(b);

	    this.pane.jScrollPane();
	};

	var oldSaveSettings = vgapDashboard.prototype.saveSettings;
	vgapDashboard.prototype.saveSettings = function() {
		
	    $("#hyperjumpOptions :checkbox").each(function(a) {
	        localStorage[$(this).attr("id")] = $(this).is(":checked");
	    });
	    
		$("#hyperjumpOptions input[type='color']").each(function(b) {
			localStorage[$(this).attr("id")] = $(this).val();
		});
	    
		oldSaveSettings.apply(this,arguments);
	};

	vgapMap.prototype.hyperjump = function(x, y)		// replaces vgap map hyperjump function
	{
		var a = { "stroke-width": 2, "stroke-opacity": .5 };
		if (localStorage.hyperjumpPlanets == "true")
			for (var i=0; i<vgap.planets.length; ++i) {
				var planet = vgap.planets[i];
				var dist = vgap.map.getDist(x, y, planet.x, planet.y);
				
	            var g = vgap.map.screenX(planet.x);
	            var h = vgap.map.screenY(planet.y);

				if (dist >= 340 && dist <= 360) {
					a["stroke"] = localStorage.ringColor;
					this.explosions.push(this.paper.circle(g, h, 12 * this.zoom).attr(a));	// I wanted the target planets circled
				}	
				else if (dist >= 338 && dist <= 362) {
					a["stroke"] = "yellow";
					this.explosions.push(this.paper.circle(g, h, 12 * this.zoom).attr(a));	// I wanted the target planets circled
				}
			}
		
        var g = vgap.map.screenX(x);
        var h = vgap.map.screenY(y);
		a["stroke"] = localStorage.ringColor;

		if (localStorage.hyperjumpRing == "true") {
			this.explosions.push(this.paper.circle(g, h, 340 * this.zoom).attr(a));
			this.explosions.push(this.paper.circle(g, h, 360 * this.zoom).attr(a));
		}
		else {
			this.explosions.push(this.paper.circle(g, h, 350 * this.zoom).attr(a));
			a["stroke-width"] = 20;
			a["stroke-opacity"] = .25;
			this.explosions.push(this.paper.circle(g, h, 350 * this.zoom).attr(a));
		}
	};
	
	
	var oldDeselectAll = vgaPlanets.prototype.deselectAll;
	
	vgaPlanets.prototype.deselectAll = function() {
		if (vgap.map.explosions !== undefined)
			vgap.map.explosions.remove();
		vgap.map.explosions = vgap.map.paper.set();

        oldDeselectAll.apply(this, arguments);
	};


};

var script = document.createElement("script");
script.type = "application/javascript";
script.textContent = "(" + wrapper + ")();";

document.body.appendChild(script);
