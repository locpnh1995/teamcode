'use strict';

var md5 = require('md5');
var portastic = require('portastic');
var mysqldb = require('../lib/mysqldb.js');

// var exec = require('child_process').exec;
const { exec } = require('child_process');
var fs = require('fs');
var ncp = require('ncp').ncp;
const host = 'localhost';

function User() {
    this.id = '0';
    this.firstName = '';
    this.lastName = '';
    this.email = '';
    this.username = '';
    this.algorithm = '';
    this.salt = 0;
    this.password = '';
    this.isActive = '';
    this.lastLogin;
}

User.prototype.initial = function (userInfo) {
    if (userInfo != null) {
        var self = this;

        self.id = userInfo.id;
        self.firstName = userInfo.first_name;
        self.lastName = userInfo.last_name;
        self.email = userInfo.email;
        self.username = userInfo.username;
        self.algorithm = userInfo.algorithm;
        self.salt = userInfo.salt;
        self.password = userInfo.password;
        self.isActive = userInfo.is_active;
        self.lastLogin = userInfo.last_login;
    }
    return this;
};

User.prototype.getId = function (){
    return this.id;
}

User.prototype.checkPassword = function (password) {
    if (password != null) {
        var passwordHased = md5(password + this.salt);
        if (passwordHased == this.password) {
            return true;
        }
        return false;
    }
    return false;
};

User.prototype.createProject = function (email, projectName, projectStack, callback) {
    console.log(email, projectName, projectStack);
    // scan port
    portastic.find({
        min: 4900,
        max: 5900
    }).then(function (ports) {
        //console.log('Port avaible %s', ports.join(', '));
        var port_website = ports[0];
        var port_database = ports[1];
        console.log(port_website, port_database);

        //copy folder docker
        var command_copy = 'mkdir /home/tando/teamcode/' + projectName + '-' + email + ' && cp -a /home/tando/teamcode_lib/LAMP_STACK/* /home/tando/teamcode/' + projectName + '-' + email;
        exec(command_copy, function (error, stdout, stderr) {
            // console.log('stdout: ' + stdout);
            // console.log('stderr: ' + stderr);
            if (error) {
                console.log('exec error: ' + error);
                callback(error);
            }
            else {
                // edit file
                var link_file = '/home/tando/teamcode/' + projectName + '-' + email + '/docker-compose.yml';
                var data = fs.readFileSync(link_file).toString();
                data = data.replace("{port-website}", port_website);
                data = data.replace("{port-database}", port_database);

                console.log(data);

                var fd = fs.openSync(link_file, 'w+');
                fs.writeFileSync(fd, data);
                fs.closeSync(fd);

                //check project exist

                // execute child process to create docker env
                var command_docker = 'cd /home/tando/teamcode/' + projectName + '-' + email + ' && docker-compose up -d';
                exec(command_docker, function (error, stdout, stderr) {
                    // console.log('stdout: ' + stdout);
                    // console.log('stderr: ' + stderr);
                    if (error) {
                        console.log('exec error: ' + error);
                        callback(error);
                    }
                    else {
                        // store port in database and set flag project is true
                        var projectInfo = {};
                        
                        projectInfo.email=email;
                        projectInfo.projectName=projectName;
                        projectInfo.dockerName=projectName;
                        projectInfo.dockerInfo = {};
                        projectInfo.dockerInfo.dockerName = projectName;
                        projectInfo.dockerInfo.sshPassword = '123456';
                        projectInfo.dockerInfo.websitePort = port_website;
                        projectInfo.dockerInfo.databasePort = port_database;
                        projectInfo.dockerInfo.sshPort='22';

                        insertProjectAndDocker(projectInfo);
                        
                        // send port and flag to client
                        callback(null, {port_website: port_website, port_database: port_database});
                    }

                });
            }
        });

    });



}

module.exports = User;


function randomNumber() {
    return Math.floor(Math.random() * 4000000);
}

function insertProjectAndDocker(projectInfo)
{
    var mysql = new mysqldb();
    mysql.setup({
        host: host,
        user: 'root',
        password: '123456',
        database: 'teamcode'
    });

    mysql.insertProject(projectInfo,function(err,result){
        if(err)
        {
            console.log('Cannot insert to projects and dockers table!');
        }
    });

}