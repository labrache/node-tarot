const sharp = require("sharp");
sharp.cache(false);
const crypto = require('crypto');
const fs = require('fs');
const uuidv1 = require('uuid/v1');
const acceptedMime = ["image/jpeg","image/png","image/gif","image/webp"];

function Users(database,config) {
	this.db = database;
	this.config = config;
}

Users.prototype.checkUser = function(username,cb) {
	this.db.get(`select login from users where login = ?`, username, (err, row) => {
		if (err) {
			return console.error(err);
		} else {
			cb(row !== undefined);
		}
	});
};

Users.prototype.getUserPI = function(username,cb,cbnotfound) {
	this.db.get(`select login, name, admin, mail, picture from users where login = ?`, username, (err, row) => {
		if (err) {
			return console.error(err);
		} else {
			if(row !== undefined) {
				cb(row);
			} else {
				cbnotfound();
			}
		}
	});
};

Users.prototype.getUser = function(username,cb,cbnotfound) {
	this.db.get(`select login, name, picture, admin from users where login = ?`, username, (err, row) => {
		if (err) {
			return console.error(err);
		} else {
			if(row !== undefined) {
				cb(row);
			} else {
				cbnotfound();
			}
		}
	});
};

Users.prototype.checkUserPassword = function(username,password,cb) {
	passwordCandidate = crypto.createHash('sha256').update(password).digest("hex");
	this.db.get(`select login, name, picture, admin from users where login = ? and password = ?`, username, passwordCandidate, (err, row) => {
		if (err) {
			return console.error(err);
		} else {
			cb(row);
		}
	});
};

Users.prototype.getUsers = function(cb) {
	this.db.all(`select login, name, mail, admin from users`, (err, row) => {
		if (err) {
			return console.error(err);
		} else {
			cb(row);
		}
	});
};
Users.prototype.isFriend = function(login,friend,cb) {
	this.db.get(`select count(1) as ct from friends where login = ? and friend = ?`, login, friend, (err, row) => {
		if (err) {
			return console.error(err);
		} else {
			cb(row.ct == 1);
		}
	});
};
Users.prototype.addFriend = function(login,friend,cb) {
	this.db.run(`insert into friends (login,friend) values (?,?)`, login, friend, (err, row) => {
		if (err) {
			return console.error(err);
		} else {
			cb();
		}
	});
};
Users.prototype.removeFriend = function(login,friend,cb) {
	this.db.run(`delete from friends where login = ? and friend = ?`, login, friend, (err, row) => {
		if (err) {
			return console.error(err);
		} else {
			cb();
		}
	});
};
Users.prototype.getFriend = function(login,cb) {
	this.db.all(`select u.login, u.name, u.picture from friends f join users u on f.friend = u.login where f.login = ?`, login, (err, row) => {
		if (err) {
			return console.error(err);
		} else {
			cb(row);
		}
	});
};
Users.prototype.getInvitables = function(login,invited,cb) {
	this.db.all(`select u.login, u.name, u.picture from friends f join users u on f.friend = u.login where f.login = ?`, login, (err, row) => {
		if (err) {
			return console.error(err);
		} else {
			var invitables = [];
			for(var k in row) {
				var isInvited = false;
				for(var j in invited) {
					if(invited[j].login == row[k].login) {
						isInvited = true;
					}
				}
				if(!isInvited){
					invitables.push(row[k]);
				}
			}
			cb(invitables);
		}
	});
};
Users.prototype.isLoginFree = function(login,cb) {
	this.db.get(`select count(1) as ct from users where login = ?`, login, (err, row) => {
		if (err) {
			return console.error(err);
		} else {
			cb(row.ct == 0);
		}
	});
};

Users.prototype.addUser = function(values,cb) {
	var admin = 0;
	var password = crypto.createHash('sha256').update(values.pass).digest("hex");
	this.db.run(`insert into users (login, name, mail, admin, password) values (?,?,?,?,?)`, values.login, values.name,values.mail, admin, password, (err, row) => {
		if (err) {
			return console.error(err);
		} else {
			cb();
		}
	});
};

