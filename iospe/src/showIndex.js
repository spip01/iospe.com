// ==UserScript==
// @name          isope.com owned list
// @description   make a list of owned orchids
// @include       http://www.orchidspecies.com/*
// @homepage      
// @version 0.0
// ==/UserScript==

function wrapper () { // showList.js
	
	var isJQueryLoaded = false;
    load = function() {
    	if (!isJQueryLoaded) {
    		isJQueryLoaded = true;
	    	var script = document.createElement('script');
	    	script.type = "text/javascript";
	    	script.src = "https://ajax.googleapis.com/ajax/libs/jquery/1.8/jquery.min.js";
	    	if (typeof script!="undefined")
	    		document.getElementsByTagName("head")[0].appendChild(script);
    	}
    };

	showIndex = function() {
    	var b;
    	
		$("li [href]").each(function(a) {
			var u = $(this).attr("href");
			p = u.match(/(\w+)\.html?$/i);
			if (p != null) {
				p = p[1];
				
				n = $(this).text();
				var owned = "";
				var wanted = "";
				
	    		var jn = {};
	    		if (localStorage[p] !== undefined) {
		        	jn = JSON.parse(localStorage[p]);
		        	owned = jn.owned ? "checked" : "";
		        	wanted = jn.wanted ? "checked" : "";
	    		}
	
	    		b = "<dev id="+p+">";
	    		b += "<input id='owned' type='checkbox' " + owned + " onchange='setOwnedWanted(\""+p+"\")'/>";
	    		b += "<input id='wanted' type='checkbox' " + wanted + " onchange='setOwnedWanted(\""+p+"\")'/>";
	    		b += "<a href="+u+">"+n+"</a></dev>";
		    	$(this).replaceWith(b);
			}
		});
    };
    
    setOwnedWanted = function(p) {
    	$("#"+p).each(function(a) {
			var c = [];
		    $("#"+p+" :checkbox").each(function(a) {
		        c[$(this).attr("id")] = $(this).is(":checked");
		    });
		    
			var jn = {};
			if (localStorage[p] === undefined) {
	    		jn.url = $("#"+p+" a").attr("href");
	    		jn.name = prompt("select name", $("#"+p+" a").text());
			}
			else 
				jn = JSON.parse(localStorage[p]);
			
			jn.owned = c.owned;
			jn.wanted = c.wanted;
			localStorage[p] = JSON.stringify(jn);
    	});
    };
    
	load();
	window.onready = showIndex;
}
	
var script = document.createElement("script");
script.type = "application/javascript";
script.onload = "(" + wrapper + ")();";
script.textContent = "(" + wrapper + ")();";

document.body.appendChild(script);
