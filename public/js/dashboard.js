$(function(){
  
  var socket = io('/dashboard');
  
  $( "#p1" ).first().show( 200, function showNext() {
    $( this ).next( ".p" ).show( 200, function(){
      $( this ).next( ".p" ).show( 200, function(){
        $( this ).next( ".p" ).fadeIn(500, function(){
          $( "#p5" ).first().show( 100, function showHup() {
            $( this ).next( ".p" ).show( 100, showHup );
          });
        });
      });
    });
  });
  
  socket.on('attBTC', function(data){
		if($("#brl").text() != data.brl){
			$("#brl").css('display', 'none').text(data.brl).fadeIn(130);
			$("#usd").css('display', 'none').text(data.usd).fadeIn(130);
		}
	});
  
});