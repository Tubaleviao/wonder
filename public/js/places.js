var map;
var infowindow;

function initMap(lat, long) {
  var region = {lat: lat, lng: long}; //-22.872696, -47.210052 // -22.864502, -47.213446

  map = new google.maps.Map(document.getElementById('map'), {
    center: region,
    zoom: 15
  });

  infowindow = new google.maps.InfoWindow();

  var service = new google.maps.places.PlacesService(map);
  service.nearbySearch({
    location: region,
    radius: 500,
    types: ['food']
  }, callback);
}

function callback(results, status) {
  if (status === google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
      var better = '<br/>Name: '+ results[i].name+'<br/>Types: '+results[i].types+'<br/>Location: '+results[i].geometry.location;
      $('#places').append(better);
      $('#places').append('<br/><br/>');
    }
  }
}

function createMarker(place) {
  var placeLoc = place.geometry.location;
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });

  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(place.name);
    infowindow.open(map, this);
  });
}

$(function(){
  $('#sub').click(function(){
    initMap(Number($('#lat').val()), Number($('#long').val()));
  });
})