var fs = require('fs');
function GameLog() {
	this.log = {
		table: {},
		startdeck: [],
		play: [],
		endpli: {},
		recap: {}
	};
}
// LOAD / SAVE
GameLog.prototype.saveto = function(uuid,logpath,cb) {
	var filename = uuid+".json";
	var filepath = logpath+filename;
	var saveStr = JSON.stringify(this.log);
	fs.writeFile(filepath,saveStr,(err) => {
	  if (err) {
	  	console.error(err);
	  } else {
	  	cb(uuid);
	  }
	});
};
GameLog.prototype.loadfrom = function(filename,cb) {
	fs.readFile(filename,(err, data) => {
	  if (err) {
	  	console.error(err);
	  } else {
	  	this.log = JSON.parse(data);
	  	cb(this.get());
	  }
	});
};
// GET METHOD
GameLog.prototype.get = function() {
	return this.log;
};
// INGAME METHODS
GameLog.prototype.setTable = function(table) {
	this.log.table = table;
};
GameLog.prototype.addPlay = function(playersdeck,playcards,turn,pli) {
	var playerturn = {};
	for(var k in playersdeck) {
		playerturn[k] ={
			playersdeck: playersdeck[k],
			playcards: playcards[k],
			pli: pli.players[k],
			win: (turn.win == k),
			first: (turn.first == k)
		};
	}
	this.log.play.push({
		playerturn: playerturn,
		pliatt: pli.att,
		plidef: pli.def,
		excuse: turn.excuse,
		count: turn.count+1
	});
};
GameLog.prototype.setstartdeck = function(startdeck) {
	this.log.startdeck = startdeck;
};
GameLog.prototype.setendpli = function(endpli,recap) {
	this.log.endpli = endpli;
	this.log.recap = recap;
};
//
module.exports = GameLog;