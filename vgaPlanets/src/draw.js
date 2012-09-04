function wrapper () { // wrapper for injection

	var oldLoadControls = vgapMap.prototype.loadControls; 
	vgapMap.prototype.loadControls = function () {

		oldLoadControls.apply(this, arguments);
		
    	if(typeof(Storage)!=="undefined") {
	    	if (localStorage["colors.E0"] == null) {
	    		this.setColors();
	    	}
    	}
   };
	
	vgapMap.prototype.setColors = function () {
		localStorage["colors.S0"] = "#808080";
		localStorage["colors.E0"] = "#101010";
   	
		for (var i=1; i<=vgap.game.slots; ++i) {
			var s = i / vgap.game.slots * 2 * Math.PI;
 			
			var r = (Math.cos(s) + 1) * 127;
			var g = (Math.cos(s + 2 * Math.PI / 3) + 1) * 127;
			var b = (Math.cos(s + 4 * Math.PI / 3) + 1) * 127;
			
			var rs = "0" + Number(r.toFixed(0)).toString(16);
			var gs = "0" + Number(g.toFixed(0)).toString(16);
			var bs = "0" + Number(b.toFixed(0)).toString(16);
			
			var rgb = "#" + rs.slice(-2) + gs.slice(-2) + bs.slice(-2);
			
			localStorage["colors.S" + i] = rgb;
			
			r *= .6;
			g *= .6;
			b *= .6;
			
			rs = "0" + Number(r.toFixed(0)).toString(16);
			gs = "0" + Number(g.toFixed(0)).toString(16);
			bs = "0" + Number(b.toFixed(0)).toString(16);
			
			rgb = "#" + rs.slice(-2) + gs.slice(-2) + bs.slice(-2);
			
			localStorage["colors.E" + i] = rgb;
		}
	};
    	    
	vgapMap.prototype.draw = function() {
	    this.paper.safari();
	    vgap.connectionsActivated = 0;
	    vgap.planetsNamesActivated = 0;
	    this.totalDist = 0;
	    this.firstX = null;
	    this.firstY = null;
	    this.measure = false;
	    $("body").css("cursor", "");
	};
	
    vgapMap.prototype.drawMap = function() {
        if (!vgap.map.canvasRendered) {
	        vgap.map.paper.clear();
	        
	        if (this.zoom < 20) {
	        	vgap.map.drawNotes();
	        	vgap.map.drawIonStorms();
	        	vgap.map.drawMinefields();
	        }
        	vgap.map.drawWaypoints();
	        vgap.map.drawShips();
        	vgap.map.drawPlanets();
        	
	        if (this.zoom < 20) {
	        	vgap.map.drawExplosions();
	        	vgap.map.drawStarBases();
	        }
        }
	 
        vgap.map.canvasRendered = true;
    };
    
    vgapMap.prototype.highlight = function() {
//    	if (this.hlight == undefined)
//    		this.hlight = this.paper.set();
//   		this.hlight.clear();	
//        this.hlight.push(this.paper.circle(this.screenX(this.centerX), this.screenY(this.centerY), 20).attr({stroke: "#0099ff","stroke-width": "3","stroke-opacity": "1"}));
    };
    
    vgapMap.prototype.centered = function() {
//		if (this.hlight == undefined)
//			this.hlight = this.paper.set();
//		this.hlight.clear();	
	    this.centering = false;
	    if (vgap.map.onCenter) {
	        vgap.map.onCenter();
	        vgap.map.onCenter = null;
	    }
    };
            
    vgapMap.prototype.updateZoom = function() {
        var a = 4000 * this.zoom;
        this.resetBoundary(this.centerX, this.centerY);
        this.createCanvasArray();
        this.paperDiv.width(a);
        this.paperDiv.height(a);
        this.mapCover.width(a);
        this.mapCover.height(a);
        this.mapDiv.width(a);
        this.mapDiv.height(a);
        this.paper.setSize(a, a);
        this.moveMap();
        this.loc.html("<div class='ItemSelection_border'><div class='ItemSelectionBox minCorrection'>Zoom: " + this.zoom * 100 + "% </div></div>");
    };
    	
    vgapMap.prototype.drawPlanets = function() {
    	if (this.planets == undefined)
    		this.planets = this.paper.set();
   		this.planets.clear();	
        
        if (vgap.nebulas) {
        	for (var p = 0; p < vgap.nebulas.length; p++) {
                var N = vgap.nebulas[p];
                var x = this.screenX(N.x);
                var y = this.screenY(N.y);
                var G = N.radius * this.zoom;
                
                var s  = "hsl("+(N.gas/5*239)+",240,75)";
                var e  = "hsl("+(N.gas/5*239)+",240,16)";
                 
                var c = {fill:"r"+s+"-"+e, "fill-opacity":0.01, "stroke-opacity":0};
                this.planets.push(vgap.map.paper.circle(x, y, G).attr(c));
            }
        }
        
        if (vgap.stars) {
            for (var p = 0; p < vgap.stars.length; p++) {
                var S = vgap.stars[p];
                var x = this.screenX(S.x);
                var y = this.screenY(S.y);
                var G = S.radius * this.zoom;
                var g = G/4;
                var k = Math.sqrt(S.mass) * this.zoom;
                
                var start  = "red";
                if (S.temp > 3000 && S.temp <= 6000) 
                    start  = "yellow";
                else if (S.temp <= 10000) 
                    start  = "brown";
                else if (S.temp <= 20000) 
                    start  = "white";
                else 
                    start  = "blue";

                var a = {fill:"r "+start+"-black", "fill-opacity":.01, "stroke-opacity":0};
                this.planets.push(vgap.map.paper.circle(x, y, k).attr(a));

                a = {fill:"white", "fill-opacity":.04, "stroke-opacity":0};
                this.planets.push(vgap.map.paper.circle(x, y, G).attr(a));
                a = {fill:"white", "fill-opacity":.2, "stroke-opacity":0};
                this.planets.push(vgap.map.paper.circle(x, y, g).attr(a));
            }
        }

        for (var i = 0; i < vgap.planets.length; ++i) {                            
        	var planet = vgap.planets[i];
            var x = this.screenX(planet.x);
            var y = this.screenY(planet.y);
            
            if (planet.debrisdisk > 1) {
            	G = planet.debrisdisk * this.zoom;
            	if (planet.debrisdisk > 1) {
                    var s  = "#462300";
                    var e  = "#2b1500";
            		c = {fill:"r "+s+"-"+e, "fill-opacity":.01, "stroke-opacity":0};
            		this.planets.push(vgap.map.paper.circle(x, y, G).attr(c));
            	}
            }
        }
        
        for (var i = 0; i < vgap.planets.length; ++i) {                            
        	var planet = vgap.planets[i];
            var x = this.screenX(planet.x);
            var y = this.screenY(planet.y);
            
            var G = Math.min(24, Math.max(6 * this.zoom, 3));
            var c = {fill:"0-"+localStorage["colors.S"+planet.ownerid]+"-"+localStorage["colors.E"+planet.ownerid], "fill-opacity":1};
            
            if (planet.debrisdisk > 1) 
            	continue;
            if (planet.debrisdisk == 1) 
                G = Math.min(8, Math.max(2 * this.zoom, 1.5));

            this.planets.push(vgap.map.paper.circle(x, y, G).attr(c));
        }
    };
    
    vgapMap.prototype.drawStarBases = function() {
    	if (this.starbases == undefined)
    		this.starbases = this.paper.set();
    	this.starbases.clear();

        var G =  Math.min(20, Math.max(8 * this.zoom, 6));
        var g = G / 2;
	    var a = {stroke: "white","stroke-width": "1","stroke-opacity": .75};
        
	   	for (var i=0; i<vgap.starbases.length; ++i) {
    		var starbase = vgap.starbases[i];
    		var planet = vgap.planets[starbase.planetid-1];
			var x = this.screenX(planet.x);
			var y = this.screenY(planet.y);
			if (this.zoom < 1) {
                var el = this.paper.path("M" + (x + g) + "," + y + "L" + (x - g) + "," + y).attr(a);
                this.starbases.push(el.transform("r90"));
                this.starbases.push(this.paper.path("M" + (x + g) + "," + y + "L" + (x - g) + "," + y).attr(a));
			}
			else 
				this.starbases.push(vgap.map.paper.image(STARBASE_ICON, x - g, y - g, G, G));
 	    }
	};
    
    vgapMap.prototype.drawShips = function() {
    	if (this.ships == undefined)
    		this.ships = this.paper.set();
    	this.ships.clear();

        var G =  Math.min(10, Math.max(6 * this.zoom, 5));
        
    	for (var i = 0; i < vgap.ships.length; ++i) {
    		var ship = vgap.ships[i];
			var x = this.screenX(ship.x) - G / 2;
			var y = this.screenY(ship.y) - G / 2;
			
    		var t = "t"+8*this.zoom+",0";
    		var l = vgap.shipMap[ship.x+","+ship.y];
    		
			for (var k=0; k<l.length; ++k) {
			    var s = l[k];
    			c = {fill:localStorage["colors.S"+s.ownerid]};
    			var el = vgap.map.paper.rect(x, y, G, G).attr(c);
    			this.ships.push(el.transform("r"+k*45+t));
			}
    	}
    };
    
	vgapMap.prototype.drawWaypoints = function()
	{        
		if (this.waypoints == undefined)
			this.waypoints = this.paper.set();
        this.waypoints.clear();
		var d;
		
		for (var i=0; i<vgap.ships.length; ++i) {
			var ship = vgap.ships[i];
			if (ship.ownerid == vgap.player.id) {
				if (vgap.isChunnelling(ship)) {
	            	var m = Number(ship.friendlycode);
	                var to = vgap.getShip(m);
                	d = {"stroke":localStorage["colors.S"+ship.ownerid], "stroke-width":2, "stroke-dasharray":"-", "stroke-opacity":0.5};
	                this.waypoints.push(this.paper.path("M" + this.screenX(ship.x) + " " + this.screenY(ship.y) + "L" + this.screenX(to.x) + " " + this.screenY(to.y)).attr(d));
				}
				else {
					if (vgap.isHyping(ship)) 
						d = {"stroke":localStorage["colors.S"+ship.ownerid], "stroke-width":2, "stroke-dasharray":".", "stroke-opacity":0.5};
					else
						d = {"stroke":localStorage["colors.S"+ship.ownerid], "stroke-width":2, "stroke-opacity":0.5};
	            this.waypoints.push(this.paper.path("M" + this.screenX(ship.x) + " " + this.screenY(ship.y) + "L" + this.screenX(ship.targetx) + " " + this.screenY(ship.targety)).attr(d));
				}
			}
			else {
	            var k = vgap.getSpeed(ship.warp, ship.hullid);
	            if (k && ship.heading != -1) {
		            var n = ship.x + Math.round(Math.sin(Math.toRad(ship.heading)) * k);
		            var o = ship.y + Math.round(Math.cos(Math.toRad(ship.heading)) * k);
	                d = {"stroke":localStorage["colors.S"+ship.ownerid], "stroke-width": 2, "stroke-opacity": 0.5};
		            this.waypoints.push(this.paper.path("M" + this.screenX(ship.x) + " " + this.screenY(ship.y) + "L" + this.screenX(n) + " " + this.screenY(o)).attr(d));
				}
			}
        }
	};

	vgapMap.prototype.drawExplosions = function() {
    	if (this.explosions == undefined)
    		this.explosions = this.paper.set();
    	this.explosions.clear();

        var G =  Math.min(10, Math.max(8 * this.zoom, 6));
        var a = {stroke: "red","stroke-width": "1","stroke-opacity": 0.5};

        for (var b in vgap.messages) {
            var c = vgap.messages[b];
            if (c.messagetype == 10) {
                var d = this.screenX(c.x);
                var e = this.screenY(c.y);
                var el = this.paper.path("M" + (d - G) + "," + e + "L" + (d + G) + "," + e).attr(a);
                this.explosions.push(el);
                el = this.paper.path("M" + (d - G) + "," + e + "L" + (d + G) + "," + e).attr(a);
                this.explosions.push(el.transform("r120"));
                el = this.paper.path("M" + (d - G) + "," + e + "L" + (d + G) + "," + e).attr(a);
                this.explosions.push(el.transform("r240"));
            }
        }
	};
        
    vgapMap.prototype.drawIonStorms = function() {
    	if (this.ionstorms == undefined)
    		this.ionstorms = this.paper.set();
    	this.ionstorms.clear();
        
        for (var b = 0; b < vgap.ionstorms.length; b++) {
            var d = vgap.ionstorms[b];
            
            var c = 0.5;
            if (d.voltage >= 50) 
                c = 0.075;
            if (d.voltage >= 100) 
                c = 0.1;
            if (d.voltage >= 150) 
                c = 0.15;
            if (d.voltage >= 200) 
                c = 0.2;

            var s  = "#707000";
            var e  = "#202000";
             
            var a = {fill:"r"+s+"-"+e, "fill-opacity":c/10, "stroke-opacity":0};

            this.ionstorms.push(this.paper.circle(this.screenX(d.x), this.screenY(d.y), (d.radius * this.zoom)).attr(a));
        }
        
        for (var b = 0; b < vgap.ionstorms.length; b++) {
            var d = vgap.ionstorms[b];
            
            var e = d.x + Math.round(Math.sin(Math.toRad(d.heading)) * d.warp * d.warp);
            var f = d.y + Math.round(Math.cos(Math.toRad(d.heading)) * d.warp * d.warp);
            this.ionstorms.push(this.paper.path("M" + this.screenX(d.x) + " " + this.screenY(d.y) + "L" + this.screenX(e) + " " + this.screenY(f)).attr({stroke: "yellow","stroke-width": 1,"stroke-opacity": .25}));
	    }
    };
    
    vgapMap.prototype.drawMinefields = function() {
    	if (this.minefields == undefined)
    		this.minefields = this.paper.set();
    	this.minefields.clear();

    	for (var c = 0; c < vgap.minefields.length; c++) {
            var d = vgap.minefields[c];
            var b = localStorage["colors.S"+d.ownerid];
            var a = {stroke: b,"stroke-width": "1","stroke-opacity": 0.5,fill: b,"fill-opacity": 0.2};
            this.minefields.push(this.paper.circle(this.screenX(d.x), this.screenY(d.y), (d.radius * this.zoom)).attr(a));
        }
    };

}
	
var script = document.createElement("script");
script.type = "application/javascript";
script.textContent = "(" + wrapper + ")();";

document.body.appendChild(script);
