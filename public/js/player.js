var musics;

function selected(){
	var x = document.getElementById("siofu_input");
	var txt3 = $("<div/>");
	var txt = "", total=0;
	if ('files' in x) {
		if (x.files.length === 0) {
			txt = "Select one or more files.";
		} else {
			for (var i = 0; i < x.files.length; i++) {
				var txt2 = $("<div/>");
				var file = x.files[i];
				if ('name' in file) {txt = file.name;}
				if ('size' in file) {
					total += (file.size / 1024 / 1024).toFixed(2);
					txt += " - " + (file.size / 1024 / 1024).toFixed(2) + " Mb";
				}
				txt2.text(txt);
				txt3.append(txt2);
			}
		}
	}
	if(Number(total)+Number(getSize()) >= 2048){
		alert("You have only "+Number(2048-getSize()).toFixed(2)+" Mb of free space, you are trying to upload "+total+" Mb\n"+
				 		"To get more space, you must to pay U$ 0,10 per Gb per Month.");
		$("#siofu_input").val("");
	}else{
		$('#selected').empty();
		$('#selected').append(txt3.html());
	}
}

function addMusics(musicsJs){
	musics = musicsJs;
	var $musics = $('.musics');
	musics.forEach(function(music){
		if(music.slice(-4) == '.mp3'){
			var $trash = $('<div>').addClass('trash');
			var $el = $('<div>').addClass('music').text(music);
			var $li = $('<li>').append($el,$trash);
			$musics.append($li);
		}
	});
}
	
function addMusic(music){
	var $musics = $('.musics');
	if(music.slice(-4) == '.mp3'){
		var $trash = $('<div>').addClass('trash');
		var $el = $('<div>').addClass('music').text(music);
		var $li = $('<li>').append($el,$trash);
		$musics.prepend($li);
	}
}

function putOnQueue(data){
	var music = $("<div/>").attr("id", "music"+data.id)
	if(!data.exists){
		music.text(data.music+" ("+data.size+" Mb) - "+data.loaded+" Mb");
		$("#upload-progress").append(music);
		$("#selected").children().first().remove();
	}else{
		music.text(data.music+" - alredy there!").show(200).delay(1000).fadeOut(150);
		$("#upload-progress").append(music);
		$("#selected").children().first().remove();
	}
}

function remove(id) {
	return (elem=document.getElementById(id)).parentNode.removeChild(elem);
}

$(document).ready(function(){
	
	var socket = io('http://tuba.life/player');
	var uploader = new SocketIOFileUpload(socket);
	var next = musics[Math.floor(Math.random()*musics.length)];
	var user = "users/"+getUser();
	var audioTag = $('#audio');
	var dom = document.getElementById("audio");
	
	dom.volume = 0.5;
	
	uploader.listenOnInput(document.getElementById("siofu_input"));
	uploader.chunkSize = 1024 * 100;
	
	// SOCKET FUNCTIONS
	
	socket.emit('setUser', user);
	
	socket.on('attBTC', function(data){
		if($("#brl").text() != data.brl){
			$("#brl").css('display', 'none').text(data.brl).fadeIn(130);
			$("#usd").css('display', 'none').text(data.usd).fadeIn(130);
		}
	});
	
	socket.on('addMusicProgress', function(data){
		putOnQueue(data);
	});
	
	socket.on('start', function(data){
		console.log('start');
		putOnQueue(data);
	});
	
	socket.on('attMusicProgress', function(data){
		var id = "#music"+data.id;
		$(id).text(data.music+" ("+data.size+" Mb) - "+data.loaded+" Mb");
	});
	
	socket.on('deleteMusicProgress', function(data){
		musics.push(data.music);
		remove("music"+data.id);
		addMusic(data.music);
	});
	
	// PAGE USABILITY
	
	$(".seeker").drags();
	$(".body").on("mouseup", function() {
		$(".seeker").removeClass('draggable');
		//dom.play();
	});
	
	$('.label').on('click', function(){
		document.getElementById("siofu_input").click();
	});

	$('.checkbox').click(function(){
		$(this).toggleClass('checked');
	});
	
	$(document).on('click', ".trash", function(){
		var music = $(this).closest('li').children('.music').text();
		socket.emit('delete', music);
		$(this).closest('li').attr('id', 'deleteThis');
		remove('deleteThis');
	});
		
	$('.trash').mouseover(function(){
		$(this).closest('li').children('.music').css('text-decoration', 'underline');
	});
	$('.trash').mouseout(function(){
		$(this).closest('li').children('.music').css('text-decoration', 'none');
	});

	$('.search').on('input', function(){
		$("li:not(:contains('"+$(this).val()+"'))").hide(); //val().toLowerCase()
		$("li:contains('"+$(this).val()+"')").show();
	});
	
	$("#vol").on('click', function(){
		if($(this).hasClass('muted')){
			dom.muted = false;
			$("#vol").css("background", "transparent url('/img/vol.ico') no-repeat 0 50%");
			$("#vol").toggleClass('muted');
		}else{
			dom.muted = true;
			$("#vol").css("background", "transparent url('/img/no-vol.ico') no-repeat 0 50%");
			$("#vol").toggleClass('muted');
		}
	});
	
	$("#play").on('click', function(){
		if($(this).hasClass('playing')){
			dom.pause();
		}else{
			dom.play();
		}
	});
	
	dom.onvolumechange = function(){
		$("#vol-level").css('width', Math.round(dom.volume*50)+'px');
	}
	
	dom.onplay = function(){
		$("#play").css("background", "transparent url('/img/pause.ico') no-repeat 0 50%");
		if(!$("#play").hasClass('playing')){
			$("#play").toggleClass('playing');
		}
	};
	
	dom.onpause = function(){
		$("#play").css("background", "transparent url('/img/play.ico') no-repeat 0 50%");
		$("#play").toggleClass('playing');
	};
	
	dom.ontimeupdate = function(){
		var coef = dom.duration/200;
		var px = dom.currentTime/coef;
		//var buf = dom.buffered.end(dom.buffered.length - 1)/coef;
		//var buf = dom.buffered.end(((dom.buffered.length > dom.duration) ? dom.buffered.length : 1) - 1)/coef;
		var buf;
		try {buf = dom.buffered.end(dom.buffered.length - 1)/coef;} 
		catch (err) {buf = 0;}
		$("#progress-value").css('width', Math.round(px)+'px');
		$("#progress-buffer").css('width', Math.round(buf)+'px');
	};

	$(document).on('click', ".music", function(){
		audioTag.attr('src', user+'/'+$(this).text());
		$('#np').text($(this).text());
	});

	audioTag.on('ended',function(){
	    if($('.repeat').hasClass('checked')){
	    	audioTag.currentTime = 0;
	    } else if($('.random').hasClass('checked')){
	    	next = musics[Math.floor(Math.random()*musics.length)];
	    	audioTag.attr('src', user+'/'+next);
	    	$('#np').text(next);
		}
	});

	$('#next').click(function(){
		next = musics[Math.floor(Math.random()*musics.length)];
    	audioTag.attr('src', user+'/'+next);
    	$('#np').text(next);
	});

	audioTag.attr('src', user+'/'+next);
	$('#np').text(next);
	
});