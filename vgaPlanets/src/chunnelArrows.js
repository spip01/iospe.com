// ==UserScript==
// @name          Planets.nu add chunnel dicrection arrows
// @description   add arrows to starting end of chunnel.
// @include       http://planets.nu/home
// @include       http://planets.nu/games/*
// @homepage      http://planets.nu/discussion/utility-script-add-direction-arrows-to-chunnel-waypoint
// @version 1.12
// ==/UserScript==

function wrapper () { // chunnelArrows.js
	var zoomTable = [25, 50, 75, 100, 125, 150, 175, 200, 300, 400, 500, 1000, 2000, 4000 ];
	
	var oldLoadControls = vgapMap.prototype.loadControls; 
	vgapMap.prototype.loadControls = function () {

		oldLoadControls.apply(this, arguments);
        
        var b = "<li onclick='vgap.map.zoomWayIn();'>Zoom Max</li>";
        $("#MapTools li:contains('Zoom In')").after(b);
        
        b = "<li class='ClearMap' onclick='vgap.deselectAll();'>Clear (x)</li>";		// menu and hotkey called different functions
        $("#MapTools li:contains('Clear')").replaceWith(b);

        var height = this.controls.height() - this.toolsMenu.height();
        this.controls.css("marginTop", "-" + this.controls.height() + "px");
        
    	vgap.map.zoom = zoomTable[localStorage.startZoom] / 100;
	    vgap.map.centerX = Number(localStorage.startX);
    	vgap.map.centerY = Number(localStorage.startY);
    };

    vgaPlanets.prototype.deselectAll = function() {
		vgap.map.deselect();
        vgap.closeLeft();

	    vgap.map.explosions.remove();
	    vgap.map.explosions = vgap.map.paper.set();
	    
		vgap.map.draw();
	};
	
	var oldProcessLoad = vgaPlanets.prototype.processLoad;
    vgaPlanets.prototype.processLoad = function(f) {
    	
    	oldProcessLoad.apply(this,arguments);
    	
    	if(typeof(Storage)!=="undefined") {
	    	if (localStorage.waypointChunnel == null) {
	    		localStorage.waypointChunnel = "true";
	    		localStorage.waypointHYP = "true";
	    		localStorage.filterZoom = "true";
	    		localStorage.startZoom = "1";
	    		localStorage.startX = "2000";
	    		localStorage.startY = "2000";
	    		localStorage.shipHistoryLength = "3";
	    		localStorage.warpCircle = "true";
	    	}
    	}
   };
	
	var oldShowSettings = vgapDashboard.prototype.showSettings;
	vgapDashboard.prototype.showSettings = function () {

		oldShowSettings.apply(this,arguments);
   
		var b = "<br><h3>Waypoint Arrows</h3>";
		
		b += "<div id='waypointOptions'><table>";
		b += "<tr><td><input id='warpCircle' type='checkbox'" + (localStorage.warpCircle == "true" ? "checked='true'" : "") + "/>";
		b += 	 " Draw warp circle at ships location</td>";
		b +=	 "<td>&nbsp;&nbsp;<input id='shipHistoryLength' type='range' vs='vs' value=" + localStorage.shipHistoryLength + " min=0 max=99 onchange='vgap.dash.updateShipHistory()'/>";
		b +=     "<div id='shipHistory'>&nbsp;&nbsp;&nbsp;" + localStorage.shipHistoryLength + " Ship History Depth</div></td></tr>";
		
		b += "<tr><td colspan=2><input id='waypointChunnel' type='checkbox'" + (localStorage.waypointChunnel == "true" ? "checked='true'" : "") + "/>";
		b += 	 " Draw direction arrows at destination of chunneling ships</td></tr>";
		
		b += "<tr><td colspan=2><input id='waypointHYP' type='checkbox'" + (localStorage.waypointHYP == "true" ? "checked='true'" : "") + "/>";
		b += 	 " Draw direction arrows at destination of HYP ships</td></tr>";
		
		b += "<tr><td colspan=3><input id='filterZoom' type='checkbox'" + (localStorage.filterZoom == "true" ? "checked='true'" : "") + "/>";
		b += 	" Zoom to destination of selected ship when zoomed to the max and only show selected ship</td></tr>";
		
		b += "<tr><td><input id='startX' type='number' vs='vs' value=" + localStorage.startX + " max=4000'/> Starting X</td>";
		b +=     "<td><input id='startY' type='number' vs='vs' value=" + localStorage.startY + " max=4000'/> Starting Y</td>";
		b += "<td>&nbsp;&nbsp;<input id='startZoom' type='range' vs='vs' value=" + localStorage.startZoom + " min=0 max=13 onchange='vgap.dash.updateZoom()'/>";
		b +=    "<div id='zoom'>&nbsp;&nbsp;&nbsp;" + zoomTable[localStorage.startZoom] + "&#37 Starting Zoom</div></td></tr>";
		b += "</table></div>";
   
		$('[onclick="vgap.resetTurn();"]').after(b);
		
	    this.pane.jScrollPane();
	};

	vgapDashboard.prototype.updateShipHistory = function() {
		var val = $("#waypointOptions #shipHistoryLength").val();
		var b = "<div id='shipHistory'>&nbsp;&nbsp;&nbsp;" + val + " Ship History</div>";
		$("#shipHistory").replaceWith(b);

	};
	
	vgapDashboard.prototype.updateZoom = function() {
		var val = $("#waypointOptions #startZoom").val();
		var b = "<div id='zoom'>&nbsp;&nbsp;&nbsp;" + zoomTable[val] + "&#37 Starting Zoom</div>";
		$("#zoom").replaceWith(b);
	};
	
	var oldSaveSettings = vgapDashboard.prototype.saveSettings;
	vgapDashboard.prototype.saveSettings = function() {
		
	    $("#waypointOptions :checkbox").each(function(a) {
	        localStorage[$(this).attr("id")] = $(this).is(":checked");
	    });

		$("#waypointOptions,input[vs='vs']").each(function(b) {
			localStorage[$(this).attr("id")] = $(this).val();
		});

		var b = "<div id='shipHistory'>&nbsp;&nbsp;&nbsp;" + localStorage.shipHistoryLength + " Ship History</div>";
		$("#shipHistory").replaceWith(b);
	    
    	vgap.map.zoom = zoomTable[localStorage.startZoom] / 100;

		b = "<div id='zoom'>&nbsp;&nbsp;&nbsp;" + zoomTable[localStorage.startZoom] + "&#37 Starting Zoom</div>";
		$("#zoom").replaceWith(b);
	    
	    vgap.map.centerX = Number(localStorage.startX);
    	vgap.map.centerY = Number(localStorage.startY);
    	
		oldSaveSettings.apply(this,arguments);
	};

	vgapMap.prototype.zoomWayIn = function() {
		vgap.map.zoom = 40;
		vgap.map.updateZoom();
	};
	
	var oldDrawWaypoints = vgapMap.prototype.drawWaypoints;
	vgapMap.prototype.drawWaypoints = function()
	{        
        if (localStorage.filterZoom == "true" && this.zoom == 40 && (ship = vgap.map.activeShip) != null) {
			if (this.waypoints == undefined)
				this.waypoints = this.paper.set();
	        this.waypoints.clear();
		    var c = this.getColors(ship.ownerid);

	        var d = {"stroke":c.start, "stroke-width": 2, "stroke-opacity": 0.5};
				
			var dist = vgap.map.getDist(ship.targetx, ship.targety, this.centerX, this.centerY);
			if (dist > 10)
				this.centerMap(ship.targetx, ship.targety);
			
	        d["arrow-end"] = "classic-wide-long";
            if (vgap.isHyping(ship))
            	d["stroke-dasharray"] = ".";
            
            this.waypoints.push(this.paper.path("M" + this.screenX(ship.x) + " " + this.screenY(ship.y) + "L" + this.screenX(ship.targetx) + " " + this.screenY(ship.targety)).attr(d));
		}
        else 
        	oldDrawWaypoints();
    };
	
	var oldSelectShip = vgapMap.prototype.selectShip;
	vgapMap.prototype.selectShip = function(a) {
		oldSelectShip.apply(this, arguments);

		vgap.map.shipHistory(a);
	};
	
    vgapMap.prototype.shipHistory = function (a) {
		if (this.special == undefined)
			this.special = this.paper.set();
		this.special.clear();
		
		var ship = vgap.getShip(a);
	    var c = this.getColors(ship.ownerid);

		var d = { stroke:c.start, "stroke-width":2, "stroke-opacity":.25 };

		var tox; //= ship.targetx;
		var toy; //= ship.targety;
		var fromx = ship.x;
		var fromy = ship.y;

		if (localStorage.warpCircle)
			vgap.map.special.push(vgap.map.paper.circle(this.screenX(fromx), this.screenY(fromy), ship.engineid * ship.engineid * this.zoom).attr(d));
		
		for (var j = 0; j < localStorage.shipHistoryLength && j < ship.history.length; j++) {

			tox = fromx;
			toy = fromy;
			fromx = ship.history[j].x;
			fromy = ship.history[j].y;
			
			vgap.map.special.push(vgap.map.paper.path("M"+ this.screenX(fromx) +"," + this.screenY(fromy) + "L"+ this.screenX(tox) +"," + this.screenY(toy)).attr(d));
		}
	};    

}

var script = document.createElement("script");
script.type = "application/javascript";
script.textContent = "(" + wrapper + ")();";

document.body.appendChild(script);
