var map;
//initiate the map
function initPlMap() {
    // fade placeholder map function
    function mapFadeOut() {
        setTimeout(function() {
            jQuery('#initial-map').fadeOut();
        }, 1750);
    }
    map = new google.maps.Map(document.getElementById('initPlMap'), {
        center: {
            lat: parseInt(paintcare.default_lat),
            lng: parseInt(paintcare.default_lng)
        },
        zoom: parseInt(paintcare.default_zoom),
        mapTypeControl: false,
        streetViewControl:false,
        styles: map_theme,
    });
    var geolocationDiv = document.createElement('div');
    var geolocationControl = new GeolocationControl(geolocationDiv, map);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(geolocationDiv);
    var markers = [];
    // more details for that place.
    var bounds = new google.maps.LatLngBounds();
    //when the form is submit
    jQuery('#pac-input-form').on('submit', function() {
        //start css loading graphic
        startLoader();
        var $this = jQuery("#pac-input");
        var val = $this.val();
        var valLength = val.length;
        var maxCount = $this.attr('maxlength');
        if (valLength > maxCount) {
            $this.val($this.val().substring(0, maxCount));
        }
        if (jQuery("#pac-input").val().length == 5 && jQuery.isNumeric( jQuery("#pac-input").val()) ) {
            console.log('is zipcode');
            var geocoder = new google.maps.Geocoder();
            var displayZip =  getAddressInfoByZip(jQuery("#pac-input").val());
        }else{
            console.log('is address');
            var geocoder = new google.maps.Geocoder();
            var displayAddress = getAddressInfoByFormatedAddress(jQuery("#pac-input").val());
            if(displayAddress == false){
            alert("Please enter a valid address");  
            }
        }
        return false;
    });
    // Try HTML5 geolocation.
    geolocate();
    console.log('map loaded');

    //create legend
    var legend = '<ul class="legend"><li><img src="' + paintcare.map_icons[0] +
        '"><p>accepts up to 5 gallons</p></li><li><img src="' + paintcare.map_icons[2] +
        '"><p>accepts up to 10-20 gal.</p></li><li><img src="' + paintcare.map_icons[
            4] + '"><p>accepts up to 100 gal.</p></li><li><img src="' + paintcare.map_icons[
            6] +
        '"><p>HHW Programs (accepts other items)</p></li><li><img src="https://www.paintcare.org/wp-content/themes/paintcare/library/images/star-pin.png"><p>Also has Reuse Program</p></li></ul>';
    jQuery('.map-search-map').after(legend);
    // load location markers
    function setLocationMarkers(search_result) {
        // make sure us only
        if (search_result.country == 'United States') {
            jQuery('.map-search-output').empty();
            var search_lat = search_result.lat;
            var search_lng = search_result.lng;
            var search_st = search_result.state;
            var place = search_result.place;
            console.log(place);
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
                    //clear out markers, sidebar list, and mobile cards when executing another search
                    clearOverlays();
                    jQuery('.map-search-list').empty();
                    jQuery('.mobile-cards').empty();
                    // loop through locations
                    // count
                    i = 1;
                    jQuery.each(response, function(key, value) {
                        var latLng = new google.maps.LatLng(value.Lat, value.Lng);
                        // test if amount of paint accepted = 5, 10-20, 21-100, or is HHW and set icon color
                        var amount = value.containType;
                        // default value is blue (HHW)
                        var icon_color = paintcare.map_icons[6];
                        if (amount == 1) {
                            // 5 Gallon
                            icon_color = paintcare.map_icons[0];
                        } else if (amount == 2) {
                            // 5 Gallon Reuse
                            icon_color = paintcare.map_icons[1];
                        } else if (amount == 3) {
                            // Up to 20 Gallon
                            icon_color = paintcare.map_icons[2];
                        } else if (amount == 7) {
                            // Up to 20 Gallon Reuse
                            icon_color = paintcare.map_icons[3];
                        } else if (amount == 4) {
                            // Up to 100 Gallon
                            icon_color = paintcare.map_icons[4];
                        } else if (amount == 8) {
                            // Up to 100 Gallon Reuse
                            icon_color = paintcare.map_icons[5];
                        } else if (amount == 12) {
                            // HHW
                            icon_color = paintcare.map_icons[6];
                        } else if (amount == 9) {
                            // HHW Reuse
                            icon_color = paintcare.map_icons[7];
                        } else {
                            //use default value
                            icon_color = icon_color;
                        }
                        // Create a marker for each place.
                        var location_marker = new google.maps.Marker({
                            id: i,
                            map: map,
                            icon: {
                                url: icon_color,
                                origin: new google.maps.Point(0, 0),
                                labelOrigin: new google.maps.Point(12, 12)
                            },
                            title: value.Address1,
                            position: latLng,
                            label: {
                                text: '' + i + '',
                                color: "#222",
                                fontSize: "12px",
                                fontWeight: "bold",
                            },
                            data: value.Id,
                        });
                       
                        //html for infowindow
                        // set default hours language
                        var hours = '';
                        if (value.DisplayHours) {
                            hours = value.DisplayHours;
                        } else {
                            hours = 'Paint is accepted during regular business hours; Call ahead for hours and to make sure the store can accept the amount and type of paint you would like to recycle.';
                        }

                        // set default Who Can Use This Service language
                        var who = '';
                        if ( value.LocationType == 1 ) {
                            who = 'For Households Only (No Businesses)';
                        } else {
                            who = 'For Households and Businesses';
                        }

                        // set default info language
                        var info = '';
                        if ( value.Comments ) {
                            info = '<strong>' + value.Comments + '</strong> ' + value.NotationDesc ;
                        } else {
                            info = value.NotationDesc;
                        }

                        if ( value.Directions ){
                            info = value.Directions + ' ' + info;
                        }

                        if ( info ){
                            info = '<p id="info-info"><span class="row-title">Information</span><span>' + info + '</span></p>';
                        }

                        //format phone numbers for href=tel elements
                        var phoneLink = value.Phone;
                        phoneLink = phoneLink.replace(/\(|\)/g, '');
                        phoneLink = phoneLink.replace(/\s+/g, '');
                        phoneLink = phoneLink.replace(/(\d{3})/, "$1-");
                       
                        var message = '<div id="maps-content" data-name="' + value.Id + '">' + '<h4 id="maps-firstHeading" class="maps-firstHeading">' + value.Name + '</h4>' + '<div id="maps-body-content"><p id="info-address"><span class="row-title">Address </span><span>' + value.Address1 + ' ' + value.Address2 + ' ' + value.City + ', ' + value.State + ' ' + value.Zip + ' <br><a href="https://www.google.com/maps/dir/current+location/' + value.Address1 + ' ' + value.Address2 + ' ' + value.City + ', ' + value.State + ' ' + value.Zip + '" target="_blank" >Get Directions</a></span></p><p id="info-phone"><span class="row-title">Phone </span><span id="info-phone"><a href="tel:' + phoneLink + '">' + value.Phone + '</a></span></p>' + '<p id="info-hours"><span class="row-title">Hours </span><span>' + hours + '</span></p><p id="info-who"><span class="row-title">Available For</span><span>' + who + '</span></p><p id="info-limit"><span class="row-title">Restrictions</span><span>' + value.LeagalRes + '</span></p>' + info + '<p id="info-link"><span class="row-title">&nbsp;</span><span>Visit <a href="http://www.paintcare.org/products-we-accept/" target="_blank">www.paintcare.org/products-we-accept</a> for complete details.</span></p></div></div>';

                        markers.push(location_marker);

                        

                         //add item to mobile cards on screen sizes 1024 and below
                         if (jQuery(window).width() < 1025) {
                            //add item to locations list                        
                            jQuery('.map-search-list').append(
                                '<article class="map-list-item"><a href="javascript:;" data-name="' +
                                value.Id +
                                '" class="list-link"></a><h4>' + i +
                                '</h4><div class="map-list-item-title"><div class="address-block"><p class="list-item-name">' +
                                value.Name + '</p><p class="list-item-add-1">' +
                                value.City + ', ' + value.State +
                                '</p><p class="list-item-add-3">' + value.Distance +
                                ' miles away</p></div><i class="fa fa-info-circle" aria-hidden="true"></i></div></article>'
                            );              
                            jQuery('.mobile-cards').append(
                                '<div class="mobile-card google-maps-trigger-items block-item" data-name="' + value.Id + '"><h4 class="mobile-heading">' + value.Name + '</h4><a class="close-box" href="javascript:;"><i class="fa fa-times" aria-hidden="true"></i></a>' + '<div class="mobile-card-content"><p id="card-address"><span class="row-title">Address </span><span>' + value.Address1 + ' ' + value.Address2 + ' ' + value.City + ', ' + value.State + ' ' + value.Zip + ' <br><a href="https://www.google.com/maps/dir/current+location/' + value.Address1 + ' ' + value.Address2 + ' ' + value.City + ', ' + value.State + ' ' + value.Zip + '" target="_blank" >Get Directions</a></span></p><p id="card-phone"><span class="row-title">Phone </span><span id="card-phone"><a href="tel:' + phoneLink + '">' + value.Phone + '</a></span></p>' + '<p id="card-hours"><span class="row-title">Hours </span><span>' + hours + '</span></p><p id="card-who"><span class="row-title">Available For</span><span>' + who + '</span></p><p id="card-limit"><span class="row-title">Restrictions</span><span>' + value.LeagalRes + '</span></p>' + info + '<p id="card-link"><span class="row-title">&nbsp;</span><span>Visit <a href="http://www.paintcare.org/products-we-accept/" target="_blank">www.paintcare.org/products-we-accept</a> for complete details.</span></p></div></div>'
                            );
                        } else{
                            // leave mobile cards empty
                            //add item to locations list                        
                            jQuery('.map-search-list').append(
                            '<div><article class="map-list-item"><a href="javascript:;" data-name="' +
                            value.Id +
                            '" class="google-maps-trigger-item block-item"></a><h4>' + i +
                            '</h4><div class="map-list-item-title"><div class="address-block"><p class="list-item-name">' +
                            value.Name + '</p><p class="list-item-add-1">' +
                            value.City + ', ' + value.State +
                            '</p><p class="list-item-add-3">' + value.Distance +
                            ' miles away</p></div><div class="address-block"><p class="phone"><i class="fa fa-phone" aria-hidden="true"></i><a href="tel:' +
                            phoneLink + '">' + value.Phone +
                            '</a></p><p class="directions"><i class="fa fa-map"></i><a href="https://www.google.com/maps/dir/current+location/' +
                            value.Address1 + ' ' + value.Address2 + ' ' + value.City + ', ' +
                            value.State + ' ' + value.Zip +
                            '" target="_blank">Get Directions</a></p></div></div></article></div>');
                        }

                        //stop css loading graphic once map tiles have loaded
                        google.maps.event.addListenerOnce(map, 'tilesloaded', stopLoader);

                        //register click event for window
                        google.maps.event.addListener(location_marker, 'click', markerClick);

                         if (jQuery(window).width() < 1025){
                            jQuery('.map-search-list article a').on('click', function(){
                                var dataItem = jQuery(this).data('name');
                                var markerMatch = jQuery(location_marker.data[dataItem]);
                                 google.maps.event.trigger(markerMatch, 'click');
                                console.log(markerMatch);
                            });
                         }
                        
                        function markerClick(){
                            //remove selected class from previously selected map-search-list item
                            jQuery('.map-search-list article').removeClass('selected');
                            // zoom to marker on mobile devices and don't open infowindow
                            if (jQuery(window).width() < 1025){
                                mobileZoom();
                                scrollBehavior();   
                                jQuery('html, body').animate({scrollTop: jQuery('.map-search-list').offset().top -300}, 800);
                            } else {
                                // set infowindow content as defined above
                                infowindow.setOptions({
                                    content: message,                               
                                });
                                // open infowindow
                                infowindow.open(map, location_marker);
                            }

                        function mobileZoom(){
                            map.setZoom(15);
                            map.setCenter(location_marker.getPosition());
                        }

                        function scrollBehavior(){
                            var match = jQuery(location_marker.data);
                            var container = jQuery('.map-search-list');
                            var listMatch = jQuery('.map-search-list a[data-name="' + match[0] + '"]');
                            var distance = jQuery(listMatch).offset().top;
                             // scroll to matching map-search-list item
                            paintcare_scroll(container,listMatch );
                            // add selected class to highlight item
                             jQuery(listMatch).parent().addClass('selected');
                        }                
                            
                           
                        }
                        i++;
                    });

                    var bounds = new google.maps.LatLngBounds();
                    for (var i = 0; i < markers.length; i++) {
                        bounds.extend(markers[i].getPosition());
                    }
                    //fit all markers in locations
                    map.fitBounds(bounds);
                    //increase zoom for mobile devices
                    if (jQuery(window).width() < 1025) { 
                        var listener = google.maps.event.addListener(map, "idle", function() { 
                              if (map.getZoom() > 13) map.setZoom(13); 
                              google.maps.event.removeListener(listener); 
                    });
                    }
                },
                dataType: "json"
            });
        } else {
            jQuery('.map-search-output').html(
                '<p style="color:Red;font-weight:bold;" width="100%">Please enter a valid Zip Code</p>'
            );
        }
    }

    //manages map-list-item scroll when clicking on marker
    function paintcare_scroll(container,location){    
            container.animate({
                scrollTop: location.offset().top - container.offset().top + container.scrollTop()
            });
    
        
    }

    function OpenInfowindowForMarker(index) {
        google.maps.event.trigger(markers[index], 'click');
    }

    function startLoader() {
        jQuery('.uil-load-css').show();
    }

    function stopLoader() {
        jQuery('.uil-load-css').hide();
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

    //settings geolocation button in upper left corner
    function GeolocationControl(controlDiv, map) {

        // Set CSS for the control button
        var controlUI = document.createElement('div');
        controlUI.style.backgroundColor = 'rgba(255,255,255, .75)';
        controlUI.style.borderStyle = 'solid';
        controlUI.style.borderRadius = '100px';
        controlUI.style.borderWidth = '2px';
        controlUI.style.borderColor = 'white';
        controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
        controlUI.style.height = '28px';
        controlUI.style.marginTop = '5px';
        controlUI.style.marginLeft = '5px';
        controlUI.style.cursor = 'pointer';
        controlUI.style.textAlign = 'left';
        controlUI.title = 'search by your location';
        controlDiv.appendChild(controlUI);

        // Set CSS for the control text
        var controlText = document.createElement('div');
        controlText.style.fontSize = '17px';
        controlText.style.color = '#6ab6d8';
        controlText.style.paddingLeft = '10px';
        controlText.style.paddingRight = '8px';
        controlText.style.marginTop = '4px';
        controlText.style.marginLeft = '-3px';
        controlText.innerHTML = '<i class="fa fa-location-arrow" aria-hidden="true"></i>';
        controlUI.appendChild(controlText);

        // Setup the click event listeners to geolocate user
        google.maps.event.addDomListener(controlUI, 'click', geolocate);

    }

    
    function geolocate() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                startLoader();
                var geo_pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                console.log(geo_pos);
                mapFadeOut();
                var latlng = new google.maps.LatLng(position.coords.latitude, position.coords
                    .longitude);
                geocoder = new google.maps.Geocoder();
                geocoder.geocode({
                    'latLng': latlng
                }, function(results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        if (results[0]) {
                            for (j = 0; j < results[0].address_components.length; j++) {
                                if (results[0].address_components[j].types[0] == 'postal_code') {
                                    console.log("Zip Code: " + results[0].address_components[j].short_name);
                                    var zipcode = results[0].address_components[j].short_name;
                                    getAddressInfoByZip(zipcode);
                                }
                            }
                        }
                        setTimeout(function() {
                            stopLoader();
                        }, 8000);
                    } else {
                        setTimeout(function() {
                            jQuery('.uil-load-css').html('<p><strong style="color:#f00;">Geolocation failed due to: ' + status + '<strong></p>');
                        }, 1750);
                    }
                });
            }, function() {
                var geo_pos = false;
            });
        } else {
            var geo_pos = false;
        }
    }


    function response(obj) {
        console.log(obj);
    }
    // convert the zip code into coordinates and put all the data in an array
    function getAddressInfoByFormatedAddress(zip) {
        if (zip.length > 5 && typeof google != 'undefined') {
            var addr = {};
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({
                'address': zip
            }, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    mapFadeOut();
                    if (results.length >= 1) {
                        for (var ii = 0; ii < results[0].address_components.length; ii++) {
                            var street_number = route = street = city = state = zipcode = country =
                                formatted_address = '';
                            var types = results[0].address_components[ii].types.join(",");
                            if (types == "street_number") {
                                addr.street_number = results[0].address_components[ii].long_name;
                            }
                            if (types == "route" || types == "point_of_interest,establishment") {
                                addr.route = results[0].address_components[ii].long_name;
                            }
                            if (types == "sublocality,political" || types == "locality,political" ||
                                types == "neighborhood,political" || types ==
                                "administrative_area_level_3,political") {
                                addr.city = (city == '' || types == "locality,political") ? results[0]
                                    .address_components[ii].long_name : city;
                            }
                            if (types == "administrative_area_level_1,political") {
                                addr.state = results[0].address_components[ii].short_name;
                            }
                            if (types == "postal_code" || types ==
                                "postal_code_prefix,postal_code") {
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
                        console.log(addr);
                        setLocationMarkers(addr);
                    } else {
                        alert("Please enter a valid address");  
                        response({
                            success: false
                        });
                    }
                } else {
                    alert("Please enter a valid address");  
                    response({
                        success: false
                    });
                }
            });
        } else {
            alert("Please enter a valid address");  
            response({
                success: false
            });
        }
    }
    
    
    // convert the address into coordinates and put all the data in an array
    function getAddressInfoByZip(zip) {
        if (zip.length >= 5 && typeof google != 'undefined') {
            var addr = {};
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({
                'address': zip
            }, function(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    mapFadeOut();
                    if (results.length >= 1) {
                        for (var ii = 0; ii < results[0].address_components.length; ii++) {
                            var street_number = route = street = city = state = zipcode = country =
                                formatted_address = '';
                            var types = results[0].address_components[ii].types.join(",");
                            if (types == "street_number") {
                                addr.street_number = results[0].address_components[ii].long_name;
                            }
                            if (types == "route" || types == "point_of_interest,establishment") {
                                addr.route = results[0].address_components[ii].long_name;
                            }
                            if (types == "sublocality,political" || types == "locality,political" ||
                                types == "neighborhood,political" || types ==
                                "administrative_area_level_3,political") {
                                addr.city = (city == '' || types == "locality,political") ? results[0]
                                    .address_components[ii].long_name : city;
                            }
                            if (types == "administrative_area_level_1,political") {
                                addr.state = results[0].address_components[ii].short_name;
                            }
                            if (types == "postal_code" || types ==
                                "postal_code_prefix,postal_code") {
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
    //remove all markers when performing a second search
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
    script.src = "https://maps.googleapis.com/maps/api/js?key=" + paintcare.api_key +
        "&libraries=places&callback=initPlMap";
    document.body.appendChild(script);
}



// console.log(markers);
console.log(paintcare);
jQuery(function($) {
    loadPlMap();
});
jQuery(function($) {
    $('#main-content').addClass('has-map');
    $('.locations-container').parents().eq(2).addClass('tab-map');
    //show cards when matching data-name link is clicked
    $( document ).on( "click", ".list-link", function(e) {
       var dataName = $(this).data("name");
        $('.mobile-card[data-name="' + dataName + '"]').addClass('opened');
        $('html, body').animate({scrollTop: jQuery('.opened h4.mobile-heading').offset().top - 50}, 500);
        e.stopPropagation();
     });
        //close mobile card when clicking "x"
       $( document ).on( "click",  "a.close-box" , function(e) {
              $( this ).parent().removeClass("opened");
            });
    if ($(window).width() < 941) {
        //place map list sidebar below map for mobile devices
        $('.mobile-content .map-search-map').appendTo('#PlMapSearch');
    }
    
    
    
});