/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , game = require('./game.js');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);

app.listen(3000, function(){

  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
  console.log(game);
});


var io = require('socket.io').listen(app);

io.sockets.on('connection', function (socket) {
  game.ListenUsers.push(socket);
  socket.name = socket.id;
  io.sockets.emit('newmsg','У нас новый гость'+socket.id);
  
  socket.emit('history',game.history);
  
  socket.on('msg', function (data) {
	try {
		var dt = JSON.parse(data);
		if (dt.name){
            this.name = dt.name;
        }
	} catch (e) {
	// не JSON	
	}  
    io.sockets.emit('newmsg',this.name+':'+data);
	game.history.push(this.name+':'+data);
  });
});

setInterval(function(){
  io.sockets.emit('newmsg','Текущее время по серверу :'+new Date(Date.now()));
}, 60000);

