function Cards() {
	this.cards = [];
	this.ccount = 78;
}
Cards.prototype.getOrderedCards = function() {
	return [
		{id:0,image:"00-T.png",isExcuse:true,color:0,level:0},
		{id:1,image:"01-C.png",isExcuse:false,color:1,level:1},
		{id:2,image:"01-D.png",isExcuse:false,color:2,level:1},
		{id:3,image:"01-H.png",isExcuse:false,color:3,level:1},
		{id:4,image:"01-S.png",isExcuse:false,color:4,level:1},
		{id:5,image:"01-T.png",isExcuse:false,color:0,level:1},
		{id:6,image:"02-C.png",isExcuse:false,color:1,level:2},
		{id:7,image:"02-D.png",isExcuse:false,color:2,level:2},
		{id:8,image:"02-H.png",isExcuse:false,color:3,level:2},
		{id:9,image:"02-S.png",isExcuse:false,color:4,level:2},
		{id:10,image:"02-T.png",isExcuse:false,color:0,level:2},
		{id:11,image:"03-C.png",isExcuse:false,color:1,level:3},
		{id:12,image:"03-D.png",isExcuse:false,color:2,level:3},
		{id:13,image:"03-H.png",isExcuse:false,color:3,level:3},
		{id:14,image:"03-S.png",isExcuse:false,color:4,level:3},
		{id:15,image:"03-T.png",isExcuse:false,color:0,level:3},
		{id:16,image:"04-C.png",isExcuse:false,color:1,level:4},
		{id:17,image:"04-D.png",isExcuse:false,color:2,level:4},
		{id:18,image:"04-H.png",isExcuse:false,color:3,level:4},
		{id:19,image:"04-S.png",isExcuse:false,color:4,level:4},
		{id:20,image:"04-T.png",isExcuse:false,color:0,level:4},
		{id:21,image:"05-C.png",isExcuse:false,color:1,level:5},
		{id:22,image:"05-D.png",isExcuse:false,color:2,level:5},
		{id:23,image:"05-H.png",isExcuse:false,color:3,level:5},
		{id:24,image:"05-S.png",isExcuse:false,color:4,level:5},
		{id:25,image:"05-T.png",isExcuse:false,color:0,level:5},
		{id:26,image:"06-C.png",isExcuse:false,color:1,level:6},
		{id:27,image:"06-D.png",isExcuse:false,color:2,level:6},
		{id:28,image:"06-H.png",isExcuse:false,color:3,level:6},
		{id:29,image:"06-S.png",isExcuse:false,color:4,level:6},
		{id:30,image:"06-T.png",isExcuse:false,color:0,level:6},
		{id:31,image:"07-C.png",isExcuse:false,color:1,level:7},
		{id:32,image:"07-D.png",isExcuse:false,color:2,level:7},
		{id:33,image:"07-H.png",isExcuse:false,color:3,level:7},
		{id:34,image:"07-S.png",isExcuse:false,color:4,level:7},
		{id:35,image:"07-T.png",isExcuse:false,color:0,level:7},
		{id:36,image:"08-C.png",isExcuse:false,color:1,level:8},
		{id:37,image:"08-D.png",isExcuse:false,color:2,level:8},
		{id:38,image:"08-H.png",isExcuse:false,color:3,level:8},
		{id:39,image:"08-S.png",isExcuse:false,color:4,level:8},
		{id:40,image:"08-T.png",isExcuse:false,color:0,level:8},
		{id:41,image:"09-C.png",isExcuse:false,color:1,level:9},
		{id:42,image:"09-D.png",isExcuse:false,color:2,level:9},
		{id:43,image:"09-H.png",isExcuse:false,color:3,level:9},
		{id:44,image:"09-S.png",isExcuse:false,color:4,level:9},
		{id:45,image:"09-T.png",isExcuse:false,color:0,level:9},
		{id:46,image:"10-C.png",isExcuse:false,color:1,level:10},
		{id:47,image:"10-D.png",isExcuse:false,color:2,level:10},
		{id:48,image:"10-H.png",isExcuse:false,color:3,level:10},
		{id:49,image:"10-S.png",isExcuse:false,color:4,level:10},
		{id:50,image:"10-T.png",isExcuse:false,color:0,level:10},
		{id:51,image:"11-C.png",isExcuse:false,color:1,level:11},
		{id:52,image:"11-D.png",isExcuse:false,color:2,level:11},
		{id:53,image:"11-H.png",isExcuse:false,color:3,level:11},
		{id:54,image:"11-S.png",isExcuse:false,color:4,level:11},
		{id:55,image:"11-T.png",isExcuse:false,color:0,level:11},
		{id:56,image:"12-C.png",isExcuse:false,color:1,level:12},
		{id:57,image:"12-D.png",isExcuse:false,color:2,level:12},
		{id:58,image:"12-H.png",isExcuse:false,color:3,level:12},
		{id:59,image:"12-S.png",isExcuse:false,color:4,level:12},
		{id:60,image:"12-T.png",isExcuse:false,color:0,level:12},
		{id:61,image:"13-C.png",isExcuse:false,color:1,level:13},
		{id:62,image:"13-D.png",isExcuse:false,color:2,level:13},
		{id:63,image:"13-H.png",isExcuse:false,color:3,level:13},
		{id:64,image:"13-S.png",isExcuse:false,color:4,level:13},
		{id:65,image:"13-T.png",isExcuse:false,color:0,level:13},
		{id:66,image:"14-C.png",isExcuse:false,color:1,level:14},
		{id:67,image:"14-D.png",isExcuse:false,color:2,level:14},
		{id:68,image:"14-H.png",isExcuse:false,color:3,level:14},
		{id:69,image:"14-S.png",isExcuse:false,color:4,level:14},
		{id:70,image:"14-T.png",isExcuse:false,color:0,level:14},
		{id:71,image:"15-T.png",isExcuse:false,color:0,level:15},
		{id:72,image:"16-T.png",isExcuse:false,color:0,level:16},
		{id:73,image:"17-T.png",isExcuse:false,color:0,level:17},
		{id:74,image:"18-T.png",isExcuse:false,color:0,level:18},
		{id:75,image:"19-T.png",isExcuse:false,color:0,level:19},
		{id:76,image:"20-T.png",isExcuse:false,color:0,level:20},
		{id:77,image:"21-T.png",isExcuse:false,color:0,level:21}
	];
};
Cards.prototype.getDebugScene = function(scene) {
	var scenes = {
		0: { //Tous les rois au premier joueur
			0:[76,2,35],
			1:[21,29,63,51,69,67,53,9,68,38,77,65,39,66,36],
			2:[61,11,4,1,31,70,27,17,72,15,13,59,57,71,16],
			3:[62,12,55,23,22,19,43,58,0,18,50,10,8,45,41],
			4:[75,34,56,49,37,46,26,42,30,14,32,64,33,7,47],
			5:[48,28,54,74,52,3,40,73,20,25,60,24,44,5,6]
		},
		1:{ //Tous les plus gros atouts au premier joueur
			0:[19,69,77],
			1:[5,35,40,45,50,55,60,65,70,71,72,73,74,75,76],
			2:[9,10,13,15,18,20,25,30,32,37,47,52,57,62,67],
			3:[0,2,4,7,16,22,23,27,31,33,36,38,42,44,48],
			4:[1,3,6,8,11,17,21,24,29,39,41,46,49,51,54],
			5:[12,14,26,28,34,43,53,56,58,59,61,63,64,66,68]
		},
		2:{ //Tous les plus gros atouts au premier joueur + excuse
			0:[19,69,77],
			1:[5,35,40,45,50,55,60,65,70,71,72,73,74,75,0],
			2:[9,10,13,15,18,20,25,30,32,37,47,52,57,62,67],
			3:[76,2,4,7,16,22,23,27,31,33,36,38,42,44,48],
			4:[1,3,6,8,11,17,21,24,29,39,41,46,49,51,54],
			5:[12,14,26,28,34,43,53,56,58,59,61,63,64,66,68]
		},
		3:{ //Poignée joueur 1 et 2, miseres
			0:[19,69,77],
			1:[9,13,45,50,55,60,65,70,73,57,62,0,72,74,75],
			2:[5,10,40,35,13,15,18,20,25,30,32,71,52,37,47,67],
			3:[76,2,4,7,16,22,23,27,31,33,36,38,42,44,48],
			4:[1,3,6,8,11,17,21,24,29,39,41,46,49,51,54],
			5:[12,14,26,28,34,43,53,56,58,59,61,63,64,66,68]
		},
		99:{ //template
			0:[],
			1:[],
			2:[],
			3:[],
			4:[],
			5:[]
		}
	};
	return scenes[scene];
};
Cards.prototype.firstInit = function() {
	var cards = this.getOrderedCards();
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    this.cards = cards;
};
Cards.prototype.firstInitDebug = function() {
	var cards = this.getOrderedCards();
    this.cards = cards;
};
Cards.prototype.getCard = function(id) {
	for (let i = 0; i < this.cards.length; i++) {
		if(this.cards[i].id === id) {
			return this.cards[i];
		}
	}
};
Cards.prototype.getCardPoints = function(cardid) {
	var card = this.getCard(cardid);
	var points = 0;
	if(card.color !== 0) {
		if(card.level === 14) {points = 4.5}
		if(card.level === 13) {points = 3.5}
		if(card.level === 12) {points = 2.5}
		if(card.level === 11) {points = 1.5}
	} else {
		if(card.level === 1) {points = 4.5}
		if(card.level === 21) {points = 4.5}
		if(card.isExcuse) {points = 4.5}
	}
	if(points === 0) {
		points = 0.5;
	}
	return points;
};
Cards.prototype.setCards = function(cards) {
	this.cards = cards;
};
Cards.prototype.getCount = function() {
	return this.ccount;
};
Cards.prototype.getCards = function() {
	return this.cards;
};
module.exports = Cards;