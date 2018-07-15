$(document).ready(function(){
	
	var socket = io('/home');
	
	socket.on('attBTC', function(data){
		if($("#brl").text() != data.brl){
			$("#brl").css('display', 'none').text(data.brl).fadeIn(130);
			$("#usd").css('display', 'none').text(data.usd).fadeIn(130);
		}
	});
	
	$('#u').focus();

	$('#btn-login').click(function(){
		$('#signup').hide(100);
		$('#login').toggle(100);
		$('#u').focus();
	});
	
	$('#btn-signup').click(function(){
		$('#login').hide(100);
		$('#signup').toggle(100);
		$('#us').focus();
	});
	
});