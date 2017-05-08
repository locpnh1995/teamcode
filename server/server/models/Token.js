'use strict';

function Token (){
	this.id=null;
	this.value=null;
	this.userEmail=null;
	this.expiresAt=null;
}

Token.prototype.initial = function (tokenInfo){	
	if (tokenInfo != null)
	{
		var self = this;

		self.id=tokenInfo.id;
		self.value=tokenInfo.value;
		self.userEmail=tokenInfo.user_email;
		self.expiresAt=tokenInfo.expires_at;
	}

	return this;
};

Token.prototype.CheckToken = function (token){
	if (token !=null)
	{
		var databaseToken = md5(password+this.salt);
		if (passwordHased==this.password)
		{
			
			return true;
		}
		return false;
	}
	return false;
};

Token.prototype.getUserEmail = function (){
	return this.userEmail;
}

Token.prototype.getValue = function (){
	return this.value;
}

Token.prototype.getExpiresAt = function (){
	return this.expiresAt;
}

module.exports = Token;
