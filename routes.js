var moment = require('moment'),
nav = ['chat', 'notes', 'player', 'broker', 'shooter', 'money', 'stracker', 'bitcoin', 'about', 'help'],//'Shooter', 'Places',  'Pr0x1'
mongo = require('./mongo'),
fs = require('fs'),
nodemailer = require('nodemailer'),
xoauth2 = require('xoauth2'),
getSize = require('get-folder-size'),
php = require('exec-php'),
otherEmail = false,
request = require('request'),
url = require('url'),
exchange = require('blockchain.info/exchange'),
cur = exchange.getTicker();

var xo_user = 'tubaleviao@gmail.com',
xo_clientId = process.env.XO_CLIENTID,
xo_clientSecret = process.env.XO_CLIENTSECRET,
xo_refreshToken = process.env.XO_REFRESHTOKEN,
xo_accessToken = process.env.XO_ACCESSTOKEN ;

setInterval(function(){
	cur = exchange.getTicker();
}, 60000);

function replaceAll(str, needle, replacement) {
    var i = 0;
    while ((i = str.indexOf(needle, i)) != -1) {
			str = str.replace(needle, replacement);
    }return str;
}

exports.broker = function(req, res){
	var date = new Date();
	var visit = {ip: req.ip, date: date.getTime(), user: req.session.user, page: "broker"};
	var cur2 = JSON.parse(JSON.stringify(cur));
	var data = {title: 'Broker', user: req.session.user, verified: req.session.verified, 
							brl: cur2.fulfillmentValue.BRL.last, usd: cur2.fulfillmentValue.USD.last};
	res.render("broker", data);
	mongo.saveVisit(visit);
};

exports.hortomorrow = function(req, res){
	var date = new Date();
	var visit = {ip: req.ip, date: date.getTime(), user: req.session.user, page: "hortomorrow"};
	var cur2 = JSON.parse(JSON.stringify(cur));
	var data = {title: 'Hortomorrow is Comming in', user: req.session.user, brl: cur2.fulfillmentValue.BRL.last, usd: cur2.fulfillmentValue.USD.last};
	res.render("hortomorrow", data);
	mongo.saveVisit(visit);
};

exports.help = function(req, res){
	var date = new Date();
	var visit = {ip: req.ip, date: date.getTime(), user: req.session.user, page: "help"};
	var cur2 = JSON.parse(JSON.stringify(cur));
	var data = {title: 'Help', user: req.session.user, brl: cur2.fulfillmentValue.BRL.last, usd: cur2.fulfillmentValue.USD.last};
	res.render("help", data);
	mongo.saveVisit(visit);
};

exports.fisheye = function(req, res){
	var date = new Date();
	var visit = {ip: req.ip, date: date.getTime(), user: "NO_USER", page: "fisheye"};
	var cur2 = JSON.parse(JSON.stringify(cur));
	var data = {title: 'Help', user: req.session.user, brl: cur2.fulfillmentValue.BRL.last, usd: cur2.fulfillmentValue.USD.last};
	res.render("help", data);
	mongo.saveVisit(visit);
};

exports.post_proxy = function(req, res){
	var data = {}, options = {};
	data.domain = req.body.dfmff;
	data.path = req.body.pfmff;
	options.uri = url.parse(req.body.dfmff+req.body.pfmff);
	options.headers = {'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"+
																	" (KHTML, like Gecko) Chrome/51.0.2704.106 Safari/537.36"};
	if(req.body.mfmff=="POST"){
		options.method = req.body.mfmff;
	}else{
		options.method = "GET";
	}
	//console.log(req.body.dfmff+req.body.pfmff);
	request(options, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			data.body = replaceAll(body, "top:0", "top:30");
			data.body = replaceAll(data.body, "src=\"/", "src=\""+data.domain+"/");
		}else{
			data.body = error;
		}res.render("proxy", data);
	});
};

