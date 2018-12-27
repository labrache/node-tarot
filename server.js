var fs = require('fs');
var config = JSON.parse(fs.readFileSync((process.argv.slice(2)[0] ? process.argv.slice(2)[0] : "data/default.json"), "utf8"));
config.uploadDir = config.avatarPath+"upload/";
config.largeDir = config.avatarPath+"avatar_large/";
config.smallDir = config.avatarPath+"avatar_small/";
var express = require('express');
var bodyParser = require('body-parser');
var multer  = require('multer');
var upload = multer({dest:config.uploadDir});
var app = express();
var server  = require("http").createServer(app);
var io = require("socket.io")(server);
var session = require("express-session")({
    secret: 'magik',
    resave: true,
    saveUninitialized: true
  });
var sharedsession = require("express-socket.io-session");
io.use(sharedsession(session,{autoSave:true}));

app.set('views', './views');
app.set('view engine', 'pug');
app.use(session);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true})); 
app.use('/jquery', express.static('node_modules/jquery/dist/'));
app.use('/bootstrap', express.static('node_modules/bootstrap/dist/'));
app.use('/moment', express.static('node_modules/moment/min/'));
app.use('/webres', express.static('webres'));

app.locals.testing = config.debug;
app.locals.autoplay = (config.debug && config.debugAutoplay);
app.locals.sitename = config.sitename;

var databaseClass = require('./classes/dbutils');
var httpService = require('./classes/httpservice');
var userClass = require('./classes/users');
var tableClass = require('./classes/table');
var scoreClass = require('./classes/score');

var database = new databaseClass(config);
database.openDb(function(db){
	users = new userClass(db,config);
	scores = new scoreClass(db);
	tables = new tableClass(db,scores);
	start();
});
var clients = [];

