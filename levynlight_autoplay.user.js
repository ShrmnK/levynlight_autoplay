// ==UserScript==
// @name           LevynLight AutoPlay
// @namespace      http://www.shrmn.com/
// @description    Automatically plays LevynLight turn, shows time to next turn in title bar and sub-menu bar.
// @copyright      2010, Shrmn K (http://www.shrmn.com/)
// @version        0.1.5
// @include        http://apps.facebook.com/levynlight/*
// @include        http://apps.new.facebook.com/levynlight/*
// ==/UserScript==

// Settings
var updateFrequency = 1;         // Frequency timer updates (in seconds)
var showSeconds = true;          // Timer shows in seconds instead of minutes:seconds
var alertOnEnergyZero = true;    // Fires a javascript alert box to inform user that he has no more energy


// *** DO NOT TOUCH ANYTHING BELOW HERE IF YOU DO NOT KNOW WHAT YOU ARE DOING!!! *** //
var pageTitle = document.title;
var header = document.getElementById("app377144924760_header");
var headerHTML = header.innerHTML;
var battleInProgress = false;
var scriptStarted = false;
var _LLAPversion = '0.1.5';

function updateStatus(text) {
	// For title, strip tags of text.
	document.title = text.replace(/(<([^>]+)>)/ig,"") + " | " + pageTitle;
	header.innerHTML = '<div id="app377144924760_status" style="width: 175px;"><span style="background: #ffffff; border: 1px solid; padding: 1px; color: #999999; left: 571px; position: absolute; top: -1px; width: 161px; text-align: center;"><b>[<a href="http://userscripts.org/scripts/show/80811" target="_blank" style="color: #666666; text-decoration: none;">AutoPlayer</a> v' + _LLAPversion + ']</b><br />' + text + '</span></div>' + headerHTML;
}

function checkActions() {
	scriptStarted = true;
	// Check if there is energy. Will terminate everything if there is no energy.
	if(document.getElementById('app377144924760_hud_energy_quantity').innerHTML == 0) {
		updateStatus('Out of Energy!');
		if(alertOnEnergyZero)
			alert('You have run out of Energy to use in LevynLight!');
		return;
	}
	// Terminate this loop if there is a battle in progress. Battle Loop will take over.
	if(battleInProgress) return;
	
	var actions = document.getElementById('app377144924760_hud_actions').innerHTML;
	if(actions > 0) {
		// Play turn (wait 1 second + random time between 1 and 5 seconds)
		setTimeout(playTurn, 1000 + Math.floor(Math.random()*5+1)*1000);
		updateStatus('Playing turn...');
		//window.getAttention();
	} else {
		var timeLeft = document.getElementById('app377144924760_playCounter').innerHTML;
		timeLeft = timeLeft.replace('+1 action in: ', '');
		var splitTime = timeLeft.split(':');
		//var secondsToPlay = parseInt(splitTime[0])*60 + parseInt(splitTime[1]);
		if(splitTime.length == 2) {
			// Check every updateFrequency seconds
			setTimeout(checkActions, updateFrequency*1000);
			if(showSeconds)
				updateStatus('Next Turn in <b>' + parseInt(parseInt(splitTime[0])*60 + parseInt(splitTime[1])) + 's</b>');
			else
				updateStatus('Next Turn in <b>' + timeLeft + '</b>');
		} else {
			setTimeout(checkActions, 1000);
			//alert("Page not fully loaded yet, check again in 1 second");
		}
	}
}

function playTurn() {
	if(!battleInProgress) {
		var playbutton = document.getElementById('app377144924760_playbutton');	
		/*var clickMouse = document.createEvent("MouseEvents");
		clickMouse.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
		playbutton.dispatchEvent(clickMouse);*/
		var clickUI = document.createEvent("UIEvents");
		clickUI.initUIEvent("click", true, true, window, 1);
		playbutton.dispatchEvent(clickUI);
		
		battleInProgress = true;
		// Run loop to check for battle status after 3 seconds (enough for ajax to initiate)
		setTimeout(loopWhileBattle, 3000);
	}
}

