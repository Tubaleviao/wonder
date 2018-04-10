var mongo = require('./mongo');
var moment = require('moment');
var usernames = [];
var players = [];
var fs = require('fs');
var schedule = require('node-schedule');
var schedules = []; // new schedule.RecurrenceRule();
var request = require('request');
var siofu = require("socketio-file-upload"),
exchange = require('blockchain.info/exchange'),
statistics = require('blockchain.info/statistics'),
wallet = require('blockchain.info/MyWallet'),
cur = exchange.getTicker(), cur2, cur3;

setInterval(function(){
	cur2 = JSON.parse(JSON.stringify(cur));
	if(cur2.fulfillmentValue){
		cur3 = {brl: cur2.fulfillmentValue.BRL.last, usd: cur2.fulfillmentValue.USD.last};
	}
	cur = exchange.getTicker();
}, 5000);

exports.bitcoin = function(socket){
	
	setInterval(function(){
		socket.emit('attBTC', cur3);
	}, 5000);
	
	socket.on('loadChart', function(data){
		var current = new Date();
		var thisYear = Number(current.getFullYear());
		var p = statistics.getChartData("market-price", {'timespan': (thisYear-2010)+'years'});
		
		p.then(function(c){
			socket.emit('chart', {chart: c});
		});
	});
	
};

exports.broker = function(socket){
	setInterval(function(){
		socket.emit('attBTC', cur3);
	}, 5000);
	
	socket.on('save', function(data){
		mongo.saveField(data, function(field){
			socket.emit('saved', field);
		});
	});
	
	socket.on('loadFields', function(data){
		mongo.loadFields(data, function(fields){
			socket.emit('fieldsReady', fields);
		});
	});
};

exports.profile = function(socket){
	setInterval(function(){
		socket.emit('attBTC', cur3);
	}, 5000);
	socket.on('userInfo', function(user){
		socket.emit('userInfo', mongo.getUserInfo(user));
	});
};

exports.console = function(socket){
	setInterval(function(){
		socket.emit('attBTC', cur3);
	}, 5000);
	socket.on('userInfo', function(user){
		socket.emit('userInfo', mongo.getUserInfo(user));
	});
};

exports.home = function(socket){
	setInterval(function(){
		socket.emit('attBTC', cur3);
	}, 5000);
};

exports.help = function(socket){
	setInterval(function(){
		socket.emit('attBTC', cur3);
	}, 5000);
};

exports.about = function(socket){
	setInterval(function(){
		socket.emit('attBTC', cur3);
	}, 5000);
};

exports.dashboard = function(socket){
	setInterval(function(){
		socket.emit('attBTC', cur3);
	}, 5000);
};

exports.bi = function(socket){
	
	socket.on('saveLink', function(data){
		mongo.saveLink(data, function(saved){
			if(saved){
				socket.emit('saved', saved.ops[0]);
			}
		});
	});
	
	socket.on('startRunning', function(data){
		var rule = new schedule.RecurrenceRule();
		var sched = {};
		rule.minute = Number(data.time.substring(3, 5));
		rule.hour = Number(data.time.substring(0, 2))+3;
		var schedu = schedule.scheduleJob(rule, function(){
			request(data.link, function (error, response, body) {
				console.log('Status: ', response.statusCode, ' Link: ', data.link);
			});
		});
		sched.id = data.id+"2";
		sched.link = data.link;
		sched.time = data.time;
		sched.rule = rule;
		sched.job = schedu;
		schedules.push(sched);
		var resp = {};
		resp.schedules = schedules;
		socket.emit('started', resp);
	});
	
	socket.on('deleteLink', function(data){
		mongo.deleteLink(data.id, function(deleted){
			if(deleted){
				socket.emit('removeLink', data);
			}
		});
	}); 
	
	socket.on('stopRunning', function(data){
		for(var i = 0; i < schedules.length; i++){
			if(schedules[i].id == data.id){
				schedules[i].job.cancel();
				schedules.splice(i, 1);
			}
		}
		var resp = {};
		resp.schedules = schedules;
		socket.emit('started', resp);
	});
	
	socket.on('loadJobs', function(data){
		var resp = {};
		resp.schedules = schedules;
		socket.emit('started', resp);
	});
}

