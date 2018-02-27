$(function(){
  
  var socket = io.connect('http://tuba.life/console');
  
  socket.on('attBTC', function(data){
		if($("#brl").text() != data.brl){
			$("#brl").css('display', 'none').text(data.brl).fadeIn(130);
			$("#usd").css('display', 'none').text(data.usd).fadeIn(130);
		}
	});
  
  socket.on('newVisit', function(data){
    $("#visits").append('<li>'+data+'</li>');
  });
  
});