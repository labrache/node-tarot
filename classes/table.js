const uuidv1 = require('uuid/v1');
var tableInfo = require('./tableInfo');
var gameClass = require('./game');

function Table(db,score) {
	this.db = db;
	this.tables = {};
	this.score = score;
}

Table.prototype.selectFirstNotComplete = function() {
	var tableCanBeJoined = null;
	for (var key in this.tables) {
		if(!this.tables[key].info.isTableComplete()){
			tableCanBeJoined = key;
		}
	}
	return tableCanBeJoined;
};
Table.prototype.parseConfiguration = function(postData) {
	var tableConf = ['pub','priv','invit'];
	var playerCount = ['3','4','5'];
	if(tableConf.indexOf(postData.tableconf) !== -1 && playerCount.indexOf(postData.playerCount)) {
		return { tablename: postData.tablename,                                                         
				  tableconf: postData.tableconf,                                                             
				  password: postData.password,                                                        
				  playercount: parseInt(postData.playercount),                                                             
				  deadplayer: (postData.deadplayer == 'on'),                                                             
				  misere: (postData.misere == 'on'),                                                                 
				  poignee: (postData.poignee == 'on'),                                                                
				  autodistrib: (postData.autodistrib == 'on'),                                                            
				  autocut: (postData.autocut == 'on'),                                                                
				  showchien: (postData.showchien == 'on')
		};
	} else return false;
};
Table.prototype.createTable = function(configuration,creator,callback) {
	var uuid = uuidv1();
	this.tables[uuid] = {uid: uuid,
						info: new tableInfo(configuration.playercount),
						currentGame: null,
						conf: configuration,
						created: Date.now(),
						it:0,
						creator: creator,
						invited: []
	};
	callback(uuid);
};
Table.prototype.tableExists = function(id) {
	return this.tables[id] !== undefined;
};
Table.prototype.isTableCreator = function(id,login) {
	return this.tables[id].creator.login == login;
};
Table.prototype.isPlayerOnInvite = function(id,login) {
	var invited = false;
	for(var k in this.tables[id].invited) {
		if(this.tables[id].invited[k].login == login) {
			invited = true;
		}
	}
	return invited;
};
Table.prototype.getInvited = function(id) {
	return this.tables[id].invited;
};
Table.prototype.addInvite = function(id,user) {
	if(!this.isPlayerOnInvite(id,user.login)) {
		this.tables[id].invited.push({login:user.login,name:user.name});
	}
};
Table.prototype.removeInvite = function(id,invited) {
	if(this.isPlayerOnInvite(id,invited)) {
		for(var k in this.tables[id].invited){
			if(this.tables[id].invited[k].login == invited) {
				this.tables[id].invited.splice(k,1);
			}
		}
	}
};
Table.prototype.joinTable = function(id,login,password,cbOk,cbPromptPw,cbErr) {
	if(this.tables[id] !== undefined)
		{
			if(this.tables[id].conf.tableconf == "priv")
			{
				if(this.isPlayerOnInvite(id,login) || this.tables[id].conf.password == password || this.isTableCreator(id,login)) {
					cbOk(this.tables[id].conf,id,this.tables[id].creator);
				}else{
					cbPromptPw();
				}
			}else{
				if(this.tables[id].conf.tableconf == "invit"){
					if(this.isPlayerOnInvite(id,login) || this.isTableCreator(id,login)){
						cbOk(this.tables[id].conf,id,this.tables[id].creator);
					} else {
						cbErr();
					}
				}else{
					cbOk(this.tables[id].conf,id,this.tables[id].creator);
				}
			}
		}
	else
		{cbErr();}
};
Table.prototype.canJoin = function(id,login,password) {
	var res = false;
	if(this.tables[id] !== undefined)
	{
		if(this.tables[id].conf.tableconf == "priv"){
			res = (this.isPlayerOnInvite(id,login) || this.tables[id].conf.password == password || this.isTableCreator(id,login));
		}else if(this.tables[id].conf.tableconf == "invit"){
			if(this.isPlayerOnInvite(id,login) || this.isTableCreator(id,login)){
				res = true;
			}
		} else {
			res = true;
		}
	}
	return res;
};
Table.prototype.getInfo = function(uuid) {
	return {
		id: uuid,
		name: this.tables[uuid].conf.tablename,
		passwordProtected: (this.tables[uuid].conf.tableconf === "priv"),
		password: this.tables[uuid].conf.password,
		spec: this.tables[uuid].conf.spec,
		playercount: this.tables[uuid].conf.playercount,
		deadplayer: this.tables[uuid].conf.deadplayer,
		misere: this.tables[uuid].conf.misere,
		poignee: this.tables[uuid].conf.poignee,
		autodistrib: this.tables[uuid].conf.autodistrib,
		autocut: this.tables[uuid].conf.autocut,
		showchien: this.tables[uuid].conf.showchien
	};
};
Table.prototype.getInfoNoCred = function(uuid) {
	return {
		id: uuid,
		name: this.tables[uuid].conf.tablename,
		passwordProtected: (this.tables[uuid].conf.tableconf === "priv"),
		spec: this.tables[uuid].conf.spec,
		playercount: this.tables[uuid].conf.playercount,
		deadplayer: this.tables[uuid].conf.deadplayer,
		misere: this.tables[uuid].conf.misere,
		poignee: this.tables[uuid].conf.poignee,
		autodistrib: this.tables[uuid].conf.autodistrib,
		autocut: this.tables[uuid].conf.autocut,
		showchien: this.tables[uuid].conf.showchien
	};
};
Table.prototype.getTables = function() {
	var tableList = [];
	for(var key in this.tables) {
		if(this.tables[key].conf.tableconf !== 'invit') {
			tableList.push(this.getInfo(key));
		}
	}
	return tableList;
};
Table.prototype.addPlayer = function(uuid,player,pos,pw,added,cbstart,cbresume,cbSetCtr,cbCallCard,cbChien,cbrecap,cbannonces,cbplaycards,cbEndGame) {
	if(this.tableExists(uuid) && this.canJoin(uuid,player.login,pw)) {
		var table = this.tables[uuid];
		table.info.addPlayer(player,pos,function(canSit,info){
			if(canSit) {
				added(info);
				if(table.info.isTableComplete()) {
					if(table.currentGame === null) {
						var gameStarted = new gameClass(table.conf,4);
						table.currentGame = gameStarted;
						var validGame = true;
						while(validGame) { //Tant que la distribution n'est pas valide ...
							validGame = !gameStarted.distribute().check;
						}
						cbstart(table.info.getPlayer(gameStarted.getPlayerTurn()),gameStarted.getPlayerTurn());
					} else {
						table.currentGame.resumeplayer(table.info.getNumPlayer(player),function(){
							cbSetCtr(player);
						},function(callablecards){
							cbCallCard(player,callablecards,table.info.getNumPlayer(player));
						},function(chien){
							cbChien(chien);
						},function(highPlayer,ctr,chien,callCard){
							cbrecap(highPlayer,ctr,chien,callCard);
						},function(annonces){
							for(var k in annonces) {
								annonces[k].player = table.info.getPlayer(annonces[k].player).name;
							}
							cbannonces(annonces);
						},function(playCards){
							cbplaycards(playCards);
						},function(recap,chien){
							cbEndGame(recap,chien);
						},function(attplayers,ctrplayers,playerTurn,deck){
							var history = table.info.getHistory();
							cbresume(playerTurn,deck,attplayers,ctrplayers,history);
						});
					}
				}
			}
		});
	}
};
Table.prototype.removePlayer = function(uuid,player,removed,closetable) {
	this.tables[uuid].info.removePlayer(player,removed);
	if(this.tables[uuid].info.isTableEmpty()) {
		delete this.tables[uuid];
		this.score.getWinner(uuid);
		closetable();
	}
};
Table.prototype.getPlayers = function(uuid) {
	if(this.tables[uuid] !== null){
		return this.tables[uuid].info.getPlayersNames();
	}else{
		return false;
	}
};
Table.prototype.getTableLog = function(uuid,logpath,cb) {
	var uuid2 = uuidv1();
	if(this.tables[uuid] !== null && this.tables[uuid].currentGame !== null){
		this.tables[uuid].currentGame.saveLog(uuid2,logpath,function(fileuuid){
			cb(fileuuid);
		});
	}else{
	}
};
Table.prototype.dispenseCards = function(uuid,cb_distrib) {
	var cards = this.tables[uuid].currentGame.getDistribCards();
	for (var key in cards.playerDecks) {
		cb_distrib(this.tables[uuid].info.getPlayer(key),cards.playerDecks[key].deck);
	}
};
Table.prototype.playerSetCtr = function(uuid,player,ctr,announce,nextCtr,redistrib,callCard,showChien,failcb) {
	var table = this.tables[uuid];
	if(table.info.isPlayerSit(player)) {
		if(table.info.isTableComplete()) {
			if(player == table.info.getPlayer(table.currentGame.getPlayerTurn())) {
				var thisPlayer = table.info.getNumPlayer(player);
				table.currentGame.playerSetCtr(thisPlayer,ctr,function(np,pctr){ //Continuer le tour
					announce(thisPlayer,pctr,false);
					if(np !== false) {
						nextCtr(table.info.getPlayer(np),np);
					}
				},function(setChien,chien,lowPlayer,playerCtr) { //Dernier joueur, contrat accepté
					if(setChien) {
						if(table.conf.showchien) {
							for (var key in lowPlayer) {
								showChien(table.info.getPlayer(lowPlayer[key]),chien);
							}
						}
					}
					var callableCards = table.currentGame.getCallableCards(playerCtr);
					callCard(table.info.getPlayer(playerCtr),callableCards,playerCtr);
				},function() { //Dernier joueur, pas de contrat accepté
					failcb("e8");
					//TODO: recup cards, etc...
					var previous = table.currentGame.getLastConfig();
					var gameStarted = new gameClass(table.conf,previous.newDispenser);
					table.currentGame = gameStarted;
					gameStarted.distribute();
					//gameStarted.distributeDebug(3);
					redistrib(table.info.getPlayer(gameStarted.getPlayerTurn()),gameStarted.getPlayerTurn());
				},function(failReason){
					failcb(failReason);
				});
			} else {failcb("r3");}
		} else {failcb("r1");}
	} else {failcb("r9");}
};
Table.prototype.setCall = function(uuid,player,callCard,callback,callbackother,callbackRecap,cbCallChien,failcb) {
	var table = this.tables[uuid];
	if(table.info.isTableComplete()) {
		if(table.info.getPlayer(table.currentGame.getPlayerHigherCtr()) == player) {
			table.currentGame.setCallCard(callCard,table.currentGame.getPlayerHigherCtr(),function(lowPlayer,chien,show){
				callback(chien);
				for (var key in lowPlayer) {
					callbackother(table.info.getPlayer(lowPlayer[key]),callCard,(chien !== false));
				}
			},function(highPlayer,ctr,chien,callCard){ // Garde Contre / G Sans
				var highPlayerName = table.info.getPlayer(highPlayer).name;
				callbackRecap(highPlayerName,ctr,chien,callCard);
			},function(player){ // oups, carte appelée dans le chien
				cbCallChien(player);
			});
		} else {failcb("r2");}
	} else {failcb("r1");}
};
Table.prototype.setChien = function(uuid,player,chien,callbackRecap,cbfail) {
	var table = this.tables[uuid];
	if(table.info.isPlayerSit(player)) {
		if(table.info.isTableComplete()) {
			if(table.info.getPlayer(table.currentGame.getPlayerHigherCtr()) == player) {
				if(table.currentGame.isChienPhase()) {
					table.currentGame.setChien(table.info.getNumPlayer(player),chien,function(highPlayer,ctr,chien,callCard){
						var highPlayerName = table.info.getPlayer(highPlayer).name;
						callbackRecap(highPlayerName,ctr,chien,callCard);
					},function(failreason){
						cbfail(failreason);
					});
				} else {cbfail("r4");}
			} else {cbfail("r5");}
		} else {cbfail("r1");}
	} else {cbfail("r9");}
};
Table.prototype.annonce = function(uuid,player,miseres,poignee,cbOK,cbErr) {
	var table = this.tables[uuid];
	if(table.info.isPlayerSit(player)) {
		if(table.info.isTableComplete()) {
			if(table.currentGame.isStandByPhase()) {
					table.currentGame.annonce(table.info.getNumPlayer(player),miseres,poignee,function(){
						cbOK();
					},function(reason){
						cbErr(reason);
					});
			} else {cbErr("r6");}
		} else {cbErr("r1");}
	} else {cbErr("r9");}
};
Table.prototype.playerSelectCard = function(uuid,player,cardid,failRulecb,okCbNextMove,cbAttFriends,cbEndGame,addScore) {
	var table = this.tables[uuid];
	var that = this;
	if(table.info.isPlayerSit(player)) {
		if(table.info.isTableComplete()) {
			if(table.currentGame.isPlayPhase()) {
				if(table.info.getNumPlayer(player) == table.currentGame.getPlayerTurn()){ //Turn
					table.currentGame.playerDropCard(table.info.getNumPlayer(player),cardid,function(failrule){
						failRulecb(failrule);
					},function(player,nextPlayer,card,nt){
						okCbNextMove(player,nextPlayer,card,table.info.getPlayer(nextPlayer),table.currentGame.getPlayableCards(nextPlayer),nt);
					},function(friends){
						cbAttFriends(friends);
					},function(recap,chien){
						table.info.addHistory(recap.playerDiff,function(historyCount,historyLine){
							cbEndGame(recap,chien,historyLine,historyCount);
						});
						//tableid,tableConfiguration,players,itcount,scores,creationdate
						addScore(uuid,that.getInfoNoCred(uuid),table.info.getPlayers(),table.info.getPlaycount(),recap,table.created);
					});
				} else {failRulecb("r7");}
			} else {failRulecb("r8");}
		} else {failRulecb("r1");}
	} else {failRulecb("r9");}
};

Table.prototype.setReady = function(uuid,player,ready,cbReady,redistrib,cbannonce,cbfail) {
	var table = this.tables[uuid];
	if(table.info.isPlayerSit(player)) {
		if(table.info.isTableComplete()) {
			table.currentGame.setReady(table.info.getNumPlayer(player),ready,function(firtsPlayer){
				cbReady(firtsPlayer);
			},function() {
				var previous = table.currentGame.getLastConfig();
				var gameStarted = new gameClass(table.conf,previous.newDispenser);
				table.currentGame = gameStarted;
				// ---------
				//gameStarted.distributeDebug(3);
				gameStarted.distribute();
				// ---------
				redistrib(table.info.getPlayer(gameStarted.getPlayerTurn()),gameStarted.getPlayerTurn());
			},function(annonce){
				for(var k in annonce) { // traduction des noms
					annonce[k].player = table.info.getPlayer(annonce[k].player).name;
				}
				cbannonce(annonce);
			})
		} else {cbfail("r1");}
	} else {cbfail("r9");}
}

module.exports = Table;