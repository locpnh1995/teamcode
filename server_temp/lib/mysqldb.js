'use strict'

const DEFAULT_HOST = 'localhost';
const DEFAULT_USERNAME = 'loc';
const DEFAULT_PASSWORD = '12341234';
const DEFAULT_DB = 'teamcode';
const DEFAULT_PORT = 3306;

var mysql = require('mysql');
var md5 = require('md5');

function mysqldb (){

	this.username = DEFAULT_USERNAME;
	this.password = DEFAULT_PASSWORD;
	this.host = DEFAULT_HOST;
	this.name = DEFAULT_DB;
	this.port = DEFAULT_PORT;
	
	this.connection = null;
	
	this.config = {
	};
}

mysqldb.prototype.setup = function (config){
	
	//I have no idea why, when assign value to variable must use "self." not "this."
	var self = this;
	if (config != null){
		self.username = config.user;
		self.password = config.password;
		self.host = config.host;
		self.name = config.database;
		self.port = config.port;
	}
	
	self.connection = mysql.createConnection({
		host: this.host,
		user: this.username,
		password: this.password,
		database: this.name
	});

	this.connection.connect();


//	console.log("Connect successful to '"+this.name+"'\n",this.connection);
};


mysqldb.prototype.findByEmail=function (email,callback){
	
	var query="select * from users where email="+AddAposttropheBeginEnd(email);
	this.connection.query(query,function(err,result){
		if (result.length != 0)
		{
			callback(err,result[0]);
		}
		else
		{
			callback(null,null);
		}
	});	
};

mysqldb.prototype.insert=function (req,table){
	
	var email = AddAposttropheBeginEnd(req.body.email);
	var salt=md5(new Date());
	var password = AddAposttropheBeginEnd(md5(req.body.password+salt));
	salt = AddAposttropheBeginEnd(salt); //addAposttrophe to insert in mysql
	
	var created_at= AddAposttropheBeginEnd('2017-04-03 03:59:22');
	var query="INSERT INTO users (email, salt, password, created_at) values ("
				+email+","+salt+","+password+","+created_at+")";
	
	this.connection.query(query,function (err,result){
		if (err){
			console.log(err);
			throw err;
		}
	});
};

module.exports = mysqldb;

function AddAposttropheBeginEnd(string)
{
	return "'"+string+"'";
}