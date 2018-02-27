var mc = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/wonder';
var bcrypt = require('bcrypt');
var db;

mc.connect(url, function(err, database){
	if(err) throw err;
	db = database;
});

module.exports = {
	deleteMove: function(data, callback){
		data._id = ObjectID.createFromHexString(data._id);
		var moves = db.collection('moves');
		moves.deleteOne({_id: data._id}, function(err, record){ // move = movements inside the account
			if(err){ console.log(err); callback(false);
			}else{ callback(record); }
		});
	},
	saveMove: function(data, callback){
		var moves = db.collection('moves');
		if(data._id && data._id !== ""){
			data._id = ObjectID.createFromHexString(data._id);
			moves.save(data, {w: 1}, function(err, record){
				if(err){ console.log(err); callback(false);
				}else{ callback(data); }
			});
		}else{
			delete data._id;
			moves.insert(data, {w: 1}, function(err, result){
				if(err){ console.log(err); callback(false);
				}else{ callback({id: result.insertedIds[0], name: data.name, value: data.value, in: data.in}); }
			});
		}
	},
	getFirstRpMove: function(user, callback){
		var moves = db.collection('moves');
		moves.aggregate([{$match: {user: user}}, {$group: {_id: "firstRecord", min: {$min: "$starty"}}}], function(err, result){
			if(err){ console.log(err); callback(false);}
			else{
				moves.aggregate([{$match: {starty: result.min, user: user}}, {$group: {_id: "firstm", min: {$min: "$startm"}}}], function(err2, result2){
					if(err2){ console.log(err2); callback(false);}
					else{
						callback({fy: result.min, fm: result2.min});
					}
				});
			}
		});
	},
	getUserInfo: function(user, callback){
		var users = db.collection('users');
		
		users.findOne( {username: user}, {verified: 0}, function(err, record){
			if(err){ console.log(err); callback(false);}
			else{
				var info = record;
				var createdDate = new Date(record.date);
				var visits = db.collection('visits');
				info.date = createdDate.getDate()+'/'+createdDate.getMonth()+'/'+createdDate.getFullYear()+' ';
				info.date += createdDate.getHours()+':'+createdDate.getMinutes()+':'+createdDate.getSeconds();
				visits.aggregate([{$match: {user: user}}, {$group: {_id: "$page", count: {$sum: 1}}}, {$sort: {count: -1}}], function(err2, results){
					if(err2){console.log(err2); callback(false);}else{
						var visitedPages = {};
						results.forEach(function(page){
							visitedPages[page._id] = page.count;
						});
						info.visitedPages = visitedPages;
						callback(null, info);
					}
				});
			}
		});
	},
	getRpMoves: function(user, callback){
		var moves = db.collection('moves');
		moves.find( {user: user, repeat: "1"} ).toArray(function(err, docs){
			if(err){console.log(err); callback(err, null);
			}else{callback(null, docs);}
		});
	},
	getFirstNrpMove: function(user, callback){
		var moves = db.collection('moves');
		moves.aggregate([{$match: {user: user}}, {$group: {_id: "firstRecord", min: {$min: "$year"}}}], function(err, result){
			if(err){ console.log(err); callback(false);}
			else{
				moves.aggregate([{$match: {year: result.min, user: user}}, {$group: {_id: "firstm", min: {$min: "$month"}}}], function(err2, result2){
					if(err2){ console.log(err2); callback(false);}
					else{
						callback({fy: result.min, fm: result2.min});
					}
				});
			}
		});
	},
	getNrpMoves: function(user, callback){
		var moves = db.collection('moves');
		moves.find( {user: user, repeat: "0"} ).toArray(function(err, docs){
			if(err){console.log(err); callback(err, null);
			}else{callback(null, docs);}
		});
	},
	deleteLink: function(id, callback){
		var idHex = ObjectID.createFromHexString(id);
		var links = db.collection('links');
		links.deleteOne( {_id: idHex}, function(err, doc){
			if(err){console.log(err); callback(false);
			}else{callback(true);}
		});
	},
	loadLinks: function(callback){
		var links = db.collection('links');
		links.find().toArray(function(err, docs){
			if(err){console.log(err); callback(false);
			}else{callback(docs);}
		});
	},
	saveLink: function(link, callback){
		if(link._id){
			link._id = ObjectID.createFromHexString(link._id);
		}
		var links = db.collection('links');
		links.insert(link, {w: 1}, function(err, record){
			if(err){ console.log(err); callback(false);
			}else{ callback(record); }
		});
	},
	saveVisit: function(data){
		var colle = db.collection('visits');
		colle.save(data, {w: 1}, function(err, record){
			if(err){console.log(err);}
		});
	},
	saveSingle: function(data, callback){
		if(data._id){
			data._id = ObjectID.createFromHexString(data._id);
		}
		var single = db.collection('single');
		single.save(data, {w: 1}, function(err, record){
			if(err){ console.log(err); callback(false);
			}else{ callback(record); }
		});
	},
	getMoves: function(user, callback){
		var moves = db.collection('moves');
		moves.find( {user: user} ).toArray(function(err, docs){
			if(err){console.log(err); callback(err, null);
			}else{callback(null, docs);}
		});
	},
	getSingle: function(callback){
		var single = db.collection('single');
		single.find( {}, function(err, docs){
			if(err){console.log(err); callback(err, null); // get single movement
			}else{callback(null, docs);}
		});
	},
	existUser: function(user, callback){
		users = db.collection('users');
		users.findOne({username: user}, function(err, record){
			if(err){ console.log(err); callback(false);}
			else{
				if(record==null){
					callback(false);
				}else{
					callback(record);
				}
			}
		});
	},
	existId: function(id, callback){
		id = ObjectID.createFromHexString(id);
		users = db.collection('users');
		users.findOne({_id: id}, function(err, record){
			if(err){ console.log(err); callback(false);}
			else{
				if(record==null){
					callback(false);
				}else{
					callback(record);
				}
			}
		});
	},
	auth: function(user, pass, callback){
		users = db.collection('users');
		users.findOne({username: user}, function(err, record){
			if(err){console.log(err); callback(false);}
			if(record){
				bcrypt.compare(pass, record.password, function(err, success){
					if(err){ console.log(err); callback(false);}
					if(success) { callback(true); }
					else{ callback(false); }
				});
			}else{ callback(false); }
		});
	},
	saveUser: function(user, callback){
		users = db.collection('users');
		//user._id = ObjectID.createFromHexString(user._id);
		users.save(user, function(err, record){
			if(err){ console.log(err); callback(false);
			}else{ callback(record); }
		});
	},
	setEmail: function(data, callback){
		users = db.collection('users');
		users.update({username: data.user}, {$set: {email: data.email}}, function(err, resp){
			if(err){ console.log(err); callback(false);
			}else{ callback(resp); }
		});
	},
	addUser: function(user, pass, email, callback){
		users = db.collection('users');
		bcrypt.hash(pass, 8, function(err, hash) {
			if (err){ console.log(err); callback(false);
			}else{
				var d = new Date();
				users.insert({username: user, password: hash, email: email, date: d.getTime()}, {w: 1}, function(err, result){
					if(err){ console.log(err); callback(false);
					}else{ callback(result.insertedIds[0]); }
				});
			}
		});
	},
	saveNote: function(data, callback){
		var notes = db.collection('notes');
		notes.update({user: data.user, id: data.id}, {$set: {note: data.note}}, {upsert: true}, function(err, resp){
			if(err){ console.log(err); callback(false);
			}else{ callback(true); }
		});
	},
	saveChat: function(data, callback){
		var chats = db.collection('chats');
		chats.insertOne(data, function(err, resp){
			if(err){ console.log(err); callback(false);
			}else{ callback(true); }
		});
	},
	getChat: function(data, callback){
		var chats = db.collection('chats');
		chats.find( {room: data} ).toArray(function(err, docs){
			if(err){console.log(err); callback(false);
			}else{callback(docs);}
		});
	},
	saveNoteSize: function(data, callback){
		var notes = db.collection('notes');
		notes.update({user: data.user, id: data.id}, {$set: {x: data.x, y: data.y}}, {upsert: true}, function(err, resp){
			if(err){ console.log(err); callback(false);
			}else{ callback(true); }
		});
	},
	takeNotes: function(user, callback){
		var notes = db.collection('notes');
		notes.find({user: user}).toArray(function(err, docs){
			if(err){console.log(err); callback(err, null);}
			else{
				callback(null, docs);
			}
		});
	},
	saveSleep: function(nap, callback){
		if(nap._id){
			nap._id = ObjectID.createFromHexString(nap._id);
		}
		var sleep = db.collection('sleep');
		sleep.save(nap, {w:1}, function(err, record){
			if(err){ console.log(err); callback(false);
			}else{callback(record);}
		});
	},
	takeNaps: function(data, callback){
		var sleep = db.collection('sleep');
		sleep.find( {user: data.user, startdate: {$gte: data.month}} ).toArray(function(err, docs){
			if(err){console.log(err); callback(err, null);
			}else{callback(null, docs);}
		});
	},
	takeNap: function(id, callback){
		var idHex = ObjectID.createFromHexString(id);
		var sleep = db.collection('sleep');
		sleep.findOne( {_id: idHex}, function(err, doc){
			if(err){console.log(err); callback(err, null);
			}else{callback(null, doc);}
		});
	},
	deleteNap: function(id, callback){
		var idHex = ObjectID.createFromHexString(id);
		var sleep = db.collection('sleep');
		sleep.deleteOne( {_id: idHex}, function(err, doc){
			if(err){console.log(err); callback(false);
			}else{callback(true);}
		});
	}
};