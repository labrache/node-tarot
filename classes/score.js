function Score(db) {
	this.db = db;
}

Score.prototype.addScore = function(tableid,tableConfiguration,players,itcount,scores,creationdate) {
	var confStr = JSON.stringify( tableConfiguration );
	var scorStr = JSON.stringify(scores.playerDiff);
	this.db.get(`select count(1) as ct from tables where tableid = ?`, tableid, (err1, row) => {
		if (err1) {
			return console.error("count tables",err1);
		} else {
			if(row.ct === 0) {
				this.db.run(`insert into tables (tableid,configuration,creationdate) values (?,?,?)`, tableid, confStr, creationdate, (err2) => {
					if (err2) {
						return console.error("tables",err2);
					} else {
						for(var k in players) {
							this.db.run(`insert into tableplayers (tableid,player,position) values (?,?,?)`, tableid, players[k].info.login , k, (err3) => {
								if (err3) {
									return console.error("tableplayers",err3);
								}
							});
						}
					}
				});
				
			}
		}
	});
	this.db.run(`insert into turn (tableid,itcount,scores) values (?,?,?)`, tableid,itcount,scorStr, (err) => {
		if (err) {
			return console.error("turn",err);
		}
	});
};
Score.prototype.parseConfig = function(data) {
	for (var key in data) {
		data[key].configuration = JSON.parse(data[key].configuration);
		data[key].hdate = new Date(data[key].creationdate).toLocaleString();
	}
};
Score.prototype.parseInfo = function(data) {
	data.configuration = JSON.parse(data.configuration);
};
Score.prototype.parseGame = function(tableplayers,turns) {
	for (var key in turns) {
		turns[key].scores = JSON.parse(turns[key].scores);
	}
};
Score.prototype.getWinner = function(table) {
	this.db.get(`select max(itcount) as mc,scores from turn where tableid = ?`, table, (err,lastTurn) => {
		if (err) {
			return console.error(err);
		} else {
			if(lastTurn.mc !== null) {
				this.db.all(`select player, position from tableplayers where tableid = ?`, table, (err2,players) => {
					if (err2) {
						return console.error(err2);
					} else {
						var lastScores = JSON.parse(lastTurn.scores);
						var bestScore = null;
						for(var k in lastScores) {
							if(bestScore === null || lastScores[k] > bestScore){
								bestScore = lastScores[k];
							}
						}
						var winners = [];
						for(var j in lastScores) {
							if(lastScores[j] == bestScore){
								winners.push(j);
							}
						}
						var playerLogin = [];
						for(var l in players) {
							for(var m in winners) {
								if(winners[m] == players[l].position) {
									playerLogin.push(players[l].player);
								}
							}
						}
						var win_stmt = this.db.prepare("insert into winner (tableid,player) values (?,?)");
						for (var n in playerLogin) {
							win_stmt.run(table,playerLogin[n]);
						}
						win_stmt.finalize();
					}
				});
			}
		}
	});
};
Score.prototype.processWinner = function(lastTurn,players,table,cb) {
	console.log(lastTurn,players,table);
	var lastScores = JSON.parse(lastTurn.scores);
	var bestScore = null;
	for(var k in lastScores) {
		if(bestScore === null || lastScores[k] > bestScore){
			bestScore = lastScores[k];
		}
	}
	console.log("bestScore",bestScore);
	var winners = [];
	for(var j in lastScores) {
		if(lastScores[j] == bestScore){
			winners.push(j);
		}
	}
	console.log("winners",winners);
	var playerLogin = [];
	for(var l in players) {
		if(winners.indexOf(players[l].position) !== -1) {
			playerLogin.push(winners.indexOf(players[l].player));
		}
	}
	console.log("playerLogin",playerLogin);
	console.log("table",table);
	var win_stmt = db.prepare("insert into winner (tableid,player) values (?,?)");
	for (var n in playerLogin) {
		win_stmt.run(table,playerLogin[n]);
	}
	win_stmt.finalize();
};
Score.prototype.getPlayerGames = function(playername,cb) {
	this.db.all(`select t.tableid, t.creationdate, t.configuration, max(u.itcount) as ct, Group_Concat(w.player) as winner
				from tableplayers p
				join tables t on p.tableid = t.tableid
				join turn u on t.tableid = u.tableid
				left join winner w on t.tableid = w.tableid
				where p.player = ?
				group by t.tableid
				order by t.creationdate desc`, playername, (err,row) => {
		if (err) {
			return console.error(err);
		} else {
			cb(row);
		}
	});
};
Score.prototype.getPlayerStats = function(playername,cb) {
	this.db.get(`select count(1) as ct from tableplayers where player = ?`, playername, (err,rowTable) => {
		if (err) {
			return console.error(err);
		} else {
			this.db.get(`select count(1) as ct from winner where player = ?`, playername, (err2,rowWin) => {
				if (err2) {
					return console.error(err);
				} else {
					cb({table:rowTable.ct,win:rowWin.ct});
				}
			});
		}
	});
};
Score.prototype.getTableInfo = function(table,cb) {
	this.db.get(`select creationdate, configuration from tables where tableid = ?`, table, (err,row) => {
		if (err) {
			return console.error(err);
		} else {
			cb(row);
		}
	});
};
Score.prototype.getTablePlayers = function(table,cb) {
	this.db.all(`select player, position from tableplayers where tableid = ? order by position`, table, (err,row) => {
		if (err) {
			return console.error(err);
		} else {
			cb(row);
		}
	});
};
Score.prototype.getTurns = function(table,cb) {
	this.db.all(`select scores, itcount from turn where tableid = ? order by itcount`, table, (err,row) => {
		if (err) {
			return console.error(err);
		} else {
			cb(row);
		}
	});
};
module.exports = Score;