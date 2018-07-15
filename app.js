var express = require('express'),
http = require('http'), // https = require('https'), // npm pem?? fff
session = require('express-session'),
app = express(),
port = process.env.PORT || 80,
routes = require('./routes'),
bodyParser = require('body-parser'),
upio = require("up.io"),
code = require('./codes'),
options = code.options,
server = /*https*/http.createServer(/*options,*/ app),
io = require('socket.io')(server),
session_secret = process.env.SESSION_SECRET || 'nosecrethereisusedsoyeah';

app.use(upio.router);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.use('/modules', express.static(__dirname + '/node_modules/'));
app.use(session({ secret: session_secret, saveUninitialized: true, resave: false }));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

//app.get('/gauge', routes.gauge);
app.get('/contagemregressivaparaahortomorrow', routes.hortomorrow);
app.get('/fisheye', routes.fisheye);
app.get('/estouvivo', routes.estouvivo);
app.get('/home', routes.home);
app.get('/php', routes.php);
app.get('/broker', routes.broker);
//app.get('/bisolutions', routes.bi);
app.post('/login', routes.login);
app.get('/logout', routes.logout);
app.post('/signup', routes.signup);
app.get('/auth', routes.auth);
app.get('/pr0x1', routes.proxy);
app.post('/pr0x1', routes.post_proxy);
app.get('/console', verified, routes.console);
app.get('/', userAuth, routes.dashboard);
app.get('/bitcoin', verified, routes.bitcoin);
app.get('/player', verified, routes.player);
app.get('/profile/:user', verified, express.static(__dirname + '/profile'), routes.otherProfile);
app.get('/profile', verified, routes.profile);
app.get('/profileCallback', verified, routes.profileCallback);
app.get('/help', verified, routes.help);
app.get('/notes', verified, routes.notes);
app.get('/chat', routes.chat);
app.get('/chat/:room', routes.chat);
app.post('/chat/:room', routes.chatApi);
app.get('/stracker', verified, routes.stracker);
app.get('/shooter', verified, routes.shooter);
app.get('/perfil', verified, routes.perfil);
app.get('/about', verified, routes.about);
app.get('/places', verified, routes.places);
app.get('/money', verified, routes.money);
app.get('/save', verified, routes.save);
//app.get('/del', verified, routes.del);
app.get('/six', verified, routes.six);
app.get('/treasure', verified, routes.treasure);
app.get('*', function(req, res){res.send('Nothing here.');});

io.of('/bitcoin').on('connection', code.bitcoin);
io.of('/treasure').on('connection', code.treasure);
io.of('/console').on('connection', code.console);
io.of('/help').on('connection', code.help);
io.of('/about').on('connection', code.about);
io.of('/dashboard').on('connection', code.dashboard);
io.of('/home').on('connection', code.home);
io.of('/bisolutions').on('connection', code.bi);
io.of('/chat').on('connection', code.chat);
io.of('/notes').on('connection', code.notes);
io.of('/money').on('connection', code.money);
io.of('/profile').on('connection', code.profile);
io.of('/shooter').on('connection', code.shooter);
io.of('/stracker').on('connection', code.stracker);
io.of('/player').on('connection', code.player);
io.of('/broker').on('connection', code.broker);
io.of('/tubaChat').on('connection', code.tubaChat);

server.listen(port, function(){console.log("Server running at the port %d", port);});

function userAuth(req, res, next) {
  if (req.session.user) { return next(); }
  res.redirect('/home');
}

function verified(req, res, next) {
  if (req.session.verified) { return next(); }
  res.redirect('/home');
}
