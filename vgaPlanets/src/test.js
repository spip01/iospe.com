//==UserScript==
//@name          Clan Display and Temperature addon for Planets.nu Starmap v1.1
//@description   Add Clan, Temperature, and Ownership display added to Map Tools within Planets.nu map
// @include       http://*.planets.nu/*
//@version 0.0
//==/UserScript==

function wrapper () { // test.js

	var oldLoadControls = vgapMap.prototype.loadControls; 
	vgapMap.prototype.loadControls = function () {

		oldLoadControls.apply(this, arguments);
           
        var b = "";
        b += "<li onclick='vgap.map.execNotes();'>exec Notes</li>";
        b += "<li onclick='vgap.map.useNotes(false);'>find Default Notes</li>";
        
        $("#MapTools li:contains('Clear')").before(b);
        
        localStorage.showCargoOnCombat = "false";
        
        vgap.map.useNotes(false);	// find defaults
	};
    		
	vgapMap.prototype.execNotes = function () {
		if (vgap.myPlanetDefault != undefined)
			for (var i = 0; i < vgap.myplanets.length; i++) 
				vgap.map.execPlanetNote(vgap.myPlanetDefault, vgap.myplanets[i]);
		
		vgap.map.useNotes(true);
	};

	vgapMap.prototype.setColonistTaxHappy = function (planet, happy) {
		var tax = vgap.map.colonistTaxAmount(planet);
		planet.colhappychange = happy - planet.colhappypoints;
		planet.colonisttaxrate = vgap.map.colonistTaxRateFHappy(planet);
		
		if (tax != vgap.map.colonistTaxAmount(planet)) 
			planet.changed = 1;
	};

	vgapMap.prototype.setColonistTaxRate = function (planet, rate) {
		if (planet.colonisttaxrate != rate) {
			planet.colonisttaxrate = rate;
			planet.colhappychange = vgap.colonistTaxChange(planet);
			planet.changed = 1;
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
		
		if (tax != planet.nativetaxvalue)
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

	
	vgapMap.prototype.setFC = function(p, fc) {
		if (fc.keep != undefined) {
			for (var i=0; i<fc.keep.length; ++i)
				if (p.friendlycode.match("/"+fc.keep+"/i"))
					return;
		}
		else if (fc["set"] != undefined) {
			if (fc["set"].match(/defense/i)) {
				for (var i in fc["set"].defense)
					if (p.defense >= fc["set"].defense[i])
						p.friendlycode = i;
			}
			else if (fc["set"].match(/random/i)) {
			var r = Math.random() * 750 + 250;
			r = Math.floor(r);
				p.friendlycode = r.toString();
			}
			else
				p.friendlycode = fc["set"];

			p.changed = 1;
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
			var max = vgap.map.maxBuildings(planet, 100);
			build = Math.min(count - planet.factories, planet.supplies, 
					Math.floor((planet.supplies + planet.megacredits) / 4), 
					max - planet.factories);			// maximum number of factories we can build

			if (build > 0) {
				planet.builtfactories += build;
				planet.factories += build;
				planet.supplies -= build;

				vgap.map.spendMC(planet, 3 * build);	// deduct supplies & MC
				planet.changed = 1;
			}
		}

		return build;
	};

	vgapMap.prototype.buildDefenses = function (planet, count)
	{
		var build = 0;
		if (planet.defense < count) {	            
			var max = vgap.map.maxBuildings(planet, 50);
			build = Math.min(count - planet.defense, planet.supplies, 
					Math.floor((planet.supplies + planet.megacredits) / 11), 
					max - planet.defense);			// maximum number we can build

			if (build > 0) {
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
			var max = vgap.map.maxBuildings(planet, 200);
			build = Math.min(count - planet.mines, planet.supplies, 
					Math.floor((planet.supplies + planet.megacredits) / 5), 
					max - planet.mines);				// maximum number of factories we can build

			if (build > 0) {
				planet.builtmines += build;
				planet.mines += build;
				planet.supplies -= build;

				vgap.map.spendMC(planet, 4 * build);
				planet.changed = 1;
			}
		}
		return build;
	};

	vgapMap.prototype.useNotes = function (use) {

		var findPlanetDefault = false;
		
		for (var i = 0; i < vgap.notes.length && (use || !findPlanetDefault); i++) {
			var note = vgap.notes[i];
			var body = note.body;
			
			switch (note.targettype) {
			case 1: // planet
				var planet = vgap.getPlanet(note.targetid);
				
				if (planet && planet.ownerid == vgap.player.id ) {
                    try {
					var jn = JSON.parse(body);
                        if (!use) {
					if (jn["default"] != undefined) {
	                            jn = jn["default"];
	                            vgap.myPlanetDefault = jn;
	                            findPlanetDefault = true;
	                        }
						continue;
					}
	
							vgap.map.execPlanetNote(jn, planet);
					}
					catch (e) {
						console.log(e);
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
        var g = vgap.map.screenX(planet.x);
        var h = vgap.map.screenY(planet.y);

		if (jn["tax-happy"] != undefined) {
			vgap.map.setColonistTaxHappy(planet, Number(jn["tax-happy"]));
		}
		
		if (jn["tax-growth"] != undefined) {
			if (planet.happypoints >= 90)
				vgap.map.setColonistTaxHappy(planet, 70);
			else
				vgap.map.setColonistTaxRate(planet, 0);
		}
		
		if (jn["nattax-happy"] != undefined) {
			vgap.map.setNativeTaxHappy(planet, Number(jn["nattax-happy"]));
		}
		
		if (jn.friendlycode != undefined) 
			vgap.map.setFC(planet, jn.friendlycode);
		
		if (jn.build != undefined) {
			var built = 0;
			for (var i=0; i<jn.build.length && built == 0; ++i) {
				var b = jn.build[i];

				if (b.factories != undefined) 
					built += vgap.map.buildFactories(planet, Number(b.factories));
				
				if (b.mines != undefined) 
					built += vgap.map.buildMines(planet,  Number(b.mines));
				
				if (b.defenses != undefined) 
					built += vgap.map.buildDefenses(planet,  Number(b.defenses));
			}
			
			if (built > 0) {
				planet.readystatus = 1;
				this.explosions.push(this.paper.circle(g, h, 16 * this.zoom).attr({stroke: "orange", "stroke-width": 4 * this.zoom,"stroke-opacity": 1}));
			}
		}

		if (planet.changed > 0) {
		vgap.save();
			this.explosions.push(this.paper.circle(g, h, 12 * this.zoom).attr({ stroke: "yellow", "stroke-width": 4 * this.zoom, "stroke-opacity": 1 }));
		}
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