exports.profile = function(req, res){
	var date = new Date();
	var visit = {ip: req.ip, date: date.getTime(), user: req.session.user, page: "profile"};
	var cur2 = JSON.parse(JSON.stringify(cur));
	var data = {brl: cur2.fulfillmentValue.BRL.last, usd: cur2.fulfillmentValue.USD.last};
	data.title = 'Profile', data.user = req.session.user;
	mongo.getUserInfo(req.session.user, function(err, resp){
		if(err){console.log(err);}else{
			data.userinfo = resp;
			res.render("profile", data);
			mongo.saveVisit(visit);
		}
	});
};

exports.console = function(req, res){
	var date = new Date();
	var visit = {ip: req.ip, date: date.getTime(), user: req.session.user, page: "console"};
	var cur2 = JSON.parse(JSON.stringify(cur));
	var data = {brl: cur2.fulfillmentValue.BRL.last, usd: cur2.fulfillmentValue.USD.last};
	data.title = 'Console', data.user = req.session.user;
	mongo.getUserInfo(req.session.user, function(err, resp){
		if(err){console.log(err);}else{
			data.userinfo = resp;
			res.render("console", data);
			mongo.saveVisit(visit);
		}
	});
};

exports.otherProfile = function(req, res){
	var date = new Date();
	var visit = {ip: req.ip, date: date.getTime(), user: req.session.user, page: "profile/"+req.params.user};
	var cur2 = JSON.parse(JSON.stringify(cur));
	var data = {brl: cur2.fulfillmentValue.BRL.last, usd: cur2.fulfillmentValue.USD.last};
	data.title = 'Profile', data.user = req.session.user;	
	console.log(req.params.user);
	res.render("profile", data);
	mongo.saveVisit(visit);
};

exports.proxy = function(req, res){
	//console.log("url: "+req.url+" query: "+JSON.stringify(req.query));
	var data = {};
	data.domain = "https://www.google.com";
	data.path = "";
	request(data.domain, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			data.body = replaceAll(body, "top:0", "top:30");
			data.body = replaceAll(data.body, "src=\"/", "src=\""+data.domain+"/");
		}else{
			data.body = error;
		}res.render("proxy", data);
	});
	
	//res.render("proxy", {url: req.body.url} );
};

exports.bi = function(req, res){
	mongo.loadLinks(function(links){
		if(links){
			res.render("bisolutions", {links: links});
		}else{
			res.render("bisolutions");
		}
	});
};

exports.php = function(req, res){
	php(__dirname+"/php/index.php", function(error, php, output){
		res.send("Error: "+error+"\nEcho: "+output);
	});
};

exports.auth = function(req, res){
	if(req.query.id){
		mongo.existId(req.query.id, function(record){
			if(record){
				req.session.verified = true;
				record.verified = true;
				mongo.saveUser(record, function(resp){
					if(resp){
						var dir = __dirname+'/public/users/'+record.username;
						if (!fs.existsSync(dir)){fs.mkdirSync(dir);}
						res.redirect('/');
					}
				});
			}
		});
	}else{
		var transporter;
		var xoauth2gen = xoauth2.createXOAuth2Generator({
			user: xo_user,
			clientId: xo_clientId,
			clientSecret: xo_clientSecret,
			refreshToken: xo_refreshToken,
			accessToken: xo_accessToken 
		});
		xoauth2gen.getToken(function(err, token){
				if(err){return console.log(err);}
		});
		transporter = nodemailer.createTransport({service: 'gmail',auth: {xoauth2: xoauth2gen}});
		mongo.setEmail({user: req.session.user, email: req.query.email}, function(resp){
			if(resp){ 
				var user_id;
				otherEmail = true;
				req.session.email = req.query.email;
				mongo.existUser(req.session.user, function(exist){
					if(exist){
						user_id = exist._id;
						var mailOptions = {
							from: '"Tubalevião" <tubaleviao@gmail.com>', 
							to: req.query.email, 
							subject: 'The answer to life, universe and everything...', 
							text: 'Hello '+req.session.user,
							html: "<div style='background-color: black; color: lime; text-align: center;'><p><b>... is 42!</b></p>"+
										"<div>Now that you know it, you can enjoy us and help humanity to solve other important questions and"+
										" problems!</div><h1>Congratulations, you have successfully joined to tuba.work!</h1>"+
										"<p>Click on this link to get validated: http://tuba.work/auth?id="+user_id+
										"<div>After validation, feel free to use our apps and enjoy the community.</div>"+
										"<pre>Best regards,<br/>Tubalevião</pre></div>"
						};
						transporter.sendMail(mailOptions, function(error, info){
							if(!error){	res.redirect('/');
							}else{console.log(error);	}
						});
					}
				});
			}
		});
	}
};

