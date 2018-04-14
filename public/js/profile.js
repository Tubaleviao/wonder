// Sign in with spotfy >>> Chamar via socket e retornar infos

// FACEBOOK SIGN IN API

function fSignIn() {
  FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
  });
}
function statusChangeCallback(response) {
  if (response.status === 'connected') {
    testAPI();
  } else {
    FB.login(function(response) {
      if (response.authResponse) {
        testAPI() // USER AUTHORIZED APP
      }
    }, {scope: 'public_profile,email,user_friends', return_scopes: true}); // user_birthday
  }
}
function testAPI() {
  var fields = 'id,name,first_name,last_name,email,link,gender,locale'+
      ',picture,timezone,updated_time,verified,permissions,birthday';
	$(".fgray").css('display', 'none');
	$(".fcolored").css('display', 'inline');
  FB.api('/me?fields='+fields, function(response) {
    var finfo = {}
    finfo.id = response.id;
    finfo.name = response.name;
    finfo.first_name = response.first_name;
    finfo.last_name = response.last_name;
    finfo.image_url = response.picture.data.url;
    finfo.email = response.email;
    finfo.birthday = response.birthday;
    finfo.gender = response.gender;
    var table = $('<table></table>').addClass('finfo');
    var row1 = $('<tr></tr>').append("<td colspan=2 class='title'>Facebook Information</td>");
    var row2 = $('<tr></tr>').append('<td>ID</td><td>'+finfo.id+'</td>');
    var row3 = $('<tr></tr>').append('<td>Name</td><td>'+finfo.name+'</td>');
    var row3_1 = $('<tr></tr>').append('<td>First Name</td><td>'+finfo.first_name+'</td>');
    var row3_2 = $('<tr></tr>').append('<td>Last Name</td><td>'+finfo.last_name+'</td>');
    var row4 = $('<tr></tr>').append('<td>Image</td><td><img src="'+finfo.image_url+'"></img></td>');
    var row5 = $('<tr></tr>').append('<td>Email</td><td>'+finfo.email+'</td>');
    var row6 = $('<tr></tr>').append('<td>Birthday</td><td>'+finfo.birthday+'</td>');
    var row7 = $('<tr></tr>').append('<td>Gender</td><td>'+finfo.gender+'</td>');
    table.append(row1,row4, row2, row3, row3_1, row3_2, row5, row6, row7);
    $(".info").prepend(table);
  });
}
function fSignOut(){
  FB.logout(function(response) {
   console.log(response);
	$(".fgray").css('display', 'inline');
	$(".fcolored").css('display', 'none');
	$(".finfo").css('display', 'none');
});
}
window.fbAsyncInit = function() {
  FB.init({appId:'1682760075293833', cookie:true, xfbml:true,version:'v2.8'});
  FB.getLoginStatus(function(response) {
    statusChangeCallback(response);
  });
};
(function(d, s, id) {
	var js, fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) return;
	js = d.createElement(s); js.id = id;
	js.src = "//connect.facebook.net/en_US/sdk.js";
	fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// GOOGLE SIGN IN API

function onSignIn(googleUser) {
	var profile = googleUser.getBasicProfile();
	$(".ggray").css('display', 'none');
	$(".gcolored").css('display', 'inline');
	var ginfo = {}
	ginfo.id_token = googleUser.getAuthResponse().id_token;
	ginfo.id = profile.getId();
	ginfo.name = profile.getName();
	ginfo.given_name = profile.getGivenName();
	ginfo.family_name = profile.getFamilyName();
	ginfo.image_url = profile.getImageUrl();
	ginfo.email = profile.getEmail();
	var table = $('<table></table>').addClass('ginfo');
	var row1 = $('<tr></tr>').append("<td colspan=2 class='title'>Google Information</td>");
	var row2 = $('<tr></tr>').append('<td>ID</td><td>'+ginfo.id+'</td>');
	var row3 = $('<tr></tr>').append('<td>Name</td><td>'+ginfo.name+'</td>');
	var row3_1 = $('<tr></tr>').append('<td>Given Name</td><td>'+ginfo.given_name+'</td>');
	var row3_2 = $('<tr></tr>').append('<td>Family Name</td><td>'+ginfo.family_name+'</td>');
	var row4 = $('<tr></tr>').append('<td>Image</td><td><img src="'+ginfo.image_url+'"></img></td>');
	var row5 = $('<tr></tr>').append('<td>Email</td><td>'+ginfo.email+'</td>');
	table.append(row1,row4, row2, row3, row3_1, row3_2, row5);
	$(".info").prepend(table);
}
function gSignIn() {
	document.querySelector('.abcRioButtonContentWrapper').click();
}
function gSignOut() {
	var auth2 = gapi.auth2.getAuthInstance();
	auth2.signOut().then(function () {
		$(".ggray").css('display', 'inline');
		$(".gcolored").css('display', 'none');
		$(".ginfo").css('display', 'none');
	});
}

// SPOTIFY SIGN IN

var client_id = 'b04664c02dfc44b8976ea038afd078c4'; // Your client id
var client_secret = 'be4f307f55ba40eb9c8836ebd86dff93'; // Your secret
var redirect_uri = 'http://tuba.work/profileCallback/'; // Your redirect uri
var scope = 'user-read-private user-read-email';
var spot_pop;

var spot_url = 'https://accounts.spotify.com/authorize?'+
		'response_type=token'+
		'&client_id=' + encodeURIComponent(client_id)+
		'&scope=' + encodeURIComponent(scope)+
		'&redirect_uri=' + encodeURIComponent(redirect_uri)+
		'&state=' + encodeURIComponent("lskcuem387509jdu");

function sSignIn(){
	spot_pop = window.open(spot_url, 'pagina', "width=478, height=517, top=100, left=110, scrollbars=no");
}

function autoSpotSignIn(){
	console.log("teste");
}

function codeReceiver(hashParameters){
	var stateKey = 'spotify_auth_state';
	var access_token = hashParameters.access_token,
			state = hashParameters.state;
	
	if (access_token && state == null) {
		alert('There was an error during the authentication');
	} else {
		if (access_token) {
			$.ajax({
					url: 'https://api.spotify.com/v1/me',
					headers: {
						'Authorization': 'Bearer ' + access_token
					},
					success: function(response) {
						console.log(response);
						var table = $('<table></table>').addClass('sinfo');
						var row1 = $('<tr></tr>').append("<td colspan=2 class='title'>Spotify Information</td>");
						var row2 = $('<tr></tr>').append('<td>ID</td><td>'+response.id+'</td>');
						var row3 = $('<tr></tr>').append('<td>Name</td><td>'+response.display_name+'</td>');
						var row3_1 = $('<tr></tr>').append('<td>Country</td><td>'+response.country+'</td>');
						var row5 = $('<tr></tr>').append('<td>Email</td><td>'+response.email+'</td>');
						var row4;
						if(response.images[0]){
							row4 = $('<tr></tr>').append('<td>Image</td><td><img src="'+response.images[0].url+'"></img></td>');
						}else{row4 = $('<tr></tr>').append('<td>Image</td><td>No Image</td>');}
						
						table.append(row1,row4, row2, row3, row3_1, row5);
						$(".info").prepend(table);
						$('#sgray').hide();
						$('#scolored').show();
					}
			});
		} else {
				$('#sgray').show();
				$('#scolored').hide();
		}
	}
}

// PROFILE PAGE CODE

$(function(){
  
  var socket = io.connect('http://tuba.work/profile');
	
	autoSpotSignIn();
    
  socket.on('userInfo', function(info){
    console.log(info);
  });
  
  socket.on('attBTC', function(data){
		if($("#brl").text() != data.brl){
			$("#brl").css('display', 'none').text(data.brl).fadeIn(130);
			$("#usd").css('display', 'none').text(data.usd).fadeIn(130);
		}
	});
});