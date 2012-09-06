// ==UserScript==
// @name          Planets.nu game history
// @description   Show game history
// @include       http://planets.nu/home
// @include       http://planets.nu/games/*
// @include       http://play.planets.nu/*
// @homepage      http://planets.nu/discussion/utility-script-game-history
// @version 1.0
// ==/UserScript==

function wrapper () { // history.js

	var oldLoadControls = vgapMap.prototype.loadControls; 
	vgapMap.prototype.loadControls = function () {

		oldLoadControls.apply(this, arguments);

		var b = "";
        b += "<li onclick='vgap.loadCompleteHistory();'>Load History</li>";
        
        $("#MapTools li:contains('Measure')").after(b);
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
}
	
var script = document.createElement("script");
script.type = "application/javascript";
script.textContent = "(" + wrapper + ")();";

document.body.appendChild(script);
