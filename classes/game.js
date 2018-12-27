var cardsClass = require('./cards');
var gameLog = require('./gamelog');
//CONTRACTS
const PASSE = 1;
const PRISE = 2;
const GARDE = 3;
const GARDE_SANS = 4;
const GARDE_CONTRE = 5;
//PHASE
const PHASE_CONTRAT = 0;
const PHASE_CALL = 1;
const PHASE_CHIEN = 2;
const PHASE_STANDBY = 3;
const PHASE_ANNONCE = 4;
const PHASE_PLAY = 5;
const PHASE_END = 6;

function Game(configuration,firstPlayer) {
	// Logging
	this.config = configuration;
	this.log = new gameLog();
	this.saved = null;
	// Variables du tour de jeu
	this.playerDispenser = firstPlayer;
	this.playerFirst = 1;
	// Variables de jeu / distribution
	this.phase = 0;
	this.playerCount = this.config.playercount;
	this.playerTurn = 1;
	this.distrib_cpt = 3;
	this.chien = [];
	this.newchien = [];
	this.players = {};
	for (var i = 1; i <= this.config.playercount; i++) {
		this.players[i] = {
			ctr:null,
			deck:[],
			pli:[],
			ready:false,
			playCard:null,
			rpt:0,
			annonce:{
				teteauchien: false,
				misereTete: false,
				misereAtout: false,
				poignee1: false,
				poignee2: false,
				poignee3: false,
				pcards: []
			}
		};
	}
	if(configuration.playercount == 5) {
		this.chienCount = 3;
	} else {
		this.chienCount = 6;
	}
	this.poignee1 = 8;
	this.poignee2 = 10;
	this.poignee3 = 13;
	// Variables contrat / appel
	this.higherCtr = {ctr:0,chelem:false};
	this.playerCtr = null;
	this.callCard = null;
	this.cards = new cardsClass();
	this.chiengot = false;
	// Variables en jeu
	this.turn = 0;
	this.colorTurn = null;
	this.pliAtt = [];
	this.pliDef = [];
	this.excuseCard = {isPending:false,player:0};
	this.pAB = {att:false,def:false};
	this.recap_points = null;
}
Game.prototype.saveLog = function(uuid,logpath,cb) {
	if(this.phase === PHASE_END) {
		if(this.saved === null) {
			this.log.saveto(uuid,logpath,function(fileuuid){
				cb(fileuuid);
			});
			this.saved = uuid;
		} else {
			cb(this.saved);
		}
	}
};
Game.prototype.excuseExchangeCard = function(lastChance) {
	var exchanged = false;
	var exchangeableCard = false;
	if(this.players[this.excuseCard.player].rpt === 1 || this.players[this.excuseCard.player].rpt === 3) {
		exchangeableCard = this.isExchangeableWithPli(this.pliAtt);
		if(exchangeableCard !== false) {
			this.pliAtt.push(this.cards.getCard(0)); // Excuse
			this.pliAtt.splice(this.pliAtt.indexOf(exchangeableCard), 1); // retirer la carte
			this.pliDef.push(exchangeableCard);
			console.log("[E] Echangée avec",exchangeableCard,"--> defense");
			exchanged = true;
		} else {
			if(lastChance) {
				if(this.higherCtr.chelem) {
					console.log("[E] Chelem: Excuse pour attaque");
					this.pliAtt.push(this.cards.getCard(0));
				}else {
					console.log("[E] Excuse pour defense, PAS DE CHANCE");
					this.pliDef.push(this.cards.getCard(0));
				}
				
			} else {
				console.log("[E] pas de cartes 0.5 trouvée dans pli att");
			}
		}
	} else if(this.players[this.excuseCard.player].rpt === 2) {
		exchangeableCard = this.isExchangeableWithPli(this.pliDef);
		if(exchangeableCard !== false) {
			this.pliDef.push(this.cards.getCard(0)); // Excuse
			this.pliDef.splice(this.pliDef.indexOf(exchangeableCard), 1); // retirer la carte
			this.pliAtt.push(exchangeableCard);
			console.log("[E] Echangée avec",exchangeableCard,"--> attaque");
			exchanged = true;
		} else {
			if(lastChance) {
				if(this.higherCtr.chelem) {
					console.log("[E] Chelem: Excuse pour defense");
					this.pliDef.push(this.cards.getCard(0));
				}else {
					console.log("[E] Excuse pour attaque, PAS DE CHANCE");
					this.pliAtt.push(this.cards.getCard(0));
				}
			} else {
				console.log("[E] pas de cartes 0.5 trouvée dans pli def");
			}
		}
	} else {
		//console.log("[E] impossible selon teams, playerteam:",this.players[this.excuseCard.player].rpt);
	}
	if(exchanged) {
		this.excuseCard.isPending = false;
	}
	return exchangeableCard;
};
Game.prototype.isSameTeam = function(p1,p2) {
	return (this.players[p1].rpt === 1 && (this.players[p2].rpt == 1 || this.players[p2].rpt == 3)) || (this.players[p1].rpt !== 0 && this.players[p1].rpt === this.players[p2].rpt);
};
Game.prototype.deck2Drop = function(player,cardid) {
	var card = this.cards.getCard(cardid);
	this.players[player].deck.splice(this.players[player].deck.indexOf(card), 1);
	this.players[player].playCard = card;
};
Game.prototype.deck2Pli = function(player,cardid) { // Uniquement pour le chien
	var card = this.cards.getCard(cardid);
	this.players[player].deck.splice(this.players[player].deck.indexOf(card), 1);
	this.pliAtt.push(card);
};
Game.prototype.drop2Pli = function(player,endOfTheGame) {
	for(var key in this.players) {
		var cardToPush = this.cards.getCard(this.players[key].playCard.id);
		if(cardToPush.isExcuse && !this.isSameTeam(player,key) && !endOfTheGame) { //Faire une exception pour chelem
			console.log("[E] Excuse non vainqueur");
			this.excuseCard = {isPending:true,player:key};
		} else {
			if(this.players[player].rpt === 0) {
				this.players[player].pli.push(cardToPush);
			} else if(this.players[player].rpt === 1 || this.players[player].rpt === 3) {
				this.pliAtt.push(cardToPush);
			} else if(this.players[player].rpt === 2) {
				this.pliDef.push(cardToPush);
			}
		}
	}
	for(var key in this.players) {
		this.players[key].playCard = null;
	}
};
Game.prototype.chien2Pli = function(cardid) {
	this.chiengot = true;
	var card = this.cards.getCard(cardid);
	this.pliAtt.push(card);
};
Game.prototype.chien2PliDef = function(cardid) {
	this.chiengot = true;
	var card = this.cards.getCard(cardid);
	this.pliDef.push(card);
};
Game.prototype.chien2Deck = function(player,cardid) {
	this.chiengot = true;
	var card = this.cards.getCard(cardid);
	this.players[player].deck.push(card);
};
Game.prototype.pli2Deck = function(player,cardid) {
	var card = this.cards.getCard(cardid);
	this.players[player].pli.splice(this.players[player].pli.indexOf(card), 1);
	this.players[player].deck.push(card);
};
Game.prototype.iterateGameTurn = function(firstPlayer) {
	this.playerFirst = firstPlayer;
	this.playerTurn = firstPlayer;
	this.turn++;
	this.colorTurn = null;
};
Game.prototype.iterate = function(value) {
	if(value == this.playerCount) {
		value = 0;
	}
	value = value+1;
	return value;
};
Game.prototype.citerate = function(value) {
	if(value == 1) {
		value = this.playerCount+1;
	}
	value = value-1;
	return value;
};
Game.prototype.getPlayerDeck = function(player) {
	return this.players[player].deck;
};
Game.prototype.getAllPlayerDeck = function(player) {
	var playerdecks = {};
	for(var k in this.players) {
		playerdecks[k] = this.getcardsid(this.getPlayerDeck(k));
	}
	return playerdecks;
};
Game.prototype.getPlayerPli = function(player) {
	return this.players[player].pli;
};
Game.prototype.getAllPli = function(player) {
	var allpli = {att:this.getcardsid(this.pliAtt),def:this.getcardsid(this.pliDef),players:{}};
	for(var k in this.players) {
		allpli.players[k] = this.getcardsid(this.getPlayerPli(k));
	}
	return allpli;
};
Game.prototype.getAllPlaycard = function() {
	var playedCards = {};
	for(var key in this.players) {
		if(this.players[key].playCard !== null) {
			playedCards[key] = this.players[key].playCard;
		}
	}
	return playedCards;
};
Game.prototype.getAllPlaycard2 = function() {
	var playedCards = {};
	for(var key in this.players) {
		if(this.players[key].playCard !== null) {
			playedCards[key] = this.players[key].playCard.id;
		}
	}
	return playedCards;
	
};
Game.prototype.getcardsid = function(cards) {
	var cardslist = [];
	for(var k in cards) {
		cardslist.push(cards[k].id);
	}
	return cardslist;
}
Game.prototype.citerateTurn = function() {
	this.playerTurn = this.citerate(this.playerTurn);
	return this.playerTurn;
};
Game.prototype.iterateTurn = function() {
	this.playerTurn = this.iterate(this.playerTurn);
	return this.playerTurn;
};
Game.prototype.getPlayerTurn = function() {
	return this.playerTurn;
};
Game.prototype.isContratPhase = function() { return this.phase === PHASE_CONTRAT; };
Game.prototype.isCallPhase = function() { return this.phase === PHASE_CALL; };
Game.prototype.isChienPhase = function() { return this.phase === PHASE_CHIEN; };
Game.prototype.isStandByPhase = function() { return this.phase === PHASE_STANDBY; };
Game.prototype.isPlayPhase = function() { return this.phase === PHASE_PLAY; };

