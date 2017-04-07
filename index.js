

//setting environment variables

var express = require('express');
const util = require('util'); //to inspect all property of Object
var app = express();
var expressPort = 2601;

var io = require('socket.io').listen(app.listen(expressPort));
var fileURL = 'index.js';

//determine RethinkDB is listening to any change on some table
var isDBListening=false;
var database = require('./lib/db.js')
var db = new database();

var colorList = ['#ff0000','#8c8c08','#3faf1a','#af6e1a','#5d13ad','#960a91','#960a50','#960a17','#0a968f'];
var colorListIndex=0;

//setup({host: ,databaseName: ,port: })
db.setup({host: 'teamcode.me', databaseName: 'teamcode',port: 28015});


//route root page
app.get('/',function(req,res){
	res.sendFile(__dirname+'/index.html')
});


//route get File
app.get('/get/:fileURL',function(req,res){
	var fileURL = req.params.fileURL;
	db.get('edit',fileURL,function(err,fileContent){
		res.send(fileContent);
	});
	
});

//static route
app.use('/', express.static(__dirname));
app.use('/bower',express.static(__dirname+'/bower_components'));
app.use('/nodejs',express.static(__dirname+'/node_modules'));
app.use('/css',express.static(__dirname+'/customCSS'));
app.use('/emmet',express.static(__dirname+'/emmet'));
/*

//login
var session = require('express-session');
var bodyParser = require('body-parser');
var passport = require('passport');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(session({
  secret : "secret",
  saveUninitialized: true,
  resave: true
}))

app.use(passport.initialize());
app.use(passport.session());

router.route('/login')
    .get(function (req, res) {
        res.render('login', {
            'title': 'Log in'
        })
    })
    .post('/login', passport.authenticate('local', { successRedirect: '/', failureRedirect:'/login' }));

var LocalStrategy = require('passport-local').Strategy;
var passport = require('passport');
var bcrypt = require('bcrypt');

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    db.user.findById(id).then(function (user) {
        done(null, user);
    }).catch(function (err) {
        console.log(err);
    })
});

passport.use(new LocalStrategy(
    function (username, password, done) {
        db.user.find({where : {
            username : username
        }}).then(function (user) {
            bcrypt.compare(password, user.password, function (err, result) {
                if (err) { return done(err); }
                if(!result) {
                    return done(null, false, { message: 'Sai thông tin username hoặc password' });
                }
                return done(null, user);
            })
        }).catch (function (err) {
            return done(err);
        })
    }
))*/

var clients ={};
//setting socket
io.on('connection',function(socket){	
	console.log('a new username connected');

	//on user disconected
	socket.on('disconnect',function(){
		//clients.splice(clients.indexOf(socket.username),1);
		io.emit('deleteCursor',socket.username);
		
		console.log('a user disconnected');
	});

	socket.on('joinRoom',function(connectionInfos){
		socket.username = connectionInfos.username;
		socket.room = connectionInfos.room;

		socket.leave(socket.id);
		socket.join(socket.room);

		var socketCursor = [];
		socketCursor.push(GetCursorByName(socket.username));
		socket.broadcast.emit('appendCursors',socketCursor); //must be array even only one element

		socket.emit('appendCursors',GetAllCursorInRoom(socket));
		console.log(io.sockets.adapter.rooms);
	});
	

	//when server receive input from Editor on.change event
	socket.on('document-update',function (message){
		db.insert('temp_files',message);
	});

	//when server receive input from Cursor of Editor on.change event
	socket.on('cursor-update',function (message){
		db.insert('temp_cursors',message);
	});

	//when server receive request to save document to database, 1s after stop typing
	socket.on('document-save',function (message){
		db.insert('edit',message);
	});
	

	if (!isDBListening)
	{
		isDBListening=true;

		db.changes('temp_files',function(err, row){
			io.to(socket.room).emit('document-coming',row);
		});

		db.changes('temp_cursors',function(err, row){
			io.to(socket.room).emit('cursor-coming',row);
		});

	}
});

function GetAllCursorInRoom(socket){
	var socketsInRoom = io.sockets.adapter.rooms[socket.room].sockets;
		
	var result=[],username='';
	for(var socketID in socketsInRoom)
	{
		username=io.sockets.connected[socketID].username;
		if (username != socket.username)
		{
			result.push(GetCursorByName(username));
		}
	}
	return result;
}

function GetCursorByName(name){
	var result={};
	result.username = name;
	result.value = 
		'<div class="CodeMirror-cursors" id="'+name+'">\n\t'+
			'<div class="CodeMirror-cursor" style="left: 4px; top: 0px; height: 15px; display:block">&nbsp;</div>\n'+
			'<div id="'+name+'-cursor" class="cursor-name" style="left: 4px; top: 0px; height: 15px; display:none; color: white; background-color: '+colorList[colorListIndex]+'">'+name+'</div>\n'+
		'</div>';
	colorListIndex++;
	return result;
}

console.log('ExpressJS listening on '+expressPort);
