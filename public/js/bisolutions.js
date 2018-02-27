function remove(id) {
  return (elem=document.getElementById(id)).parentNode.removeChild(elem);
}

function printSched(sched){
  var u = $("<div/>").addClass('url2').css('display', 'inline-block').text(sched.link);
  var t = $("<div/>").addClass('hora2').css('display', 'inline-block').text(sched.time);
  var a = $("<a/>").addClass("stop").attr('href', '#').text("stop");
  var li = $("<li/>").attr('id', sched.id).append(u, " - ", t, " ", a);
  $("#scheds").children("ul").append(li);
}

function printLink(link){
  var parsed = JSON.parse(link);
  var c = $("<a/>").attr('href', '#').addClass('glyphicon').addClass('glyphicon-trash');
  var u = $("<div/>").addClass('url2').css('display', 'inline-block').text(parsed.url);
  var t = $("<div/>").addClass('hora2').css('display', 'inline-block').text(parsed.time);
  var a = $("<a/>").addClass("start").attr('href', '#').text("start");
  var li = $("<li/>").attr('id', parsed._id).append(c, " ", u, " - ", t, " ", a);
  $("#links").children("ul").append(li);
}

$(function(){

  var socket = io('/bisolutions');

  socket.emit("loadJobs", {});

  $("button").click(function(){
    var link = {};
    link.time = document.getElementById("hora").value;;
    link.url = $("#url").val();
    socket.emit('saveLink', link);
  });

  $(".start").on("click", function(){
    var data = {};
    data.id = $(this).parent().attr('id');
    data.link = $(this).parent().children(".url2").text();
    data.time = $(this).parent().children(".hora2").text();
    socket.emit('startRunning', data);
  });

  $(document).on('click', ".stop", function(){
    var data = {};
    data.id = $(this).parent().attr('id');
    socket.emit('stopRunning', data);
  });

  $(document).on('click', ".glyphicon-trash", function(){
    var data = {};
    data.id = $(this).parent().attr('id');
    socket.emit('deleteLink', data);
  });

  socket.on('saved', function(link){
    //$('#msg').text('Link saved ~').show(200).delay(500).fadeOut(150);
    printLink(JSON.stringify(link));
  });

  socket.on('removeLink', function(data){
    remove(data.id);
  });

  socket.on('started', function(data){
    $("#scheds").children("ul").empty();
    data.schedules.forEach(function(sched){
      printSched(sched);
    });
  });
});