Game.prototype.playerHaveCard = function(player,cardid) {
	return this.players[player].deck.indexOf(this.cards.getCard(cardid)) !== -1;
};
Game.prototype.chienHaveCard = function(cardid) {
	return this.chien.indexOf(this.cards.getCard(cardid)) !== -1;
};
Game.prototype.pliHaveCard = function(player,cardid) {
	return this.players[player].pli.indexOf(this.cards.getCard(cardid)) !== -1;
};
Game.prototype.falseReady = function() {
	for(var key in this.players) {
		this.players[key].ready = false;
	}
};
Game.prototype.readyPlayerTurn = function() {
	if(this.higherCtr.chelem){
		this.playerFirst = this.playerCtr;
	} else {
		this.playerFirst = this.citerate(this.playerDispenser);
	}
	this.playerTurn = this.playerFirst;
};
Game.prototype.distributePlayerTurn = function() {
	this.playerFirst = this.citerate(this.playerDispenser);
	this.playerTurn = this.playerFirst;
};
Game.prototype.getLastConfig = function() {
	var cards = [];
	for(var key in this.players) {
		if(this.players[key].pli.length !== 0) {
			cards = cards.concat(this.players[key].deck);
		}
	}
	cards = cards.concat(this.pliAtt);
	cards = cards.concat(this.pliDef);
	for(var key in this.players) {
		if(this.players[key].pli.length !== 0) {
			cards = cards.concat(this.players[key].pli);
		}
	}
	if(!this.chiengot) {
		cards = cards.concat(this.chien);
	}
	return {
		newDispenser: this.citerate(this.playerDispenser),
		cards : cards
	}
};
Game.prototype.resumeplayer = function(player,cbAskCtr,cbAskCall,cbSetChien,cbRecap,cbAnnonces,cbPlayCards,cbEndGame,cbStatus) {
	this.players[player].ready = false;
	if(this.phase === PHASE_CONTRAT) {
		if(player == this.playerTurn) {
			cbAskCtr();
		}
	}else if(this.phase === PHASE_CALL) {
		if(player == this.playerCtr) {
			cbAskCall(this.getCallableCards(player));
		}
	}else if(this.phase === PHASE_CHIEN) {
		if(player == this.playerCtr) {
			cbSetChien(this.getChien());
		}
	}else if(this.phase === PHASE_STANDBY) {
		cbRecap(this.getPlayerHigherCtr(),this.higherCtr,this.getChien(),this.callCard);
	}else if(this.phase === PHASE_ANNONCE) {
		cbAnnonces(this.getAnnonces().annonces);
	}else if(this.phase === PHASE_PLAY) {
		cbPlayCards(this.getAllPlaycard());
	}else if(this.phase === PHASE_END) {
		cbEndGame(this.recap_points,this.getChien());
	}
	var attplayers = [];
	var ctrplayers = {};
	for(var key in this.players) {
		if(this.players[key].rpt === 1 || this.players[key].rpt === 3) {
			attplayers.push(key);
		}
		ctrplayers[key] = this.players[key].ctr;
	}
	cbStatus(attplayers,ctrplayers,this.playerTurn,this.getPlayerDeck(player));
}
Game.prototype.setReady = function(player,ready,cbAllReady,cbRedistribute,cbAnnonces) {
	this.players[player].ready = ready;
	var allReady = true;
	for(var key in this.players) {
		if(!this.players[key].ready) {
			allReady = false;
		}
	}
	if(allReady) {
		if(this.phase === PHASE_STANDBY) {
			var annonces = this.getAnnonces();
			if(annonces.isAnn) {
				this.falseReady();
				this.phase = PHASE_ANNONCE;
				cbAnnonces(annonces.annonces);
			} else {
				this.readyPlayerTurn();
				this.phase = PHASE_PLAY;
				cbAllReady(this.playerTurn);
			}
			//Logging
			this.log.setTable({config:this.config,
				ctr:this.higherCtr,
				playerCtr:this.playerCtr,
				callcard:this.callCard.id});
			// -----
		} else if(this.phase === PHASE_ANNONCE) {
			this.readyPlayerTurn();
			this.phase = PHASE_PLAY;
			cbAllReady(this.playerTurn);
		} else if(this.phase === PHASE_END){
			cbRedistribute();
		}

	}
};
Game.prototype.getAnnonces = function() {
	var annonces = [];
	var isAnn = false;
	for(var k in this.players) {
		var pann = this.players[k].annonce;
		if(pann.teteauchien || pann.misereTete || pann.misereAtout || pann.poignee1 || pann.poignee2 || pann.poignee3){
			isAnn = true;
			var thisAnn = {player:k};
			if(pann.teteauchien){
				thisAnn.teteauchien = true;
			}
			if(pann.misereTete){
				thisAnn.misereTete = true;
			}
			if(pann.misereAtout){
				thisAnn.misereAtout = true;
			}
			if(pann.poignee1 || pann.poignee2 || pann.poignee3){
				thisAnn.poignee = true;
				thisAnn.poigneeCards = this.players[k].annonce.pcards;
			}
			annonces.push(thisAnn);
		}
	}
	return {isAnn:isAnn,annonces:annonces};
}
Game.prototype.playerSetCtr = function(player,set_ctr,cbCtr,cbstartgame,cbnoctr,cbFail) {
	var okcontinue = true;
	this.players[player].ctr = set_ctr;
	if(set_ctr.ctr !== PASSE) {
		if(set_ctr.ctr > this.higherCtr.ctr) {
			this.higherCtr = set_ctr;
			this.playerCtr = player;
		} else {
			okcontinue = false;
			cbFail("c2");
		}
	}
	if(okcontinue) {
		this.citerateTurn();
		if(this.playerTurn === this.playerFirst){ //Dernier a parler
			cbCtr(false,set_ctr);
			if(this.higherCtr.ctr >= PRISE) { //Contrat accepte
				setChien = true;
				this.phase = PHASE_CALL;
				var chien = this.getChien()
				if(this.higherCtr.ctr === GARDE_SANS) {
					setChien = false;
					for(var key in chien) {this.chien2Pli(chien[key].id);}
				}else if(this.higherCtr.ctr === GARDE_CONTRE) {
					setChien = false;
					for(var key in chien) {this.chien2PliDef(chien[key].id);}
				}
				cbstartgame(setChien,chien,this.getPlayerLowerCtr(),this.playerCtr);
			} else {
				// Redistribuer
				this.phase = PHASE_CONTRAT;
				cbnoctr(); // Bye
			}
		} else {
			cbCtr(this.playerTurn,set_ctr);
		}
	}
};
Game.prototype.getPlayerHigherCtr = function() {
	return this.playerCtr;
};
Game.prototype.getPlayerLowerCtr = function() {
	var lowPlayer = [];
	for (var key in this.players) {
		if(key != this.playerCtr) {
			lowPlayer.push(key);
		}
	}
	return lowPlayer;
};
Game.prototype.getAllCardsLevel = function(level) {
	var rcards = [];
	var allCards = this.cards.getOrderedCards();
	for(var key in allCards) {
		if(allCards[key].level === level && allCards[key].color !== 0)
		{
			rcards.push(allCards[key]);
		}
	}
	return rcards;
};
Game.prototype.getCallableCards = function(player) {
	var rcards = this.getAllCardsLevel(14);
	var check = this.checkPlayerDeck(player);
	if(check.all14) {
		rcards = rcards.concat(this.getAllCardsLevel(13));
	}
	if(check.all13) {
		rcards = rcards.concat(this.getAllCardsLevel(12));
	}
	if(check.all12) {
		rcards = rcards.concat(this.getAllCardsLevel(11));
	}
	return rcards;
};
Game.prototype.setCallCard = function(callCard,player,callback,readyCb,chienSetFriend) {
	var callable = this.getCallableCards(player);
	var okcall = false;
	for(var key in callable) {
		if(callCard.id === callable[key].id) {
			okcall = true;
		}
	}
	if(okcall) {
		this.callCard = callCard;
		setChien = !(this.higherCtr.ctr === GARDE_SANS || this.higherCtr.ctr === GARDE_CONTRE);
		if(setChien) {
			this.phase = PHASE_CHIEN;
			var chien = this.getChien();
			oups = false;
			for(var k in chien) {
				if(chien[k].id == callCard.id){
					oups = true;
				}
			}
			if(oups) {
				this.setFriend(this.playerCtr,player);
				chienSetFriend(player);
			}
			callback(this.getPlayerLowerCtr(),chien);
		} else {
			this.phase = PHASE_STANDBY;
			callback(this.getPlayerLowerCtr(),false);
			readyCb(this.getPlayerHigherCtr(),this.higherCtr,[],this.callCard);
		}
	}
};
Game.prototype.getChien = function() {
	return this.chien;
};
Game.prototype.setChien = function(player,chien,callback,cbfail) {
	if(chien.length === this.chienCount){
		var checkChien = true;
		// check anti triche
		for (var key in chien) {
			var oneCard = chien[key];
			if(!this.chienHaveCard(oneCard.id) && !this.playerHaveCard(player,oneCard.id))
			{
				checkChien = false;
			}
		}
		if(checkChien) {
			this.newchien = chien;
			// modification du deck et du pli
			for(var key in this.players[player].deck) {
				var deck2pli = false;
				for(var k in chien) {
					if(chien[k].id === this.players[player].deck[key].id) {
						deck2pli = true;
					}
				}
				if(deck2pli) {
					this.deck2Pli(player,this.players[player].deck[key].id);
				}
			}
			var ochien = this.getChien()
			for(var key in ochien) {
				var chien2chien = false;
				for(var k in chien) {
					if(chien[k].id === ochien[key].id) {
						chien2chien = true;
					}
				}
				if(chien2chien) {
					this.chien2Pli(ochien[key].id);
				} else {
					this.chien2Deck(player,ochien[key].id);
				}
			}
			//têtes au chien ?
			for(var c in this.newchien){
				if(this.newchien[c].color !== 0 && this.newchien[c].level > 10){
					this.players[player].annonce.teteauchien = true;
				}
			}
			// terminé, envoi du recap
			this.phase = PHASE_STANDBY;
			callback(this.getPlayerHigherCtr(),this.higherCtr,this.getChien(),this.callCard);
		}
	}else{
		cbfail("c1");
	}
};
Game.prototype.annoncePoignee = function(player,cards,stat) {
	var result = {ok:false,reason:null,cards:null}
	var process = true;
	var joker = false;
	var triCartes1 = function(carda,cardb){
		return carda.level > cardb.level;
	};
	if(cards.length === this.poignee1 || cards.length === this.poignee2 || cards.length === this.poignee3)
	{
		for(var k in cards) {
			if(!this.playerHaveCard(player,cards[k].id) || cards[k].color !== 0) {
				process = false;
				result.reason = "p1";
			}
			if(cards[k].isExcuse && !stat.petit && !stat.bout21) {
				process = false;
				result.reason = "p2";
			}else if(cards[k].isExcuse){
				joker = true;
			}
		}
		if(process) {
			//Tri des cartes
			for(var i= 0 ; i< cards.length; i++){ 
				for(var j=i+1; j< cards.length; j++){
					if(triCartes1( cards[j], cards[i]) ){
						var temp = cards[j];
						cards[j]=cards[i];
						cards[i]=temp;
					}
				}
			}
			var upperlevel = cards[0].level;
			if(joker) {
				var lowerlevel = cards[cards.length -2].level; //L'excuse se trouve tout en bas
			} else {
				var lowerlevel = cards[cards.length -1].level;
			}
			var notfoundCard = 0;
			for(var i=upperlevel ; i>lowerlevel -1; i--){
				var foundCard = false;
				for(var k in cards)	{
					if(cards[k].level === i) {
						foundCard = true;
					}
				}
				if(!foundCard) {notfoundCard++;}
			}
			if(notfoundCard === 0 || (notfoundCard === 1 && joker)) {
				result.cards = cards;
				result.ok = true;
			} else {
				result.reason = "p3";
			}
		}
	} else {
		result.reason = "p4";
	}
	return result;
};
Game.prototype.annonce = function(player,miseres,poignee,cbOk,cbErr) {
	var tpa = this.players[player].annonce;
	if(!tpa.misereTete && !tpa.misereAtout && !tpa.poignee1 && !tpa.poignee2 && !tpa.poignee3) {
		var stat = this.checkPlayerDeck(player);
		var process = true;
		var failReason = null;
		var declared = false;
		if(miseres.atout || miseres.tete) {
			if(this.config.misere) {
				if(miseres.atout) { // Déclaré
					if(stat.pasAtout) { // Réel
						this.players[player].annonce.misereAtout = true;
						declared = true;
					} else {
						process = false;
						failReason = "m1";
					}
				}
				if(miseres.tete && process) { // Déclaré
					if(stat.pasTete) { // Réel
						this.players[player].annonce.misereTete = true;
						declared = true;
					} else {
						process = false;
						failReason ="m2";
					}
				}
			} else {
				process = false;
				failReason ="m3";
			}
		}
		if(poignee.length !== 0 && process) {
			if(this.config.poignee) {
				var processpoignee = this.annoncePoignee(player,poignee,stat);
				if(processpoignee.ok){
					this.players[player].annonce.pcards = processpoignee.cards;
					if(processpoignee.cards.length === this.poignee1) {
						this.players[player].annonce.poignee1 = true;
					}else if(processpoignee.cards.length === this.poignee2) {
						this.players[player].annonce.poignee2 = true;
					} else if(processpoignee.cards.length === this.poigne31) {
						this.players[player].annonce.poignee3 = true;
					}
					declared = true;
				} else {
					process = false;
					failReason = processpoignee.reason;
				}
			} else {
				process = false;
				failReason ="m4";
			}
		}
		// ---
		if(process) {
			if(declared){
				cbOk();
			} else {
				cbErr("a2");
			}
		} else {
			cbErr(failReason);
		}
	} else {
		cbErr("a1");
	}
};
Game.prototype.getDistribCards = function() {
	return {
		playerDecks : this.players,
		chien : this.getChien()
	};
};
Game.prototype.getPlayableCards = function(player) {
	playableCards = [];
	for(var key in this.players[player].deck) {
		if(this.canPlay(player,this.players[player].deck[key].id,false)) {
			playableCards.push(this.players[player].deck[key].id);
		}
	}
	return playableCards;
};
Game.prototype.canPlay = function(player,cardid,notify) {
	var card = this.cards.getCard(cardid);
	var stat = this.checkPlayerDeck(player);
	var canPlay = true;
	if(this.colorTurn !== null) {
		if(card.color !== this.colorTurn && card.color !== 0) {
			if(!stat.pasAtout) {
				canPlay = false;
				if(notify) {notify("e3")}
			}else if(stat.color[this.colorTurn] > 0){
				canPlay = false;
				if(notify) {notify("e4")}
			}
		}else if(card.color === 0 && !card.isExcuse && this.colorTurn !== 0) {
			if(this.checkPlayerDeckForColor(player,this.colorTurn) !== 0) {
				if(notify) {notify("e5")}
				canPlay = false;
			}
		}
	}
	if(this.turn === 0 && card.color === this.callCard.color && card.level !== this.callCard.level && !this.isCardDropped(this.callCard.id).isPlay){
		if(notify) {notify("e6")}
		canPlay = false;
	}
	if(card.color === 0 && !card.isExcuse) {
		var higherAtout = this.getHigherAtoutCardPlay()
		if(card.level < higherAtout) {
			if(this.checkPlayerDeckForColor(player,0) > higherAtout) {
				canPlay = false;
				if(notify) {notify("e7")}
			}
		}
	}
	return canPlay;
}
Game.prototype.isPetit = function() {
	var petit = false;
	for(var key in this.players) {
		if(this.players[key].playCard.color == 0 && this.players[key].playCard.level == 1) {
			petit = true;
		}
	}
	return petit;
}
Game.prototype.getFriendCount = function() {
	var result = {att: 0, def: 0};
	for(var key in this.players) {
		if(this.players[key].rpt !== 2) {
			result.att = result.att + 1;
		} else {
			result.def = result.def + 1;
		}
	}
	return result;
}
Game.prototype.setFriend = function(pPlayer,player) {
	for(var key in this.players) {
		if(key === pPlayer) {
			this.pliAtt = this.pliAtt.concat(this.players[key].pli);
			this.players[key].pli = [];
			this.players[key].rpt = 1;
		} else if(key === player) {
			this.pliAtt = this.pliAtt.concat(this.players[key].pli);
			this.players[key].pli = [];
			this.players[key].rpt = 3;
		} else {
			this.pliDef = this.pliDef.concat(this.players[key].pli);
			this.players[key].pli = [];
			this.players[key].rpt = 2;
		}
	}
}
Game.prototype.isOulder = function(card) {
	return (card.isExcuse || (card.color == 0 && (card.level == 1 || card.level == 21)))
}
Game.prototype.countPoints = function() {
	// debug
	for(var key in this.players) {
		if(this.players[key].pli.length !== 0) {
			console.error("ERREUR FATALE: un pli n'est pas vide",key,this.players[key].pli);
		}
	}
	// ----
	var recap = {};
	var pointsAtt = 0;
	var pointsDef = 0;
	var pointsWithOulders = {0: 56, 1: 51, 2: 41, 3: 36};
	var attOulders = 0;
	var attWin = true;
	var teamCount = this.getFriendCount();
	for(var key in this.pliAtt) { // Parcour du pli attaque
		var pointsCAtt = this.cards.getCardPoints(this.pliAtt[key].id);
		pointsAtt = pointsAtt + pointsCAtt;
		if(this.isOulder(this.pliAtt[key])) {
			attOulders++;
		}
	}
	var pointsToWin = pointsWithOulders[attOulders];
	for(var key in this.pliDef) {
		var pointsCDef = this.cards.getCardPoints(this.pliDef[key].id);
		pointsDef = pointsDef + pointsCDef;
	}
	recap.pointsAtt = pointsAtt;
	recap.pointsDef = pointsDef;
	recap.attOuldersCount = attOulders;
	recap.pointsToWin = pointsToWin;
	var diffAtt = pointsAtt - pointsToWin;
	var diffDef = pointsToWin - pointsAtt;
	recap.diffAtt = diffAtt;
	recap.diffDef = diffDef;
	if(diffAtt < 0) {
		attWin = false;
		recap.resultContrat = "Défense gagne !";
		var diffAtt_ctr = diffAtt - 25;
		var diffDef_ctr = diffDef + 25;
	} else {
		recap.resultContrat = "Attaque gagne !";
		var diffAtt_ctr = diffAtt + 25;
		var diffDef_ctr = diffDef - 25;
	}
	var multiply = 1;
	recap.ctr = this.higherCtr;
	if (this.higherCtr.ctr === GARDE) {
		multiply = 2;
	}else if (this.higherCtr.ctr === GARDE_SANS) {
		multiply = 4;
	}else if (this.higherCtr.ctr === GARDE_CONTRE) {
		multiply = 6;
	}
	recap.multiplier = multiply;
	
	var totalPointsAtt = diffAtt_ctr * multiply;
	var totalPointsDef = diffDef_ctr * multiply;
	recap.totalPointsAtt = totalPointsAtt;
	recap.totalPointsDef = totalPointsDef;
	
	// Primes
	var prizeAtt = 0;
	var prizeDef = 0;
	//	Annonces
	annoncePrize = 0;
	for(var k in this.players) {
		if(this.players[k].annonce.poignee1) {annoncePrize = annoncePrize + 20}
		if(this.players[k].annonce.poignee2) {annoncePrize = annoncePrize + 30}
		if(this.players[k].annonce.poignee3) {annoncePrize = annoncePrize + 40}
		if(this.players[k].annonce.misereTete) {annoncePrize = annoncePrize + 10}
		if(this.players[k].annonce.misereAtout) {annoncePrize = annoncePrize + 10}
	}
	if(attWin) {
		prizeAtt = prizeAtt + (annoncePrize*teamCount.def);
		prizeDef = prizeDef - (annoncePrize*teamCount.def);
	} else {
		prizeAtt = prizeAtt - (annoncePrize*teamCount.att);
		prizeDef = prizeDef + (annoncePrize*teamCount.att);
	}
	//	Chelem
	if(this.higherCtr.chelem && this.pliDef.length === 0) {
		prizeAtt = prizeAtt + 400;
	}else if(!this.higherCtr.chelem && this.pliDef.length === 0) {
		prizeAtt = prizeAtt + 200;
	}else if(this.higherCtr.chelem && this.pliDef.length !== 0) {
		prizeAtt = prizeAtt - 200;
	}
	if(this.pliAtt.length === 0) {
		prizeDef = prizeDef + 200;
	}
	//	Petit au bout
	if(this.pAB.att) { // PAB pour att dans total
		prizeAtt = prizeAtt + (10 * multiply);
	}
	// ----
	totalPointsAtt = totalPointsAtt + prizeAtt; 
	totalPointsDef = totalPointsDef + prizeDef; 
	recap.prizeAtt = prizeAtt;
	recap.prizeDef = prizeDef;
	
	recap.distribute = teamCount;
	
	var PrePoints = 0;
	var CoePoints = 0;
	var DefPoints = 0;
	if(teamCount.att == 1) { // si attaquant seul
		PrePoints = Math.floor(totalPointsAtt);
		DefPoints = Math.floor(totalPointsDef / teamCount.def);
	} else {
		PrePoints = Math.floor((totalPointsAtt / 3) * 2);
		CoePoints = Math.floor(totalPointsAtt / 3);
		DefPoints = Math.floor(totalPointsDef / teamCount.def);
	}
	if(this.pAB.def) { //PAB pour def collective
		DefPoints = DefPoints + (10 * multiply);
	}
	
	recap.PrePoints = PrePoints;
	recap.CoePoints = CoePoints;
	recap.DefPoints = DefPoints;
	// ---
	var playerDiff = {};
	for(var key in this.players) {
		if(this.players[key].rpt == 1) { //attaque
			playerDiff[key] = PrePoints;
		}else if(this.players[key].rpt == 2) { //defense
			playerDiff[key] = DefPoints;
		} else if(this.players[key].rpt == 3) { //attaque (coe)
			playerDiff[key] = CoePoints;
		}
	}
	recap.playerDiff = playerDiff;
	return recap;
}
Game.prototype.playerDropCard = function(player,cardid,cbRuleFail,cbNextMove,cbGotTeam,cbEndGame) {
	var card = this.cards.getCard(cardid);
	if(this.playerHaveCard(player,card.id)) {
		if(this.canPlay(player,card.id,cbRuleFail)) {
			if(this.colorTurn === null) {
				if(!card.isExcuse) {
					this.colorTurn = card.color;
				}
			}
			if(card.id === this.callCard.id) {
				this.setFriend(this.playerCtr,player);
				if(player !== this.playerCtr) {
					cbGotTeam([player,this.playerCtr]);
				} else {
					cbGotTeam([player]);
				}
			}
			this.deck2Drop(player,card.id);
			var nt = this.citerateTurn();
			if(this.playerFirst === nt) {
				var winnerPlayer = this.processWinner(this.colorTurn);
				var endOfTheGame = (this.cards.getCount() - this.chienCount) / this.playerCount == this.turn + 1;
				
				if(endOfTheGame) { //Vérification dernier plis avant drop 2 pli
					for(var k in this.newchien) {// Carte appelee dans chien ?
						if(this.newchien[k].id == this.callCard.id){
							this.setFriend(this.playerCtr,this.playerCtr);
							console.log("OUPS !! (A ETE DROPé DANS CHIEN) !! PEUT ETRE PAS LEGAL");
						}
					}
					if(this.isCardDropped(5).isPlay) { // petit au bout
						if(this.isSameTeam(this.playerCtr,winnerPlayer)) {
							this.pAB.att = true;
						} else {
							this.pAB.def = true;
						}
					}
				}
				//logging
				
				var allPlayerDeck = this.getAllPlayerDeck();
				var allPlayCard = this.getAllPlaycard2();
				var allPli = this.getAllPli();
				// -----
				this.drop2Pli(winnerPlayer,endOfTheGame);
				// -----
				var excuse = {
					pending: this.excuseCard.isPending,
					player: this.excuseCard.player,
				}
				var excuseExchange = false;
				if(this.excuseCard.isPending) {
					excuseExchange = this.excuseExchangeCard(endOfTheGame); //Si oui c'est la dernière chance pour l'excuse
				}
				if(excuseExchange !== false) {
					excuse.exchange = excuseExchange.id;
				}
				var turnlog = {count:this.turn,win:winnerPlayer,first:this.playerFirst,excuse:excuse}
				this.log.addPlay(allPlayerDeck,allPlayCard,turnlog,allPli);
				this.iterateGameTurn(winnerPlayer);
				cbNextMove(player,winnerPlayer,card,true,endOfTheGame);
				if(endOfTheGame) {
					// Carte appelee dans chien ?
					/*
					for(var k in this.newchien) {
						if(this.newchien[k].id == this.callCard.id){
							this.setFriend(this.playerCtr,this.playerCtr);
							console.log("OUPS !! (A ETE DROPé DANS CHIEN) !! PEUT ETRE PAS LEGAL");
						}
					}
					*/
					this.phase = PHASE_END;
					this.recap_points = this.countPoints();
					this.falseReady();
					cbEndGame(this.recap_points,this.getChien());
					this.log.setendpli(this.getAllPli(),this.recap_points);
				}
			} else {
				cbNextMove(player,nt,card,false,false);
			}
		}
	}
};
Game.prototype.processWinner = function(color) {
	var highValue = 0;
	var winner = 0;
	for(var key in this.players)
	{
		var value = 0;
		var card = this.players[key].playCard;
		if(card.color !== color && card.color !== 0) {
			value = 0;
		}
		if(card.color == color && card.color !== 0) {
			value = card.level;
		}
		if(card.color == 0 && !card.isExcuse) {
			value = card.level + 15; //14 etant roi
		}
		if(value > highValue) {
			winCard = card;
			winner = key;
			highValue = value;
		}
	}
	return parseInt(winner,10);
}
Game.prototype.isExchangeableWithPli = function(pli) {
	var canExchange = false;
	var cardToExchange = null;
	for(var key in pli) {
		if(this.cards.getCardPoints(pli[key].id) == 0.5) {
			canExchange = true;
			cardToExchange = pli[key];
		}
	}
	if(canExchange) {
		return cardToExchange;
	} else {
		return false;
	}
}
Game.prototype.isCardDropped = function(cardid) {
	var result = {isPlay:false,player:0}
	var droppedcard = [];
	for(var key in this.players) {
		if(this.players[key].playCard !== null) {
			droppedcard.push(this.players[key].playCard);
			if(this.players[key].playCard.id === cardid) {
				result = {isPlay:true,player:key};
			}
		}
	}
	return result;
}
Game.prototype.checkPlayerDeckForColor = function(player,color) {
	var higherColor = 0;
	for(var key in this.players[player].deck) {
		if(!this.players[player].deck[key].isExcuse) {
			if(this.players[player].deck[key].color === color) {
				if(this.players[player].deck[key].level > higherColor) {
					higherColor = this.players[player].deck[key].level;
				}
			}
		}
	}
	return higherColor;
}
Game.prototype.getHigherAtoutCardPlay = function() {
	var highLevel = 0;
	for(var key in this.players) {
		if(this.players[key].playCard !== null) {
			if(!this.players[key].playCard.isExcuse && this.players[key].playCard.color === 0) {
				if(this.players[key].playCard.level > highLevel) {
					highLevel = this.players[key].playCard.level;
				}
			}
		}
	}
	return highLevel;
}
Game.prototype.checkPlayerDeck = function(player) {
	var atoutCount = 0;
	var upCount = 0;
	var excuse = false;
	var petit = false;
	var bout21 = false;
	var count14 = 0;
	var count13 = 0;
	var count12 = 0;
	var count11 = 0;
	var cardCount = 0;
	var color = {0:0,1:0,2:0,3:0,4:0};
	for(var key in this.players[player].deck) {
		cardCount++;
		if(this.players[player].deck[key].isExcuse) {
			excuse = true;
		} else {
			color[this.players[player].deck[key].color] = color[this.players[player].deck[key].color] + 1
		}
		if(this.players[player].deck[key].level === 21 && this.players[player].deck[key].color === 0) {
			bout21 = true;
		}
		if(this.players[player].deck[key].level === 1 && this.players[player].deck[key].color === 0) {
			petit = true;
		}
		if(this.players[player].deck[key].color === 0 && !this.players[player].deck[key].isExcuse) {
			atoutCount++;
		}
		if(this.players[player].deck[key].color !== 0 && this.players[player].deck[key].level > 10) {
			upCount++;
			if(this.players[player].deck[key].level === 14) {
				count14++;
			}
			if(this.players[player].deck[key].level === 13) {
				count13++;
			}
			if(this.players[player].deck[key].level === 12) {
				count12++;
			}
			if(this.players[player].deck[key].level === 11) {
				count11++;
			}
		}

	}
	return {
		cardCount: cardCount,
		excuse: excuse,
		petit: petit,
		bout21: bout21,
		petitSec: (atoutCount === 1 && petit && !excuse),
		pasTete: (upCount === 0),
		pasAtout: (atoutCount === 0),
		poignee1: (atoutCount >= this.poignee1),
		poignee2: (atoutCount >= this.poignee2),
		poignee3: (atoutCount >= this.poignee3),
		all14: (count14 === 4),
		all13: (count13 === 4),
		all12: (count12 === 4),
		all11: (count11 === 4),
		color : color
	}
};
Game.prototype.distributeDebug = function(scene) {
	this.cards.firstInitDebug();
	var cards = this.cards.getCards();
	var repart = this.cards.getDebugScene(scene)
	// Distribution
	for(var k in repart) {
		for(var j in repart[k]) {
			var card = this.cards.getCard(repart[k][j]);
			if(k == 0) {
				this.chien.push(card);
			} else {
				this.players[k].deck.push(card);
			}
		}
	}
	this.distributePlayerTurn();
};
Game.prototype.distribute = function(oldcards,cut) {
	var cut = cut !== undefined ? cut : 0;
	// Recuperation paquet de cartes ou nouveau
	if(oldcards === undefined) {
		this.cards.firstInit();
	} else {
		this.cards.setCards(oldcards);
	}
	var cards = this.cards.getCards();
	
	// Coupe
	cards = cards.slice(cut).concat(cards.slice(0,cut));
	
	// Distribution
	var slice_num = (cards.length - this.chienCount) / this.distrib_cpt;
	var card_count = (cards.length - this.chienCount) / this.playerCount;
	var thisPlayerCardsCount = 0;
	var playerCardsCount = 0;
	var rand_pick = [];
	var rand_sel = [];
	for (let r = 1; r <= slice_num; r++) {
		 rand_pick.push(r); 
	}
	for (let c = 0; c < this.chienCount; c++) {
		var irem = Math.floor(Math.random() *  ((rand_pick.length - 1) - 1) + 1);
		rand_sel.push(rand_pick[irem]);
		rand_pick.splice(irem, 1);
	}	
	for (let i = 0; i < cards.length; i++) {
		var itour = Math.floor(i / this.distrib_cpt);
		if(rand_sel.indexOf(itour) !== -1) {
			this.chien.push(cards[i]);
			rand_sel.splice(rand_sel.indexOf(itour), 1);
		}else{
			if(thisPlayerCardsCount == 3) {
				this.citerateTurn();
				thisPlayerCardsCount = 0;
			}
			this.players[this.playerTurn].deck.push(cards[i]);
			thisPlayerCardsCount++;
			playerCardsCount++;
		}
	}
	this.distributePlayerTurn();
	// Apres c'est plus de la distrib
	var checkDistrib = true;
	var errReason = "";
	for(var k in this.players) {
		var checkdeck = this.checkPlayerDeck(k);
		if(checkdeck.petitSec) {
			checkDistrib = false;
			errReason = "e1";
		}
		if(card_count !== checkdeck.cardCount) {
			checkDistrib = false;
			errReason = "e2";
		}
	}
	if(!checkDistrib) {
		console.log(errReason);
	} else {
		// logging
		var decks = {chien:this.getcardsid(this.chien)};
		for(var j in this.players) {
			decks[j] = this.getcardsid(this.players[j].deck);
		}
		this.log.setstartdeck(decks);
		// -------
	}
	return {check:checkDistrib,reason:errReason};
};
module.exports = Game;