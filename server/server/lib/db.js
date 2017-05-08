

const DEFAULT_HOST = 'localhost';
const DEFAULT_DB = 'teamcode';
const DEFAULT_PORT = 28015;

var r = require('rethinkdb');

//connect and work with rethinkdb
module.exports = Database;

function Database(){
	
	this.host = DEFAULT_HOST;
	this.name = DEFAULT_DB;
	this.port = DEFAULT_PORT;
	
	this.connection = null;
	
	this.config = {
	};
}


Database.prototype.setup = function (config){
	
	//I have no idea why, when assign value to variable must use "self." not "this."
	var self = this;

	self.host = config.host;
	self.name = config.databaseName;
	self.port = config.port;
	
	self.config = {
		db: this.name,
		host: this.host,
		port: this.port
	};

	r.connect (this.config, function(err,conn){
		if (err) 
		{
			console.log(err);
			throw err;
		}
		self.connection = conn;
		console.log('RethinkDB listening on '+config.port);
	});

};

Database.prototype.insert = function (table, data){
	r.table(table).insert(data,{conflict: "update"}).run(this.connection,function(err,response){
		if (err)
		{
			console.log(err);
			throw err;
		}
		console.log(table+' table updated.');
	});
};

Database.prototype.get = function (table,key,callback){
	var dbResult;
	r.table(table).get(key).run(this.connection,function(err,result){
		if (err)
		{
			console.log(err);
			throw err;
		}
		if (typeof callback === 'function')
			callback(err,result);
	});
};

Database.prototype.changes = function (table, callback){
	r.table(table).changes().run(this.connection,function(err, cursor) {
		cursor.each(function(err,row){
			if (err)
			{
				console.log(err);
				throw err;
			}
			if (typeof callback === 'function')
				callback(err,row);
		});
	});
};
