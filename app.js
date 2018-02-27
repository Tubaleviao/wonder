var express = require('express'),
http = require('http'), // https = require('https'),
session = require('express-session'),
app = express(),
port = process.env.PORT || 80,
routes = require('./routes'),
bodyParser = require('body-parser'),
siofu = require("socketio-file-upload"),
code = require('./codes'),
multer  = require('multer'),
storage = multer.diskStorage(code.storage),
upload = multer({ storage: storage }),
options = code.options,
server = /*https*/http.createServer(/*options,*/ app),
io = require('socket.io')(server),
session_secret = process.env.SESSION_SECRET || 'nosecrethereisusedsoyeah';

console.log(session_secret);

app.use(siofu.router);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.use('/modules', express.static(__dirname + '/node_modules/'));
app.use(session({ secret: session_secret, saveUninitialized: true, resave: false }));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

//app.get('/gauge', routes.gauge);
app.get('/contagemregressivaparaahortomorrow', routes.hortomorrow);
app.get('/fisheye', routes.fisheye);
app.get('/home', routes.home);
app.get('/php', routes.php);
app.get('/bisolutions', routes.bi);
app.post('/login', routes.login);
app.get('/logout', routes.logout);
app.post('/signup', routes.signup);
app.get('/auth', routes.auth);
app.get('/pr0x1', routes.proxy);
app.post('/pr0x1', routes.post_proxy);
app.get('/console', emailAuth, routes.console);
app.get('/', userAuth, routes.dashboard);
app.get('/bitcoin', emailAuth, routes.bitcoin);
app.get('/player', emailAuth, routes.player);
app.get('/profile/:user', emailAuth, express.static(__dirname + '/profile'), routes.otherProfile);
app.get('/profile', emailAuth, routes.profile);
app.get('/help', emailAuth, routes.help);
app.get('/notes', emailAuth, routes.notes);
app.get('/chat', routes.chat);
app.get('/chat/:room', routes.chat);
app.post('/chat/:room', routes.chatApi);
app.get('/stracker', emailAuth, routes.stracker);
app.get('/shooter', emailAuth, routes.shooter);
app.get('/perfil', emailAuth, routes.perfil);
app.get('/about', emailAuth, routes.about);
app.get('/places', emailAuth, routes.places);
app.get('/money', emailAuth, routes.money);
app.get('/save', emailAuth, routes.save);
//app.get('/del', emailAuth, routes.del);
app.get('/six', emailAuth, routes.six);
app.get('*', function(req, res){res.send('Nothing here.');});

io.of('/bitcoin').on('connection', code.bitcoin);
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

server.listen(port, function(){console.log("Server running at the port %d", port);});

function userAuth(req, res, next) {
  if (req.session.user) { return next(); }
  res.redirect('/home');
}

function emailAuth(req, res, next) {
  if (req.session.verified) { return next(); }
  res.redirect('/home');
}
