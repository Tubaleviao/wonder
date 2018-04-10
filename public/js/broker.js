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
  
  // POLYGONS
  
  var triangleCoords = [
    {lat: -22.880690, lng: -47.191280},
    {lat: -22.880814, lng: -47.191057},
    {lat: -22.880917, lng: -47.191130},
    {lat: -22.880792, lng: -47.191346},
    {lat: -22.880690, lng: -47.191280}
  ];

  // Construct the polygon.
  var xan = new google.maps.Polygon({
    paths: triangleCoords,
    strokeColor: '#FF0000',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#FF0000',
    fillOpacity: 0.35,
    _id: 03988
  });
  xan.setMap(map);

  // POLYGONS
  
  var addListenersOnPolygon = function(polygon) {
    google.maps.event.addListener(polygon, 'click', function (event) {
      alert(polygon._id);
    });  
  }
  
  addListenersOnPolygon(xan);
  
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
      var desc = $("#desc").val();
      var fieldName = $("#fieldName").val();
      socket.emit("save", {user: user, coords: savingFieldArray, contract: "contract_name", description: desc, field: fieldName});
    }else{
      alert("You must singup before save changes");
    }
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
      });
    }
  });
  
  socket.on("saved", function(field){
    drawingManager.setOptions({
      drawingControl: true
    });
    
    savingFieldPolygon.setMap(null);
    
    console.log(field);
    
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
    // agregar o _id no desenho de alguma forma junto co nome
    
    console.log("Funfou");
  });
  
  socket.emit("loadFields", {user: getUser()});
})