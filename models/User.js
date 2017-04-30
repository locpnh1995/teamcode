'use strict';
var md5 = require('md5');

function User (){
	this.id='0';
	this.firstName='';
	this.lastName='';
	this.email='';
	this.username='';
	this.algorithm='';
	this.salt=0;
	this.password='';
	this.isActive='';
	this.lastLogin;
}

User.prototype.initial = function (userInfo){
	if (userInfo != null)
	{
		var self = this;

		self.id=userInfo.id;
		self.firstName=userInfo.first_name;
		self.lastName=userInfo.last_name;
		self.email=userInfo.email;
		self.username=userInfo.username;
		self.algorithm=userInfo.algorithm;
		self.salt=userInfo.salt;
		self.password=userInfo.password;
		self.isActive=userInfo.is_active;
		self.lastLogin=userInfo.last_login;
	}
	return this;

};

User.prototype.CheckPassword = function (password){
	if (password !=null)
	{
		var passwordHased = md5(password+this.salt);
		if (passwordHased==this.password)
		{
			
			return true;
		}
		return false;
	}
	return false;
};

module.exports = User;



function RandomNumber (){
	return Math.floor(Math.random()*4000000);
}