exports.player = function(socket){
	var uploader = new siofu();
	var user; // users/user
	uploader.dir = "./public/tmp";
	uploader.listen(socket);
	
	setInterval(function(){
		socket.emit('attBTC', cur3);
	}, 5000);
	
	socket.on('setUser', function(username){
		user = username; // users/user
	});

	socket.on('delete', function(music){
		fs.unlink(__dirname+'/public/'+user+'/'+music, function(err, resp){
			if(err) {console.log(err)}
		});
	});

	uploader.on('start', function(event){
		var data = {};
		if(fs.existsSync(__dirname+'/public/'+user+'/'+event.file.name)){
			data.exists = true;
			data.music = event.file.name;
			uploader.abort(event.file.id, socket);
			socket.emit('addMusicProgress', data);
		}else{
			data.exists = false;
			data.id = event.file.id;
			data.music = event.file.name;
			data.size = (event.file.size/1024/1024).toFixed(2);
			data.loaded = 0;
			socket.emit('addMusicProgress', data);
		}
	});

	uploader.on('progress', function(event){
		var data = {};
		data.id = event.file.id;
		data.music = event.file.name;
		data.size = (event.file.size/1024/1024).toFixed(2);
		data.loaded = (event.file.bytesLoaded/1024/1024).toFixed(2);
		socket.emit("attMusicProgress", data);
	});

	uploader.on('complete', function(event){
		var data = {};
		data.id = event.file_id;
		console.log(event);
		data.music = event.file_name;
		fs.rename(uploader.dir+'/'+data.music, './public/'+user+'/'+data.music, function(err){
			if(err) console.log(err);
		});
		socket.emit('deleteMusicProgress', event);
	});

	uploader.on("error", function(event){
		console.log(event.file.name+" - "+event.memo);
		fs.unlink('./public/tmp/'+event.file.name, function(err, resp){
			if(err) {console.log(err)}
		});
	});
}

exports.money = function(socket){
	
	setInterval(function(){
		socket.emit('attBTC', cur3);
	}, 5000);
	
	socket.on('getMovements', function(data){
		var moves;
		mongo.getMoves(data.user, function(err, resp){
			moves = resp;
			socket.emit('getMovements', {moves: moves});
		});
	});

	socket.on('getSingle', function(nothing){
		var single;
		mongo.getSingle(function(err, resp){
			single = resp;
			socket.emit('getRepeat', {singles: single});
		});
	});
	
	socket.on('oldMoves', function(data){
		mongo.getRpMoves(data.user, function(err, resp){
			mongo.getNrpMoves(data.user, function(err2, resp2){
				socket.emit('oldMoves', {rpMoves: resp, nrpMoves: resp2});
			});
		});
	});
	
	socket.on('deleteMove', function(data){
		mongo.deleteMove({_id: data.id}, function(resp){
			if(!resp){ console.log("Error while removing move") }else{
				socket.emit('moveDeleted', data);
			}
		});
	});
	
	socket.on('saveMove', function(data){
		var record = data;
		if(record.value !== ""){
			if(record.repeat == "1"){
				delete record.month;
				delete record.year;
				mongo.saveMove(record, function(resp){
					if(!resp){console.log('Nãosalvo');}else{
						socket.emit('moveSaved', resp);
					}
				});
			}else{
				delete record.months;
				delete record.years;
				delete record.startm;
				delete record.starty;
				mongo.saveMove(record, function(resp){
					if(!resp){console.log('Nãosalvo');}else{
						socket.emit('moveSaved', resp);
					}
				});
			}
		}
	});
}

exports.shooter = function(socket){
	socket.on('turn', function(data){
		socket.broadcast.emit('turn', data);
	});

	socket.on('addPlayer', function(data){
		players.push({name: data.name});
		socket.broadcast.emit('oldPlayers', data);
		socket.broadcast.emit('addPlayer', data);
	});

	socket.on('oldPlayer', function(data){
		socket.broadcast.emit('loadPlayers', data);
	});

	socket.on('shoot', function(data){
		socket.broadcast.emit('shoot', data);
	});

	socket.on('setPosition', function(data){
		socket.broadcast.emit('setPosition', data);
	});

	socket.on('kill', function(data){
		socket.broadcast.emit('kill', data);
	});
}

