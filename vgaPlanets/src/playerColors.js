// ==UserScript==
// @name          Planets.nu set player colors
// @description   set player colors on option screen. shows sample planet gradient and sample waypoint.
// @include       http://planets.nu/home
// @include       http://planets.nu/games/*
// @homepage      http://planets.nu/discussion/
// @version 1.00
// ==/UserScript==

function wrapper () {	// playerColors.js
	
	var oldShowSettings = vgapDashboard.prototype.showSettings;
	vgapDashboard.prototype.showSettings = function () {

		oldShowSettings.apply(this,arguments);
		
    	if(typeof(Storage)!=="undefined") {
	    	if (localStorage.colors === undefined) {
				localStorage["colors.S0"] = "#808080";
				localStorage["colors.E0"] = "#101010";
	    		this.setColors();
	    	}
    	}
		
		this.buildPlayerColors();
		this.showPlayerColors();
	};

	vgapDashboard.prototype.setColors = function () {
		
		for (var i=1; i<=vgap.game.slots; ++i) {
			rgb = this.getColorSlot(i);
			localStorage["colors.S" + i] = rgb;
			localStorage["colors.E" + i] = this.dim(rgb, .6);
		}
	};
	
	vgapDashboard.prototype.setRandomColors = function () {
		var slots = [vgap.game.slots];
		
		for (var i=1; i<=vgap.game.slots;) {
			j = Math.random() * (vgap.game.slots - 1) + 1;
			j = j.toFixed(0);
			if (slots[j] === true)
				continue;
			
			slots[j] = true;
			rgb = this.getColorSlot(i);
			localStorage["colors.S" + j] = rgb;
			localStorage["colors.E" + j] = this.dim(rgb, .6);
			++i;
		}
	};
	
	vgapDashboard.prototype.getColorSlot = function (i) {
		var s = (i-1) / vgap.game.slots * 2 * Math.PI;
		
		var r = (Math.cos(s) + 1) * 127;
		var g = (Math.cos(s + 2 * Math.PI / 3) + 1) * 127;
		var b = (Math.cos(s + 4 * Math.PI / 3) + 1) * 127;
		
		var rs = "0" + Number(r.toFixed(0)).toString(16);
		var gs = "0" + Number(g.toFixed(0)).toString(16);
		var bs = "0" + Number(b.toFixed(0)).toString(16);
		
		var rgb = "#" + rs.slice(-2) + gs.slice(-2) + bs.slice(-2);
		
		return rgb;
	};
	
	vgapDashboard.prototype.dim = function(rgb, dim) {
		var r = parseInt(rgb.slice(1,3), 16);
		var g = parseInt(rgb.slice(3,5), 16);
		var b = parseInt(rgb.slice(5,7), 16);
		
		r *= dim;
		g *= dim;
		b *= dim;
		
		var rs = "0" + Number(r.toFixed(0)).toString(16);
		var gs = "0" + Number(g.toFixed(0)).toString(16);
		var bs = "0" + Number(b.toFixed(0)).toString(16);
		
		return "#" + rs.slice(-2) + gs.slice(-2) + bs.slice(-2);
	};
	
	vgapMap.prototype.getColors = function (player) {
		return {start:localStorage["colors.S"+player], end:localStorage["colors.E"+player]};
	};
	
	vgapDashboard.prototype.buildPlayerColors = function() {
		var b = "";
		
		b += "<div id='AccountSettings'>";
		b += "<br><h3>Color Settings</h3><table>";

		for (var i=1; i<=vgap.game.slots; ++i) {
			b += "<tr><td>Player "+i+": "+vgap.races[i].shortname+"</td>";
			b +=   "<td><input id='colors.S"+i+"' type='color' onchange='vgap.dash.setPlayerColors()' value=" + localStorage["colors.S"+i] + " /></td>";
			b +=   "<td><input id='colors.E"+i+"' type='color' onchange='vgap.dash.setPlayerColors()' value=" + localStorage["colors.E"+i] + " /></td>";
			b +=   "<td><div id='showExample.S"+i+"'></div></td></tr>";
		}
		
		b += "<tr><td colspan=2><button type='button' onmousedown='vgap.dash.resetPlayerColors()'>Reset Player Colors</button></td>";
		b +=     "<td colspan=2><button type='button' onmousedown='vgap.dash.randomPlayerColors()'>Randomize Player Colors</button></td></tr></table></div>";
		
		$("#AccountSettings").replaceWith(b);
	};
	
	vgapDashboard.prototype.buildColorTable = function() {
		$("#AccountSettings input[type='color']").each(function(b) {
			var id = $(this).attr("id");
			var b = "<input id='"+id+"' type='color' onchange='vgap.dash.setPlayerColors()' value=" + localStorage[id] + " />";
			$(this).replaceWith(b);
		});
	};
	
	vgapDashboard.prototype.setPlayerColors = function() {
		$("#AccountSettings input[type='color']").each(function(b) {
			localStorage[$(this).attr("id")] = $(this).val();
		});

		this.showPlayerColors();
	};

	vgapDashboard.prototype.resetPlayerColors = function() {
		this.setColors();
		this.buildColorTable();
		this.showPlayerColors();
	};
	
	vgapDashboard.prototype.randomPlayerColors = function() {
		this.setRandomColors();
		this.buildColorTable();
		this.showPlayerColors();
	};
	
	vgapDashboard.prototype.showPlayerColors = function() {
		
		for (var i=1; i<=vgap.game.slots; ++i) {
			if (vgap.dash.paper === undefined)
				vgap.dash.paper = [];
			
			if (vgap.dash.paper["colors.S"+i] === undefined)
				vgap.dash.paper["colors.S"+i] = Raphael(document.getElementById("showExample.S"+i), 90, 30);
			var paper = vgap.dash.paper["colors.S"+i];
			
			if (vgap.dash.canvas === undefined)
				vgap.dash.canvas = [];
			
			if (vgap.dash.canvas["colors.S"+i] !== undefined)
				vgap.dash.canvas["colors.S"+i].remove();
			vgap.dash.canvas["colors.S"+i] = paper.set();
			var canvas = vgap.dash.canvas["colors.S"+i];
			
		    var s = localStorage["colors.S"+i];
		    var e = localStorage["colors.E"+i];
	        var a = {fill:"0-"+s+"-"+e, "fill-opacity":1};
	        canvas.push(paper.circle(15, 15, 8).attr(a));
	        
            a = {stroke:s, "stroke-width":1, "stroke-opacity":0.5, fill:s, "fill-opacity":0.2};
            canvas.push(paper.circle(35, 15, 8).attr(a));
	        
	        
	    	a = {stroke:s, "stroke-width":2, "arrow-end":"classic-wide-long", "stroke-opacity":1};
	        canvas.push(paper.path("M 50 15 L 85 15 Z").attr(a));
		}
	};

}

var script = document.createElement("script");
script.type = "application/javascript";
script.textContent = "(" + wrapper + ")();";

document.body.appendChild(script);