exports.signup = function(req, res){
	var now = moment(), transporter;
	var xoauth2gen = xoauth2.createXOAuth2Generator({
		user: xo_user,
		clientId: xo_clientId,
		clientSecret: xo_clientSecret,
		refreshToken: xo_refreshToken,
		accessToken: xo_accessToken 
	});
	xoauth2gen.getToken(function(err, token){
			if(err){return console.log(err);}
	});
	transporter = nodemailer.createTransport({service: 'gmail',auth: {xoauth2: xoauth2gen}});

	mongo.existUser(req.body.username, function(exist){
		if(exist){
			res.render('home', {title: 'home', msg: 'User already exists'});
		}else{
			mongo.addUser(req.body.username, req.body.password, req.body.email, function(success){
				if(success){
					var mailOptions = {
						from: '"Tubalevião" <tubaleviao@gmail.com>', 
						to: req.body.email, 
						subject: 'The answer to life, universe and everything...', 
						text: 'Hello mom 🐴',
						html: "<div style='background-color: black; color: lime; text-align: center;'><p><b>... is 42!</b></p>"+
									"<div>Now that you know it, you can enjoy us and help humanity to solve other important questions and"+
									" problems!</div><h1>Congratulations, you have successfully joined to tuba.work!</h1>"+
									"<p>Click on this link to get validated: http://tuba.work/auth?id="+success+
									"<div>After validation, feel free to use our apps and enjoy the community.</div>"+
									"<pre>Best regards,<br/>Tubalevião</pre></div>"
					};
					req.session.user = req.body.username;
					req.session.email = req.body.email;
					transporter.sendMail(mailOptions, function(error, info){
						if(!error){
							res.redirect('/');
						}else{
							console.log(error);
						}
					});
				}else{
					res.render('home', {title: 'home', msg: 'User not registred'});
				}
			});
		}
	});
	console.log(req.ip+" "+now.format('DD/MM/YYYY HH:mm:ss')+' sigup');
};

exports.save = function(req, res){
	var record = req.query;
	record.user = req.session.user;
	if(record.page !== ""){
		req.session.page = record.page;
	}else{
		delete req.session.page;
	}
	if(record.value !== ""){
		if(record.repeat == "1"){
			delete record.month;
			delete record.year;
			mongo.saveMove(record, function(resp){
				if(!resp){
					console.log('Nãosalvo');
				}
			});
		}else{
			delete record.months;
			delete record.years;
			delete record.startm;
			delete record.starty;
			mongo.saveMove(record, function(resp){
				if(!resp){
					console.log('Nãosalvo');
				}
			});
		}
	}
	res.redirect('/money');
};

exports.six = function(req, res){
	delete req.session.page;
	res.redirect('/money');
};

exports.money = function(req, res){
	var cur2 = JSON.parse(JSON.stringify(cur));
	var data = {};
	if(cur2.fulfillmentValue.BRL.last){
		data = {brl: cur2.fulfillmentValue.BRL.last, usd: cur2.fulfillmentValue.USD.last};
	}
	var date = new Date();
	var visit = {ip: req.ip, date: date.getTime(), user: req.session.user, page: "money"};
	data.title = 'Money', data.user = req.session.user;
	
	if(req.session.page){
		data.page=req.session.page;
	}else{
		data.page='';
	}
	res.render('money', data);
	mongo.saveVisit(visit);
};

exports.bitcoin = function(req, res){
	var cur2 = JSON.parse(JSON.stringify(cur));
	var data = {};
	if(cur2.fulfillmentValue.BRL.last){
		data = {brl: cur2.fulfillmentValue.BRL.last, usd: cur2.fulfillmentValue.USD.last};
	}
	var date = new Date();
	var visit = {ip: req.ip, date: date.getTime(), user: req.session.user, page: "bitcoin"};
	data.title = 'Bitcoin', data.user = req.session.user;
	
	res.render('bitcoin', data);
	mongo.saveVisit(visit);
};

