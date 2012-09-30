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
        
    	vgap.map.zoom = zoomTable[localStorage[vgap.gameId+".startZoom"]] / 100;
	    vgap.map.centerX = Number(localStorage[vgap.gameId+".startX"]);
    	vgap.map.centerY = Number(localStorage[vgap.gameId+".startY"]);
    };

    vgapMap.prototype.getColors = function(player) {
        return {start: localStorage["colors.S" + player],end: localStorage["colors.E" + player]};
    };
    
	var oldProcessLoad = vgaPlanets.prototype.processLoad;
    vgaPlanets.prototype.processLoad = function(f) {
    	
    	oldProcessLoad.apply(this,arguments);
    	
    	if(typeof(Storage)!=="undefined") {
	    	if (localStorage.filterZoom == null) {
	    		localStorage.filterZoom = "true";
	    		localStorage.waypointChunnel = "true";
	    		localStorage.waypointHYP = "true";
	    		localStorage[vgap.gameId+".startZoom"] = "1";
	    		localStorage[vgap.gameId+".startX"] = "2000";
	    		localStorage[vgap.gameId+".startY"] = "2000";
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
		
		b += "<tr><td><input id='"+vgap.gameId+".startX' type='number' vs='vs' value=" + localStorage[vgap.gameId+".startX"] + " max=4000'/> Starting X</td>";
		b +=     "<td><input id='"+vgap.gameId+".startY' type='number' vs='vs' value=" + localStorage[vgap.gameId+".startY"] + " max=4000'/> Starting Y</td>";
		b += "<td>&nbsp;&nbsp;<input id='"+vgap.gameId+".startZoom' type='range' vs='vs' value=" + localStorage[vgap.gameId+".startZoom"] + " min=0 max=13 onchange='vgap.dash.updateZoom()'/>";
		b +=    "<div id='zoom'>&nbsp;&nbsp;&nbsp;" + zoomTable[localStorage[vgap.gameId+".startZoom"]] + "&#37 Starting Zoom</div></td></tr>";
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
		var val = $("#waypointOptions #"+vgap.gameId+".startZoom").val();
		var b = "<div id='zoom'>&nbsp;&nbsp;&nbsp;" + zoomTable[val] + "&#37 Starting Zoom</div>";
		$("#zoom").replaceWith(b);
	};
	
	var oldSaveSettings = vgapDashboard.prototype.saveSettings;
	vgapDashboard.prototype.saveSettings = function() {
		
	    $("#waypointOptions :checkbox").each(function(a) {
	        localStorage[$(this).attr("id")] = $(this).is(":checked");
	    });

		$("#waypointOptions input[vs='vs']").each(function(b) {
			localStorage[$(this).attr("id")] = $(this).val();
		});

		var b = "<div id='shipHistory'>&nbsp;&nbsp;&nbsp;" + localStorage.shipHistoryLength + " Ship History</div>";
		$("#shipHistory").replaceWith(b);
	    
    	vgap.map.zoom = zoomTable[localStorage[vgap.gameId+".startZoom"]];

		b = "<div id='zoom'>&nbsp;&nbsp;&nbsp;" + vgap.map.zoom + "&#37 Starting Zoom</div>";
		$("#zoom").replaceWith(b);
	    
		vgap.map.zoom /= 100;
	    vgap.map.centerX = Number(localStorage[vgap.gameId+".startX"]);
    	vgap.map.centerY = Number(localStorage[vgap.gameId+".startY"]);
    	
		oldSaveSettings.apply(this,arguments);
	};

	vgapMap.prototype.zoomWayIn = function() {
		vgap.map.zoom = 40;
		vgap.map.updateZoom();
	};
	
	vgapMap.prototype.drawWaypoints = function()
	{        
		if (this.waypoints !== undefined)
	        this.waypoints.remove();
        this.waypoints = this.paper.set();

        var d = {"stroke-width": 2, "stroke-opacity": 0.5};
	        
        if (localStorage.filterZoom == "true" && this.zoom == 40 && (ship = vgap.map.activeShip) != null) {
		    var c = this.getColors(ship.ownerid);

			var dist = vgap.map.getDist(ship.targetx, ship.targety, this.centerX, this.centerY);
			if (dist > 10)
				this.centerMap(ship.targetx, ship.targety);
			
	        d["arrow-end"] = "classic-wide-long";
	        d["stroke"] = c.start;
            if (vgap.isHyping(ship))
            	d["stroke-dasharray"] = ".";
            
            this.waypoints.push(this.paper.path("M" + this.screenX(ship.x) + " " + this.screenY(ship.y) + "L" + this.screenX(ship.targetx) + " " + this.screenY(ship.targety)).attr(d));
		}
        else {
        
		for (var i=0; i<vgap.ships.length; ++i) {
			var ship = vgap.ships[i];
			var x = this.screenX(ship.x);
			var y = this.screenY(ship.y);
		    var c = this.getColors(ship.ownerid);
			d["stroke"] = c.start;
			
			if (ship.ownerid == vgap.player.id) {
				if (vgap.isChunnelling(ship)) {
	            	var m = Number(ship.friendlycode);
	                var to = vgap.getShip(m);
                	d["stroke-dasharray"] = "-";
                	if (localStorage.waypointChunnel== "true")
                		d["arrow-end"] = "classic-wide-long";
	                this.waypoints.push(this.paper.path("M" + x + " " + y + "L" + this.screenX(to.x) + " " + this.screenY(to.y)).attr(d));
				}
				else {
					if (vgap.isHyping(ship)) {
	                	d["stroke-dasharray"] = ".";
	                	if (localStorage.waypointHYP== "true")
	                		d["arrow-end"] = "classic-wide-long";
					}
					this.waypoints.push(this.paper.path("M" + x + " " + y + "L" + this.screenX(ship.targetx) + " " + this.screenY(ship.targety)).attr(d));
				}
				
            	delete d["arrow-end"];
            	delete d["stroke-dasharray"];
			}
			else {
	            var k = vgap.getSpeed(ship.warp, ship.hullid);
	            
	            if (k && ship.heading != -1) {
		            var n = ship.x + Math.round(Math.sin(Math.toRad(ship.heading)) * k);
		            var o = ship.y + Math.round(Math.cos(Math.toRad(ship.heading)) * k);
		            this.waypoints.push(this.paper.path("M" + x + " " + y + "L" + this.screenX(n) + " " + this.screenY(o)).attr(d));
				}
			}
        }
	}
  };
	
  vgaPlanets.prototype.isChunnelling = function(c) {
      if ((c.hullid == 56 || c.hullid == 1055) && c.warp == 0 && c.neutronium >= 50 && c.mission != 6) {
          if (this.isTowTarget(c.id) == null) {
              var b = /\d{3}/;
              var a = c.friendlycode;
              a = a.toString();
              if ((a.match(b)) && (a != "")) {
                  var e = parseInt(c.friendlycode, 10);
                  var d = vgap.getShip(e);
                  if (d != null) {
                	  b = /hyp/i;
                	  a = d.friendlycode;
                	  a = a.toString();
                      if (d.ownerid == c.ownerid && (d.warp == 0 || a.match(b) && a != "") && d.neutronium >= 1 && d.mission != 6 && vgap.map.getDist(c.x, c.y, d.x, d.y) >= 100 && this.isTowTarget(d.id) == null) {
                    	  if (d.hullid == 56 || d.hullid == 1054 || c.hullid == 1055 && d.hullid == 51)
                    	  	return true;
                      }
                  }
              }
          }
      }
      return false;
  };
  
  var oldSelectShip = vgapMap.prototype.selectShip;
	vgapMap.prototype.selectShip = function(a) {
		oldSelectShip.apply(this, arguments);

		vgap.map.shipHistory(a);
	};
	
    vgapMap.prototype.shipHistory = function (a) {
		if (this.special !== undefined)
			this.special.remove();
		this.special = this.paper.set();
		
		var ship = vgap.getShip(a);
	    var c = this.getColors(ship.ownerid);

		var tox;// = ship.targetx;
		var toy;// = ship.targety;
		var fromx = ship.x;
		var fromy = ship.y;

		var d = { stroke:c.start, "stroke-width":1, "stroke-opacity":.33 };
		var e = { "stroke-opacity":0, fill:c.start, "fill-opacity":.075 };
		
		if (localStorage.warpCircle == "true")
			vgap.map.special.push(vgap.map.paper.circle(this.screenX(fromx), this.screenY(fromy), ship.engineid * ship.engineid * this.zoom).attr(d));
		
		for (var j = 0; j < localStorage.shipHistoryLength && j < ship.history.length; j++) {

			tox = fromx;
			toy = fromy;
			fromx = ship.history[j].x;
			fromy = ship.history[j].y;
			
			if (ship.hullid == 54 && vgap.getNebulaIntensity(tox, toy) > 0) 
				vgap.map.special.push(vgap.map.paper.circle(this.screenX(tox), this.screenY(toy), 100 * this.zoom).attr(e));
			
			vgap.map.special.push(vgap.map.paper.path("M"+ this.screenX(fromx) +"," + this.screenY(fromy) + "L"+ this.screenX(tox) +"," + this.screenY(toy)).attr(d));
		}
	}; 
	
	var oldDeselectAll = vgaPlanets.prototype.deselectAll;
	
	vgaPlanets.prototype.deselectAll = function() {
		if (vgap.map.waypoints !== undefined)
			vgap.map.waypoints.remove();
		vgap.map.waypoints = vgap.map.paper.set();

		if (vgap.map.special !== undefined)
			vgap.map.special.remove();
		vgap.map.special = vgap.map.paper.set();

        oldDeselectAll.apply(this, arguments);
	};


}

var script = document.createElement("script");
script.type = "application/javascript";
script.textContent = "(" + wrapper + ")();";

document.body.appendChild(script);
