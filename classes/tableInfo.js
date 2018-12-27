function TableInfo(playercount) {
	this.players = {};
	for (var i = 1; i <= playercount; i++) {
		this.players[i] = {info:null,points:0};
	}
	this.gamePlayed = [];
}
TableInfo.prototype.addPlayer = function(player,position,callback) {
	var canSit = true;
	var info = null;
	for (var key in this.players) {
		if(this.players[key].info === player) {
			canSit = false;
			console.log("already sit");
		}
	}
	if(canSit) {
		if(this.players[position].info === null) {
			this.players[position].info = player;
		} else {
			canSit = false;
		}
		info = {
			name:this.players[position].info.name,
			login:this.players[position].info.login,
			points:this.players[position].points,
		};
		if(this.players[position].info.pict !== null) {
			info.pict = this.players[position].info.pict.small
		} else {
			info.pict = null;
		}
	}
	thisplayerinfo = {
		name:this.players[position].info.name,
		login:this.players[position].info.login,
		points:this.players[position].points,
		pict:this.players[position].info.pict
	}
	callback(canSit,thisplayerinfo);
};
TableInfo.prototype.removePlayer = function(player,removed) {
	for (var key in this.players) {
		if(this.players[key].info === player) {
			this.players[key].info = null;
			removed(key);
		}
	}
};
TableInfo.prototype.isTableEmpty = function() {
	var tableempty = true;
	for (var key in this.players) {
		if(this.players[key].info !== null) {
			tableempty = false;
		}
	}
	return tableempty;
};
TableInfo.prototype.isTableComplete = function() {
	var playable = true;
	for (var key in this.players) {
		if(this.players[key].info === null) {
			playable = false;
		}
	}
	return playable;
};
TableInfo.prototype.getPlaycount = function() {
	return this.gamePlayed.length;
};
TableInfo.prototype.getPlayers = function() {
	return this.players;
};
TableInfo.prototype.getPlayer = function(id) {
	if(this.players[id] !== undefined) {
		return this.players[id].info;
	} else {
		console.error("FATAL: PLAYER ID",id);
	}
};
TableInfo.prototype.isPlayerSit = function(player) {
	var res = false;
	for (var key in this.players) {
		if(this.players[key].info === player) {
			res = true;
		}
	}
	return res;
};
TableInfo.prototype.getNumPlayer = function(player) {
	for (var key in this.players) {
		if(this.players[key].info === player) {
			return key;
		}
	}
};
TableInfo.prototype.getPlayersNames = function() {
	var playerNames = {};
	for (var key in this.players) {
		if(this.players[key].info !== null) {
			playerNames[key] = {
				name:this.players[key].info.name,
				login:this.players[key].info.login,
				points:this.players[key].points,
				pict:this.players[key].info.pict
			};
		} else {
			playerNames[key] = null;
		}
	}
	return playerNames;
};
TableInfo.prototype.addHistory = function(playerDiff,cbNewScore) {
	for(var k in playerDiff) {
		this.players[k].points = this.players[k].points + playerDiff[k];
	}
	var historyLine = {};
	for (var key in this.players) {
		historyLine[key] = this.players[key].points;
	}
	this.gamePlayed.push(historyLine);
	cbNewScore(this.gamePlayed.length,historyLine);
};
TableInfo.prototype.getHistory = function(playerDiff) {
	return this.gamePlayed;
};
module.exports = TableInfo;