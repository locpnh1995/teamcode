const host = 'localhost'

//setting environment variables
var helperModule = require('./lib/TeamCodeHelper.js');
var helper = new helperModule();

var express = require('express');
var path = require('path');

const util = require('util'); //to inspect all property of Object
var app = express();
var expressPort = 8888;

//for passport js
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
// var passport = require('passport');
var md5 = require('md5');


//custom mysql with user
var mysqldb = require('./lib/mysqldb.js');
var mysql = new mysqldb();
const USER_TABLE = 'users';

mysql.setup({
    host: host,
    user: 'root',
    password: '',
    database: 'teamcode'
});

var User = require('./models/User.js');
var Token = require('./models/Token.js');

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));
app.use(cookieParser());

app.use('/assets', express.static(path.join(__dirname, '../../', 'assets')));
app.use('/node_modules', express.static(path.join(__dirname, '../../', 'node_modules')));
app.use('/app', express.static(path.join(__dirname, '../../', 'app')));

app.get('/', function (req, res) {
    // console.log(path.join(__dirname, '../../', 'index.html'));
    // res.end("hello");
    res.sendFile(path.join(__dirname, '../../', 'index.html'));
})

app.post('/authentication', function (req, res) {
    console.log(req.cookies);
    mysql.findTokenByValue(req.cookies.tokenTeamCode, function (err, token) {
        console.log(err, token);
        if (!err) {
            var tempToken = new Token();
            tempToken.initial(token);

            if (req.cookies.emailTeamCode == tempToken.getUserEmail()) {
                var expiresAt = new Date(tempToken.getExpiresAt());
                var now = new Date();

                if (now.getTime() < expiresAt.getTime()) {
                    mysql.updateTokenExpiresAt(60, tempToken.getUserEmail(), function (err) {
                        if (!err) {
                            //handle something when it isn't error.
                            res.send({code: 200, message: 'Your token is correct, match and available.'});
                        }
                        else {
                            res.send({code: 216, message: 'Error!'});
                        }
                    });
                    //res.send({code: 200, message: 'Your token is correct, match and available.'});
                    //res.send(helper.ToJSON(200, 'Your token is correct, match and available.'));
                }
                else {
                    res.send({code: 401, message: 'Your token is expired or incorrect.'});
                }
            }
            /*else
             {
             res.send(helper.ToJSON(403,'This is not your token.'));
             }*/
        }
        else {
            res.send({code: 404, message: 'Your token is not exists.'});
            //res.send(helper.ToJSON(404, 'Your token is not exists.'));
        }
    });

});

app.post('/register', function (req, res) {

    // if (!req.body)
    //     return res.sendStatus(404);
    if (req.body == null) {
        res.status(500).send({error: 'Something failed!'});
    }
    else {
        mysql.findUserByEmail(req.body.email, function (err, result) {
            if (!err) {
                res.send({code: 211, message: 'Email already exists!'});
            }
            else {
                if (req.body.password !== req.body.re_password || req.body.password == null || req.body.re_password == null) {
                    res.send({code: 216, message: 'Password and Re-Password don\'t match'});
                }
                else {
                    mysql.insertUser(req, function (err, result) {
                        if (!err) {
                            // console.log('Create email: ' + req.body.email + 'complete!');
                            res.send({code: 201, message: 'Register successful!'});
                        }
                        else {
                            res.send({code: 210, message: 'Register failed!'});
                        }
                    });
                }
            }
        });

    }
    // res.send('Your account has been created. Try to <a href="/login">Login</a>');
});

app.post('/login', function (req, res) {
    if (!req.body) {
        res.status(500).send({error: 'Something failed!'});
    }
    else {
        var tempUser = new User();
        mysql.findUserByEmail(req.body.email, function (err, user) {
            if (!err) {
                tempUser.initial(user);
                if (tempUser.checkPassword(req.body.password)) {
                    mysql.deleteTokenByEmail(req.body.email, function (err) {
                        if (!err) {
                            mysql.insertToken(req, function (err, token) {
                                if (!err) {
                                    // res.send(helper.ToJSON(200, 'Your token is: ' + token));
                                    //handle duplicate token down here
                                    res.send({
                                        code: 200,
                                        message: 'Login successful!',
                                        token: token.value,
                                        email: req.body.email,
                                        expires: token.expiresAt
                                    });
                                }
                                else {
                                    res.send({code: 213, message: 'Login failed!'});
                                }
                            });
                        }
                    });
                }
                else {
                    res.send({code: 215, message: 'Password incorrect!'});
                }
            }
            else {
                res.send({code: 214, message: 'Email not found!'});
            }
        });
    }

});


