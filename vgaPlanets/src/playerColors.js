// ==UserScript==
// @name          Planets.nu hide notes display on map
// @description   hide notes box drawn around planets.
// @include       http://planets.nu/home
// @include       http://planets.nu/games/*
// @homepage      http://planets.nu/discussion/utility-script-hide-notes-display
// @version 1.11
// ==/UserScript==

function wrapper () {
	
	var oldProcessLoad = vgaPlanets.prototype.processLoad;
    vgaPlanets.prototype.processLoad = function(f) {
    	
    	oldProcessLoad.apply(this,arguments);
    	
    	if(typeof(Storage)!=="undefined") {
	    	if (localStorage["colors.S0"] == null) {
	    		this.setColors();
	    	}
    	}
   };
	
	vgaPlanets.prototype.setColors = function () {
		localStorage["colors.S0"]  = "hsl(0,0,128)";
		localStorage["colors.E0"] = "hsl(0,0,16)";
    	
        for (var i=1; i<=vgap.game.slots; ++i) {
            localStorage["colors.S" + i] = "hsl(" + Number(i / vgap.game.slots * 239).toFixed(0) + ",240,128)";
            localStorage["colors.E" + i] = "hsl(" + Number(i / vgap.game.slots * 239).toFixed(0) + ",240,32)";
        }
	};

	var oldShowSettings = vgapDashboard.prototype.showSettings;
	vgapDashboard.prototype.showSettings = function () {

		oldShowSettings.apply(this,arguments);

		
		var b = "<br><h3>Color Settings</h3>";
		
		b += "<div id=playerColors'><table>";

		for (var i=1; i<=vgap.game.slots;++i) {
			b += "<tr><td>Player "+i+": "+vgap.races[i].shortname+"</td>";
			b +=   "<td><input id='color.S"+i+"' type='color' onchange='vgap.dash.changingColors(S"+i+")' value=" + localStorage["colors.S"+i] + " /></td>";
			b +=   "<td><input id='color.E"+i+"' type='color' onchange='vgap.dash.changingColors(E"+i+")' value=" + localStorage["colors.E"+i] + " /></td></tr>";
		}
		
		b += "</table></div>";
		
		$("#AccountSettings").replaceWith(b);
	};


	vgapDashboard.prototype.changingColors = function(player) {
        if (this.notePaper == undefined) {
	        this.notePaper = Raphael("noteCanvas", 160, 80);
	        this.noteCanvas = this.notePaper.set();
        }
        
        if (this.notePaper) {
		    var s = $("#notesOptions #noteColorStart").val();
		    var e = $("#notesOptions #noteColorEnd").val();
	        var r = {fill:"r"+s+"-"+e, "fill-opacity":1};
	        var l = {fill:"0-"+s+"-"+e, "fill-opacity":1};
		    
		    this.noteCanvas.clear();
	        this.noteCanvas.push(this.notePaper.circle(40, 40, 40).attr(r));
	        this.noteCanvas.push(this.notePaper.circle(120, 40, 40).attr(l));
        }
	};

	var oldSaveSettings = vgapDashboard.prototype.saveSettings;
	vgapDashboard.prototype.saveSettings = function() {
		
    	$("#notesOptions :checkbox").each(function(a) {
			localStorage[$(this).attr("id")] = $(this).is(":checked");
    	});

//     	:color doesn't work yet
//		$("#notesOptions :color").each(function(b) {
//			localStorage[$(this).attr("id")] = $(this).val();
//		});
	    	
	    localStorage.noteColor = $("#notesOptions #noteColor").val();

	    oldSaveSettings.apply(this,arguments);
	};
	
	var oldLoadControls = vgapMap.prototype.loadControls; 
	vgapMap.prototype.loadControls = function () {

		oldLoadControls.apply(this, arguments);
		
    	if (localStorage.hideMapTip == "true" && vgap.map.mapTip != null)
    		vgap.map.mapTip.hide();
    	else
    		vgap.map.mapTip = $("<div id='MapTip'></div>").appendTo("#PlanetsContainer").hide();	// not defined before calling loadControls
	};
		
	vgapMap.prototype.drawNotes = function() {		// make the box red instead of yellow
		if (this.notes == undefined)
			this.notes = this.paper.set();
        this.notes.clear();
	    
	    if (localStorage.noteDisplay == "true") {
		    for (var c = 0; c < vgap.notes.length; c++) {
		        var d = vgap.notes[c];
		        if (d.targettype == 1 && d.body.length > 0) {
		            var e = vgap.getPlanet(d.targetid);
		            var b = 7;
		            var g = vgap.map.screenX(e.x) - (b * this.zoom);
		            var h = vgap.map.screenY(e.y) - (b * this.zoom);
		            var f = (b + b) * this.zoom;
		            var a = {stroke: localStorage.noteColor, "stroke-width": "1","stroke-opacity": 0.5};
		            vgap.map.notes.push(vgap.map.paper.rect(g, h, f, f).attr(a));
		        }
		    }
	    }
    };
	
}

var script = document.createElement("script");
script.type = "application/javascript";
script.textContent = "(" + wrapper + ")();";

document.body.appendChild(script);
