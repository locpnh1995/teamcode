'use strict'

const MAX_TOKEN_SIZE = 62;

const DEFAULT_HOST = 'localhost';
const DEFAULT_USERNAME = 'root';
const DEFAULT_PASSWORD = '';
const DEFAULT_DB = 'teamcode';
const DEFAULT_PORT = 3306;

var mysql = require('mysql');
var md5 = require('md5');
var helperModule = require('../lib/TeamCodeHelper.js');
var helper = new helperModule();

var randtoken = require('rand-token');

//models
var Token = require('../models/Token.js');

function mysqldb() {

    this.username = DEFAULT_USERNAME;
    this.password = DEFAULT_PASSWORD;
    this.host = DEFAULT_HOST;
    this.name = DEFAULT_DB;
    this.port = DEFAULT_PORT;

    this.connection = null;

    this.config = {};
}

mysqldb.prototype.setup = function (config) {

    //I have no idea why, when assign value to variable must use "self." not "this."
    var self = this;
    if (config != null) {
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


mysqldb.prototype.findUserByEmail = function (email, callback) {

    var query = "select * from users where email=" + helper.AddAposttropheBeginEnd(email);
    this.connection.query(query, function (err, result) {
        // console.log(result);
        if (result.length > 0) {
            callback(false, result[0]);
        }
        else {
            // console.log('findUserByEmail errors:', err);
            if (err == null) {
                callback(true);
            }
            else {
                callback(err);
            }

        }
    });
};

mysqldb.prototype.findTokenByValue = function (value, callback) {

    var query = "select * from tokens where value=" + helper.AddAposttropheBeginEnd(value);

    this.connection.query(query, function (err, result) {
        if (result.length > 0) {
            callback(false, result[0]);
        }
        else {
            if (err == null) {
                callback(true);
            }
            else {
                callback(err);
            }
        }
    });
};

mysqldb.prototype.insertUser = function (req, callback) {

    var email = helper.AddAposttropheBeginEnd(req.body.email);
    var salt = md5(new Date());
    var password = helper.AddAposttropheBeginEnd(md5(req.body.password + salt));
    salt = helper.AddAposttropheBeginEnd(salt); //addAposttrophe to insert in mysql

    var created_at = helper.AddAposttropheBeginEnd(helper.GetDateTime());
    var query = "INSERT INTO users (email, salt, password, created_at) values ("
        + email + "," + salt + "," + password + "," + created_at + ")";

    this.connection.query(query, function (err, result) {
        if (err) {
            console.log('inserUser errors: ', err);
            callback(err);
        }
        else {
            callback(false, result);
        }
    });
};

mysqldb.prototype.insertToken = function (req, callback) {

    var token = new Token();
    token.userEmail = req.body.email;
    token.value = randtoken.generate(MAX_TOKEN_SIZE);
    token.expiresAt = helper.GetDateTimeAddMinutes(60);

    var value = helper.AddAposttropheBeginEnd(token.value);
    var userEmail = helper.AddAposttropheBeginEnd(token.userEmail);
    var expires_at = helper.AddAposttropheBeginEnd(token.expiresAt);

    var query = "INSERT INTO tokens (value, user_email, expires_at) values (" + value + ","
        + userEmail + "," + expires_at + ")";

    this.connection.query(query, function (err, result) {
        if (err) {
            console.log(err);
            callback(err);
        }
        else {
            callback(false, token);
        }
    });
};

mysqldb.prototype.deleteTokenByEmail = function (email, callback) {

    var query = "DELETE FROM tokens WHERE user_email=" + helper.AddAposttropheBeginEnd(email);

    this.connection.query(query, function (err, result) {
        if (err) {
            console.log(err);
            callback(err);
        }
        else {
            callback(false, result);
        }
    });
};

mysqldb.prototype.updateTokenExpiresAt = function (time, email, callback) {

    var query = "UPDATE tokens SET expires_at=" + helper.AddAposttropheBeginEnd(helper.GetDateTimeAddMinutes(60)) + " WHERE user_email=" + helper.AddAposttropheBeginEnd(email);

    this.connection.query(query, function (err, result) {
        if (err) {
            console.log(err);
            callback(err);
        }
        else {
            callback(false, result);
        }
    });
};

module.exports = mysqldb;