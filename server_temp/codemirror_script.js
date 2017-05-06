var theme = 'monokai';
var myCodeMirror = CodeMirror.fromTextArea(document.getElementById("editor"), 
	{
		lineNumbers: true,
		lineWrapping: true,
		extraKeys: { "Ctrl-Space": "autocomplete" }, 
		mode: { name: "text/html", globalVars: true },
		autoCloseTags: true,
		autoCloseBrackets: true,
		styleActiveLine: true,
		tabSize: 2,
		gutters: ["CodeMirror-lint-markers", "CodeMirror-linenumbers", "breakpoints"],
		lint: true,
		theme: theme,
		profile: 'xhtml'
	}); 
emmetCodeMirror(myCodeMirror);

myCodeMirror.on("gutterClick", function(cm, n) {
  var info = cm.lineInfo(n);
  cm.setGutterMarker(n, "breakpoints", info.gutterMarkers ? null : makeMarker());
});

function makeMarker() {
  var marker = document.createElement("div");
  marker.style.color = "#822";
  marker.innerHTML = "●";
  return marker;
}


const CURSOR_MODE = 'local'; //get cursor position from the top-left editor.


//var username = window.location.toString().substr(window.location.toString().indexOf('=')+1);
var username = prompt("Your name ?");
var fileURL = prompt("Your file ?");
var timeToSyncRethinkDB;
var timeToHideCursorName={};
var colorList = ['#ff0000','#8c8c08','#3faf1a','#af6e1a','#5d13ad','#960a91','#960a50','#960a17','#0a968f'];
var colorListIndex=0;


var socket = io.connect();

socket.on('connect',function(){
	var connectionInfos = {};
	connectionInfos.room = fileURL;
	connectionInfos.username = username
	socket.emit('joinRoom',connectionInfos);
});

socket.on ('appendCursors',function(cursors){
	var cursor;
	for(i=0; i<cursors.length; i++)
	{
		cursor = cursors[i];
		console.log(cursor);
		$('.CodeMirror-lines div:first').prepend(cursor.value);
	}
});

socket.on('deleteCursor',function(username){
	$('#'+username).remove();
});

socket.on('disconnect',function(){});

socket.on('document-coming',function(data){
	HandleDocumentComing(data);
});

socket.on('cursor-coming',function (data){
	
	if (data.new_val.username != username)
	{
		var cursorLine = data.new_val.line;
		var cursorChar = data.new_val.ch;

		//return of coordinate of cursor (left, right, top, bottom), when we have {line: , ch: }
		var cursorCoordinate=myCodeMirror.cursorCoords({line: cursorLine,ch: cursorChar}, CURSOR_MODE);

		//setting attribute of cursor will place to right position
		var cursorElement = '#'+data.new_val.username+' div';
		var cursorLeftPosition=cursorCoordinate.left+'px';
		var cursorTopPosition=cursorCoordinate.top-4+'px';
		$(cursorElement).css({left: cursorLeftPosition,top: cursorTopPosition});
		
		//setting attribute of username above it's cursor
		var cursorNameElement = '#'+data.new_val.username+' div.cursor-name';
		var cursorNameLeftPosition=cursorCoordinate.left+1+'px';
		var cursorNameTopPosition=cursorCoordinate.top-22+'px';
		$(cursorNameElement).css({left: cursorNameLeftPosition,top: cursorNameTopPosition, display: 'block'});
		
		clearTimeout(timeToHideCursorName[data.new_val.username]);
		timeToHideCursorName[data.new_val.username] = setTimeout(function(){
			$(cursorNameElement).css({'display': 'none'});
		},2000);
		
	}
});


//when cursor position change
myCodeMirror.getDoc().on('cursorActivity',function(cm){
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

	/*clearTimeout(timeToSyncRethinkDB);
	timeToSyncRethinkDB = setTimeout(function (){*/
		var date = new Date();
		var dateFormated = FormatDate(date);
		var message = {
			id: fileURL,
			value: myCodeMirror.getValue(),
			lastModified: username,
			timeStamp: dateFormated};
		socket.emit('document-save',message);
	/*},1000);*/
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

function getSelectedRange(){
	return {from: myCodeMirror.getCursor(true), to: myCodeMirror.getCursor(false)};
}

function autoFormatSelection(){
	var range = getSelectedRange();
	myCodeMirror.autoFormatRange(range.from,range.to);
}