var myCodeMirror = CodeMirror.fromTextArea(document.getElementById("editor"), 
	{
		lineNumbers: true, 
		mode: "javascript"
	}); 
var username = window.location.toString().substr(window.location.toString().indexOf('=')+1);
var fileURL = 'index.js';
var timeToSyncRethinkDB;
var timeToHideCursorName;

var socket = io();

socket.on('disconnect',function(){});

socket.on('document-coming',function(data){
	HandleDocumentComing(data);
});

socket.on('cursor-coming',function (data){
	if (data.new_val.username != username)
	{
		var cursorLine = data.new_val.line;
		var cursorChar = data.new_val.ch;
		const CURSOR_MODE = 'local'; //get cursor position from the top-left editor.

		//return of coordinate of cursor (left, right, top, bottom), when we have {line: , ch: }
		var cursorCoordinate=myCodeMirror.cursorCoords({line: cursorLine,ch: cursorChar}, CURSOR_MODE);

		//setting attribute of cursor will place to right position
		var cursorElement = '#'+data.new_val.username+' div';
		var cursorLeftPosition=cursorCoordinate.left+'px';
		var cursorTopPosition=cursorCoordinate.top-4+'px';
		$(cursorElement).css({left: cursorLeftPosition,top: cursorTopPosition, "border-left": '1px solid red'});
		
		//setting attribute of username above it's cursor
		var cursorNameElement = '#'+data.new_val.username+' div.cursor-name';
		var cursorNameLeftPosition=cursorCoordinate.left+1+'px';
		var cursorNameTopPosition=cursorCoordinate.top-22+'px';
		$(cursorNameElement).css({left: cursorNameLeftPosition,top: cursorNameTopPosition, color: 'white', "background-color": 'red', display: 'block'});
		
		clearTimeout(timeToHideCursorName);
		timeToHideCursorName = setTimeout(function(){
			$(cursorNameElement).css({'display': 'none'});
		},2000);
		


	}
});


//when cursor position change
myCodeMirror.on('cursorActivity',function(cm){
	var cursor = cm.getCursor();
	cursor['username']=username;
	cursor['fileURL']=fileURL;

	//static projectID, will change to dynamic later
	cursor['projectID']='112c12a8-53df-4ac0-a57a-f4b3f14401f4';		

	socket.emit('cursor-update',cursor);
});

//when content of Editor change
myCodeMirror.on('change',function(cm,ob){
	
	//this constant will make myCodeMirror.on('change') not detect replaceRange() function is a change.
	//prevent infinite loop
	const IGNORE_ONCHANGE_EVENT = '@ignore';

	if (ob['origin'] != 'setValue' && ob['origin'] != '@ignore')
	{
		ob['id']=fileURL;
		ob['lastModified']=username;
		ob['origin']=IGNORE_ONCHANGE_EVENT;
		socket.emit('document-update',ob);
	}

	clearTimeout(timeToSyncRethinkDB);
	timeToSyncRethinkDB = setTimeout(function (){
		var date = new Date();
		var dateFormated = FormatDate(date);
		var message = {
			id: fileURL,
			value: myCodeMirror.getValue(),
			lastModified: username,
			timeStamp: dateFormated};
		socket.emit('document-save',message);
	},1000);
});	

function FormatDate(date){
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

	var dateFormat = hour+':'+minute+':'+second+' '+day+'/'+month+'/'+date.getFullYear();

	return dateFormat;
}

//when receiving input from other partners
function HandleDocumentComing(data){
	var fileId = data.new_val.id;
	var userUpdated = data.new_val.lastModified; //user make this event

	if (fileId == fileURL && userUpdated != username)
	{
		var valueToAppend = data.new_val.text;
		var appendPosition = {'from': data.new_val.from, 'to': data.new_val.to};
		var documentOrigin = data.new_val.origin; //input, paste, cut, setValue ...

		myCodeMirror.getDoc().replaceRange(valueToAppend,appendPosition.from,appendPosition.to,documentOrigin);
	}
}

//ask server content of file you need
$.ajax({
	url: '/get/'+fileURL,
	success: function(result, status,xhr){
		myCodeMirror.getDoc().setValue(result.value);
		myCodeMirror.focus();
		myCodeMirror.setCursor({line: myCodeMirror.lastLine()});
	}
});

//ask server to receive all cursor is active
$.ajax({
	url: '/getCursor/'+username,
	success: function(result, status,xhr){
		if (result != username)
		{
			//CodeMirror Cursor style
			var cursorContent=
			'<div class="CodeMirror-cursors" id="'+result+'">\n\t'+
				'<div class="CodeMirror-cursor" style="left: 4px; top: 0px; height: 15px;">&nbsp;</div>\n'+
				'<div class="cursor-name" style="left: 4px; top: 0px; height: 15px; display:none">'+result+'</div>\n'+
			'</div>';
			$('.CodeMirror-lines div:first').prepend(cursorContent);
		}
	}
});