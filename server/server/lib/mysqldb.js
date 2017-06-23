'use strict'

const MAX_TOKEN_SIZE = 62;

const DEFAULT_HOST = 'localhost';
const DEFAULT_USERNAME = 'root';
const DEFAULT_PASSWORD = '123456';
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

    var query = "SELECT * FROM users WHERE email = ?";
    this.connection.query(query, [email], function (err, result) {
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

    var query = "SELECT * FROM tokens WHERE value = ?";

    this.connection.query(query, [value], function (err, result) {
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

    var email = req.body.email;
    var salt = md5(new Date());
    var password = md5(req.body.password + salt);
    var created_at = helper.GetDateTime();

    var query = "INSERT INTO users (email, salt, password, created_at) values (?, ?, ?, ?)";

    this.connection.query(query, [email, salt, password, created_at], function (err, result) {
        if (err) {
            console.log(err);
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

    var value = token.value;
    var userEmail = token.userEmail;
    var expires_at = token.expiresAt;

    var query = "INSERT INTO tokens (value, user_email, expires_at) values (?, ?, ?)";

    this.connection.query(query, [value, userEmail, expires_at], function (err, result) {
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

    var query = "DELETE FROM tokens WHERE user_email = ?";

    this.connection.query(query, [email], function (err, result) {
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
    var timeUpdate = helper.GetDateTimeAddMinutes(time);
    var query = "UPDATE tokens SET expires_at = ? WHERE user_email = ?";

    this.connection.query(query, [timeUpdate, email], function (err, result) {
        if (err) {
            console.log(err);
            callback(err);
        }
        else {
            callback(false, timeUpdate, result);
        }
    });
};

mysqldb.prototype.insertProject = function (projectInfo,callback) {

    console.log('projectInfo',projectInfo);
    var createdAt = helper.GetDateTime();
    var ownerId=0;

    var mysql=this;

    this.findUserByEmail(projectInfo.email,function (err, user){
        if (err === false){
            console.log('this',mysql);
            console.log('user id',user.id)
           ownerId=user.id;

            if (ownerId == 0){
                console.log ("Email is not exist!");
                return false;
            }

        mysql.insertDocker(projectInfo.dockerInfo,function(err, result){

            if(err === false)
            {
                var query = "INSERT INTO projects (owner_id, project_name, docker_name, created_at) values (?, ?, ?, ?)";

                mysql.connection.query(query, [ownerId, projectInfo.projectName, projectInfo.dockerName, createdAt], function (err, result) {
                    console.log('query');
                    if (err) {
                        console.log(err);
                        callback(err);
                    }
                    else {
                        console.log('result',result);
                        callback(false,result);
                    }
                });
            }
            else
            {
                console.log(err);
                console.log('Insert to Docker is not complete!');
            }

        });

        }
    });

    console.log('after',ownerId.value);
    return;

 
};

mysqldb.prototype.insertDocker = function (dockerInfo,callback) {

    //console.log('projectInfo',wesprojectInfo);
    //var createdAt = helper.GetDateTime();
    //var ownerId=0;
    var mysql=this;

    var query = "INSERT INTO dockers (docker_name, ssh_password, website_port, database_port, ssh_port) values (?, ?, ?, ?, ?)";

    mysql.connection.query(query, [dockerInfo.dockerName, dockerInfo.sshPassword, dockerInfo.websitePort, dockerInfo.databasePort, dockerInfo.sshPort], function (err, result) {
        console.log('query');
        if (err) {
            console.log(err);
            callback(err);
        }
        else {
            console.log('result',result);
            callback(false,result);
        }
    }); 
};

mysqldb.prototype.insertContributor = function (contributorInfo,callback) {

    //console.log('projectInfo',wesprojectInfo);
    //var createdAt = helper.GetDateTime();
    //var ownerId=0;
    var mysql=this;

    var query = "INSERT INTO dockers (docker_name, ssh_password, website_port, database_port, ssh_port) values (?, ?, ?, ?, ?)";

    mysql.connection.query(query, [dockerInfo.dockerName, dockerInfo.sshPassword, dockerInfo.websitePort, dockerInfo.databasePort, dockerInfo.sshPort], function (err, result) {
        console.log('query');
        if (err) {
            console.log(err);
            callback(err);
        }
        else {
            console.log('result',result);
            callback(false,result);
        }
    }); 
};


mysqldb.prototype.getProjectByOwnerIdAndProjectName = function (ownerId, projectName){
    var query = "SELECT * FROM projects WHERE owner_id = ? AND project_name = ?";

    this.connection.query(query, [ownerId, projectName], function (err, result) {
        console.log('query');
        if (err) {
            console.log(err);
            callback(err);
        }
        else {
            console.log('result',result);
            callback(false,result);
        }
    }); 

};


mysqldb.prototype.getProjectByEmail = function (email,callback){
    //var query = "SELECT * FROM projects WHERE owner_id = ? AND project_name = ?";

    var mysql=this;

    this.findUserByEmail(email,function (err, user){
        if (err === false){
            var ownerId=0;
            
            ownerId=user.id;

            if (ownerId == 0){
                console.log ("Email is not exist!");
                return false;
            }

            var query = "SELECT * FROM projects WHERE owner_id = ?";

            mysql.connection.query(query, [ownerId], function (err, result) {
                console.log('query');
                if (err) {
                    console.log(err);
                    callback(err);
                }
                else {
                    callback(false,result);
                }
            }); 
        }
    });

};

module.exports = mysqldb;