function loopWhileBattle() {
	updateStatus("Battle ongoing...");
	var winnerDiv = getElementsByClassName("winner player", "div", document.getElementById('app377144924760_turnSummary'));
	var roundOver = getElementsByClassName("hidden player", "div", document.getElementById('app377144924760_turnStack'));
	
	var won = "Victory!";
	if(winnerDiv.length == 0) {
		won = "Defeat!";
		// The class changes from "player" to "game" when the AI wins
		roundOver = getElementsByClassName("hidden game", "div", document.getElementById('app377144924760_turnStack'));
	}
	
	if(roundOver.length == 1 && roundOver[0].getAttribute("id") == "app377144924760_turnSummary") {
		// Run this every second until the battle is over.
		setTimeout(loopWhileBattle, 1000);
	} else {
		battleInProgress = false;
		var loot = getElementsByClassName("lootContent clear-block", "div", document.getElementById('app377144924760_turnSummary'));
		if(loot.length == 0)
			updateStatus(won);
		else
			updateStatus(won + " (Loot Present)");
		// Refresh page
		setTimeout('window.location = "http://apps.facebook.com/levynlight/";', 3000);
	}
}

/*
	Following function getElementsByClassName is
	Developed by Robert Nyman, http://www.robertnyman.com
	Code/licensing: http://code.google.com/p/getelementsbyclassname/
*/	
var getElementsByClassName = function (className, tag, elm){
	if (document.getElementsByClassName) {
		getElementsByClassName = function (className, tag, elm) {
			elm = elm || document;
			var elements = elm.getElementsByClassName(className),
				nodeName = (tag)? new RegExp("\\b" + tag + "\\b", "i") : null,
				returnElements = [],
				current;
			for(var i=0, il=elements.length; i<il; i+=1){
				current = elements[i];
				if(!nodeName || nodeName.test(current.nodeName)) {
					returnElements.push(current);
				}
			}
			return returnElements;
		};
	}
	else if (document.evaluate) {
		getElementsByClassName = function (className, tag, elm) {
			tag = tag || "*";
			elm = elm || document;
			var classes = className.split(" "),
				classesToCheck = "",
				xhtmlNamespace = "http://www.w3.org/1999/xhtml",
				namespaceResolver = (document.documentElement.namespaceURI === xhtmlNamespace)? xhtmlNamespace : null,
				returnElements = [],
				elements,
				node;
			for(var j=0, jl=classes.length; j<jl; j+=1){
				classesToCheck += "[contains(concat(' ', @class, ' '), ' " + classes[j] + " ')]";
			}
			try	{
				elements = document.evaluate(".//" + tag + classesToCheck, elm, namespaceResolver, 0, null);
			}
			catch (e) {
				elements = document.evaluate(".//" + tag + classesToCheck, elm, null, 0, null);
			}
			while ((node = elements.iterateNext())) {
				returnElements.push(node);
			}
			return returnElements;
		};
	}
	else {
		getElementsByClassName = function (className, tag, elm) {
			tag = tag || "*";
			elm = elm || document;
			var classes = className.split(" "),
				classesToCheck = [],
				elements = (tag === "*" && elm.all)? elm.all : elm.getElementsByTagName(tag),
				current,
				returnElements = [],
				match;
			for(var k=0, kl=classes.length; k<kl; k+=1){
				classesToCheck.push(new RegExp("(^|\\s)" + classes[k] + "(\\s|$)"));
			}
			for(var l=0, ll=elements.length; l<ll; l+=1){
				current = elements[l];
				match = false;
				for(var m=0, ml=classesToCheck.length; m<ml; m+=1){
					match = classesToCheck[m].test(current.className);
					if (!match) {
						break;
					}
				}
				if (match) {
					returnElements.push(current);
				}
			}
			return returnElements;
		};
	}
	return getElementsByClassName(className, tag, elm);
};

// Firefox DOMContentLoaded (Greasemonkey)
if(document.addEventListener) {
	document.addEventListener("DOMContentLoaded", checkActions, false);
}
// Chrome window.onload (Script Extension)
// Possible support for other browsers as well
window.onload = function() {
	if(!scriptStarted) {
		setTimeout('if(!scriptStarted) { checkActions(); }', 3000);
	}
}