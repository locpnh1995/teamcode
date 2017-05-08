'use strict';

function Helper(){
	this.text='hello world';
}

Helper.prototype.AddAposttropheBeginEnd = function (string){
	return "'"+string+"'";
};

Helper.prototype.GetDateTime = function (){
	var date = new Date();
	return FormatDateDatabase(date);
};

Helper.prototype.GetDateTimeAddMinutes = function (minutes){
	var date = new Date();
	date.setMinutes(date.getMinutes()+minutes);
	return FormatDateDatabase(date);
};

Helper.prototype.ToJSON = function (code, message){

	return JSON.parse('{"code":'+code+',"message": "'+message+'"}');
}

module.exports = Helper;

function FormatDateDatabase(date){
	var hour = date.getHours();
	if (hour<10)
		hour='0'+hour;

	var minute = date.getMinutes();
	if (minute<10)
		minute='0'+minute;

	var second = date.getSeconds();
	if (second<10)
		second='0'+second;

	var day = date.getDate();
	if (day<10)
		day='0'+day;
	
	var month = date.getMonth()+1;
	if (month<10)
		month='0'+month;

	var dateFormat = date.getFullYear()+'-'+month+'-'+day+' '+hour+':'+minute+':'+second;

	return dateFormat;
}