exports.stracker = function(req, res){
	var now = moment();
	var time = new Date(now.format('YYYY'), now.format('MM')-1, 01);
	var monthMili = time.getTime();
	var data = {title: 'Stracker', user: req.session.user};
	mongo.takeNaps({user: data.user, month: monthMili}, function(err, records){
		if(err!=null){console.log(err);}else{
			if(records){
				data.records = records;
				res.render('stracker', data);
			}else{
				res.render('stracker', data);
			}
		}
	});
	console.log(req.ip+" "+now.format('DD/MM/YYYY HH:mm:ss')+' stracker');
};

exports.player = function(req, res){
	var dir = __dirname+'/public/users/'+req.session.user;
	var date = new Date();
	var cur2 = JSON.parse(JSON.stringify(cur));
	var data = {};
	if(cur2.fulfillmentValue.BRL.last){
		data = {brl: cur2.fulfillmentValue.BRL.last, usd: cur2.fulfillmentValue.USD.last};
	}
	var visit = {ip: req.ip, date: date.getTime(), user: req.session.user, page: "player"};
	
	getSize(dir, function(err, folder_size) {
		if (err) { console.log(err);
		}else{
			fs.readdir(dir, function(err, files){
				if(err) throw err;
				data.musics = files, data.size = (folder_size/1024/1024).toFixed(2), 
					data.user = req.session.user, data.title = 'Player';
				res.render('player', data);
				mongo.saveVisit(visit);
			});
		}
	});	
};

exports.shooter = function(req, res){
	var now = moment();
	res.render('shooter', {title: 'Shooter', user: req.session.user});
	console.log(req.ip+" "+now.format('DD/MM/YYYY HH:mm:ss')+' shooter');
};

exports.home = function(req, res){
	var date = new Date();
	var visit = {ip: req.ip, date: date.getTime(), user: req.session.user};
	var cur2 = JSON.parse(JSON.stringify(cur));
	var data = {};
	if(cur2.fulfillmentValue.BRL.last){
		data = {brl: cur2.fulfillmentValue.BRL.last, usd: cur2.fulfillmentValue.USD.last};
	}
	
	if(req.session.verified){
		data.title = 'Dashboard';
		data.nav = nav;
		data.user = req.session.user;
		res.render('dashboard', data);
		visit.page = "dashboard";
	}else if(req.session.user){
		data.title = 'Verify';
		data.user = req.session.user;
		data.email = req.session.email;
		res.render('verify', data);
		visit.page = "verify";
	}else{
		data.title = 'Home';
		res.render('home', data);
		visit.page = "home";
	}
	mongo.saveVisit(visit);
};

exports.login = function(req, res){
	var date = new Date();
	var visit = {ip: req.ip, date: date.getTime(), user: req.session.user};
	
	mongo.existUser(req.body.username, function(exist){
		if(exist){
			mongo.auth(req.body.username, req.body.password, function(success){
				if(success){
					req.session.user = req.body.username;
					req.session.email = exist.email;
					req.session.verified = true;
					res.redirect(req.body.url);
				}else{
					res.render('home', {title: 'Home', msg: 'Wrong password'});
				}
			});	
		}else{
			res.render('home', {title: 'Home', msg: 'User don\'t exists'});
		}
	});	
	mongo.saveVisit(visit);
};

exports.dashboard = function(req, res){
	var cur2 = JSON.parse(JSON.stringify(cur));
	var data = {};
	if(cur2.fulfillmentValue.BRL.last){
		data = {brl: cur2.fulfillmentValue.BRL.last, usd: cur2.fulfillmentValue.USD.last};
	}
	var date = new Date();
	var visit = {ip: req.ip, date: date.getTime(), user: req.session.user};
	
	if(req.session.verified){
		data.title = 'Dashboard';
		data.user = req.session.user;
		data.nav = nav;
		res.render('dashboard', data);
		visit.page = "dashboard";
	}else if(req.session.user){
		data.title = 'Verify';
		data.user = req.session.user;
		data.email = req.session.email;
		if(otherEmail){
			otherEmail = false;
			data.msg = "Email changed ~";
		}
		res.render('verify', data);
		visit.page = "verify";
	}else{
		data.title = 'Home';
		res.render('home', data);
		visit.page = "home";
	}
	mongo.saveVisit(visit);
};

