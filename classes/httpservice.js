module.exports = {
	session: function(req, res, next) {
		if (req.session) {res.locals.session = req.session;}
		next();
	},
	checkAuth: function (req, res, next) {
	  if (!req.session.login) {
	    res.render('guest');
	  } else { next(); }
	},
	checkAdmin: function(req, res, next) {
	  if (!req.session.login || !req.session.admin) {
	    res.render('notadmin');
	  } else { next(); }
	},
	registerDebug: function (app,users,config,database) {
	  	app.get('/autologin/:user', function(req, res) { users.autologin2(req, res, config); });
		app.get('/createSample', this.checkAuth, function (req, res) {
			database.createSample(function(){
				res.redirect('/');
			});
		});
	},
	registerHome: function(app,debug) {
		if(debug === true) {
			app.get('/', function (req, res) { res.render('homedebug'); });
		} else {
			app.get('/', function (req, res) { res.render('home'); });
		}
	},
	registerUserServices: function (app,users,config,upload,scores) {
		app.get('/login', function(req, res) { res.render('login'); });
		app.post('/login', function(req, res) { users.login(req, res, config); });
		app.get('/logout', this.checkAuth,function(req,res){ req.session.destroy(function(err) { res.redirect('/'); }); });
		app.get('/user/:user', function(req, res) {
			users.getUser(req.params.user,function(user){
				users.getFriend(req.params.user,function(friends){
					scores.getPlayerGames(user.login,function(playedGames){
						scores.parseConfig(playedGames);
						scores.getPlayerStats(user.login,function(playerStats){
							var me = (req.session.login === user.login);
							if(user.picture) {user.pictureDir = "/"+config.largeDir+user.picture;}
							if (!req.session.login || me) {
								res.render('user',{user:user,canEdit:me,scores:playedGames,playerStats:playerStats,friends:friends,canBeFriend:false});
							} else {
								users.isFriend(req.session.login,user.login,function(isFriend){
									res.render('user',{user:user,canEdit:me,scores:playedGames,playerStats:playerStats,friends:friends,canBeFriend:true,isFriend:isFriend});
								});
							}
						});
					});
				});
			},function(){
				res.render('message',{title:"Erreur",message:"Ce profil n'existe pas"});
			});
		});
		app.get('/user/json/:user', this.checkAuth, function(req, res) {
			users.getUser(req.params.user,function(user){
				users.getFriend(req.params.user,function(friends){
					scores.getPlayerStats(user.login,function(playerStats){
						var me = (req.session.login === user.login);
						if(user.picture) {user.picture = "/"+config.smallDir+user.picture;}
						if (!req.session.login || me) {
							res.json({user:user,me:me,playerStats:playerStats,friends:friends,canBeFriend:false});
						} else {
							users.isFriend(req.session.login,user.login,function(isFriend){
								res.json({user:user,me:me,playerStats:playerStats,friends:friends,canBeFriend:true,isFriend:isFriend});
							});
						}
					});
				});
			},function(){
				res.status(404).send('Not found');
			});
		});
		app.get('/user/:user/edit', this.checkAuth, function(req, res) {
			users.getUserPI(req.params.user,function(user){
				if(req.session.login === user.login) {
					if(user.picture) {user.pictureDir = "/"+config.largeDir+user.picture;}
					res.render('useredit',{user:user});
				} else {res.render('message',{title:"Erreur",message:"Vous ne pouvez pas editer ce profil"});}
			},function(){
				res.render('message',{title:"Erreur",message:"Ce profil n'existe pas"});
			});
		});
		app.post('/user/:user/edit', this.checkAuth, upload.single('picture'), function(req, res) {
			users.getUserPI(req.params.user,function(user){
				if(req.session.login === user.login) {
					this.users.updateUser(user.login,req.body,req.file,function(){
						res.render('message',{title:"Modifications enregistrés",message:"Votre profil à été enregistré",link:"/user/"+user.login});
					},function(err){
						res.render('message',{title:"Erreur",message:err});
					},function(newpict){
						req.session.pictures = {
							large: "/"+config.largeDir+newpict,
							small: "/"+config.smallDir+newpict
						}
					});
				} else {res.render('message',{title:"Erreur",message:"Vous ne pouvez pas editer ce profil"});}
			},function(){
				res.render('message',{title:"Erreur",message:"Ce profil n'existe pas"});
			});
		});
		app.get('/user/:user/addFriend', this.checkAuth, function(req, res) {
			users.getUser(req.params.user,function(user){
				users.isFriend(req.session.login,user.login,function(isFriend){
					if(isFriend){
						res.redirect('/user/'+user.login);
					} else {
						users.addFriend(req.session.login,user.login,function(){
							res.redirect('/user/'+user.login);
						});
					}
				});
			},function(){
				res.render('message',{title:"Erreur",message:"Ce profil n'existe pas"});
			});
		});
		app.get('/user/:user/removeFriend', this.checkAuth, function(req, res) {
			users.getUser(req.params.user,function(user){
				users.isFriend(req.session.login,user.login,function(isFriend){
					if(isFriend){
						users.removeFriend(req.session.login,user.login,function(){
							res.redirect('/user/'+user.login);
						});
					} else {
						res.redirect('/user/'+user.login);
					}
				});
			},function(){
				res.render('message',{title:"Erreur",message:"Ce profil n'existe pas"});
			});
		});
		app.get('/user/:user/addFriend.json', this.checkAuth, function(req, res) {
			users.getUser(req.params.user,function(user){
				users.isFriend(req.session.login,user.login,function(isFriend){
					if(isFriend){
						res.json({status:true});
					} else {
						users.addFriend(req.session.login,user.login,function(){
							res.json({status:true});
						});
					}
				});
			},function(){
				res.status(404).send('Not found');
			});
		});
		app.get('/user/:user/removeFriend.json', this.checkAuth, function(req, res) {
			users.getUser(req.params.user,function(user){
				users.isFriend(req.session.login,user.login,function(isFriend){
					if(isFriend){
						users.removeFriend(req.session.login,user.login,function(){
							res.json({status:true});
						});
					} else {
						res.json({status:true});
					}
				});
			},function(){
				res.status(404).send('Not found');
			});
		});
		app.get('/scores/:table', function(req, res) {
			scores.getTableInfo(req.params.table,function(tableinfo){
				scores.getTablePlayers(req.params.table,function(tableplayers){
					scores.getTurns(req.params.table,function(turns){
						scores.parseInfo(tableinfo);
						scores.parseGame(tableplayers,turns);
						res.render('scores',{table:tableinfo,players:tableplayers,turns:turns});
					});
				});
			});
		});
		if(config.register) {
			var regKey = (config.registerInviteCode !== undefined);
			app.get('/register', function(req, res) { res.render('register',{checkInvite:regKey}); });
			app.get('/register/:key', function(req, res) { res.render('register',{checkInvite:regKey,urlcode:req.params.key}); });
			app.post('/register', function(req, res) {
				users.checkRegister(req.body,config,function(){
					users.addUser(req.body,function(){
						res.render('message',{title:"Inscription effectuée",message:"Vous pouvez maintenant vos connecter",link:"login"});
					});
				},function(error) {
					res.render('register',{error:error,checkInvite:regKey});	
				});
			});
		} else {
			app.get('/register', function(req, res) { res.render('message',{title:"Inscription impossible",message:"La configuration serveur n'autorise pas les nouvelles inscriptions"}); });
		}
	},
	registerUserAdminServices: function (app,users) {
		app.get('/users', this.checkAdmin, function (req, res) {
			users.getUsers(function(users){
				res.render('users', {users:users}); 
			});
		});
		app.get('/user/add', this.checkAdmin, function (req, res) { res.render('useradd'); });
		app.post('/user/add', this.checkAdmin, function (req, res) {
			users.addUser(req.body,function(){
				res.redirect('/users');
			});
		});
		app.get('/user/:login/delete', this.checkAdmin, function (req, res) { 
			users.removeUser(req.params.login, function() {
				res.redirect('/users');
			});
		});
		},
	registerTables: function(app,tableClass,users,config,io,clients) {
		var gameLogClass = require('./gamelog');
		var cardsClass = require('./cards');
		var messageClass = require('./messages');
		app.get('/createTable', this.checkAuth, function (req, res) {
			res.render('newtable');
		});
		app.post('/createTable', this.checkAuth, function (req, res) {
			var tconfig = tableClass.parseConfiguration(req.body);
			if(tconfig !== false) {
				users.getUser(req.session.login,function(user){
					tableClass.createTable(tconfig,user,function(uuid){
						res.redirect('/table_'+uuid);
					});
				});
			} else {
				res.render('errconftable');
			}
		});
		app.get('/joinTable', this.checkAuth, function (req, res) {
			res.render('jointable',{tables:tableClass.getTables()});
		});
		// DEBUG
		if(config.debug === true) {
			app.get('/createTableDbg', this.checkAuth, function (req, res) {
				users.getUser(req.session.login,function(user){
					var tconfig = { tablename: 'Table Debug',tableconf: 'pub',password: '',playercount: '5',poignee: 'on',showchien: 'on'};
					tableClass.createTable(tableClass.parseConfiguration(tconfig),user,function(uuid){
						res.redirect('/table_'+uuid);
					});
				});
			});
			app.get('/joinTableDbg', this.checkAuth, function (req, res) {
				var joinTable = tableClass.selectFirstNotComplete();
				if(joinTable !== null) {
					res.redirect('/table_'+joinTable);
				}else{
					res.render('notabledispo');
				}
			});
		}
		// fin debug
		app.get('/table_:table', this.checkAuth, function (req, res) { 
			tableClass.joinTable(req.params.table,req.session.login,null,function(conf,id,creator){
				res.render('table',{table:conf,id:id,pw:null,creator:creator});
			},function(){
				res.render('tablepassword',{fail:false});
			},function(){
				res.render('notable');
			});
		});
		app.post('/table_:table', this.checkAuth, function (req, res) { 
			tableClass.joinTable(req.params.table,req.session.login,req.body.password,function(conf,id,creator){
				res.render('table',{table:conf,id:id,pw:req.body.password,creator:creator});
			},function(){
				res.render('tablepassword',{fail:true});
			},function(){
				res.render('notable');
			});
		});
		if(config.debugRecap === true) {
			app.get('/log_:log', this.checkAuth, function (req, res) { 
				var glog = new gameLogClass();
				var filelog = config.logpath+req.params.log+".json"
				glog.loadfrom(filelog,function(gotlog){
					res.render('gamelog',{tablelog:gotlog});
				});
			});
		}
		app.get('/closetable', this.checkAuth, function (req, res) { 
			res.render('message',{title:"Table fermée",message:"Cette table n'a plus aucun joueur, elle a été fermée automatiquement",link:"/"});
		});
		app.get('/cards.json', this.checkAuth, function (req, res) { 
			var gcards = new cardsClass();
			res.json(gcards.getOrderedCards());
		});
		app.get('/messages.json', this.checkAuth, function (req, res) { 
			var gmessages = new messageClass();
			res.json(gmessages.get());
		});
		app.get('/invited_:table.json', this.checkAuth, function (req, res) { 
			if(tableClass.tableExists(req.params.table)) {
				if(tableClass.isTableCreator(req.params.table,req.session.login)){
					var invited = tables.getInvited(req.params.table);
					users.getInvitables(req.session.login,invited,function(invitables){
						res.json({invited:invited,invitables:invitables});
					});
					
				} else {res.status(403).send('Forbidden');}
			} else {res.status(404).send('Not found');}
		});
		app.post('/invite_:table.json', this.checkAuth, function (req, res) {
			if(tableClass.tableExists(req.params.table)) {
				if(tableClass.isTableCreator(req.params.table,req.session.login)){
					users.getUser(req.body.invite,function(user){
						tableClass.addInvite(req.params.table,user);
						users.getUser(req.session.login,function(proposer){
							if(proposer.picture) {proposer.picture = "/"+config.smallDir+proposer.picture;}
							for(var k in clients) {
								if(clients[k].login == user.login) {
									io.to(clients[k].id).emit("gotInvite",req.params.table,tables.getInfoNoCred(req.params.table),proposer);
								}
							}
						});
						var invited = tables.getInvited(req.params.table);
						users.getInvitables(req.session.login,invited,function(invitables){
							res.json({invited:invited,invitables:invitables});
						});
					},function(){
						res.status(404).send('Not found');
					});
				} else {res.status(403).send('Forbidden');}
			} else {res.status(404).send('Not found');}
		});
		app.post('/removeinvite_:table.json', this.checkAuth, function (req, res) {
			if(tableClass.tableExists(req.params.table)) {
				if(tableClass.isTableCreator(req.params.table,req.session.login)){
					tableClass.removeInvite(req.params.table,req.body.remove);
					for(var k in clients) {
						if(clients[k].login == req.body.remove) {
							io.to(clients[k].id).emit("noInvite",req.params.table);
						}
					}
					var invited = tables.getInvited(req.params.table);
					users.getInvitables(req.session.login,invited,function(invitables){
						res.json({invited:invited,invitables:invitables});
					});
				} else {res.status(403).send('Forbidden');}
			} else {res.status(404).send('Not found');}
		});
	}
};