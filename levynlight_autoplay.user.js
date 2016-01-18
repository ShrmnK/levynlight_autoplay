// ==UserScript==
// @name           LevynLight AutoPlay
// @namespace      http://www.shrmn.com/
// @description    Automatically plays LevynLight turn, shows time to next turn in title bar and sub-menu bar.
// @copyright      2010, Shrmn K (http://www.shrmn.com/)
// @version        0.1.1
// @include        http://apps.facebook.com/levynlight/*
// @include        http://apps.new.facebook.com/levynlight/*
// @require        http://getelementsbyclassname.googlecode.com/files/getElementsByClassName-1.0.1.js
// ==/UserScript==

var pageTitle = document.title;
var subMenu = document.getElementById("app377144924760_subMenu");
var subMenuHTML = subMenu.innerHTML;
var battleInProgress = false;

function checkActions() {
	var actions = document.getElementById('app377144924760_hud_actions').innerHTML;
	if(actions > 0) {
		// Play turn (wait 3 seconds to load)
		setTimeout(playTurn, 3000);
		// Change window title
		document.title = "Playing turn... | " + pageTitle;
		//window.getAttention();
	} else {
		if(!battleInProgress) {
			var timeleft = document.getElementById('app377144924760_playCounter').innerHTML;
			timeleft = timeleft.replace('+1 action in: ', '');
			var splitTime = timeleft.split(':');
			// Calculate time left in seconds, and add random number between 0 to 10
			//var secondsToPlay = parseInt(splitTime[0])*60 + parseInt(splitTime[1]) + Math.floor(Math.random()*10+1);
			var secondsToPlay = parseInt(splitTime[0])*60 + parseInt(splitTime[1]);
			if(splitTime.length == 2 && typeof(secondsToPlay) == 'number') {
				// Check every 5 seconds
				setTimeout(checkActions, 5000);
				//alert("TIMEOUT SET: " + timeleft + " (" + splitTime[0] + "/" + splitTime[1] + ") -- " + secondsToPlay + "s");
				subMenu.innerHTML = '<span style="border: 1px solid; padding: 1px 1px 1px 1px; color: #999999; left: 215px; position: absolute; top: 13px;">&nbsp;<b>[AutoPlay]</b> Time to next Turn: <b>' + secondsToPlay + "s</b>&nbsp;</span>&nbsp;" + subMenuHTML;
				document.title = "Next Turn in " + secondsToPlay + "s | " + pageTitle;
			} else {
				setTimeout(checkActions, 1000);
				//alert("Page not fully loaded yet, check again in 1 second");
			}
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
		setTimeout(superBattleLoop, 3000);
	}
}

function superBattleLoop() {
	document.title = "Battle ongoing... | " + pageTitle;
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
		setTimeout(superBattleLoop, 1000);
	} else {
		battleInProgress = false;
		var loot = getElementsByClassName("lootContent clear-block", "div", document.getElementById('app377144924760_turnSummary'));
		if(loot.length == 0)
			document.title = won + " | Round ended | " + pageTitle;
		else
			document.title = won + " (Loot Present) | Round ended | " + pageTitle;
		// Refresh page
		window.location = "http://apps.facebook.com/levynlight/";
	}
}

// Activates script 1 second after page loads.
setTimeout(checkActions, 1000);