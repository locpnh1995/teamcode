'use strict';

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

};


module.exports = User;

function RandomNumber (){
	return Math.floor(Math.random()*4000000);
}
