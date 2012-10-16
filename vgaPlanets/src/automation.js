//==UserScript==
//@name          planets.nu automation
//@description   add colony automation scripts from planet notes
//@include       http://planets.nu/home
//@include       http://planets.nu/games/*
//@include       http://play.planets.nu/*
//@version 1.0
//==/UserScript==

function wrapper () { // automation.js

	var oldLoadControls = vgapMap.prototype.loadControls; 
	vgapMap.prototype.loadControls = function () {

		oldLoadControls.apply(this, arguments);
           
        var b = "";
        b += "<li onclick='vgap.map.execNotes();'>Execute Notes</li>";
        $("#MapTools li:contains('Clear')").before(b);
	};
    		
	vgapMap.prototype.execNotes = function () {
		if (this.explosions !== undefined)
	        this.explosions.remove();
        this.explosions = this.paper.set();

        vgap.map.findNotes();

		for (var i = 0; i < vgap.myplanets.length; i++) 
			vgap.map.execPlanetNote(vgap.myplanets[i]);
	};

	vgapMap.prototype.setColonistTaxHappy = function (planet, happy) {
		var tax = vgap.map.colonistTaxAmount(planet);
		planet.colhappychange = happy - planet.colonisthappypoints;
		planet.colonisttaxrate = vgap.map.colonistTaxRateFHappy(planet);
		var newtax = vgap.map.colonistTaxAmount(planet);
		if (newtax > 0) {
			if (tax != newtax) {
				planet.changed = 1;
				console.log(planet.id+" col tax "+planet.nativetaxrate);
			}
		}
		else
			vgap.map.setColonistTaxRate(planet, 0);
	};

	vgapMap.prototype.setColonistTaxRate = function (planet, rate) {
		if (planet.colonisttaxrate != rate) {
			planet.colonisttaxrate = rate;
			if (vgap.map.colonistTaxAmount(planet) < 100)
				planet.colonisttaxrate = 0;
			planet.colhappychange = vgap.colonistTaxChange(planet);
			planet.changed = 1;
		}
	};

	vgapMap.prototype.setNativeTaxHappy = function (planet, happy) {
		var tax = planet.nativetaxvalue;
		
		planet.nativehappychange = happy - planet.nativehappypoints;
		planet.nativetaxrate = vgap.map.nativeTaxRateFHappy(planet);
		planet.nativetaxvalue = vgap.map.nativeTaxAmount(planet);
		
		if (planet.nativetaxrate > 20) {
	        var b = vgap.getPlayer(planet.ownerid);
            if (b.raceid == 6)
            	planet.nativetaxrate = 20;
            planet.nativehappychange = vgap.nativeTaxChange(planet);
    		planet.nativetaxvalue = vgap.map.nativeTaxAmount(planet);
		}
		
		if (planet.nativetaxvalue > planet.clans) { 
			planet.nativetaxvalue = planet.clans;
			planet.nativetaxrate = vgap.map.nativeTaxRateFAmount(planet);
			planet.nativehappychange = vgap.nativeTaxChange(planet);
		}
		
		if (planet.nativetaxrate > 20) {
	        var b = vgap.getPlayer(planet.ownerid);
            if (b.raceid == 6)
            	planet.nativetaxrate = 20;
            planet.nativehappychange = vgap.nativeTaxChange(planet);
			planet.nativetaxvalue = vgap.map.nativeTaxAmount(planet);
		}
		
		if (tax != planet.nativetaxvalue) {
			planet.changed = 1;
			console.log(planet.id+" nat tax "+planet.nativetaxrate);
		}
	};

	vgapMap.prototype.nativeTaxRateFHappy = function (planet) {
		var tx = - Math.floor((planet.nativehappychange*100 - 1000 + Math.sqrt(planet.nativeclans) + (planet.factories + planet.mines)/2 + 50*(10-planet.nativegovernment)) / 85); 
		return tx;
	};
	
	vgapMap.prototype.nativeTaxRateFAmount = function (planet) {
		tx = Math.floor((planet.nativetaxvalue / ((planet.nativeclans / 100) * (planet.nativegovernment / 5))) * 10);
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
					if (p.defense >= fc["set"].defense[i]) {
						p.friendlycode = i;
						console.log(p.id+" FC "+p.friendlycode);
					}
			}
			else if (fc["set"].match(/random/i)) {
				var r = Math.random() * 750 + 250;
				r = Math.floor(r);
				p.friendlycode = r.toString();
				console.log(p.id+" FC "+p.friendlycode);
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
				
				console.log(planet.id+" factories "+build);
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
				console.log(planet.id+" defense "+build);
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
				console.log(planet.id+" mines "+build);
			}
		}
		return build;
	};

	vgapMap.prototype.findNotes = function () {
		
		for (var i = 0; i < vgap.notes.length; i++) {
			var note = vgap.notes[i];
			var body = note.body;
			
			switch (note.targettype) {
			case 1: // planet
				var planet = vgap.getPlanet(note.targetid);
				
				if (planet && planet.ownerid == vgap.player.id ) {
                    try {
                        var jn = JSON.parse(body);

                        if (jn["default"] != undefined) {
                            vgap.notesPlanetDefault = jn["default"];
                        }
                        if (jn["planet"] != undefined) {
                        	planet.notesDefault = jn["planet"];
                        	console.log(planet.id+" non default");
                        }
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

	vgapMap.prototype.execPlanetNote = function (planet) {
        var g = vgap.map.screenX(planet.x);
        var h = vgap.map.screenY(planet.y);
	            
        if (planet.notesDefault != undefined)
        	jn = planet.notesDefault;
        else
        	jn = vgap.notesPlanetDefault;
        
		if (jn["tax-happy"] != undefined) {
			vgap.map.setColonistTaxHappy(planet, Number(jn["tax-happy"]));
		}
		
		if (jn["tax-growth"] != undefined) {
			if (planet.colonisthappypoints >= 90)
				vgap.map.setColonistTaxRate(planet, 20);
			else
				vgap.map.setColonistTaxRate(planet, 0);
		}
		
		if (jn["nattax-happy"] != undefined && planet.nativeclans > 0) {
			vgap.map.setNativeTaxHappy(planet, Number(jn["nattax-happy"]));
		}
		
		if (jn.friendlycode != undefined) 
			vgap.map.setFC(planet, jn.friendlycode);
		
		if (jn.build != undefined) {
			var built = 0;
			for (var i=0; i<jn.build.length && built == 0; ++i) {
				var b = jn.build[i];

				if (b.done != undefined) {
					b.changed = 1;
					built = 1;
					break;
				}
				
				if (b.factories != undefined) 
					built += vgap.map.buildFactories(planet, Number(b.factories));
				
				if (b.mines != undefined) 
					built += vgap.map.buildMines(planet,  Number(b.mines));
				
				if (b.defenses != undefined) 
					built += vgap.map.buildDefenses(planet,  Number(b.defenses));
			}
			
			if (built > 0)
				planet.readystatus = 1;
		}

		if (planet.clans == 1) {
			planet.readystatus = 1;
			planet.changed = 1;
		}
		
		if (planet.changed > 0) {
			vgap.savePlanet(planet);
			this.explosions.push(this.paper.circle(g, h, 10 * this.zoom).attr({ stroke: "yellow", "stroke-width": 4 * this.zoom, "stroke-opacity": 1 }));
		}
	};

	vgaPlanets.prototype.savePlanet = function(p) {
        var b = new dataObject();
        b.add("gameid", this.gameId);
        b.add("playerid", this.player.id);
        b.add("turn", this.settings.turn);
        b.add("version", this.version);
        b.add("savekey", this.savekey);
        b.add("apikey", vgap.apikey);
        b.add("saveindex", 2);
        b.add("Planet" + p.id, this.serializePlanet(p), false);
        p.changed = 2;
        b.add("keycount", 11);
        this.saveInProgress = 2;
        this.request("/game/save", b, function(f, p) {
            if (f.success)
            	p.changed = 0;
            this.saveInProgress = 0;
        });
    }; 
	
}
	
var script = document.createElement("script");
script.type = "application/javascript";
script.textContent = "(" + wrapper + ")();";

document.body.appendChild(script);
