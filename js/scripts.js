var map;
//initiate the map
function initPlMap() {


    map = new google.maps.Map(document.getElementById('initPlMap'), {
        center: {
            lat: parseInt(paintcare.default_lat),
            lng: parseInt(paintcare.default_lng)
        },
        zoom: parseInt(paintcare.default_zoom),
        styles: map_theme



    });
	
    var markers = [];
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    var bounds = new google.maps.LatLngBounds();
	//when the form is submit
    jQuery('#pac-input-form').on('submit', function() {
        var $this = jQuery("#pac-input");
        
        var val = $this.val();
        var valLength = val.length;
        var maxCount = $this.attr('maxlength');
        if (valLength > maxCount) {
            $this.val($this.val().substring(0, maxCount));
        }



        if (jQuery("#pac-input").val().length == 5) {
            var geocoder = new google.maps.Geocoder();

            getAddressInfoByZip(jQuery("#pac-input").val());


        }
        return false;

    });
	
	
	
	 
        // Try HTML5 geolocation.
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
            var geo_pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
		console.log(geo_pos);
           	
		   var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
			geocoder = new google.maps.Geocoder();

    geocoder.geocode({'latLng': latlng}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            if (results[0]) {
                for (j = 0; j < results[0].address_components.length; j++) {
                    if (results[0].address_components[j].types[0] == 'postal_code'){
                        console.log("Zip Code: " + results[0].address_components[j].short_name);
						
						var zipcode = results[0].address_components[j].short_name;
					//jQuery("#pac-input").val(zipcode);
					getAddressInfoByZip(zipcode);
					}
								
                }
				
            }
			
        } else {
            console.log("Geocoder failed due to: " + status);
        }
    });
		   
		   
		   
		   
          }, function() {
          var  geo_pos = false;
		  
          });
        } else {
          var  geo_pos = false;
          
        }



    console.log('map loaded');
	// load location markers
    function setLocationMarkers(search_result) {
		// make sure us only
        if (search_result.country == 'United States') {
            jQuery('.map-search-output').empty();
            console.log(search_result);
            var search_lat = search_result.lat;
            var search_lng = search_result.lng;
            var search_st = search_result.state;

            var place = search_result.place;
            var infowindow = new google.maps.InfoWindow();


			// post to ajax to get json locations
            jQuery.ajax({
                type: 'POST',
                url: paintcare.ajax_url,
                data: {
                    action: 'pc_get_json',
                    lat: search_lat,
                    lng: search_lng,
                    st: search_st
                },
                success: function(response) {
                    console.log(response);
                    clearOverlays();

					// loop through locations
                    jQuery.each(response, function(key, value) {

                        var latLng = new google.maps.LatLng(value.Lat, value.Lng);
						// set the icon if none are set then use default icon
                        if (paintcare.map_icons[value.LocationType]) {
                            var icon = paintcare.map_icons[value.LocationType];
							if(icon == ''){
								icon =  paintcare.plugin_uri + 'images/red-circle.png';	
							}
                        } else {
							var icon =	paintcare.plugin_uri + 'images/red-circle.png';	
                        }

                        // Create a marker for each place.
                        var location_marker = new google.maps.Marker({
                            map: map,
                            icon: icon,
                            title: value.Address1,
                            position: latLng
                        });
						//html for the windowbox
                        var message = '<div id="maps-content">' +
                            '<h4 id="maps-firstHeading" class="maps-firstHeading">' + value.Address1 + '</h4>' +
                            '<div style="margin:5px 0px"><a href="' + value.Website + '" class="button" target="_blank">Website</a> <a href="https://www.google.com/maps/dir/current+location/' + value.Address2 + ' ' + value.City + ', ' + value.State + ' ' + value.Zip + '" target="_blank" class="button">Directions</a></div>' +
                            '<div id="maps-bodyContent"  >' +
                            '<p><strong>Address:</strong> ' + value.Address2 + ' ' + value.City + ', ' + value.State + ' ' + value.Zip + ' <br>' +
                            '<strong>Phone:</strong> ' + value.Phone + '<br>' +
                            '<strong>Comments:</strong> ' + value.Comments + '<br>' +
                            '<strong>Hours:</strong> ' + value.DisplayHours + '<br>' +
                            '<strong>Notation:</strong> ' + value.NotationDesc + '<br>' +
                            '</div>' +
                            '</div>';

                        markers.push(location_marker);
						//register click event for window
                        google.maps.event.addListener(location_marker, 'click', function() {
                            infowindow.setOptions({
                                content: message,

                            });
                            infowindow.open(map, location_marker);
                        });




                    });
                    // Create a marker for each place.
                    var location_marker = new google.maps.Marker({
                        map: map,

                        title: place.formatted_address,
                        position: place.geometry.location
                    });
                    markers.push(location_marker);
                    //map.setZoom(8);
                    //map.panTo(location_marker.position);

                    var bounds = new google.maps.LatLngBounds();
                    for (var i = 0; i < markers.length; i++) {
                        bounds.extend(markers[i].getPosition());
                    }
					//fit all markers in locations
                    map.fitBounds(bounds);



                },
                dataType: "json"
            });
        } else {

            jQuery('.map-search-output').html('<p style="color:Red;font-weight:bold;">Please enter a valid Zip Code</p>');
        }
    }
	
	 function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
                              'Error: The Geolocation service failed.' :
                              'Error: Your browser doesn\'t support geolocation.');
      }
    function getLocation() {
        getAddressInfoByZip(document.forms[0].zip.value);
    }

    function response(obj) {
        console.log(obj);
    }
	// convert the zip code into coordinates and put all the data in an array
    function getAddressInfoByZip(zip) {
        if (zip.length >= 5 && typeof google != 'undefined') {
            var addr = {};
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({
                'address': zip
            }, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    if (results.length >= 1) {
                        for (var ii = 0; ii < results[0].address_components.length; ii++) {
                            var street_number = route = street = city = state = zipcode = country = formatted_address = '';
                            var types = results[0].address_components[ii].types.join(",");
                            if (types == "street_number") {
                                addr.street_number = results[0].address_components[ii].long_name;
                            }
                            if (types == "route" || types == "point_of_interest,establishment") {
                                addr.route = results[0].address_components[ii].long_name;
                            }
                            if (types == "sublocality,political" || types == "locality,political" || types == "neighborhood,political" || types == "administrative_area_level_3,political") {
                                addr.city = (city == '' || types == "locality,political") ? results[0].address_components[ii].long_name : city;
                            }
                            if (types == "administrative_area_level_1,political") {
                                addr.state = results[0].address_components[ii].short_name;
                            }
                            if (types == "postal_code" || types == "postal_code_prefix,postal_code") {
                                addr.zipcode = results[0].address_components[ii].long_name;
                            }
                            if (types == "country,political") {
                                addr.country = results[0].address_components[ii].long_name;
                            }
                        }


                        addr.lat = results[0].geometry.location.lat();
                        addr.lng = results[0].geometry.location.lng();
                        addr.place = results[0];
                        addr.success = true;

                        setLocationMarkers(addr);
                    } else {
                        response({
                            success: false
                        });
                    }
                } else {
                    response({
                        success: false
                    });
                }
            });
        } else {
            response({
                success: false
            });
        }
    }

	//remove all markers
    function clearOverlays() {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
        }
        markers.length = 0;
    }

}
// load up the map
function loadPlMap() {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://maps.googleapis.com/maps/api/js?key=" + paintcare.api_key + "&libraries=places&callback=initPlMap";
    document.body.appendChild(script);
}



jQuery(function($) {
    loadPlMap();
});