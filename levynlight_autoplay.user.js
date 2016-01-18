// ==UserScript==
// @name           LevynLight AutoPlay
// @namespace      http://www.shrmn.com/
// @description    Automatically plays LevynLight turn, shows time to next turn in title bar and sub-menu bar.
// @copyright      2010, Shrmn K (http://www.shrmn.com/)
// @version        0.1.2
// @include        http://apps.facebook.com/levynlight/*
// @include        http://apps.new.facebook.com/levynlight/*
// @require        http://getelementsbyclassname.googlecode.com/files/getElementsByClassName-1.0.1.js
// ==/UserScript==

var pageTitle = document.title;
var subMenu = document.getElementById("app377144924760_subMenu");
var subMenuHTML = subMenu.innerHTML;
var battleInProgress = false;

function updateStatus(text) {
	// For title, strip tags of text.
	document.title = text.replace(/(<([^>]+)>)/ig,"") + " | " + pageTitle;
	subMenu.innerHTML = '<span style="border: 1px solid; padding: 1px 1px 1px 1px; color: #999999; left: 215px; position: absolute; top: 13px;">&nbsp;<b>[<a href="http://userscripts.org/scripts/show/80811" target="_blank" style="color: #666666; text-decoration: none;">AutoPlay</a> v' + _LLAPversion + ']</b> ' + text + '&nbsp;</span>&nbsp;' + subMenuHTML;
}

function checkActions() {
	// Check if there is energy. Will terminate everything if there is no energy.
	if(document.getElementById('app377144924760_hud_energy_quantity').innerHTML == 0) {
		updateStatus('Out of Energy!');
		return;
	}
	// Terminate this loop if there is a battle in progress. Battle Loop will take over.
	if(battleInProgress)	return;
	
	var actions = document.getElementById('app377144924760_hud_actions').innerHTML;
	if(actions > 0) {
		// Play turn (wait 1 second + random time between 1 and 5 seconds)
		setTimeout(playTurn, 1000 + Math.floor(Math.random()*5+1)*1000);
		updateStatus('Playing turn...');
		//window.getAttention();
	} else {
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
			updateStatus('Next Turn in: <b>' + secondsToPlay + 's</b>');
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
		window.location = "http://apps.facebook.com/levynlight/";
	}
}

if (document.addEventListener)
	document.addEventListener("DOMContentLoaded", checkActions, false);
var _LLAPversion = '0.1.2';