app.post('/logout', function (req, res) {

    var request = require('request');
    var cookiesReq = 'emailTeamCode=' + req.cookies.emailTeamCode + '; tokenTeamCode=' + req.cookies.tokenTeamCode;
    request.post({
            url: 'http://' + host + ":" + expressPort + '/authentication',
            // form: {
            //     'email': req.body.email,
            //     'token': req.body.token
            // }
            headers: {
                'Cookie': cookiesReq
            }
        },
        function (err, httpResponse, body) {
            var response = JSON.parse(body);

            if (response.code == 200) {
                mysql.deleteTokenByEmail(req.cookies.emailTeamCode, function (err) {
                    if (!err) {
                        res.send({code: 200, message: 'You has been logout.'});
                        //res.send(helper.ToJSON(200, 'You has been logout.'));
                    }
                    else {
                        res.send({code: 250, message: 'Error!'});
                    }
                });
            }
        });
});

app.listen(expressPort, function () {
    console.log('ExpressJS listening on ' + expressPort);
});

// //for socketio
// var io = require('socket.io').listen(app.listen(expressPort));
//
// //determine RethinkDB is listening to any change on some table
// var isDBListening = false;
// var database = require('./lib/db.js')
// var db = new database();
//
// var colorList = ['#ff0000', '#8c8c08', '#3faf1a', '#af6e1a', '#5d13ad', '#960a91', '#960a50', '#960a17', '#0a968f'];
// var colorListIndex = 0;
//
// //setup({host: ,databaseName: ,port: })
// db.setup({host: host, databaseName: 'teamcode', port: 28015});
//
//
// //route root page
// app.get('/', function (req, res) {
//     res.sendFile(__dirname + '/index.html')
// });
//
// //static route
// app.use('/', express.static(__dirname));
// app.use('/bower', express.static(__dirname + '/bower_components'));
// app.use('/nodejs', express.static(__dirname + '/node_modules'));
// app.use('/css', express.static(__dirname + '/customCSS'));
// app.use('/emmet', express.static(__dirname + '/emmet'));
// app.use('/csslintjs', express.static(__dirname + '/csslintjs'));
//
// var clients = {};
// //setting socket
// io.on('connection', function (socket) {
//     console.log('a new username connected');
//
//     //on user disconected
//     socket.on('disconnect', function () {
//         //clients.splice(clients.indexOf(socket.username),1);
//         io.emit('deleteCursor', socket.username);
//
//         console.log('a user disconnected');
//     });
//
//     socket.on('joinRoom', function (connectionInfos) {
//         socket.username = connectionInfos.username;
//         socket.room = connectionInfos.room;
//
//         socket.leave(socket.id);
//         socket.join(socket.room);
//
//         var socketCursor = [];
//         socketCursor.push(GetCursorByName(socket.username));
//         socket.broadcast.emit('appendCursors', socketCursor); //must be array even only one element
//
//         socket.emit('appendCursors', GetAllCursorInRoom(socket));
//         console.log(io.sockets.adapter.rooms);
//     });
//
//
//     //when server receive input from Editor on.change event
//     socket.on('document-update', function (message) {
//         db.insert('temp_files', message);
//     });
//
//     //when server receive input from Cursor of Editor on.change event
//     socket.on('cursor-update', function (message) {
//         db.insert('temp_cursors', message);
//     });
//
//     //when server receive request to save document to database, 1s after stop typing
//     socket.on('document-save', function (message) {
//         db.insert('edit', message);
//     });
//
//
//     if (!isDBListening) {
//         isDBListening = true;
//
//         db.changes('temp_files', function (err, row) {
//             io.to(socket.room).emit('document-coming', row);
//         });
//
//         db.changes('temp_cursors', function (err, row) {
//             io.to(socket.room).emit('cursor-coming', row);
//         });
//
//     }
// });
//
// function GetAllCursorInRoom(socket) {
//     var socketsInRoom = io.sockets.adapter.rooms[socket.room].sockets;
//
//     var result = [], username = '';
//     for (var socketID in socketsInRoom) {
//         username = io.sockets.connected[socketID].username;
//         if (username != socket.username) {
//             result.push(GetCursorByName(username));
//         }
//     }
//     return result;
// }
//
// function GetCursorByName(name) {
//     var result = {};
//     result.username = name;
//     result.value =
//         '<div class="CodeMirror-cursors" id="' + name + '">\n\t' +
//         '<div class="CodeMirror-cursor" style="left: 4px; top: 0px; height: 15px; display:block">&nbsp;</div>\n' +
//         '<div id="' + name + '-cursor" class="cursor-name" style="left: 4px; top: 0px; height: 15px; display:none; color: white; background-color: ' + colorList[colorListIndex] + '">' + name + '</div>\n' +
//         '</div>';
//     colorListIndex++;
//     return result;
// }
//
// console.log('ExpressJS listening on ' + expressPort);
