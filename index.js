//setting environment variables
var r = require('rethinkdb');
var express = require('express');
const util = require('util'); //to inspect all property of Object
var app = express();
var expressPort = 2601;
var io = require('socket.io').listen(app.listen(expressPort));
var index = 0;
var fileURL = 'index.js';
var data;

//connect and work with rethinkdb
var connection = null;
var dbPort = 28015;
var dbName = 'teamcode';
var dbHost = 'localhost'

//determine RethinkDB is listening to any change on some table
var isDBListening=false;

//make connection to database
r.connect ({host: dbHost,port: dbPort, db: dbName}, function(err,conn){
	if (err) 
		throw err;
	connection = conn;
});

//route root page
app.get('/',function(req,res){
	res.sendFile(__dirname+'/index.html')
});


//route get File
app.get('/get/:fileURL',function(req,res){
	r.table('edit').get(req.params.fileURL).run(connection,function(err,result){
		if (err)
			throw err;
		res.send(result);
	});
});


//route all cursor. Now, setting static username, but will change to dynamic later...
app.get('/getCursor/:cursorUsername',function(req,res){
	var result = req.params.cursorUsername;
	switch(result){
		case 'do':
		{
			result='loc';
			break;
		}
		case 'loc':
		{
			result='do';
			break;
		}
	}
	res.send(result);
});

//static route
app.use('/', express.static(__dirname));
app.use('/bower',express.static(__dirname+'/bower_components'));
app.use('/nodejs',express.static(__dirname+'/node_modules'));
app.use('/css',express.static(__dirname+'/customCSS'));



//setting socket
io.on('connection',function(socket){

	console.log('a new user connected');

	//on user disconected
	socket.on('disconnect',function(){
		console.log('a user disconnected');
	});
	

	//when server receive input from Editor on.change event
	socket.on('document-update',function (message){
		r.table('temp_files').insert(message,{conflict: "update"}).run(connection,function(err,response){
			if (err)
				throw err;
			console.log('Temp Files table updated.');
		});
	});

	//when server receive input from Cursor of Editor on.change event
	socket.on('cursor-update',function (message){
		r.table('temp_cursors').insert(message,{conflict: "update"}).run(connection,function(err,response){
			if (err)
				throw err;
			console.log('Temp Cursors table updated.');
		});
	});

	//when server receive request to save document to database, 1s after stop typing
	socket.on('document-save',function (message){
		r.table('edit').insert(message,{conflict: "update"}).run(connection,function(err,response){
			if (err)
				throw err;
			console.log('Edit table updated.');
		});

	});
	

	if (!isDBListening)
	{
		isDBListening=true;
		r.table('temp_files').changes().run(connection,function(err, cursor) {
			cursor.each(function(err,row){
				if (err)
					throw err;
				io.emit('document-coming',row);
			});
		});

		r.table('temp_cursors').changes().run(connection,function(err, cursor) {
			cursor.each(function(err,row){
				if (err)
					throw err;
				io.emit('cursor-coming',row);
			});
		});
	}
});


console.log('ExpressJS listening on '+expressPort);
console.log('RethinkDB listening on '+dbPort);