function httpHandle() {
	app.use(httpService.session);
	httpService.registerHome(app,config.debug);
	httpService.registerUserServices(app,users,config,upload,scores);
	if(config.debug) {
		httpService.registerDebug(app,users,config,database);
	}
	httpService.registerTables(app,tables,users,config,io,clients);
	httpService.registerUserAdminServices(app,users);
}
function handleWSserver() {
	io.on('connection', function (socket) {
		if(socket.handshake.session.login) {
			var playerTables = [];
			//console.log(socket.handshake);
			var player = {
				login: socket.handshake.session.login,
				name: socket.handshake.session.name,
				pict: socket.handshake.session.pictures,
				id: socket.id
			};
			clients.push(player);
			socket.on('getlog',function(table){
				if(config.debugRecap) {
					tables.getTableLog(table,config.logpath,function(fileuuid){
						socket.emit("gotLog",fileuuid);
					});
				}
			});
			socket.on('spectate',function(table,pw) {
				if(tables.tableExists(table)) {
					if(tables.canJoin(table,player.login,pw)) {
						socket.join(table);
						socket.emit("players",tables.getPlayers(table));
						if(tables.isTableCreator(table,player.login)) {
							socket.emit("enableCreator");
						}
					}
				}
			});
			socket.on('joinTable',function(table,pos,pw){
				tables.addPlayer(table,player,pos,pw,function(pinfo){
					playerTables.push(table);
					socket.emit('okJoin',pos,tables.getPlayers(table));
					socket.to(table).emit('joined',pos,pinfo);
				},function(firstPlayer,pos) {
					tables.dispenseCards(table,function(player,deck) {
						io.to(player.id).emit('gotDeck',deck);
					});
					io.to(firstPlayer.id).emit('promptCtr');
					io.in(table).emit('turn',pos);
				},function(playerTurn,deck,attplayers,ctrplayers,scores){
					socket.emit('resumePlayer',playerTurn,deck,attplayers,ctrplayers,scores);
				},function(pos){
					socket.emit('promptCtr');
				},function(promptCardPlayer,callable,pos){
					socket.emit('promptCall',callable);
				},function(chien){
					socket.emit("okCallChien",chien);
				},function(highPlayer,ctr,chien,callCard){
					socket.emit("recap",highPlayer,ctr,chien,callCard);
				},function(annonce){
					socket.emit('recapAnnonce',annonce);
				},function(playcards){
					socket.emit('setDrop',playcards);
				},function(recap,chien){
					socket.emit('endGame',recap,chien,null,null,config.debugRecap);
				});
			});
			socket.on('setCtr',function(table,ctr,chelem) {
				var set_ctr = {ctr: ctr, chelem: chelem};
				tables.playerSetCtr(table,player,set_ctr,function(player_ctr,ctr,playerHigh){
					socket.emit("okCtr");
					io.in(table).emit('gotCtr',player_ctr,ctr);
					if(playerHigh) {
						io.in(table).emit('gotHighCtr',playerHigh);
					}
				},function(nextPlayer,pos){
					io.to(nextPlayer.id).emit('promptCtr');
					io.in(table).emit('turn',pos);
				},function(firstPlayer,pos) { //Redistrib
					io.in(table).emit('redistrib');
					tables.dispenseCards(table,function(player,deck) {
						io.to(player.id).emit('gotDeck',deck);
					});
					io.to(firstPlayer.id).emit('promptCtr');
					io.in(table).emit('turn',pos);
				},function(promptCardPlayer,callable,pos){ //Demande d'appel
					io.to(promptCardPlayer.id).emit('promptCall',callable);
					io.in(table).emit('turn',pos);
				},function(otherPlayer,chien){ // chien aux autres
					io.to(otherPlayer.id).emit('chien',chien);
				},function(failreason){
					socket.emit("message",failreason);
				});
			});
			socket.on('selectCard',function(table,cardid){
				tables.playerSelectCard(table,player,cardid,function(failedRule){
					socket.emit("message",failedRule);
				},function(player,nextPlayer,card,InextPlayer,npCards,nt,end){
					io.in(table).emit('play',player,nextPlayer,card,nt);
					if(!end) {
						io.to(InextPlayer.id).emit('yourturn',npCards);
					}
				},function(attFriends){
					io.in(table).emit('gotTeam',attFriends);
				},function(recap,chien,historyLine,historyCount){
					io.in(table).emit('endGame',recap,chien,historyLine,historyCount,config.debugRecap);
				},function(tableid,tableConfiguration,players,itcount,recap,creationdate) {
					scores.addScore(tableid,tableConfiguration,players,itcount,recap,creationdate);
				});
			});
			socket.on('setCall',function(table,callCard){
				tables.setCall(table,player,callCard,function(chien){
					if(chien) {
						socket.emit("okCallChien",chien);
					} else {
						socket.emit("okCall");
					}
				},function(otherPlayer,callCard,show){
					//io.to(otherPlayer.id).emit('called',callCard,show);
					socket.to(table).emit('called',callCard,show);
				},function(highPlayer,ctr,chien,callCard){
					io.in(table).emit("recap",highPlayer,ctr,chien,callCard);
				},function(player){
					io.in(table).emit('gotTeam',[player]);
				},function(failreason){
					socket.emit("message",failreason);
				});
			});
			socket.on('setChien',function(table,chien){
				tables.setChien(table,player,chien,function(highPlayer,ctr,chien,callCard){
					io.in(table).emit("recap",highPlayer,ctr,chien,callCard);
				},function(failreason){
					socket.emit("message",failreason);
				});
			});
			socket.on('annonce',function(table,miseres,poignee){
				tables.annonce(table,player,miseres,poignee,function(){ //Acceptee
					socket.emit("okAnnonce",true,null);
					//io.in(table).emit("gotAnnonce",highPlayer,ctr,chien,callCard);
				},function(reason){ //refusee
					socket.emit("message",reason);
				});
			});
			socket.on('ready',function(table,ready){
				tables.setReady(table,player,ready,function(firstPlayer){
					io.in(table).emit('startGame');
					io.in(table).emit('turn',firstPlayer);
				},function(firstPlayer,pos) {
					io.in(table).emit('redistrib');
					tables.dispenseCards(table,function(player,deck) {
						io.to(player.id).emit('gotDeck',deck);
					});
					io.in(table).emit('turn',pos);
					io.to(firstPlayer.id).emit('promptCtr');	
				},function(annonce){
					io.in(table).emit('recapAnnonce',annonce);
				},function(failreason){
					socket.emit("message",failreason);
				});
			});
			socket.on('disconnect', function () {
				clients.splice(clients.indexOf(player), 1);
				for (var key in playerTables) {
					tables.removePlayer(playerTables[key],player,function(posRemoved){
						io.in(playerTables[key]).emit('leave',posRemoved);
					},function(){
						io.in(playerTables[key]).emit('closetable');
					});
					
				}
			});
		}
	});
}
function start() {
	httpHandle();
	handleWSserver();
	console.log("LISTENING ON "+config.port);
	server.listen(config.port);
}