exports.storage = {
  destination: function (req, file, cb) {
    cb(null, __dirname + '/public/users/'+req.session.user+'/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
}

exports.options = {
  key: fs.readFileSync(__dirname+'/cert/tuba.work.key'),
  cert: fs.readFileSync(__dirname+'/cert/9ab1a56907ff9cb3.crt'),
  ca: [fs.readFileSync(__dirname+'/cert/gd_bundle-g2-g1.crt')]
}

exports.stracker = function (socket){
	
	setInterval(function(){
		socket.emit('attBTC', cur3);
	}, 5000);
	
  socket.on('save', function(data){
    mongo.saveSleep(data, function(success){
			var now = moment();
			var time = new Date(now.format('YYYY'), now.format('MM')-1, 01);
			var monthMili = time.getTime();
			mongo.takeNaps({user: data.user, month: monthMili}, function(err, records){
				if(err!=null){console.log(err);}else{
					socket.emit('saved', records);
				}
			});
    });
  });
	socket.on('take', function(id){
    mongo.takeNap(id, function(err, nap){
			if(err){console.log(err);}else{
      	socket.emit('took', nap);
			}
    });
  });
	socket.on('del', function(id){
    mongo.deleteNap(id, function(success){
			socket.emit('saved', success);
		});
  });
	socket.on('del', function(id){
    mongo.deleteNap(id, function(success){
			socket.emit('saved', success);
		});
  });
	
}

exports.notes = function (socket){
	
	setInterval(function(){
		socket.emit('attBTC', cur3);
	}, 5000);
	
  socket.on('save', function(data){
    mongo.saveNote(data, function(success){
      socket.emit('saved', success);
    });
  });
	
	socket.on('saveSize', function(data){
    mongo.saveNoteSize(data, function(success){
      if(!success){
				console.log("ERROR ON SAVING NOTE SIZE OMG");	
			}
    });
  });
}

exports.chat = function (socket){
	var addedUser = false;
  
socket.on('new message', function (data) {
	var hora = moment().format('h:mm:ss a');
	var resp = {
		hora: hora,
		username: socket.username,
		room: socket.room,
		message: data
	}
	socket.broadcast.emit('new message', resp);
	socket.emit('new message', resp);
	resp.hora = moment().format('x');
  if(socket.room != ''){
    mongo.saveChat(resp, function(done){
      if(!done) console.log('ERROR while saving chat');
    });
  }
	
});

  socket.on('add user', function (data) {
    var client_ip_address = socket.request.connection.remoteAddress;
		var existe_user = false;
		var existe_room = false;
		var user_room, room_json;
		if(data.room){
			user_room = data.room;
		}else{
			user_room = "";
		}
		
		for (var i = 0; i < usernames.length; i++){
			if (usernames[i].room == user_room){
				existe_room = true;
				room_json = usernames[i];
			}
		}
		// [ {room: "tubaroom", users: ["tuba", "joão" , ...]}, {...} ]
		
		if(!existe_room){
			usernames.push({room: user_room, users: []});
			room_json = {room: user_room, users: []};
		}
		
		if(room_json.users.indexOf(data.user) >= 0){
			existe_user = true;
		}
		
		if(!existe_user){
			console.log(socket.username+" "+client_ip_address);
			socket.username = data.user;
			socket.room = user_room;
			room_json.users.push(data.user);
			for (var i = 0; i < usernames.length; i++){
				if (usernames[i].room == data.room){
					usernames[i].users = room_json.users;
				}
			}
			addedUser = true;
			mongo.getChat(data.room, function(chat){
				if(!chat){ console.log('ERROR while getting chat')}
				else{
					room_json.chats = chat;
					socket.emit('login', {});
					socket.emit('refresh users', room_json);
				}
				delete room_json.chats;
				socket.broadcast.emit('refresh users', room_json);
			});
		} else {
			socket.emit('login failed', {});
		}
  });
  
  socket.on('disconnect', function () {
		var room_json;
    if (addedUser) {
			for (var i = 0; i < usernames.length; i++){ 
				if (usernames[i].room == socket.room){
					room_json = usernames[i];
					usernames[i].users.splice(usernames[i].users.indexOf(socket.username), 1);
				}
			}
			socket.broadcast.emit('refresh users', room_json);
			socket.emit('log', "You become disconnected. Please refresh the page");
    }
  });
  
  socket.on('blink', function(data){
	  socket.broadcast.emit('blink', data);
  });
};