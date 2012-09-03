//==UserScript==
//@name          Clan Display and Temperature addon for Planets.nu Starmap v1.1
//@description   Add Clan, Temperature, and Ownership display added to Map Tools within Planets.nu map
//@include       http://planets.nu/home
//@include       http://planets.nu/games/*
//@include       http://play.planets.nu/*
//@version 1.1
//==/UserScript==

function wrapper () { // wrapper for injection

	var oldLoadControls = vgapMap.prototype.loadControls; 
	vgapMap.prototype.loadControls = function () {

		oldLoadControls.apply(this, arguments);

		var b = "";
        b += "<li onclick='vgap.map.showMinerals();'>Show Minerals</li>";
        b += "<li onclick='vgap.loadCompleteHistory();'>Load History</li>";
        
        $("#MapTools li:contains('Measure')").after(b);
           
        b = "";
        b += "<li onclick='vgap.map.randomizeFC();'>Rand FC</li>";
        b += "<li onclick='vgap.map.setTaxes();'>Set Taxes</li>";
        b += "<li onclick='vgap.map.setSmallComplete();'>Set Complete</li>";
        b += "<li onclick='vgap.map.useNotes();'>Use Notes</li>";
        
        $("#MapTools li:contains('Clear')").before(b);

        $(".ShowMinerals").remove();
        
        vgap.map.colorsA = [];
        vgap.map.colorsA2 = [];
        vgap.map.colorsA[0]  = "hsl(0,0,128)";
        vgap.map.colorsA2[0] = "hsl(0,0,16)";
    	
        for (var i=1; i<=vgap.game.slots; ++i) {
        	vgap.map.colorsA[i]  = "hsl("+(i/vgap.game.slots*239)+",240,128)";
        	vgap.map.colorsA2[i] = "hsl("+(i/vgap.game.slots*239)+",240,32)";
        }
	};
    
	vgaPlanets.prototype.loadCompleteHistory = function () {
	    var b = "<div id='rNav'></div>";
		$("#PlanetsContainer").append(b);

		vgap.history = [];
		for (var i=0; i<=vgap.settings.turn; ++i) {
    		vgap.history[i] = {};
    		vgap.history[i].planets = [];
    		vgap.history[i].ships = [];
    		vgap.history[i].ionstorms = [];
    		vgap.history[i].starbases = [];
    		vgap.history[i].messages = [];
    		vgap.history[i].messageMap = [];
    		vgap.history[i].minefields = [];
    		vgap.history[i].notes = [];
		}
		
       vgap.loadTurns(1, 1);
	   vgap.map.drawTurn(0);
	};
	
	vgaPlanets.prototype.loadTurns = function(player, turn) {
		
        vgap.indicator.text(player+" - "+turn);
        vgap.indicateOn();
        
		var a = new dataObject();
		a.add("gameid", vgap.gameId);
		a.add("apikey", "null");
		a.add("forsave", true);
		a.add("playerid", player);
		a.add("turn", turn);

		try {
			vgap.request("/game/loadturn", a, function(b) {
				if (b != null && b.success == true) {
					vgap.cacheFromRST(b);
					delete b;
				}

				vgap.loadNextTurn(player, turn);
			});
		}
		catch (e) {
			vgap.loadNextTurn(player, turn);
		}
		
		delete a;
	};
	
    vgaPlanets.prototype.loadNextTurn = function (player, turn) {
		var p = player;
		var t = turn;
		if (++p > 11/*vgap.game.slots*/) {
			p = 1;
			if (++t > vgap.game.turn) {
				vgap.map.drawTurn(vgap.game.turn);
				return;
			}
		}
		
		vgap.loadTurns(p, t);
		
		if (t != turn)
			vgap.map.drawTurn(turn);
	};
	
    vgaPlanets.prototype.cacheFromRST = function(b) {
        var a = b.rst.settings.turn;
        var player = b.rst.player.id;
        
        for (var i = 0; i < b.rst.planets.length; ++i) {
            var planet = b.rst.planets[i];
            if (vgap.history[a].planets[planet.id] == undefined || planet.ownerid == player)
                vgap.history[a].planets[planet.id] = planet;
        }
        
        for (var i = 0; i < b.rst.ships.length; ++i) {
            var ship = b.rst.ships[i];
            for (var d = 0; d < vgap.history[a].ships.length; d++) 
                if (vgap.history[a].ships[d].id == ship.id) 
                	break;
            if (d == vgap.history[a].ships.length)
            	vgap.history[a].ships.push(ship);
            else if (ship.ownerid == player)
            	vgap.history[a].ships[d] = ship;
        }
        
        for (var i = 0; i < b.rst.starbases.length; ++i) {
            var starbase = b.rst.starbases[i];
            if (!vgap.getArray(vgap.history[a].starbases, starbase.id))
            	vgap.history[a].starbases.push(starbase);
        }
        
        for (var i = 0; i < b.rst.minefields.length; ++i) {
            var minefield = b.rst.minefields[i];
            if (!vgap.getArray(vgap.history[a].minefields, minefield.id))
            	vgap.history[a].minefields.push(minefield);
        }
        
        for (var i = 0; i < b.rst.ionstorms.length; ++i) {
            var ionstorm = b.rst.ionstorms[i];
            if (!vgap.getArray(vgap.history[a].ionstorms, ionstorm.id))
            	vgap.history[a].ionstorms.push(ionstorm);
        }

        for (var i = 0; i < b.rst.messages.length; ++i) {
            var message = b.rst.messages[i];
            if (message.messagetype == 10) {
            	if (vgap.history[a].messageMap[message.x+","+message.y] == undefined) {
            		vgap.history[a].messageMap[message.x+","+message.y] = message;
            		vgap.history[a].messages.push(message);
            	}
            }
        }
        
//        for (var i = 0; i < b.rst.notes.length; ++i) {
//            var note = b.rst.notes[i];
//            vgap.history[a].notes.push(note);
//        }
    };
    
    vgapMap.prototype.drawTurn = function(t) {
	    var b = "";
	    if (t == 1)
	    	b += "<div id='rNav'><a disabled='disabled' class='rNavLeft'>back</a>";
	    else
	    	b += "<div id='rNav'><a onclick='vgap.map.drawTurn("+(t-1)+");' class='rNavLeft'>back</a>";
    	b += "<span id='rNavState'>Turn "+t+"</span>";
    	if (t < vgap.game.turn)
		    b += "<a onclick='vgap.map.drawTurn("+(t+1)+");' class='rNavRight'>next</a></div>";
    	else
    		b += "<a disabled='disabled' class='rNavRight'>next</a></div>";
		
		$("#rNav").replaceWith(b);
		
	    if (t != vgap.historyDrawn || t == 0) {
	    	vgap.historyDrawn = t;
	
	        for (var i = 0; i < vgap.planets.length; ++i) {
	        	var planet = vgap.planets[i];
	        	if (vgap.history[t].planets[i] != undefined) {
	        		vgap.planets[i] = vgap.history[t].planets[i];
	        		planet = vgap.planets[i];
	        	}
	        	else {
	        		planet.infoturn = 0;
	        		planet.ownerid = 0;
	        	}
	        	
	        	vgap.planetMap[planet.x+","+planet.y] = planet;
	        }	
	        
	        vgap.starbases = vgap.history[t].starbases;
	        vgap.ionstorms = vgap.history[t].ionstorms;
	        vgap.messages = vgap.history[t].messages;
	        vgap.minefields = vgap.history[t].minefields;
//	        vgap.notes = vgap.history[t].notes;
	        vgap.ships = vgap.history[t].ships;
	        
	        delete vgap.shipMap;
	        vgap.shipMap = [];
	        
	        for (var i = 0; i < vgap.ships.length; ++i) {
	        	var ship = vgap.ships[i];
	        	if (vgap.shipMap[ship.x+","+ship.y] == undefined)
	        		vgap.shipMap[ship.x+","+ship.y] = [];
	        	vgap.shipMap[ship.x+","+ship.y].push(ship);
	        }	
	        
	        vgap.map.canvasRendered = false;
	        vgap.map.drawMap();
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
            var G = Math.min(30, Math.max(6 * this.zoom, 3));
            var c = {fill:"0-"+vgap.map.colorsA[planet.ownerid]+"-"+vgap.map.colorsA2[planet.ownerid]};
            
            if (planet.debrisdisk >= 1) {
            	G = planet.debrisdisk * this.zoom;
            	if (planet.debrisdisk > 1)
            		c = {fill:"r gray-black", "fill-opacity":.01, "stroke-opacity":0};
            }

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
    			c = {fill:vgap.map.colorsA[s.ownerid]};
    			var el = vgap.map.paper.rect(x, y, G, G).attr(c);
    			this.ships.push(el.transform("r"+k*45+t));
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
            var a = "yellow";
            
            var c = 0.05;
            if (d.voltage >= 50) 
                c = 0.075;
            if (d.voltage >= 100) 
                c = 0.1;
            if (d.voltage >= 150) 
                c = 0.15;
            if (d.voltage >= 200) 
                c = 0.2;

            this.ionstorms.push(this.paper.circle(this.screenX(d.x), this.screenY(d.y), (d.radius * this.zoom)).attr({fill:a,"fill-opacity": c, "stroke-opacity":0}));
            
            var e = d.x + Math.round(Math.sin(Math.toRad(d.heading)) * d.warp * d.warp);
            var f = d.y + Math.round(Math.cos(Math.toRad(d.heading)) * d.warp * d.warp);
            this.ionstorms.push(this.paper.path("M" + this.screenX(d.x) + " " + this.screenY(d.y) + "L" + this.screenX(e) + " " + this.screenY(f)).attr({stroke: a,"stroke-width": "1","stroke-opacity": c * 2}));
	    }
    };
    
    vgapMap.prototype.drawMinefields = function() {
    	if (this.minefields == undefined)
    		this.minefields = this.paper.set();
    	this.minefields.clear();

    	for (var c = 0; c < vgap.minefields.length; c++) {
            var d = vgap.minefields[c];
            var b = vgap.map.colorsA[d.ownerid];
            var a = {stroke: b,"stroke-width": "1","stroke-opacity": 0.5,fill: b,"fill-opacity": 0.2};
            this.minefields.push(this.paper.circle(this.screenX(d.x), this.screenY(d.y), (d.radius * this.zoom)).attr(a));
        }
    };
    
	vgaPlanets.prototype.deselectAll = function() {
		vgap.map.deselect();
        vgap.closeLeft();

	    vgap.map.explosions.clear();
	    vgap.map.explosions = vgap.map.paper.set();
	    
		vgap.map.draw();
	};
	
	vgapMap.prototype.drawText = function(b, c, a, at)
	{
		if (arguments.length == 4)
			this.canvas.push(this.paper.text(this.screenX(b), this.screenY(c), a).attr(at));
		else
			this.canvas.push(this.paper.text(this.screenX(b), this.screenY(c), a).attr({"fill": "white"}));
	};
	
	vgapMap.prototype.setSmallComplete = function () 
	{
//		var x = 1000;
//		var y = 3000;
//		var a = {"text-anchor": "start", fill: "white" };
//		this.drawCircle(x, y, 10 * this.zoom, { stroke: "red", "stroke-width": 4, "stroke-opacity": 1 });
//		this.drawText(x+50, y, "ship FC", a);
//		y -= 30;
//		this.drawCircle(x, y, 15 * this.zoom, { stroke: "orange", "stroke-width": 4, "stroke-opacity": 1 });
//		this.drawText(x+50, y, "readyStatus", a);
//		y -= 30;
//		this.drawCircle(x, y, 20 * this.zoom, { stroke: "yellow", "stroke-width": 4, "stroke-opacity": 1 });
//		this.drawText(x+50, y, "native taxes", a);
//		y -= 30;
//		this.drawCircle(x, y, 25 * this.zoom, { stroke: "green", "stroke-width": 4, "stroke-opacity": 1 });
//		this.drawText(x+50, y, "built factory", a);
//		y -= 30;
//		this.drawCircle(x, y, 30 * this.zoom, { stroke: "blue", "stroke-width": 4, "stroke-opacity": 1 });
//		this.drawText(x+50, y, "built defense", a);
//		y -= 30;
//		this.drawCircle(x, y, 35 * this.zoom, { stroke: "purple", "stroke-width": 4, "stroke-opacity": 1 });
//		this.drawText(x+50, y, "build complete", a);
//
		for (var i = 0; i < vgap.myplanets.length; i++) {
			var planet = vgap.myplanets[i];
			x = planet.x;
			y = planet.y;
			
			if (planet.readystatus == 0) {
				var ships = [];
				for (var j = 0; j < vgap.myships.length; j++) {
					ship = vgap.myships[j];
					if (ship.x == x && ship.y == y) 
						ships.push(ship);
				}

				if (ships.length == 0) {										// no ships so complete build
					var built = vgap.map.buildFactories(planet, 15);
					built += vgap.map.buildDefense(planet, 20);
					
					if (planet.defense >= 20) {
						built += vgap.map.buildFactories(planet, 60);
						built += vgap.map.buildMines(planet, 60);
						built += vgap.map.buildFactories(planet, 100);
						built += vgap.map.buildMines(planet, 100);
						built += vgap.map.buildDefense(planet, 100);
					}
					
					if (built > 0)
						planet.readystatus = 1;
				}
				
				if (planet.factories >= vgap.map.maxBuildings(planet, 100) && planet.defense >= vgap.map.maxBuildings(planet, 50) && planet.mines >= vgap.map.maxBuildings(planet, 200)) {
					planet.readystatus = 1;
					planet.changed = 1;
					this.drawCircle(x, y, 35 * this.zoom, { stroke: "purple", "stroke-width": 4 * this.zoom, "stroke-opacity": 1 });
				}
				
				if (planet.clans < 5 || planet.supplies < 5 || planet.supplies + planet.megacredits < 20) {		// nothing to do here
					planet.readystatus = 1;
					planet.changed = 1;
				}
				
				if (planet.readystatus > 0)
					this.drawCircle(x, y, 15 * this.zoom, { stroke: "orange", "stroke-width": 4 * this.zoom, "stroke-opacity": 1 });
			}
		}

		for (var i = 0; i < vgap.myships.length; i++) {
			var ship = vgap.myships[i];
			if (ship.readystatus == 0) {
				
				var shipFC = Number(ship.friendlycode);
				if (isNaN(ship.friendlycode) || shipFC < 250) {	// generate new FC if the old FC was HYP or < 250 which could be a chunnel
					var b = Math.random() * 750 + 250;
					b = Math.floor(b);
					ship.friendlycode = b.toString();
					ship.changed = 1;
					this.drawCircle(ship.x, ship.y, 10 * this.zoom, { stroke: "red", "stroke-width": 4 * this.zoom, "stroke-opacity": 1 });
				}
				
				var dist = vgap.map.getDist(ship.x, ship.y, ship.targetx, ship.targety);
				if (ship.hullid == 51 && dist == 0 && ship.target.isPlanet) {		// borg probe, if the planet is unowned drop clans to caputure
					var planet = ship.target;
					if (planet.nativetype != 5) {
						if (planet.ownerid == 0 && ship.clans != 0) {	// drop all if natives exist & set ship ready
							if (planet.nativeclans != 0) {
								ship.transferclans = ship.clans;
								ship.clans = 0;
								ship.readystatus = 1;
							}
							else {										// just 1 if planet is empty	
								ship.transferclans = 1;
								ship.clans -= 1;
								if (ship.supplies >= 1) {
									ship.transfersupplies = 1;
									ship.supplies -= 1;
								}
							}
							
							this.drawCircle(ship.x, ship.y, 16 * this.zoom, { stroke: "blue", "stroke-width": 8 * this.zoom, "stroke-opacity": 1 });
						}
						
						if (planet.ownerid == vgap.player.id && planet.factories == 0 && ship.supplies > 0 && ship.megacredits > 0) {
							planet.supplies += ship.supplies;
							ship.transfersupplies = ship.supplies;
							ship.supplies = 0;
							planet.megacredits += ship.megacredits;
							ship.transfermegacredits = ship.megacredits;
							ship.megacredits = 0;
							planet.changed = 1;
						}
						
						if (ship.transferclans > 0 || ship.transfersupplies > 0 || ship.transfermegacredits > 0) {
							ship.transfertargettype = 1;
							ship.transfertargetid = planet.id;
							ship.changed = 1;
							var built = vgap.map.buildFactories(planet, 15);
							
							if (built > 0) {
								ship.readystatus = 1;
								planet.readystatus = 1;
								planet.changed = 1;
								this.drawCircle(ship.x, ship.y, 24 * this.zoom, { stroke: "cyan", "stroke-width": 4 * this.zoom, "stroke-opacity": 1 });
							}
						}
					}
				}
				
				if (ship.target && ship.target.isPlanet && dist > 0 && dist <= ship.warp * ship.warp + 3) {	// 1 turn away target set
					ship.readystatus = 1;
					ship.changed = 1;
				}
				
				if (ship.readystatus > 0)
					this.drawCircle(x, y, 15 * this.zoom, { stroke: "orange", "stroke-width": 4 * this.zoom, "stroke-opacity": 1 });
			}
		}
		
		for (var i = 0; i < vgap.myplanets.length; i++) {
			var planet = vgap.myplanets[i];
			if (planet.changed == 1)
				vgap.map.savePlanet(planet);
		}
		
		for (var i = 0; i < vgap.myships.length; i++) {
			var ship = vgap.myships[i];
			if (ship.changed == 1)
				vgap.map.saveShip(ship);
		}
	};

	vgapMap.prototype.setTaxes = function()
	{
		var happychange;
		var happypoints;
		var taxrate;
		
		for (var i = 0; i < vgap.myplanets.length; i++) {
			var planet = vgap.myplanets[i];
			var x = planet.x;
			var y = planet.y;
			
			if (planet.nativeclans != 0) {
				happychange = planet.nativehappychange;
				happypoints = planet.nativehappypoints;
				taxrate = planet.nativetaxrate;
				
				while (happypoints + happychange != 70 && (happychange > -5 || happypoints + happychange <= 70)) {	// calculate max tax happy tax rate
					if (happypoints + happychange > 70)
						++planet.nativetaxrate;
					else
						--planet.nativetaxrate;
					happychange = vgap.nativeTaxChange(planet);
					
					var value = planet.nativetaxvalue;
					planet.nativetaxvalue = vgap.map.nativeTaxAmount(planet);
					if (value == planet.nativetaxvalue) {
						--planet.nativetaxrate;
						happychange = vgap.nativeTaxChange(planet);
						planet.nativetaxvalue = vgap.map.nativeTaxAmount(planet);
						break;
					}
				}   
				
				if (taxrate != planet.nativetaxrate) {
					planet.nativehappychange = happychange;
					planet.changed = 1;
					this.drawCircle(x, y, 20 * this.zoom, { stroke: "yellow", "stroke-width": 4 * this.zoom, "stroke-opacity": 1 });
				}
			}
	
			happychange = planet.colhappychange;
			happypoints = planet.colonisthappypoints;
			taxrate = planet.colonisttaxrate;
			var coltaxvalue = vgap.map.colonistTaxAmount(planet);
				
			while (happypoints + happychange != 70 && (happychange > -5 || happypoints + happychange <= 70)) {	// calculate max tax happy tax rate
				if (happypoints + happychange > 70)
					++planet.colonisttaxrate;
				else
					--planet.colonisttaxrate;
				happychange = vgap.colonistTaxChange(planet);
	
				var value = coltaxvalue;
				coltaxvalue = vgap.map.colonistTaxAmount(planet);
				if (value == coltaxvalue) {
					--planet.colonisttaxrate;
					happychange = vgap.colonistTaxChange(planet);
					break;
				}
			}   
	
			if (taxrate != planet.colonisttaxrate) {
				planet.colhappychange = happychange;
				planet.changed = 1;
				this.drawCircle(x, y, 15 * this.zoom, { stroke: "orange", "stroke-width": 4 * this.zoom, "stroke-opacity": 1 });
			}
			
			if (planet.changed)					// if anything changed write the planet.  writing them all overflows buffers
				vgap.map.savePlanet(planet);
		}
	};
	   

    vgapMap.prototype.hitTextBox = function(hit) {
	    var txt = "";
	    if (hit.isPlanet) { //planet
	        txt += "<div class='ItemSelectionBox minCorrection'>";
	        txt += "<span>" + hit.id + ": " + hit.name;
	        if (hit.temp != -1)
	            txt += "<span style='float:right;'>Temp: " + hit.temp + "</span>";
	        txt += "</span>";
	        txt += "<table class='CleanTable'>";
	        if (hit.infoturn == 0) {
	            //unknown planet
	            txt += this.hitText(hit, hit.isPlanet).replace("&nbsp", "");
	        } 
	        else {
	            if (hit.nativeclans > 0) {
	                txt += "<tr><td colspan='4'>" + addCommas(hit.nativeclans * 100) + " " + hit.nativeracename + " - " + hit.nativegovernmentname + "</td></tr>";
	            }
				var neu = vgap.map.mining(hit, hit.densityneutronium, hit.groundneutronium);
				var tri = vgap.map.mining(hit, hit.densitytritanium, hit.groundtritanium);
				var dur = vgap.map.mining(hit, hit.densityduranium, hit.groundduranium);
				var mol = vgap.map.mining(hit, hit.densitymolybdenum, hit.groundmolybdenum);
				var tax = vgap.map.nativeTaxAmount(hit) + vgap.map.colonistTaxAmount(hit);
				
				txt += 
	            "<tr> <td>Neutronium: </td><td>&nbsp;" + gsv(hit.neutronium) + " / " + gsv(hit.groundneutronium) + " / " + gsv(neu) + "&nbsp;<td>Colonists: </td><td>&nbsp;" + addCommas(gsv(hit.clans * 100)) + "</td></tr>" + 
	            "<tr> <td>Duranium: </td><td>&nbsp;" + gsv(hit.duranium) + " / " + gsv(hit.groundduranium) + " / " + gsv(dur) + "&nbsp;</td>" + "<td>Supplies: </td><td>&nbsp;" + gsv(hit.supplies) + " / " + gsv(hit.factories) + "</td></tr>" + 
	            "<tr> <td>Tritanium: </td><td>&nbsp;" + gsv(hit.tritanium) + " / " + gsv(hit.groundtritanium) + " / " + gsv(tri) + "&nbsp;</td>" + "<td>Megacredits: </td><td>&nbsp;" + gsv(hit.megacredits) + " / " + gsv(tax) + "</td></tr>" + 
	            "<tr> <td>Molybdenum: </td><td>&nbsp;" + gsv(hit.molybdenum) + " / " + gsv(hit.groundmolybdenum) + " / " + gsv(mol) + "</td></tr>";
	            //known planet
	            if (hit.ownerid != vgap.player.id && hit.ownerid != 0) {
	                var player = vgap.getPlayer(hit.ownerid);
	                var race = vgap.getRace(player.raceid);
	                txt += "<tr><td colspan='4'>" + race.name + " (" + player.username + ")</td></tr>";
	            }
	            txt += this.hitText(hit, hit.isPlanet).replace("&nbsp", "");
	            var starbase;
	            if (starbase = vgap.getStarbase(hit.id)) {
	    	        txt += "<tr><td class='WarnText'>Starbase</td>";
	    	        if (starbase.isbuilding) {
	    		        var hull = vgap.getHull(starbase.buildhullid);
	    	            txt += "<td colspan='2'>Building: " + hull.name + "</td></tr>";
	    	        }
	            }
	        }
	        txt += "</table></div>";
	    } else { //ship
	    	var planet;
	        var ship = hit;
	        var hull = vgap.getHull(ship.hullid);
//	        var totalCargo = ship.ammo + ship.duranium + ship.tritanium + ship.molybdenum + ship.supplies + ship.clans;
	        var html = "<div class='ItemSelectionBox minCorrection'>";
	        if (ship.ownerid == vgap.player.id || vgap.fullallied(ship.ownerid)) {
	            html += "<span>" + ship.id + ": " + hull.name;
	            html += "<span style='float:right;'>FC: " + ship.friendlycode + "</span></span>";
	            html += "<table class='CleanTable'>";
	            html += "<tr><td colspan='2'>\= " + ship.x + " : " + ship.y + "</td>";
	            html += "<td colspan='2'>" + vgap.map.getMission(ship) + "</td></tr>";
	            if (ship.x != ship.targetx || ship.y != ship.targety) {
		            html += "<tr><td colspan='2'>\> " + ship.targetx + " : " + ship.targety + "</td>";
		            if (planet = vgap.map.getPlanet(ship.targetx, ship.targety)) {
		            	var warp = "";
		            	if (planet.x != ship.targetx || planet.y != ship.targety)
				            warp = "  warp well";
		            	html += "<td colspan='2'>"+ planet.id + " : " + planet.name + warp + "</td>"; 
		            }
		            else
			            html += "<td colspan='2'>deep space</td>";
		            html += "</tr>";
		        }
	            html += "<tr><td>Neutronium:</td><td>&nbsp;" + gsv(ship.neutronium) + "/" + hull.fueltank + " </td><td>&nbsp;Clans:</td><td>&nbsp;" + gsv(ship.clans) + "</td></tr>";
	            html += "<tr><td>Duranium:</td><td>&nbsp;" + gsv(ship.duranium) + "</td><td>&nbsp;Supplies:</td><td>&nbsp;" + gsv(ship.supplies) + "</td></tr>";
	            html += "<tr><td>Tritanium:</td><td>&nbsp;" + gsv(ship.tritanium) + "</td><td>&nbsp;Megacredits:</td><td>&nbsp;" + gsv(ship.megacredits) + "</td></tr>";
	            html += "<tr><td>Molybdenum:</td><td>&nbsp;" + gsv(ship.molybdenum) + "</td>";
	            if (ship.torps > 0 || ship.bays > 0) {
	                var ammoText = "&nbsp;Fighters";
	                if (ship.torps > 0)
	                    ammoText = "&nbsp;Torpedos lvl" + gsv(ship.torpedoid);
	                html += "<td>" + ammoText + ": </td><td>&nbsp;" + gsv(ship.ammo) + "</td></tr>";
	            }
	            
	            html += this.hitText(hit, hit.isPlanet).replace("&nbsp", "");
	            html += "</table>";
	        } else { //enemy
	            var player = vgap.getPlayer(ship.ownerid);
	            var hull = vgap.getHull(ship.hullid);
	            var race = vgap.getRace(player.raceid);
	            html += "<div class='enemyShipStyle'>";
	            html += "<table class='CleanTable'>";
	            html += "<tr><td colspan='2'>" + ship.id + ": " + hull.name + "</td></tr>";
	            html += "<tr><td colspan='2'>" + ship.x + " : " + ship.y + "</td></tr>";
	            html += "<tr><td colspan='2'>" + hull.name + "</td></tr>";
	            html += "<tr><td>Heading:</td><td>&nbsp;" + gsv(ship.heading) + " at Warp: " + gsv(ship.warp) + "</td></tr>";
	            html += "<tr><td>Mass: </td><td>&nbsp;" + gsv(ship.mass) + "</td></tr>";
	            html += "<tr><td colspan='2'>" + race.name + " (" + player.username + ")" + "</td></tr>";
	            //html += "<tr><td>Neutronium:</td><td>?/" + hull.fueltank + " </td><td>&nbsp;Total Cargo:</td><td>?/" + hull.cargo + "</td></tr>";
	            html += this.hitText(hit, hit.isPlanet).replace("&nbsp", "");
	            html += "</table>";
	            html += "</div>";
	        }
	        html += "</div>";
	        txt = html;
	    }
	    return txt;
	};
	
	vgapMap.prototype.getMission = function(ship) {
		var name = "";

        switch(ship.mission) {
		
        case 0: name = "Exploration"; break;
        case 1: name = "Mine Sweep"; break;
        case 2: name = "Lay Mines"; break;
        case 3: name = "Kill!!"; break;
		case 4: 
	        if (ship.hullid == 84 || ship.hullid == 96 || ship.hullid == 9) {
	            name = "Bio Scan";
	        } else {
	            name = "Sensor Sweep";
	        } break;
        case 5: name = "Land and Disassemble"; break;
        case 6: name = "Try to Tow"; break;
        case 7: name = "Try to Intercept"; break;
        case 8:
        	switch (vgap.player.raceid) {
            case 1: name = "Super Refit"; break;
            case 2: name = "Hisssss!"; break;
            case 3: name = "Super Spy"; break;
            case 4: name = "Pillage Planet"; break;
            case 5: name = "Rob Ship"; break;
            case 6: name = "Self Repair"; break;
            case 7: name = "Lay Web Mines"; break;
            case 8: name = "Dark Sense"; break;
            case 9: name = "Build Fighters"; break;
            case 10: name = "Rebel Ground Attack"; break;
        	}
        	break;
        case 9: name = "Cloak"; break;
        case 10: name = "Beam up Fuel"; break;
        case 11: name = "Beam up Duranium"; break;
        case 12: name = "Beam up Tritanium"; break;
        case 13: name = "Beam up Molybdenum"; break;
        case 14: name = "Beam up Supplies"; break;
        case 15: name = "Repair Ship"; break;
        case 16: name = "Destroy Planet"; break;
        }
        
        return name;
	};
        	
    vgapMap.prototype.getPlanet = function(d, e) {
	    for (var b = 0; b < vgap.planets.length; b++) {
	        var c = vgap.planets[b];
	        var a = vgap.map.getDist(d, e, c.x, c.y);
	        if (a <= 3)
	            return c;
	    }
	    return false;
	};
	
	vgapMap.prototype.showMinerals = function () 
	{
//		var x = 1000;
//		var y = 3000;
//		var a = {"text-anchor": "start", fill: "white" };
//		this.drawCircle(x, y, 10, { fill: "green" });
//		this.drawText(x+50, y, "mined neutronium", a);
//		y -= 30;
//		this.drawCircle(x, y, 10, { fill: "cyan" });
//		this.drawText(x+50, y, "mined tritanium", a);
//		y -= 30;
//		this.drawCircle(x, y, 10, { fill: "blue" });
//		this.drawText(x+50, y, "mined duranium", a);
//		y -= 30;
//		this.drawCircle(x, y, 10, { fill: "purple" });
//		this.drawText(x+50, y, "mined molybdenum", a);
//		y -= 30;
//		this.drawCircle(x, y, Math.sqrt(100) * this.zoom, { stroke: "red", "stroke-width": 2, "stroke-opacity": 1 });
//		this.drawText(x+50, y, "500 surface neutronium", a);
//		y -= 30;
//		this.drawCircle(x, y, Math.sqrt(600) * this.zoom, { stroke: "orange", "stroke-width": 2, "stroke-opacity": 1 });
//		this.drawText(x+50, y, "1000 surface tritanium", a);
//		y -= 30;
//		this.drawCircle(x, y, Math.sqrt(1100) * this.zoom, { stroke: "yellow", "stroke-width": 2, "stroke-opacity": 1 });
//		this.drawText(x+50, y, "1500 surface duranium", a);
//		y -= 30;
//		this.drawCircle(x, y, Math.sqrt(1600) * this.zoom, { stroke: "beige", "stroke-width": 2, "stroke-opacity": 1 });
//		this.drawText(x+50, y, "2000 surface molybdenum", a);

		for (var i=0; i < vgap.myplanets.length; ++i) {
			var planet = vgap.myplanets[i];
			
			var neu = Math.log(vgap.map.mining(planet, planet.densityneutronium, planet.groundneutronium));
			var tri = Math.log(vgap.map.mining(planet, planet.densitytritanium, planet.groundtritanium));
			var dur = Math.log(vgap.map.mining(planet, planet.densityduranium, planet.groundduranium));
			var mol = Math.log(vgap.map.mining(planet, planet.densitymolybdenum, planet.groundmolybdenum));
			var rad = 10;
			
			if (neu > 4) {
				this.drawCircle(planet.x, planet.y, rad * this.zoom, { stroke: "green", "stroke-width": neu, "stroke-opacity": 1 });
				rad += neu;
			}
			if (tri > 4) {
				this.drawCircle(planet.x, planet.y, rad * this.zoom, { stroke: "cyan", "stroke-width": tri, "stroke-opacity": 1 });
				rad += tri;
			}
			if (dur > 4) {
				this.drawCircle(planet.x, planet.y, rad * this.zoom, { stroke: "blue", "stroke-width": dur, "stroke-opacity": 1 });
				rad += dur;
			}
			if (mol > 4)
				this.drawCircle(planet.x, planet.y, rad * this.zoom, { stroke: "purple", "stroke-width": mol, "stroke-opacity": 1 });
			
			if (planet.neutronium > 400)
				this.drawCircle(planet.x, planet.y, (26 + Math.sqrt(planet.neutronium - 400)) * this.zoom, { stroke: "red", "stroke-width": 2, "stroke-opacity": 1 });
			if (planet.tritanium > 400)
				this.drawCircle(planet.x, planet.y, (26 + Math.sqrt(planet.tritanium - 400)) * this.zoom, { stroke: "orange", "stroke-width": 2, "stroke-opacity": 1 });
			if (planet.duranium > 400)
				this.drawCircle(planet.x, planet.y, (26 + Math.sqrt(planet.duranium - 400)) * this.zoom, { stroke: "yellow", "stroke-width": 2, "stroke-opacity": 1 });
			if (planet.molybdenum > 400)
				this.drawCircle(planet.x, planet.y, (26 + Math.sqrt(planet.molybdenum - 400)) * this.zoom, { stroke: "beige", "stroke-width": 2, "stroke-opacity": 1 });
		}
	};

	vgapMap.prototype.showSupplies = function () 
	{
//		var x = 1000;
//		var y = 3000;
//		var a = {"text-anchor": "start", fill: "white" };
//		this.drawCircle(x, y, 25 * this.zoom, { stroke: "green", "stroke-width": 8, "stroke-opacity": 1 });
//		this.drawText(x+50, y, "factories", a);
//		y -= 30;
//		this.drawCircle(x, y, 30 * this.zoom, { stroke: "blue", "stroke-width": 2, "stroke-opacity": 1 });
//		this.drawText(x+50, y, "megacredits", a);
//		y -= 30;
//		this.drawCircle(x, y, 35 * this.zoom, { stroke: "purple", "stroke-width": 2, "stroke-opacity": 1 });
//		this.drawText(x+50, y, "supplies", a);

		for (var i=0; i<vgap.myplanets.length; ++i) {
			var planet = vgap.myplanets[i];
			var rad  = 10;
			
			if (planet.factories > 20) {
				this.drawCircle(planet.x, planet.y, 10 * this.zoom, { stroke: "green", "stroke-width": Math.log(planet.factories), "stroke-opacity": 1 });
				rad = 10 + Math.log(planet.factories);
			}
			if (planet.megacredits + planet.supplies > 1000) {
				this.drawCircle(planet.x, planet.y, (rad + Math.sqrt(planet.megacredits)) * this.zoom, { stroke: "blue", "stroke-width": 2, "stroke-opacity": 1 });
				this.drawCircle(planet.x, planet.y, (rad + Math.sqrt(planet.supplies)) * this.zoom, { stroke: "purple", "stroke-width": 2, "stroke-opacity": 1 });
			}
		}
	};

	vgapMap.prototype.showColonist = function () 
	{
//		var x = 1000;
//		var y = 3000;
//		var a = {"text-anchor": "start", fill: "white" };
//		this.drawCircle(x, y, 20 * this.zoom, { stroke: "green", "stroke-width": 4 * this.zoom, "stroke-opacity": 1 });
//		this.drawText(x+50, y, "defense", a);
//		y -= 30;
//		this.drawCircle(x, y, 10 * this.zoom, { stroke: "red", "stroke-width": 2 * this.zoom, "stroke-opacity": 1 });
//		this.drawText(x+50, y, "clans", a);
//		y -= 30;
//		this.drawCircle(x, y, 15 * this.zoom, { stroke: "orange", "stroke-width": 2 * this.zoom, "stroke-opacity": 1 });
//		this.drawText(x+50, y, "natives", a);

		for (var i=0; i<vgap.myplanets.length; ++i) {
			var planet = vgap.myplanets[i];

			if (planet.defense > 20) 
				this.drawCircle(planet.x, planet.y, 10 * this.zoom, { stroke: "green", "stroke-width": Math.log(planet.defense), "stroke-opacity": 1 });
			
			var rad = 10 + Math.log(planet.defense);

			this.drawCircle(planet.x, planet.y, (rad + Math.log(planet.clans)) * this.zoom, { stroke: "red", "stroke-width": 2, "stroke-opacity": 1 });
			this.drawCircle(planet.x, planet.y, (rad + Math.log(planet.nativeclans)) * this.zoom, { stroke: "orange", "stroke-width": 2, "stroke-opacity": 1 });
		}
	};

	vgapMap.prototype.nativeTaxAmount = function (planet)		// taken from vgap planet screen because it uses an undefined this when I need it
	{
		var a = planet.nativetaxrate;
		var b = vgap.getPlayer(planet.ownerid);
		if (b != null) 
			if (b.raceid == 6 && a > 20) 
				a = 20;

		var e = Math.round(a * planet.nativegovernment * 20 / 100 * planet.nativeclans / 1000);
		if (e > planet.clans) 
			e = planet.clans;

		var d = 1;
		if (vgap.advActive(2)) 
			d = 2;

		e = e * d;
		if (planet.nativetype == 6) 
			e = e * 2;

		if (e > 5000) 
			e = 5000;

		return e;
	};

	vgapMap.prototype.randomizeFC = function()	// random meaningless FC
	{
//		var x = 1000;
//		var y = 3000;
//		var a = {"text-anchor": "start", fill: "white" };
//		this.drawCircle(x, y, 10 * this.zoom, { stroke: "red", "stroke-width": 4 * this.zoom, "stroke-opacity": 1 });
//		this.drawText(x+50, y, "planet FC", a);
//		y -= 30;
//		this.drawCircle(x, y, 15 * this.zoom, { stroke: "orange", "stroke-width": 4 * this.zoom, "stroke-opacity": 1 });
//		this.drawText(x+50, y, "ship FC", a);

		for (var i = 0; i < vgap.myplanets.length; i++) {
			var planet = vgap.myplanets[i];
			if (planet.readystatus == 0) {
				var b = Math.random() * 750 + 250;
				b = Math.floor(b);
				planet.friendlycode = b.toString();
				planet.changed = 1;
				this.drawCircle(planet.x, planet.y, 10 * this.zoom, { stroke: "red", "stroke-width": 4 * this.zoom, "stroke-opacity": 1 });
				vgap.map.savePlanet(planet);
			}
		}
		
		for (var i = 0; i < vgap.myships.length; i++) {
			var ship = vgap.myships[i];
			if (ship.readystatus == 0) {
				var b = Math.random() * 750 + 250;
				b = Math.floor(b);
				ship.friendlycode = b.toString();
				ship.changed = 1;
				this.drawCircle(ship.x, ship.y, 15 * this.zoom, { stroke: "orange", "stroke-width": 4 * this.zoom, "stroke-opacity": 1 });
				vgap.map.saveShip(ship);
			}
		}
	};
	
	vgapMap.prototype.mining = function(planet, percent, inground) {
		var rate = vgap.miningRate(planet, percent);
	    return Math.min(inground, rate);
	};
	
	vgapMap.prototype.savePlanet = function(planet)			// taken from vgap planet save() because it saves everything not just 1 planet
	{
	    var b = new dataObject();
        b.add("gameid", vgap.gameId);
        b.add("playerid", vgap.player.id);
        b.add("turn", vgap.settings.turn);
        b.add("version", vgap.version);
        b.add("savekey", vgap.savekey);
        b.add("apikey", vgap.apikey);
        b.add("saveindex", 2);
        b.add("Planet" + planet.id, vgap.serializePlanet(planet), false);
        b.add("keycount", 11);
    
        planet.changed = 2;

	    vgap.saveInProgress = 2;
	    vgap.request("/game/save", b, function(f) { vgap.processSave(f); });
	};

	vgapMap.prototype.saveShip = function(ship)			// taken from vgap planet save() because it saves everything not just 1 planet
	{
	    var b = new dataObject();
        b.add("gameid", vgap.gameId);
        b.add("playerid", vgap.player.id);
        b.add("turn", vgap.settings.turn);
        b.add("version", vgap.version);
        b.add("savekey", vgap.savekey);
        b.add("apikey", vgap.apikey);
        b.add("saveindex", 2);
        b.add("Ship" + ship.id, vgap.serializeShip(ship), false);
        b.add("keycount", 11);
    
        ship.changed = 2;

	    vgap.saveInProgress = 2;
	    vgap.request("/game/save", b, function(f) { vgap.processSave(f); });
	};

	vgapMap.prototype.nativeTaxAmount = function (planet) 	// taken from vgap screen because it uses an undefined this when I need it
	{
		var e = 0;
		if (planet.nativeclans > 0) {
			var a = planet.nativetaxrate;
			var b = vgap.getPlayer(planet.ownerid);
			if (b != null) 
				if (b.raceid == 6 && a > 20) 
					a = 20;
	
			e = Math.round(a * planet.nativegovernment * 20 / 100 * planet.nativeclans / 1000);
			if (e > planet.clans) 
				e = planet.clans;
	
			var d = 1;
			if (vgap.advActive(2)) 
				d = 2;
	
			e = e * d;
			if (planet.nativetype == 6) 
				e = e * 2;
	
			if (e > 5000) 
				e = 5000;
		}
		
		return e;
	};
	
	vgapMap.prototype.colonistTaxAmount = function(planet)	// taken from vgap screen because it uses an undefined this when I need it
	{
		var a = Math.round(planet.colonisttaxrate * planet.clans / 1000);
		var b = 1;
		if (vgap.advActive(2)) {
			b = 2;
		}
		a = a * b;
		if (a > 5000) {
			a = 5000;
		}
		return a;
	};

	vgapMap.prototype.maxBuildings = function (planet, min)		// taken from vgap screen because it uses an undefined this when I need it
	{
		if (planet.clans <= min) 
			return planet.clans;
		else
			return Math.floor(min + Math.sqrt(planet.clans - min));
	};

	vgapMap.prototype.spendMC = function(planet, amount)
	{
		if (planet.megacredits >= amount)
			planet.megacredits -= amount;
		else {
			var supplies = amount - planet.megacredits;		// sell supplies
			planet.suppliessold += supplies;
			planet.supplies -= supplies;
			planet.megacredits = 0;
		}
		planet.changed = 1;
	};

	vgapMap.prototype.buildFactories = function (planet, count)
	{
		var build = 0;
		var x = planet.x;
		var y = planet.y;
		if (planet.factories < count) {	
			var max = vgap.map.maxBuildings(planet, 100);
			build = Math.min(count - planet.factories, planet.supplies, 
					Math.floor((planet.supplies + planet.megacredits) / 4), 
					max - planet.factories);			// maximum number of factories we can build

			if (build > 0) {
				this.drawCircle(x, y, 25 * this.zoom, { stroke: "green", "stroke-width": 4 * this.zoom, "stroke-opacity": 1 });

				planet.builtfactories += build;
				planet.factories += build;
				planet.supplies -= build;

				vgap.map.spendMC(planet, 3 * build);	// deduct supplies & MC
				planet.changed = 1;
			}
		}

		return build;
	};

	vgapMap.prototype.buildDefense = function (planet, count)
	{
		var build = 0;
		var x = planet.x;
		var y = planet.y;
		if (planet.defense < count) {	            
			var max = vgap.map.maxBuildings(planet, 50);
			build = Math.min(count - planet.defense, planet.supplies, 
					Math.floor((planet.supplies + planet.megacredits) / 11), 
					max - planet.defense);			// maximum number we can build

			if (build > 0) {
				this.drawCircle(x, y, 30 * this.zoom, { stroke: "blue", "stroke-width": 4 * this.zoom, "stroke-opacity": 1 });

				planet.builtdefense += build;
				planet.defense += build;
				planet.supplies -= build;

				vgap.map.spendMC(planet, 10  * build);
				planet.changed = 1;
			}
		}
		return build;
	};

	vgapMap.prototype.buildMines = function (planet, count)
	{
		var build = 0;
		var x = planet.x;
		var y = planet.y;
		if (planet.mines < count) {	
			var max = vgap.map.maxBuildings(planet, 200);
			build = Math.min(count - planet.mines, planet.supplies, 
					Math.floor((planet.supplies + planet.megacredits) / 5), 
					max - planet.mines);				// maximum number of factories we can build

			if (build > 0) {
				this.drawCircle(x, y, 35 * this.zoom, { stroke: "purple", "stroke-width": 4 * this.zoom, "stroke-opacity": 1 });

				planet.builtmines += build;
				planet.mines += build;
				planet.supplies -= build;

				vgap.map.spendMC(planet, 4 * build);
				planet.changed = 1;
			}
		}
		return build;
	};

	vgapMap.prototype.useNotes = function () 
	{
//		var x = 1000;
//		var y = 3000;
//		var a = {"text-anchor": "start", fill: "white" };
//		this.drawCircle(x, y, 15 * this.zoom, { stroke: "yellow", "stroke-width": 4 * this.zoom, "stroke-opacity": 1 });
//		this.drawText(x+50, y, "planet done", a);
//		y -= 30;
//		this.drawCircle(x, y, 20 * this.zoom, { stroke: "orange", "stroke-width": 4 * this.zoom, "stroke-opacity": 1 });
//		this.drawText(x+50, y, "ship HYP", a);
//		y -= 30;
//		this.drawCircle(x, y, 25 * this.zoom, { stroke: "green", "stroke-width": 4 * this.zoom, "stroke-opacity": 1 });
//		this.drawText(x+50, y, "built factory", a);
//		y -= 30;
//		this.drawCircle(x, y, 30 * this.zoom, { stroke: "blue", "stroke-width": 4 * this.zoom, "stroke-opacity": 1 });
//		this.drawText(x+50, y, "built defense", a);
//		y -= 30;
//		this.drawCircle(x, y, 35 * this.zoom, { stroke: "purple", "stroke-width": 4 * this.zoom, "stroke-opacity": 1 });
//		this.drawText(x+50, y, "built mines", a);

		for (var i = 0; i < vgap.notes.length; i++) {
			var note = vgap.notes[i];
			switch (note.targettype) {
			case 1: // planet
				var planet = vgap.getPlanet(note.targetid);
//				this.drawCircle(planet.x, planet.y, 15 * this.zoom, { stroke: "yellow", "stroke-width": 4 * this.zoom, "stroke-opacity": 1 });
				
				if (planet && planet.ownerid == vgap.player.id ) {
					x = planet.x;
					y = planet.y;
					var built = 0;
					var body = note.body;
					body = body.toString();
					var found = body.match(/[a-z]+:\d*/ig);			// note can contain commands in any order and multiple copies of each like:
																	// factories:50<cr>defense:50<cr>factories:100<cr>mines:100<cr>defense:100<cr>factories:999
																	// 999 just keeps building to max
					
					for(var j=0; found != null && j<found.length; ++j) {	
						var ex = found[j].toString();
						var build = ex.match(/\d+/);
						build = Number(build);

						if (ex.match(/factories:/i) && planet.defense >= 20) {	// build factories based on planet notes "factories:xxx"
							built += vgap.map.buildFactories(planet, build);
//							if (planet.factories >= build)						// i want to delete completed builds but it isn't working
//								body.replace(ex, "");							// doesn't really matter since they wouldn't do anything anyway
						}
						if (ex.match(/mines:/i) && planet.defense >= 20) {		// build mines based on planet notes "mines:xxx"
							built += vgap.map.buildMines(planet, build);
//							if (planet.mines >= build)
//								body.replace(ex, "");
						}
						if (ex.match(/defense:/i)) {							// build defense based on planet notes "defense:xxx"
							built += vgap.map.buildDefense(planet, build);	
//							if (planet.defense >= build)
//								body.replace(ex, "");
						}
						if (ex.match(/done:/i)) {								// no more building so just set ready
							++built;
							this.drawCircle(planet.x, planet.y, 15 * this.zoom, { stroke: "yellow", "stroke-width": 4 * this.zoom, "stroke-opacity": 1 });
						}
					}
					
					if (built > 0) {
						planet.readystatus = 1;
						planet.changed = 1;
						vgap.map.savePlanet(planet);
					}
				}
				break;
				
				case 2: // ship
				var ship = vgap.getShip(note.targetid);
				if (ship && ship.ownerid == vgap.player.id ) {
					var x = ship.x;
					var y = ship.y;
					this.drawCircle(x, y, 20 * this.zoom, { stroke: "orange", "stroke-width": 4 * this.zoom, "stroke-opacity": 1 });
					var found;
					if (found = note.body.match(/hyp:\d+/i)) {		// automatically HYP to next planet based on notes  "HYP:xxx"
						found = found.toString();
						var id = found.match(/\d+/);
						id = Number(id);
						var planet = vgap.planets[id-1];
						ship.targetx = planet.x;
						ship.targety = planet.y;
						ship.target = planet;
						this.drawLine(ship.x, ship.y, ship.targetx, ship.targety, { stroke: "orange", "stroke-width": 4 * this.zoom, "stroke-opacity": 1 });
						ship.friendlycode = "HYP";
						ship.mission = 10;
						ship.redystatus = 1;
						ship.changed = 1;
					}
				}
				break;
				
//				case 3: // starbase
//				var object = vgap.getStarbase(note.targetid);
//				if (object && object.ownerid == vgap.player.id ) {
//				var x = object.x;
//				var y = object.y;
//				this.drawCircle(x, y, 20 * this.zoom, { stroke: "orange", "stroke-width": 4 * this.zoom, "stroke-opacity": 1 });
//				}
//				break;

			}


		}
	};

	vgapMap.prototype.resetCompleted = function () 
	{
		for (var i = 0; i < vgap.myplanets.length; i++) {
			var planet = vgap.myplanets[i];
			if (planet.readystatus && planet.clans == 2) {
				planet.readystatus = 0;
				planet.changed = 1;
				this.drawCircle(planet.x, planet.y, 11 * this.zoom, { stroke: "green", "stroke-width": 4 * this.zoom, "stroke-opacity": 1 });
			}
		}
	};
}
	
var script = document.createElement("script");
script.type = "application/javascript";
script.textContent = "(" + wrapper + ")();";

document.body.appendChild(script);
