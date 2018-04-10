var map;
var savingFieldArray, savingFieldPolygon;
var drawingManager;
var fieldsArray = [];

function initMap() {
  var region = {lat: -22.880698, lng: -47.191324}; 

  map = new google.maps.Map(document.getElementById('map'), {
    center: region,
    zoom: 18
  });
  
  // Drawing Stuff
  
  drawingManager = new google.maps.drawing.DrawingManager();
  drawingManager.setMap(map);
  
  drawingManager.setOptions({
    drawingControlOptions: {
      drawingModes: ['polygon']
    }
  });
  
  google.maps.event.addListener(drawingManager, 'polygoncomplete', function(polygon) {
    var field = [];
    savingFieldPolygon = polygon;
    polygon.getPath().forEach(function(x){
      field.push({lat: x.lat(), lng: x.lng()});
    });
    field.push(field[0]);
    savingFieldArray = field;
    $("#fields").css("display", "inline-block");
    $("#tutorial").css("display", "none");
    $("#delete").css("display", "none");
    drawingManager.setOptions({
      drawingControl: false
    });
    drawingManager.setDrawingMode(null);
  });
}

$(function(){
  
  var socket = io('/broker');
  
  $("#send").on("click", function(){
    var user = getUser();
    var verified = canSave();    
    if(user && verified){
      var data = {user: user, coords: savingFieldArray, contract: "contract_name"}
      data.description = $("#desc").val();
      data.field = $("#fieldName").val();
      var _id = $("#_id").val();
      if( _id !== "" && _id.length > 0){
        data._id = _id;
      }
      socket.emit("save", data);
    }else{
      alert("You must singup before save changes");
    }
  });
  
  $("#cancel").on("click", function(){
    $("#_id").val("");
    $("#desc").val("");
    $("#fieldName").val("");
    $("#fields").css("display", "none");
    drawingManager.setOptions({
      drawingControl: true
    });
    if(!savingFieldPolygon._id){
      savingFieldPolygon.setMap(null);
      savingFieldPolygon = undefined;
    }
  });
  
  $("#del").on("click", function(){
    if(confirm("Are you sure that you want to delete this field?")){
      socket.emit("delete", {_id: $("#_id").val()});
    }
  });
  
  socket.on("deleted", function(_id){
    $("#_id").val("");
    $("#desc").val("");
    $("#fieldName").val("");
    $("#fields").css("display", "none");
    drawingManager.setOptions({
      drawingControl: true
    });
    savingFieldPolygon.setMap(null);
    savingFieldPolygon = undefined;
    savingFieldArray = undefined;
    function findId(json){
      return json._id == _id;
    }
    var oldField = fieldsArray.find(findId);
    var x = fieldsArray.indexOf(oldField);
    fieldsArray.splice(x, 1);
  });
  
  socket.on("fieldsReady", function(fields){
    if(fields){
      fieldsArray = fields;
      fieldsArray.forEach(function(field){
        var newField = new google.maps.Polygon({
          paths: field.coords,
          strokeColor: '#FF0000',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#FF0000',
          fillOpacity: 0.35,
          _id: field._id
        });
        newField.setMap(map);
        var addListenersOnPolygon = function(polygon) {
          google.maps.event.addListener(polygon, 'click', function (event) {
            function findId(json){
              return json._id == polygon._id;
            }
            var updatingField = fieldsArray.find(findId);
            savingFieldPolygon = polygon;
            $("#_id").val(updatingField._id);
            $("#desc").val(updatingField.description);
            $("#fieldName").val(updatingField.field);
            savingFieldArray = updatingField.coords;
            $("#tutorial").css("display", "none");
            $("#fields").css("display", "inline-block");
            drawingManager.setOptions({
              drawingControl: false
            });
            drawingManager.setDrawingMode(null);
          });  
        }
        addListenersOnPolygon(newField);
      });
      
    }
  });
  
  socket.on("saved", function(field){
    drawingManager.setOptions({
      drawingControl: true
    });
    
    if(savingFieldPolygon !== undefined){
      savingFieldPolygon.setMap(null);
    }
    
    var newField = new google.maps.Polygon({
      paths: field.coords,
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.35
    });
    newField.setMap(map);
    
    $("#fields").css("display", "none");
  });
  
  socket.emit("loadFields", {user: getUser()});
})