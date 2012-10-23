// ==UserScript==
// @name          Planets.nu map draw
// @description   new map drawing routines.  library for other modules
// @include       http://*.planets.nu/*
// @homepage      http://planets.nu/discussion/
// @version 1.0
// ==/UserScript==

function wrapper () { // draw.js

    vgapMap.prototype.drawMap = function() {
        if (!vgap.map.canvasRendered) {
        	if (this.zoom < 20) {
	        	vgap.map.drawNotes();
	        	vgap.map.drawIonStorms();
	        	vgap.map.drawMinefields();
	        }
	        
        	vgap.map.drawPlanets();
	        vgap.map.drawShips();
        	vgap.map.drawWaypoints();
        	
	        if (this.zoom < 20) {
	        	vgap.map.drawExplosions();
	        	vgap.map.drawStarBases();
	        }
        }
	 
        vgap.map.canvasRendered = true;
    };
        	
    vgapMap.prototype.drawPlanets = function() {
		if (this.planets !== undefined)
	        this.planets.remove();
        this.planets = this.paper.set();
	            
    	this.drawZoomField();

    	if (vgap.nebulas) {
        	for (var p = 0; p < vgap.nebulas.length; p++) {
                var N = vgap.nebulas[p];
                var x = this.screenX(N.x);
                var y = this.screenY(N.y);
                var G = N.radius * this.zoom;
                
                var s  = "hsl("+(N.gas/5)+",.5,.2)";
                var e  = "hsl("+(N.gas/5)+",.3,.005)";
                 
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

		var c = {fill:"r #462300-#2b1500", "fill-opacity":.01, "stroke-opacity":0};
		
        for (var i = 0; i < vgap.planets.length; ++i) {                            
        	var planet = vgap.planets[i];
            
            if (planet.debrisdisk > 1) {
            	if (planet.debrisdisk > 1) {
            		var G = planet.debrisdisk * this.zoom;
                    
		            var x = this.screenX(planet.x);
		            var y = this.screenY(planet.y);
            		
            		this.planets.push(vgap.map.paper.circle(x, y, G).attr(c));
            	}
            }
        }
        
        for (var i = 0; i < vgap.planets.length; ++i) {                            
        	var planet = vgap.planets[i];
            var G = Math.min(24, Math.max(6 * this.zoom, 3));
            
            if (planet.debrisdisk > 1) 
            	continue;
            if (planet.debrisdisk == 1) 
                G = Math.min(8, Math.max(2 * this.zoom, 1.5));

            var x = this.screenX(planet.x);
            var y = this.screenY(planet.y);
            var color = this.getColors(planet.ownerid);
            if (planet.ownerid == 0 && planet.infoturn != 0) {
            	color.start = "#73610c";
                color.end = "#4d2c04";
            }
            var c = {fill:"0-"+color.start+"-"+color.end, "fill-opacity":1};
            
            this.planets.push(vgap.map.paper.circle(x, y, G).attr(c));
        }
    };
    
    vgapMap.prototype.drawStarBases = function() {
		if (this.starbases !== undefined)
	        this.starbases.remove();
        this.starbases = this.paper.set();
	    
        var G = Math.min(24, Math.max(6 * this.zoom, 3));
	    var a = {stroke:"white", "stroke-width":1, "stroke-opacity":1};
        
	   	for (var n=0; n<vgap.starbases.length; ++n) {
    		var starbase = vgap.starbases[n];
    		var planet = vgap.getPlanet(starbase.planetid);
			var x = this.screenX(planet.x);
			var y = this.screenY(planet.y);
	        var g = Math.ceil(G / 2);
	        
			if (this.zoom < 1) {
                this.starbases.push(this.paper.path("M" + (x + g) + "," + y + "L" + (x - g) + "," + y).attr(a));
                this.starbases.push(this.paper.path("M" + x + "," + (y + g) + "L" + x + "," + (y - g)).attr(a));
			}
			else 
				this.starbases.push(vgap.map.paper.image(STARBASE_ICON, x - g, y - g, G, G));
 	    }
	};
    
    vgapMap.prototype.drawShips = function() {
		if (this.ships !== undefined)
	        this.ships.remove();
        this.ships = this.paper.set();
        
    	for (var i = 0; i < vgap.ships.length; ++i) {
    		var ship = vgap.ships[i];
    		ship.drawn = false;
    	}
    	
        var g = Math.min(24, Math.max(6 * this.zoom, 3));
        
    	for (var i = 0; i < vgap.ships.length; ++i) {
    		var ship = vgap.ships[i];
    		if (ship.drawn)
    			continue;
    		
			var x = this.screenX(ship.x);
			var y = this.screenY(ship.y);
			
    		var l = vgap.shipMap[ship.x+","+ship.y];
    		var p = vgap.planetMap[ship.x+","+ship.y];
    		
    		if (p != undefined)
    			G = g;
			else
				G = 6 * this.zoom;
    		
			for (var k=0; k<l.length; ++k) {
			    var s = l[k];
			    s.drawn = true;
				var c = this.getColors(s.ownerid);
				c = { fill:c.start };
			    if (s.beams == 0 && s.torps == 0 && s.bays == 0)
			    	c["fill-opacity"] = .5;
			    else
			    	c["fill-opacity"] = 1;
    			var r = vgap.map.paper.rect(x, y, g, g).attr(c);
    			this.ships.push(r.transform("r"+k*60+"t"+G+",0"));
			}
    	}
    };
    
	vgapMap.prototype.drawWaypoints = function()
	{        
		if (this.waypoints !== undefined)
	        this.waypoints.remove();
        this.waypoints = this.paper.set();
	            
		var d = {"stroke-width":2, "stroke-opacity":0.5};
		
		for (var i=0; i<vgap.ships.length; ++i) {
			var ship = vgap.ships[i];
			var x = this.screenX(ship.x);
			var y = this.screenY(ship.y);
		    var c = this.getColors(ship.ownerid);
			d.stroke = c.start;
			
			if (ship.ownerid == vgap.player.id) {
				if (vgap.isChunnelling(ship)) {
	            	var m = Number(ship.friendlycode);
	                var to = vgap.getShip(m);
                	d["stroke-dasharray"] = "-";
	                this.waypoints.push(this.paper.path("M" + x + " " + y + "L" + this.screenX(to.x) + " " + this.screenY(to.y)).attr(d));
				}
				else {
					if (vgap.isHyping(ship)) {
	                	d["stroke-dasharray"] = ".";
					}
					this.waypoints.push(this.paper.path("M" + x + " " + y + "L" + this.screenX(ship.targetx) + " " + this.screenY(ship.targety)).attr(d));
				}
				
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
	};

	vgapMap.prototype.drawExplosions = function() {
		if (this.explosions !== undefined)
	        this.explosions.remove();
        this.explosions = this.paper.set();
	    
        var G =  Math.min(10, Math.max(8 * this.zoom, 6));
        var a = {stroke: "red","stroke-width": "1","stroke-opacity": 0.5};

        for (var b in vgap.messages) {
            var c = vgap.messages[b];
            if (c.messagetype == 10) {
                var h = this.screenX(c.x) - G;
                var i = this.screenX(c.x) + G;
                var e = this.screenY(c.y);
                var el = this.paper.path("M" + h + "," + e + "L" + i + "," + e).attr(a);
                this.explosions.push(el);
                el = this.paper.path("M" + h + "," + e + "L" + i + "," + e).attr(a);
                this.explosions.push(el.transform("r120"));
                el = this.paper.path("M" + h + "," + e + "L" + i + "," + e).attr(a);
                this.explosions.push(el.transform("r240"));
            }
        }
	};
        
    vgapMap.prototype.drawIonStorms = function() {
		if (this.ionstorms !== undefined)
	        this.ionstorms.remove();
        this.ionstorms = this.paper.set();
	        	
        var s = "#707000";
        
        for (var b = 0; b < vgap.ionstorms.length; b++) {
            var d = vgap.ionstorms[b];
            
            var c = 0.01;
            var e  = "#202000";
             
            if (d.voltage >= 50) 
                c = 0.05;
            if (d.voltage >= 100) 
                c = 0.1;
            if (d.voltage >= 150)
                c = 0.15;
            if (d.voltage >= 200) 
                c = 0.2;
            
            var a = {fill:"r"+s+"-"+e, "fill-opacity":c, "stroke-opacity":0};

            this.ionstorms.push(this.paper.circle(this.screenX(d.x), this.screenY(d.y), d.radius * this.zoom).attr(a));
        }
        
        for (var b = 0; b < vgap.ionstorms.length; b++) {
            var d = vgap.ionstorms[b];
            
            var e = d.x + Math.round(Math.sin(Math.toRad(d.heading)) * d.warp * d.warp);
            var f = d.y + Math.round(Math.cos(Math.toRad(d.heading)) * d.warp * d.warp);
            this.ionstorms.push(this.paper.path("M" + this.screenX(d.x) + " " + this.screenY(d.y) + "L" + this.screenX(e) + " " + this.screenY(f)).attr({stroke:s, "stroke-width":1, "stroke-opacity":.5}));
	    }
    };
    
    vgapMap.prototype.drawMinefields = function() {
		if (this.minefields !== undefined)
	        this.minefields.remove();
        this.minefields = this.paper.set();

    	for (var c = 0; c < vgap.minefields.length; c++) {
            var d = vgap.minefields[c];
		    var c = this.getColors(d.ownerid);
            var a = {stroke:c.start, "stroke-width":1, "stroke-opacity":0.5, fill:c.start, "fill-opacity":0.2};
            this.minefields.push(this.paper.circle(this.screenX(d.x), this.screenY(d.y), d.radius * this.zoom).attr(a));
        }
    };
    
    vgapMap.prototype.drawZoomField = function() {
    	if (this.zoom >= 20) {
            var a = { fill:"#000000", stroke:"#333333", "stroke-width":1 };
            
            for (var T = (this.centerX - 3); T <= this.centerX + 3; T++) {
                for (var U = (this.centerY - 3); U <= this.centerY + 3; U++) {
                    if (this.getDist(T, U, this.centerX, this.centerY) <= 3) {
                        var G = this.zoom / 2;
                        var z = this.screenX(T) - G;
                        var A = this.screenY(U) - G;
                        this.planets.push(this.paper.rect(z, A, G * 2, G * 2).attr(a));
                    }
                }
            }
    	}

    };
    
}
	
var script = document.createElement("script");
script.type = "application/javascript";
script.textContent = "(" + wrapper + ")();";

document.body.appendChild(script);
