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

    displayList = function() {
		var b = "<div id='showList'><table>";
		b += "<tr><td><input id='show' type='checkbox' onchange='showList()'/>&nbsp;&nbsp;Show List</td></tr></table></div>";
		
        $("body").prepend(b);
	};

	showList = function() {
		var c = [];
	    $("#showList :checkbox").each(function(a) {
	        c[$(this).attr("id")] = $(this).is(":checked");
	    });
	    
	    if (c.show) {
	    	var b = "<div id=myList>";
	    	var jn = {};
	    	
	    	for (i in localStorage) {
	        	jn = JSON.parse(localStorage[i]);
	        	var owned = jn.owned ? "checked" : "";
	        	var wanted = jn.wanted ? "checked" : "";
	        	
	    		b += "<li><div id="+i+">";
	    		b +=    "<input id='owned' type='checkbox' " + owned + " onchange='listOwnedWanted(\""+i+"\")'/>&nbsp;";
	    		b +=    "<input id='wanted' type='checkbox' " + wanted + " onchange='listOwnedWanted(\""+i+"\")'/>&nbsp;";
	    		b +=    "<a href="+jn.url+">"+jn.name+"</a></div></li>";
	    	}
	    	
	    	b += "</div>";
	    	$("#showList").after(b);
	    }
	    else
	    	$("#myList").remove();    	
    };
    
    listOwnedWanted = function(p) {
    	$("#"+p).each(function(a) {
			var c = [];
			$(this).find(":checkbox").each(function(a) {
		        c[$(this).attr("id")] = $(this).is(":checked");
		    });
		    
			var jn = {};
			jn = JSON.parse(localStorage[p]);
			jn.owned = c.owned;
			jn.wanted = c.wanted;
			localStorage[p] = JSON.stringify(jn);
    	});
    };
    
	load();
	window.onready = displayList;
}
	
var script = document.createElement("script");
script.type = "application/javascript";
script.onload = "(" + wrapper + ")();";
script.textContent = "(" + wrapper + ")();";

document.body.appendChild(script);
