//==UserScript==
//@name          Clan Display and Temperature addon for Planets.nu Starmap v1.1
//@description   Add Clan, Temperature, and Ownership display added to Map Tools within Planets.nu map
//@include       http://planets.nu/home
//@include       http://planets.nu/games/*
//@include       http://play.planets.nu/*
//@version 1.1
//==/UserScript==

function wrapper () { // test.js

	var oldLoadControls = vgapMap.prototype.loadControls; 
	vgapMap.prototype.loadControls = function () {

		oldLoadControls.apply(this, arguments);

		var b = "";
        b += "<li onclick='vgap.map.showMinerals();'>Show Minerals</li>";
        b += "<li onclick='vgap.map.showSupplies();'>Show Supplies</li>";
        
        $("#MapTools li:contains('Measure')").after(b);
           
        b = "";
        b += "<li onclick='vgap.map.randomizeFC();'>Rand FC</li>";
        b += "<li onclick='vgap.map.setTaxes();'>Set Taxes</li>";
        b += "<li onclick='vgap.map.setSmallComplete();'>Set Complete</li>";
        b += "<li onclick='vgap.map.useNotes();'>Use Notes</li>";
        
        $("#MapTools li:contains('Clear')").before(b);

        $(".ShowMinerals").remove();
   	};
    	
	vgapMap.prototype.setSmallComplete = function () 
	{
		var c = { "stroke-width": 4 * this.zoom, "stroke-opacity": 1 };
		
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
				
		        var g = vgap.map.screenX(x);
		        var h = vgap.map.screenY(y);

				if (planet.factories >= vgap.map.maxBuildings(planet, 100) && planet.defense >= vgap.map.maxBuildings(planet, 50) && planet.mines >= vgap.map.maxBuildings(planet, 200)) {
					planet.readystatus = 1;
					planet.changed = 1;
					c["stroke"] = "purple";
					this.special.push(this.paper.circle(g, h, 35 * this.zoom).attr(c));
				}
				
				if (planet.clans < 5 || planet.supplies < 5 || planet.supplies + planet.megacredits < 20) {		// nothing to do here
					planet.readystatus = 1;
					planet.changed = 1;
				}
				
				if (planet.readystatus > 0) {
					c["stroke"] = "orange";
					this.special.push(this.paper.circle(g, h, 15 * this.zoom).attr(c));
				}
			}
		}

		for (var i = 0; i < vgap.myships.length; i++) {
			var ship = vgap.myships[i];
			if (ship.readystatus == 0) {
				
		        var g = vgap.map.screenX(ship.x);
		        var h = vgap.map.screenY(ship.y);

				var shipFC = Number(ship.friendlycode);
				if (isNaN(ship.friendlycode) || shipFC < 250) {	// generate new FC if the old FC was HYP or < 250 which could be a chunnel
					var b = Math.random() * 750 + 250;
					b = Math.floor(b);
					ship.friendlycode = b.toString();
					ship.changed = 1;
					c["stroke"] = "red";
					this.special.push(this.paper.circle(g, h, 10 * this.zoom).attr(c));
				}
				
				var dist = vgap.map.getDist(ship.x, ship.y, ship.targetx, ship.targety);
//				if (ship.hullid == 51 && dist == 0 && ship.target.isPlanet) {		// borg probe, if the planet is unowned drop clans to caputure
//					var planet = ship.target;
//					if (planet.nativetype != 5) {
//						if (planet.ownerid == 0 && ship.clans != 0) {	// drop all if natives exist & set ship ready
//							if (planet.nativeclans != 0) {
//								ship.transferclans = ship.clans;
//								ship.clans = 0;
//								ship.readystatus = 1;
//							}
//							else {										// just 1 if planet is empty	
//								ship.transferclans = 1;
//								ship.clans -= 1;
//								if (ship.supplies >= 1) {
//									ship.transfersupplies = 1;
//									ship.supplies -= 1;
//								}
//							}
//							
//							c["stroke"] = "blue";
//							this.special.push(this.paper.circle(g, h, 16 * this.zoom).attr(c));
//						}
//						
//						if (planet.ownerid == vgap.player.id && planet.factories == 0 && ship.supplies > 0 && ship.megacredits > 0) {
//							planet.supplies += ship.supplies;
//							ship.transfersupplies = ship.supplies;
//							ship.supplies = 0;
//							planet.megacredits += ship.megacredits;
//							ship.transfermegacredits = ship.megacredits;
//							ship.megacredits = 0;
//							planet.changed = 1;
//						}
//						
//						if (ship.transferclans > 0 || ship.transfersupplies > 0 || ship.transfermegacredits > 0) {
//							ship.transfertargettype = 1;
//							ship.transfertargetid = planet.id;
//							ship.changed = 1;
//							var built = vgap.map.buildFactories(planet, 15);
//							
//							if (built > 0) {
//								ship.readystatus = 1;
//								planet.readystatus = 1;
//								planet.changed = 1;
//								c["stroke"] = "cyan";
//								this.special.push(this.paper.circle(g, h, 24 * this.zoom).attr(c));
//							}
//						}
//					}
//				}
				
				if (ship.target && ship.target.isPlanet && dist > 0 && dist <= ship.warp * ship.warp + 3) {	// 1 turn away target set
					ship.readystatus = 1;
					ship.changed = 1;
				}
				
				if (ship.readystatus > 0) {
					c["stroke"] = "orange";
					this.special.push(this.paper.circle(g, h, 15 * this.zoom).attr(c));
				}
			}
		}
		
		vgap.map.savePlanets();
		vgap.map.saveShips();
	};

	vgapMap.prototype.setTaxes = function()
	{
		var happychange;
		var happypoints;
		var taxrate;
		var c = { "stroke-width": 4 * this.zoom, "stroke-opacity": 1 };
		
		for (var i = 0; i < vgap.myplanets.length; i++) {
			var planet = vgap.myplanets[i];
	        var g = vgap.map.screenX(planet.x);
	        var h = vgap.map.screenY(planet.y);
			
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
					c["stroke"] = "yellow";
					this.special.push(this.paper.circle(g, h, 20 * this.zoom).attr(c));
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
				c["stroke"] = "orange";
				this.special.push(this.paper.circle(g, h, 15 * this.zoom).attr(c));
			}
		}
		
		vgap.map.savePlanets();
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
		var c = { "stroke-width": 2, "stroke-opacity": 1 };
		for (var i=0; i < vgap.myplanets.length; ++i) {
			var planet = vgap.myplanets[i];
	        var g = vgap.map.screenX(planet.x);
	        var h = vgap.map.screenY(planet.y);
						
			if (planet.neutronium > 400) {
				c["stroke"] = vgap.dash.getColorSlot(1);
				this.special.push(this.paper.circle(g, h, (26 + Math.sqrt(planet.neutronium - 400)) * this.zoom).attr(c));
			}
			if (planet.duranium > 400) {
				c["stroke"] = vgap.dash.getColorSlot(3);
				this.special.push(this.paper.circle(g, h, (26 + Math.sqrt(planet.duranium - 400)) * this.zoom).attr(c));
			}
			if (planet.tritanium > 400) {
				c["stroke"] = vgap.dash.getColorSlot(5);
				this.special.push(this.paper.circle(g, h, (26 + Math.sqrt(planet.tritanium - 400)) * this.zoom).attr(c));
			}
			if (planet.molybdenum > 400) {
				c["stroke"] = vgap.dash.getColorSlot(7);
				this.special.push(this.paper.circle(g, h, (26 + Math.sqrt(planet.molybdenum - 400)) * this.zoom).attr(c));
			}
		}
	};

	vgapMap.prototype.showSupplies = function () 
	{
		var c = { "stroke-width": 2, "stroke-opacity": 1 };
		for (var i=0; i<vgap.myplanets.length; ++i) {
			var planet = vgap.myplanets[i];
	        var g = vgap.map.screenX(planet.x);
	        var h = vgap.map.screenY(planet.y);
			
			if (planet.megacredits + planet.supplies > 1000) {
				c["stroke"] = vgap.dash.getColorSlot(9);
				this.special.push(this.paper.circle(g, h, (10 + Math.sqrt(planet.megacredits)) * this.zoom).attr(c));
				c["stroke"] = vgap.dash.getColorSlot(11);
				this.special.push(this.paper.circle(g, h, (10 + Math.sqrt(planet.supplies)) * this.zoom).attr(c));
			}
		}
	};

	vgapMap.prototype.showColonist = function () 
	{
		for (var i=0; i<vgap.myplanets.length; ++i) {
			var planet = vgap.myplanets[i];
	        var g = vgap.map.screenX(planet.x);
	        var h = vgap.map.screenY(planet.y);
			var c = { "stroke-width": 2, "stroke-opacity": 1 };

			c["stroke"] = "red";
			this.special.push(this.paper.circle(g, h, (10 + Math.log(planet.clans)) * this.zoom).attr(c));
			c["stroke"] = "orange";
			this.special.push(this.paper.circle(g, h, (10 + Math.log(planet.nativeclans)) * this.zoom).attr(c));
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
		var c = { "stroke-width": 2, "stroke-opacity": 1 };
		
		for (var i = 0; i < vgap.myplanets.length; i++) {
			var planet = vgap.myplanets[i];
			if (planet.readystatus == 0) {
		        var g = vgap.map.screenX(planet.x);
		        var h = vgap.map.screenY(planet.y);
				var b = Math.random() * 750 + 250;
				b = Math.floor(b);
				planet.friendlycode = b.toString();
				planet.changed = 1;
				c["stroke"] = "red";
				this.special.push(this.paper.circle(g, h, 10 * this.zoom).attr(c));
			}
		}
		
		for (var i = 0; i < vgap.myships.length; i++) {
			var ship = vgap.myships[i];
			if (ship.readystatus == 0) {
		        var g = vgap.map.screenX(ship.x);
		        var h = vgap.map.screenY(ship.y);
				var b = Math.random() * 750 + 250;
				b = Math.floor(b);
				ship.friendlycode = b.toString();
				ship.changed = 1;
				c["stroke"] = "orange";
				this.special.push(this.paper.circle(g, h, 13 * this.zoom).attr(c));
			}
		}
		
		vgap.map.savePlanets();
		vgap.map.saveShips();
	};
	
	vgapMap.prototype.mining = function(planet, percent, inground) {
		var rate = vgap.miningRate(planet, percent);
	    return Math.min(inground, rate);
	};
	
	dataObject.prototype.reset = function() {
        this.data = "";
        this.add("gameid", vgap.gameId);
        this.add("playerid", vgap.player.id);
        this.add("turn", vgap.settings.turn);
        this.add("version", vgap.version);
        this.add("savekey", vgap.savekey);
        this.add("apikey", vgap.apikey);
        this.add("saveindex", 2);
	};

	vgapMap.prototype.savePlanets = function()			// taken from vgap planet save() because it saves everything not just 1 planet
	{
	    var b = new dataObject();
	    b.reset();
        var keycount = 10;
        
		for (var i = 0; i < vgap.myplanets.length; i++) {
			var planet = vgap.myplanets[i];
			if (planet.changed == 1) {
				b.add("Planet" + planet.id, vgap.serializePlanet(planet), false);
				planet.changed = 2;
				++keycount;
				
				if (vgap.saveInProgress == 0) {		// ignoring this causes an error
			        b.add("keycount", keycount);
				    vgap.saveInProgress = 2;
				    vgap.request("/game/save", b, function(f) { vgap.processSave(f); });
					keycount = 10;
					b.reset();
				}
			}
		}
	};

	vgapMap.prototype.saveShips = function()			// taken from vgap planet save() because it saves everything not just 1 planet
	{
	    var b = new dataObject();
	    b.reset();
        var keycount = 10;
        
		for (var i = 0; i < vgap.myships.length; i++) {
			var ship = vgap.myships[i];
			if (ship.changed == 1) {
				b.add("Ship" + ship.id, vgap.serializeShip(ship), false);
				ship.changed = 2;
				++keycount;
				
				if (vgap.saveInProgress == 0) {		// ignoring this causes an error
			        b.add("keycount", keycount);
				    vgap.saveInProgress = 2;
				    console.log(b);
				    vgap.request("/game/save", b, function(f) { vgap.processSave(f); });
					keycount = 10;
					b.reset();
				}
			}
		}
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
		
		if (planet.factories < count) {	
	        var g = vgap.map.screenX(planet.x);
	        var h = vgap.map.screenY(planet.y);
			var max = vgap.map.maxBuildings(planet, 100);
			build = Math.min(count - planet.factories, planet.supplies, 
					Math.floor((planet.supplies + planet.megacredits) / 4), 
					max - planet.factories);			// maximum number of factories we can build

			if (build > 0) {
				this.special.push(this.paper.circle(g, h, 25 * this.zoom).attr({ stroke: "green", "stroke-width": 4 * this.zoom, "stroke-opacity": 1 }));

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
		if (planet.defense < count) {	            
	        var g = vgap.map.screenX(planet.x);
	        var h = vgap.map.screenY(planet.y);
			var max = vgap.map.maxBuildings(planet, 50);
			build = Math.min(count - planet.defense, planet.supplies, 
					Math.floor((planet.supplies + planet.megacredits) / 11), 
					max - planet.defense);			// maximum number we can build

			if (build > 0) {
				this.special.push(this.paper.circle(g, h, 30 * this.zoom).attr({ stroke: "blue", "stroke-width": 4 * this.zoom, "stroke-opacity": 1 }));

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
		if (planet.mines < count) {	
	        var g = vgap.map.screenX(planet.x);
	        var h = vgap.map.screenY(planet.y);
			var max = vgap.map.maxBuildings(planet, 200);
			build = Math.min(count - planet.mines, planet.supplies, 
					Math.floor((planet.supplies + planet.megacredits) / 5), 
					max - planet.mines);				// maximum number of factories we can build

			if (build > 0) {
				this.special.push(this.paper.circle(g, h, 35 * this.zoom).attr({ stroke: "purple", "stroke-width": 4 * this.zoom, "stroke-opacity": 1 }));

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
		for (var i = 0; i < vgap.notes.length; i++) {
			var note = vgap.notes[i];
			switch (note.targettype) {
			case 1: // planet
				var planet = vgap.getPlanet(note.targetid);
				
				if (planet && planet.ownerid == vgap.player.id ) {
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

						if (ex.match(/factories:/i) && planet.defense >= 20) 	// build factories based on planet notes "factories:xxx"
							built += vgap.map.buildFactories(planet, build);

						if (ex.match(/mines:/i) && planet.defense >= 20) 		// build mines based on planet notes "mines:xxx"
							built += vgap.map.buildMines(planet, build);

						if (ex.match(/defense:/i)) 							// build defense based on planet notes "defense:xxx"
							built += vgap.map.buildDefense(planet, build);	

						if (ex.match(/done:/i)) {								// no more building so just set ready
					        var g = vgap.map.screenX(planet.x);
					        var h = vgap.map.screenY(planet.y);
							++built;
							this.special.push(this.paper.circle(g, h, 15 * this.zoom).attr({ stroke: "yellow", "stroke-width": 4 * this.zoom, "stroke-opacity": 1 }));
						}
					}
					
					if (built > 0) {
						planet.readystatus = 1;
						planet.changed = 1;
						vgap.map.savePlanet(planet);
					}
				}
				break;
				
//				case 2: // ship
//				var ship = vgap.getShip(note.targetid);
//				if (ship && ship.ownerid == vgap.player.id ) {
//					var x = ship.x;
//					var y = ship.y;
//					this.special.push(this.drawCircle(x, y, 20 * this.zoom, { stroke: "orange", "stroke-width": 4 * this.zoom, "stroke-opacity": 1 }));
//					var found;
//					if (found = note.body.match(/hyp:\d+/i)) {		// automatically HYP to next planet based on notes  "HYP:xxx"
//						found = found.toString();
//						var id = found.match(/\d+/);
//						id = Number(id);
//						var planet = vgap.planets[id-1];
//						ship.targetx = planet.x;
//						ship.targety = planet.y;
//						ship.target = planet;
//						//this.special.push(this.drawLine(ship.x, ship.y, ship.targetx, ship.targety, { stroke: "orange", "stroke-width": 4 * this.zoom, "stroke-opacity": 1 }));
//						ship.friendlycode = "HYP";
//						ship.mission = 10;
//						ship.redystatus = 1;
//						ship.changed = 1;
//					}
//				}
//				break;
				
//				case 3: // starbase
//				var object = vgap.getStarbase(note.targetid);
//				if (object && object.ownerid == vgap.player.id ) {
//				var x = object.x;
//				var y = object.y;
//				//this.special.push(this.drawCircle(x, y, 20 * this.zoom, { stroke: "orange", "stroke-width": 4 * this.zoom, "stroke-opacity": 1 }));
//				}
//				break;

			}


		}
	};

//	vgapMap.prototype.resetCompleted = function () 
//	{
//		for (var i = 0; i < vgap.myplanets.length; i++) {
//			var planet = vgap.myplanets[i];
//			if (planet.readystatus && planet.clans == 2) {
//				planet.readystatus = 0;
//				planet.changed = 1;
//				//this.special.push(this.drawCircle(planet.x, planet.y, 11 * this.zoom, { stroke: "green", "stroke-width": 4 * this.zoom, "stroke-opacity": 1 }));
//			}
//		}
//	};
	
	var oldDeselectAll = vgaPlanets.prototype.deselectAll;
	
	vgaPlanets.prototype.deselectAll = function() {
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
