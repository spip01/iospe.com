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
        b += "<li onclick='vgap.map.randomizeFC();'>Rand FC</li>";
        b += "<li onclick='vgap.map.setTaxes();'>Set Taxes</li>";
        b += "<li onclick='vgap.map.setSmallComplete();'>Set Complete</li>";
        b += "<li onclick='vgap.map.useNotes();'>Use Notes</li>";
        
        $("#MapTools li:contains('Clear')").before(b);
        
        localStorage.showCargoOnCombat = "false";
        
        vgap.map.findDefaultNote();
	};
    		
	vgapMap.prototype.setSmallComplete = function () {
		var c = { "stroke-width": 2 * this.zoom, "stroke-opacity": 1 };
		
		for (var i = 0; i < vgap.myplanets.length; i++) {
			var planet = vgap.myplanets[i];
			x = planet.x;
			y = planet.y;
			
			if (planet.readystatus == 0) {
				if (vgap.shipMap[planet.x+","+planet.y] === undefined) {										// no ships so complete build
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
					c["stroke"] = "blue";
					this.explosions.push(this.paper.circle(g, h, 22 * this.zoom).attr(c));
				}
				
				if (planet.clans < 5 || planet.supplies < 5 || planet.supplies + planet.megacredits < 20) {		// nothing to do here
					planet.readystatus = 1;
					planet.changed = 1;
					c["stroke"] = "purple";
					this.explosions.push(this.paper.circle(g, h, 19 * this.zoom).attr(c));
				}
				
				if (planet.readystatus > 0) {
					c["stroke"] = "orange";
					this.explosions.push(this.paper.circle(g, h, 16 * this.zoom).attr(c));
				}
				
				if (planet.changed == 1)
					vgap.save();
			}
		}

//		for (var i = 0; i < vgap.myships.length; i++) {
//			var ship = vgap.myships[i];
//			if (ship.readystatus == 0) {
//				
//		        var g = vgap.map.screenX(ship.x);
//		        var h = vgap.map.screenY(ship.y);
//
//			}
//		}
		
//		vgap.map.savePlanets();
//		vgap.map.saveShips();
	};

	vgapMap.prototype.setTaxes = function()
	{
		for (var i = 0; i < vgap.myplanets.length; i++) {
			var planet = vgap.myplanets[i];
			
			if (planet.nativeclans != 0) 
				vgap.map.setNativeTaxHappy(planet, 70);
	
			happychange = planet.colhappychange;
			happypoints = planet.colonisthappypoints;
			taxrate = planet.colonisttaxrate;
			var coltaxvalue = vgap.map.colonistTaxAmount(planet);
				
			while (happypoints + happychange <= 30) {	// calculate max tax happy tax rate
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
			}
			
			if (planet.changed == 1) {
				vgap.save();
				
		        var g = vgap.map.screenX(planet.x);
		        var h = vgap.map.screenY(planet.y);
				
				var c = { "stroke":"orange", "stroke-width": 4 * this.zoom, "stroke-opacity": 1 };
				this.explosions.push(this.paper.circle(g, h, 28 * this.zoom).attr(c));
			}
		}
	};
	
	vgapMap.prototype.setNativeTaxHappy = function (planet, happy) {
		var tax = planet.nativetaxvalue;
		
		planet.nativehappychange = happy - planet.nativehappypoints;
		planet.nativetaxrate = vgap.map.nativeTaxRateFHappy(planet);
		if (planet.nativetaxrate > 20) {
	        var b = vgap.getPlayer(planet.ownerid);
            if (b.raceid == 6)
            	planet.nativetaxrate = 20;
		}
		planet.nativetaxvalue = vgap.map.nativeTaxAmount(planet);
		
		if (planet.nativetaxvalue > planet.clans) { 
			planet.nativetaxvalue = planet.clans;
			planet.nativetaxrate = vgap.map.nativeTaxRateFAmount(planet);
			planet.nativehappychange = vgap.nativeTaxChange(planet);
		}
		
		if (tax != planet.nativetaxvalue) {
			planet.changed = 1;
	};
	
	vgapMap.prototype.nativeTaxRateFHappy = function (planet) {
		var tx = - Math.floor((planet.nativehappychange*100 - 1000 + Math.sqrt(planet.nativeclans) + (planet.factories + planet.mines)/2 + 50*(10-planet.nativegovernment)) / 85); 
		return tx;
	};
	
	vgapMap.prototype.nativeTaxRateFAmount = function (planet) {
		var tx = Math.floor(planet.nativetaxvalue / planet.nativegovernment / planet.nativeclans * 200000);
		return tx;
	};
	
	vgapMap.prototype.colonistTaxRateFHappy = function (planet) {
		var tx = - Math.floor((planet.colhappychange * 100 - 1000 + Math.sqrt(planet.clans) + Math.abs(50 - planet.temp)*3 + (planet.factories + planet.mines)/3) / 80); 
		return tx;
	};
	
	vgapMap.prototype.nativeTaxAmount = function (planet) 	// taken from vgap screen because it uses an undefined this when I need it
	{
		var e = Math.round(planet.nativetaxrate * planet.nativegovernment * 20 / 100 * planet.nativeclans / 1000);

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

	vgapMap.prototype.hitTextBox = function(hit) {
	    var txt = "";
	    if (hit.isPlanet) { //planet
	        txt += "<div class='ItemSelectionBox minCorrection'>";
	    	txt += "<span>";
	        if (hit.ownerid == vgap.player.id && hit.readystatus > 0)
		        txt += "<span class='GoodText'>";
		    else
		    	txt += "<span>";
	        txt += hit.id + ": " + hit.name + "</span>";
	        if (hit.temp != -1)
	            txt += "<span style='float:right;'>Temp: " + hit.temp + "</span></span>";
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
	            "<tr> <td>Molybdenum: </td><td>&nbsp;" + gsv(hit.molybdenum) + " / " + gsv(hit.groundmolybdenum) + " / " + gsv(mol) + "&nbsp;</td>" + "<td>Taxes: </td><td>&nbsp;" + gsv(hit.colonisttaxrate) + "&#37; / " + gsv(hit.nativetaxrate) + "&#37;</td></tr>";
	            //known planet
	            if (hit.ownerid != vgap.player.id && hit.ownerid != 0) {
	                var player = vgap.getPlayer(hit.ownerid);
	                var race = vgap.getRace(player.raceid);
	                txt += "<tr><td colspan='4'>" + race.name + " (" + player.username + ")</td></tr>";
	            }
	            txt += this.hitText(hit, hit.isPlanet);
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
	        html += "<span>";
	        if (ship.ownerid == vgap.player.id || vgap.fullallied(ship.ownerid)) {
	        	if (ship.readystatus > 0)
	        		html += "<span class='GoodText'>";
	        	else
	        		html += "<span>";
	        	html += ship.id + ": " + hull.name + "</span>";
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
	            if (localStorage.showCargoOnCombat == "true" || (ship.torps == 0 && ship.bays == 0 && ship.beams == 0)) {
		            html += "<tr><td>Neutronium:</td><td>&nbsp;" + gsv(ship.neutronium) + "/" + hull.fueltank + " </td><td>&nbsp;Clans:</td><td>&nbsp;" + gsv(ship.clans) + "</td></tr>";
		            html += "<tr><td>Duranium:</td><td>&nbsp;" + gsv(ship.duranium) + "</td><td>&nbsp;Supplies:</td><td>&nbsp;" + gsv(ship.supplies) + "</td></tr>";
		            html += "<tr><td>Tritanium:</td><td>&nbsp;" + gsv(ship.tritanium) + "</td><td>&nbsp;Megacredits:</td><td>&nbsp;" + gsv(ship.megacredits) + "</td></tr>";
		            html += "<tr><td>Molybdenum:</td><td>&nbsp;" + gsv(ship.molybdenum) + "</td>";
	            }
	            if (ship.torps > 0 || ship.bays > 0) {
	                var ammoText = "&nbsp;Fighters";
	                if (ship.torps > 0)
	                    ammoText = "&nbsp;Torpedos lvl" + gsv(ship.torpedoid);
	                html += "<td>" + ammoText + ": </td><td>&nbsp;" + gsv(ship.ammo) + "</td></tr>";
	            }
	            
	            html += this.hitText(hit, hit.isPlanet);
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
	            html += this.hitText(hit, hit.isPlanet);
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
	
	vgapMap.prototype.randomizeFC = function()	// random meaningless FC
	{
		for (var i = 0; i < vgap.myplanets.length; i++) {
			var planet = vgap.myplanets[i];
			var b = /att/i;
			var c = /nuk/i;
			if (!b.match(planet.friendlycode) && !c.match(planet.friendlycode))
				vgap.map.randFC(planet);
		}
		
		for (var i = 0; i < vgap.myships.length; i++) {
			var ship = vgap.myships[i];
			vgap.map.randFC(ship);
		}
	};
	
	vgapMap.prototype.randFC = function(i) {
		
		if (i.readystatus == 0) {
			var c = { stroke:"orange", "stroke-width": 2, "stroke-opacity": 1 };
	        var g = vgap.map.screenX(i.x);
	        var h = vgap.map.screenY(i.y);
			var b = Math.random() * 750 + 250;
			b = Math.floor(b);
			i.friendlycode = b.toString();
			i.changed = 1;
			var r = 13;
			if (i.isPlanet !== undefined && i.isPlanet == true)
				r -= 3;
			this.explosions.push(this.paper.circle(g, h, r * this.zoom).attr(c));
			vgap.save();
		}
	};
	
	vgapMap.prototype.mining = function(planet, percent, inground) {
		var rate = vgap.miningRate(planet, percent);
	    return Math.min(inground, rate);
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
				this.explosions.push(this.paper.circle(g, h, 31 * this.zoom).attr({ stroke: "green", "stroke-width": 2 * this.zoom, "stroke-opacity": 1 }));

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
				this.explosions.push(this.paper.circle(g, h, 34 * this.zoom).attr({ stroke: "blue", "stroke-width": 2 * this.zoom, "stroke-opacity": 1 }));

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
				this.explosions.push(this.paper.circle(g, h, 37 * this.zoom).attr({ stroke: "purple", "stroke-width": 2 * this.zoom, "stroke-opacity": 1 }));

				planet.builtmines += build;
				planet.mines += build;
				planet.supplies -= build;

				vgap.map.spendMC(planet, 4 * build);
				planet.changed = 1;
			}
		}
		return build;
	};

	vgapMap.prototype.findDefaultNote = function () {
		var foundPlanetDefault = false;

		for (var i = 0; i < vgap.notes.length; i++) {
			var note = vgap.notes[i];
			if (note.body == "")
				continue;
			
			switch (note.targettype) {
			case 1: // planet
//				"default":
//				{"tax-happy":"70","nattax":"20",
//				 "build":[{"defenses":"20","factories":"20","mines":"20"},
//					      {"factories":"60","mines":"60","defenses":"60"}]}
				if (foundPlanetDefault)
					continue;
				
				var planet = vgap.getPlanet(note.targetid);
				
				if (planet && planet.ownerid == vgap.player.id ) {
					var body = note.body;
					var jn = JSON.parse(body);
					if (jn["default"] != undefined) {
						vgap.myPlanetDefault = jn["default"];
						foundPlanetDefault = true;
						continue;
					}
				}
				break;
			case 2: // ship 
				break;
			case 3: // starbase 
				break;
			}
		}
	};
	
	vgapMap.prototype.useNotes = function () 
	{
		for (var i = 0; i < vgap.notes.length; i++) {
			var note = vgap.notes[i];
			var body = note.body;
			
			switch (note.targettype) {
			case 1: // planet
				var planet = vgap.getPlanet(note.targetid);
				
				if (planet && planet.ownerid == vgap.player.id ) {
					try {
						JSON.parse(body, function(jn, planet) {
							vgap.map.execPlanetNote(jn, planet);
						});
					}
					catch (e) {
						continue;
					}
				}
				break;
			case 2: // ship 
				break;
			case 3: // starbase 
				break;
			}
		}
	};

	vgapMap.prototype.execPlanetNote = function (jn, planet) {
//		"tax-happy":"70","nattax-happy":"70",
//		 "build":[{"defenses":"20","factories":"20","mines":"20"},
//			      {"factories":"60","mines":"60","defenses":"60"}]

		if (jn["tax-happy"] != undefined) {
			vgap.map.setColTaxHappy(planet, Number(jn["tax-happy"]));
		}
		
		if (jn["tax-growth"] != undefined) {
			if (planet.happypoints >= 90)
				vgap.map.setColTaxHappy(planet, 70);
			else
				vgap.map.setColTaxRate(planet, 0);
		}
		
		if (jn["nattax-happy"] != undefined) {
			vgap.map.setNativeTaxHappy(planet, Number(jn["nattax-happy"]));
		}
		
		if (jn["build"] != undefined) {
			var built = 0;
			for (var i=0; i<jn["build"].length && built == 0; ++i) {
				var b = jn["build"][i];

				if (b["factories"] != undefined) 
					built += vgap.map.buildFactories(planet, Number(b["factories"]));
				
				if (b["mines"] != undefined) 
					built += vgap.map.buildMines(planet, Number(b["mines"]));
				
				if (b["defenses"] != undefined) 
					built += vgap.map.buildDefenses(planet, Number(b["defenses"]));
			}
		}

		planet.redystatus = 1;
		planet.changed = 1;
		vgap.save();

		var x = this.screenX(planet.x);
		var y = this.screenY(planet.y);
		this.explosions.push(this.drawCircle(x, y, 20 * this.zoom, { stroke: "yellow", "stroke-width": 4 * this.zoom, "stroke-opacity": 1 }));

	};
	
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
