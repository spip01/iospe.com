// ==UserScript==
// @name          isope.com owned list
// @description   make a list of owned orchids
// @include       http://www.orchidspecies.com/*
// @homepage      
// @version 0.0
// ==/UserScript==

function wrapper () { // addList.js
	
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

    displaySelection = function() {
		var p = location.pathname;
		p = p.match(/(\w+)\.html?$/i);
		p = p[1];
		
    	var owned = '';
    	var wanted = '';
    	
    	if (localStorage[p] !== undefined) {
    		var jn = {};
        	jn = JSON.parse(localStorage[p]);
        	owned = jn.owned ? 'checked' : '';
        	wanted = jn.wanted ? 'checked' : '';
    	}
    	
		var b = "<table><tr>";
		b += "<td><input id='owned' type='checkbox' " + owned + " onchange='addOwnedWanted(\""+p+"\")'/>&nbsp;Owned&nbsp;</td>";
		b += "<td><input id='wanted' type='checkbox' " + wanted + " onchange='addOwnedWanted(\""+p+"\")'/>&nbsp;Wanted&nbsp;</td>";
		b += "</tr></table>";
		
        $("body").prepend(b);
	};

    addOwnedWanted = function(p) {
    	//$("#"+p).each(function(a) {
			var c = [];
		    $(":checkbox").each(function(a) {
		        c[$(this).attr("id")] = $(this).is(":checked");
		    });
		    
			var jn = {};
			if (localStorage[p] === undefined) {
	    		jn.url = location.pathname;
	    		jn.name = prompt("select name", $("p:first").text());
			}
			else {
				if (!c.owned && ! c.wanted) {
					delete localStorage[p];
					return;
				}
				
				jn = JSON.parse(localStorage[p]);
			}
			
			jn.owned = c.owned;
			jn.wanted = c.wanted;
			localStorage[p] = JSON.stringify(jn);
    	//});
    };
    
	load();
	window.onready = displaySelection;
}
	
var script = document.createElement("script");
script.type = "application/javascript";
script.onload = "(" + wrapper + ")();";
script.textContent = "(" + wrapper + ")();";

document.body.appendChild(script);