exports.notes = function(req, res){
	var cur2 = JSON.parse(JSON.stringify(cur));
	var data = {};
	if(cur2.fulfillmentValue.BRL.last){
		data = {brl: cur2.fulfillmentValue.BRL.last, usd: cur2.fulfillmentValue.USD.last};
	}
	var date = new Date();
	var visit = {ip: req.ip, date: date.getTime(), user: req.session.user, page: "notes"};
	data.title = 'Notes',	data.nav = nav, data.user = req.session.user;
	mongo.takeNotes(req.session.user, function(err, docs){
		if(err!=null){res.render('notes', data);}else{
			if(docs){
				data.notes = docs;
				res.render('notes', data);
			}else{
				res.render('notes', data);
			}
		}
	});
	mongo.saveVisit(visit);
};

exports.chat = function(req, res){
	var now = moment();
	var date = new Date();
	var visit = {ip: req.ip, date: date.getTime(), user: req.session.user, page: "chat"};
	var data = {title: 'Chat'};
	if(req.session.user != null){
		data.user = req.session.user;
	}
	if(req.params.room){
		data.room = req.params.room;
	}
	res.render('chat', data);
	mongo.saveVisit(visit);
};

exports.profileCallback = function(req, res){
	var now = moment();
	var date = new Date();
	var visit = {ip: req.ip, date: date.getTime(), user: req.session.user, page: "profileCallback"};
	var data = {title: 'Callback'};
	if(req.session.user != null){
		data.user = req.session.user;
	}
	res.render('profileCallback', data);
	mongo.saveVisit(visit);
};


exports.chatApi = function(req, res){
	var now = moment();
	var date = new Date();
	var visit = {ip: req.ip, date: date.getTime(), user: req.session.user, page: "chatapi"};
	var data = {title: 'Chat'};
	if(req.session.user != null){
		data.user = req.session.user;
	}
	if(req.params.room){
		data.room = req.params.room;
	}
	res.render('chatApi', data);
	mongo.saveVisit(visit);
};

exports.perfil = function(req, res){
	var cur2 = JSON.parse(JSON.stringify(cur));
	var data;
	if(cur2.fulfillmentValue.BRL.last){
		data = {brl: cur2.fulfillmentValue.BRL.last, usd: cur2.fulfillmentValue.USD.last};
	}
	var date = new Date();
	var visit = {ip: req.ip, date: date.getTime(), user: req.session.user, page: "perfil"};
	data.title = 'Perfil', data.nav = nav, data.user = req.session.user;
	res.render('perfil', data);
	mongo.saveVisit(visit);
};

exports.about = function(req, res){
	var cur2 = JSON.parse(JSON.stringify(cur));
	var data = {};
	if(cur2.fulfillmentValue.BRL.last){
		data = {brl: cur2.fulfillmentValue.BRL.last, usd: cur2.fulfillmentValue.USD.last};
	}
	var date = new Date();
	var visit = {ip: req.ip, date: date.getTime(), user: req.session.user, page: "about"};
	data.title = 'About', data.nav = nav, data.user = req.session.user;
	res.render('about', data);
	mongo.saveVisit(visit);
};

exports.places = function(req, res){
	var now = moment();
	res.render('places', {
		title: 'Places',
		user: req.session.user
		});
	console.log(req.ip+" "+now.format('DD/MM/YYYY HH:mm:ss')+' places');
};

exports.logout = function(req, res){
	var date = new Date();
	var visit = {ip: req.ip, date: date.getTime(), user: req.session.user, page: "about"};
	req.session.destroy();
	res.redirect('/home');
	mongo.saveVisit(visit);
};

/*request("https://blockchain.info/pt/ticker", function (error, response, body) {
		if (!error && response.statusCode == 200) {
			data.usd = JSON.parse(body).USD.last;
			data.brl = JSON.parse(body).BRL.last;
		}else{
			console.log(error);
		}
		
	}); */