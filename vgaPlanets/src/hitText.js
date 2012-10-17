//==UserScript==
//@name          planets.nu hit text
//@description   add more information and options to hit text
//@include       http://planets.nu/home
//@include       http://planets.nu/games/*
//@include       http://play.planets.nu/*
//@version 1.0
//==/UserScript==

function wrapper () { // hitText.js
	
	vgapMap.prototype.hitTextBox = function(hit) {
		
		/*************** need option for this ***************/
        localStorage.showCargoOnCombat = "false";
		
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
	            //txt += this.hitText(hit, hit.isPlanet);
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
	            
		        html += "<tr><td>Neutronium:</td><td>&nbsp;" + gsv(ship.neutronium) + "/" + hull.fueltank + " </td>";
	            if (ship.clans != 0)
		            html += "<td>&nbsp;Clans:</td><td>&nbsp;" + gsv(ship.clans) + "</td>";
	            html += "</tr>"
	            if (ship.duranium + ship.tritanium + ship.molybdenum > 0) {
		            html += "<tr><td>Duranium:</td><td>&nbsp;" + gsv(ship.duranium) + "</td>";
		            html += "<td>&nbsp;Supplies:</td><td>&nbsp;" + gsv(ship.supplies) + "</td></tr>";
		            html += "<tr><td>Tritanium:</td><td>&nbsp;" + gsv(ship.tritanium) + "</td>";
		            html += "<td>&nbsp;Megacredits:</td><td>&nbsp;" + gsv(ship.megacredits) + "</td></tr>";
		            html += "<tr><td>Molybdenum:</td><td>&nbsp;" + gsv(ship.molybdenum) + "</td>";
	            }
	            else if (ship.supplies + ship.megacredits > 0) {
		            html += "<tr><td>Supplies:</td><td>&nbsp;" + gsv(ship.supplies) + "</td>";
		            html += "<td>&nbsp;Megacredits:</td><td>&nbsp;" + gsv(ship.megacredits) + "</td></tr><tr>";
	            }
	            
	            if (ship.torps > 0 || ship.bays > 0) {
	                var ammoText = "&nbsp;Fighters";
	                if (ship.torps > 0)
	                    ammoText = "&nbsp;Torpedos lvl" + gsv(ship.torpedoid);
	                html += "<td>" + ammoText + ": </td><td>&nbsp;" + gsv(ship.ammo) + "</td></tr>";
	            }
	            
	            //html += this.hitText(hit, hit.isPlanet);
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
	            //html += this.hitText(hit, hit.isPlanet);
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

}
	
var script = document.createElement("script");
script.type = "application/javascript";
script.textContent = "(" + wrapper + ")();";

document.body.appendChild(script);