Users.prototype.checkRegister = function(data,config,cbOk,cbErr) {
	var checkInvite = (config.registerInviteCode === undefined);
	var checkValues = true;
	if(!checkInvite) {
		checkInvite = (data.inviteCode == config.registerInviteCode);
	}
	errors = [];
	if(!checkInvite) {
		checkValues = false;
		errors.push("invitation invalide");
	}
	if(!data.login.match("^([A-z0-9_-]{4,20})$")) {
		checkValues = false;
		errors.push("Login invalide");
	}
	if(!data.mail.match("[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?")) {
		checkValues = false;
		errors.push("Courriel invalide");
	}
	if(checkValues) {
		this.isLoginFree(data.login,function(isFree){
			if(!isFree) {
				checkValues = false;
				errors.push("Login déjà utilisé");
				cbErr(errors);
			} else {
				cbOk();
			}
		});
	} else {
		cbErr(errors);
	}
};
Users.prototype.processPicture = function(login,picture,cbOk,cbErr) {
	if (acceptedMime.indexOf(picture.mimetype) !== -1) {
		var pictuuid = uuidv1()+".jpg";
		var inputFile = picture.destination + picture.filename;
		var outputFileLarge = this.config.largeDir+pictuuid;
		var outputFileSmall = this.config.smallDir+pictuuid;
		var that = this;
		sharp(inputFile).resize({ width: 800 }).toFile(outputFileLarge, function(err) {
			if(err) {
				console.error(err);
				cbErr("Erreur de conversion du fichier (1)");
			} else {
				sharp(inputFile).resize(300, 300).toFile(outputFileSmall, function(err) {
					if(err) {
						console.error(err);
						cbErr("Erreur de conversion du fichier (2)");
					} else {
						fs.unlinkSync(inputFile);
						that.removeOldPicture(login,function() {
							that.updatePicture(login,pictuuid,function(){
								cbOk(pictuuid);
							})
						});
					}
				});
			}
		});
	} else {
		cbErr("Format invalide");
	}
}
Users.prototype.updateUser = function(login,values,picture,cb,cberr,newpict) {
	this.db.run(`update users set name = ?, mail = ? where login = ?`, values.name, values.mail, login, (err, row) => {
		if (err) {
			return console.error(err);
		} else {
			if(values.pass !== "") {
				this.changePassword(login,values.pass);
			}
			if(picture) {
				this.processPicture(login,picture,function(pictureuuid){
					cb();
					newpict(pictureuuid);
				},function(err){
					cberr(err);
				});
				/*
				if (!picture.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
					this.removeOldPicture(login,function() {
						picture.newname = picture.filename + path.extname(picture.originalname);
						fs.renameSync(picture.destination + picture.filename, picture.destination + picture.newname);
						this.updatePicture(login,picture);
						newpict(picture.newname);
					});
				}
				*/
				
			} else { cb(); }
		}
	});
};
Users.prototype.removeOldPicture = function(login,cb) {
	this.db.get(`select picture from users where login = ?`, login, (err, row) => {
		if (err) {
			return console.error(err);
		} else {
			if(row.picture !== null) {
				var oldFileLarge = this.config.largeDir+row.picture;
				var oldFileSmall = this.config.smallDir+row.picture;
				if(fs.existsSync(oldFileLarge)){
					fs.unlinkSync(oldFileLarge);
				}
				if(fs.existsSync(oldFileSmall)){
					fs.unlinkSync(oldFileSmall);
				}
			}
			cb();
		}
	});
};
Users.prototype.updatePicture = function(login,picture,cb) {
	this.db.run(`update users set picture = ? where login = ?`, picture, login, (err, row) => {
		if (err) {
			return console.error(err);
		} else {
			cb();
		}
	});
};

Users.prototype.removeUser = function(login,cb) {
	var that = this;
	this.removeOldPicture(login,function() {
		that.db.run(`delete from users where login = ?`, login, (err, row) => {
			if (err) {
				return console.error(err);
			} else {
				cb();
			}
		});
	});
};

Users.prototype.changePassword = function(login,newPassword) {
	var password = crypto.createHash('sha256').update(newPassword).digest("hex");
	this.db.run(`update users set password = ? where login = ?`, password, login, (err, row) => {
		if (err) {
			return console.error(err);
		}
	});
};

Users.prototype.autologin2 = function(req, res, config) {
	this.getUser(req.params.user,function(authchecked){
		req.session.admin = authchecked.admin;
		req.session.name = authchecked.name;
		req.session.login = authchecked.login;
		req.session.picture = authchecked.picture;
		if(authchecked.picture != null) {
			req.session.pictures = {
				large: "/"+config.largeDir+authchecked.picture,
				small: "/"+config.smallDir+authchecked.picture
			}
		} else {
			req.session.pictures = null;
		}
		res.redirect('/');
	})
};
Users.prototype.login = function(req, res, config) {
    if ( typeof req.body.login !== 'undefined' && typeof req.body.pass !== 'undefined') {
		this.checkUserPassword(req.body.login.toString(),req.body.pass.toString(),function(authchecked){
			if(authchecked !== undefined) {
				req.session.admin = authchecked.admin;
				req.session.name = authchecked.name;
				req.session.login = authchecked.login;
				req.session.picture = authchecked.picture;
				if(authchecked.picture != null) {
					req.session.pictures = {
						large: "/"+config.largeDir+authchecked.picture,
						small: "/"+config.smallDir+authchecked.picture
					}
				} else {
					req.session.pictures = null;
				}
				res.redirect('/');
			} else {
				res.render('login', {error: "Mot de passe invalide"});
			}
		});
    }else{
    	res.render('login', {error: "Mot de passe invalide"});
    }
};

Users.prototype.wsgetlogin = function(wsquery,cb) {
    if ( typeof wsquery.login !== 'undefined' && typeof wsquery.pass !== 'undefined') {
		this.checkUserPassword(wsquery.login.toString(),wsquery.pass.toString(),function(passwordchecked) {
			if(passwordchecked) {
    			cb(passwordchecked);
			}else{return false}
		});
    }
};


module.exports = Users;