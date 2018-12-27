var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();
var db;

function Database(config) {
	dbpath = config.databasepath;
	this.debug = config.debug;
}

Database.prototype.openDb = function(success) {
	var debug = this.debug;
	db = new sqlite3.Database(dbpath, (err) => {
		if (err) {
			return console.error(err.message);
		} else {
			controlDb(db,function(ver) {
				console.log('Connecté à la base de donnée (v'+ver+').');
				success(db);
			},function(){
				console.log('Initialisation de la base de donnée.');
				createDatabase(db,debug);
				success(db);
			});
		}
	});
};
function controlDb(database,cbOk,cbErr) {
	db.get(`select value from technical where key = "dbver"`, (err, row) => {
		if (err) {
			cbErr();
		} else {
			cbOk(row.value);
		}
	});
}
	
function createDatabase(database,debug) {
	var create = fs.readFileSync("data/create.sql", "utf8");
	database.exec(create,(err) => {
	    if (err) {
	    	console.error(err.message);
	    } else {
			if(debug){
				var sample = fs.readFileSync("data/sample.sql", "utf8");
				database.exec(sample,(err) => {
					if (err) {
						console.error(err.message);
					} else {
						console.log("Tables et samples crées");
					}
				});
			} else {
				console.log("Tables crées");
			}
	    }
	});
}

module.exports = Database;