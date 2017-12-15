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
        fullscreenControl: false,
        mapTypeControl: false,
        streetViewControl: false,
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
        //startLoader();
        var $this = jQuery("#pac-input");
        var val = $this.val();
        var valLength = val.length;
        var maxCount = $this.attr('maxlength');
        if (valLength > maxCount) {
            $this.val($this.val().substring(0, maxCount));
        }
        if (jQuery("#pac-input").val().length == 5 && jQuery.isNumeric(jQuery(
                "#pac-input").val())) {
          console.log('is zipcode');
          var geocoder = new google.maps.Geocoder();
            var displayZip = getAddressInfoByZip(jQuery("#pac-input").val());
            console.log(geocoder);
			 mapFadeOut();
        } else {
            // console.log('is address');
           // var geocoder = new google.maps.Geocoder();
            var displayAddress = getAddressInfoByZip(jQuery("#pac-input").val());
            if (displayAddress == false) {
                alert("Please enter a valid address");
            }
            console.log(geocoder);
        }
        return false;
    });
    // Try HTML5 geolocation.
    geolocate();
    // console.log('map loaded');

    // load location markers
    function setLocationMarkers(search_result) {
        //create an array of PaintCare states defined by the user on the admin design panel
        var states = paintcare.map_states.split(',');
        var stateArr = [];
        for (var i = 0; i < states.length; i++) {
            if (/\S/.test(states[i])) {
                stateArr.push(jQuery.trim(states[i]));
            }
        }

        // make sure US only
        if (search_result.country == 'United States') {
            jQuery('.map-search-output').empty();
            var search_lat = search_result.lat;
            var search_lng = search_result.lng;
            var search_st = search_result.state;
            var place = search_result.place;
            // console.log(place);
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
                    //set position for overlapping labels
                    var hoverOffset = 80000;
                    // count
                    i = 1;
                    jQuery.each(response, function(key, value) {
                        var latLng = new google.maps.LatLng(value.Lat, value.Lng);
                        // test if amount of paint accepted = 5, 10-20, 21-100, or is HHW and set icon color
                        var amount = value.containType;
                        //some transfer stations are not listed as containType = 12
                        //this set of variables tests the name string to see if "transfer" exists
                        var name = value.Name;
                        name = name.toLowerCase();
                        //** the following rules are subject to change if user changes marker icon settings **
                        // icon_color values and corresponding amounts (containType.value) are:
                        // 	paintcare.map_icons[0]	=	green			(amount = 1)
                        // 	paintcare.map_icons[1]	=	green with star		(amount = 6)
                        // 	paintcare.map_icons[2]	=	yellow			(amount = 3)
                        // 	paintcare.map_icons[3]	=	yellow with star	(amount = 7)
                        // 	paintcare.map_icons[4]	=	orange			(amount = 4)
                        // 	paintcare.map_icons[5]	=	orange with star 	(amount = 8)
                        // 	paintcare.map_icons[6]	=	blue			(amount = 0)
                        // 	paintcare.map_icons[7]	=	blue with star		(amount = 9)

                        // the default icon is blue (HHW)
                        var icon_color = paintcare.map_icons[6];
                        if (amount == 1) {
                            // 5 Gallon
                            icon_color = paintcare.map_icons[0];
                        } else if (amount == 6) {
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
                        // location_marker.setZIndex(hoverOffset);
                        //html for infowindow
                        // set default hours language
                        var hours = '';
                        //remove whitespace - important in cases where DisplayHours only has whitespace
                        var hourLong = value.DisplayHours.replace(/ /g, '');
                        hourLong = hourLong.length;
                        if (hourLong > 0) {
                            hours = value.DisplayHours;
                        } else {
                            hours =
                                'Paint is accepted during regular business hours; Call ahead for hours and to make sure the store can accept the amount and type of paint you would like to recycle.';
                        }
                        // set default Who Can Use This Service language
                        var who = '';
                        if (value.LocationType == 1) {
                            who = 'For Households Only (No Businesses)';
                        } else {
                            who = 'For Households and Businesses';
                        }

                        // set restrictions language
                        var restrict = '';
                        if (value.LeagalRes) {
                            restrict = '<p id="info-limit"><span class="row-title">Restrictions</span><span>' +
                                value.LeagalRes + '</span></p>';
                        } else {
                            restrict = '<p id="info-limit" class="empty"></p>';
                        }

                        //format phone numbers for href=tel elements
                        var phoneLink = value.Phone;
                        var phoneNumber = '';
                        if (phoneLink.length > 1) {
                            phoneNumber = phoneLink.match(/\d/g).length;
                        } else {
                            phoneNumber = 0;
                        }

                        if (phoneNumber == 10) {
                            //remove parentheses
                            phoneLink = phoneLink.replace(/\(|\)/g, '');
                            //remove text
                            phoneLink = phoneLink.replace(/\D+/g, '');
                            //remove white spaces
                            phoneLink = phoneLink.replace(/\s+/g, '');
                            //place a hyphen after the first and second 3 digit blocks
                            phoneLink = phoneLink.replace(/(\d{3})/, "$1-");
                            phoneLink = '<span id="info-phone"><a href="tel:' + phoneLink + '">' + value.Phone + '</a></span>';
                        } else {
                            phoneLink = '<span id="info-phone">' + value.Phone + '</span>';
                        }

                        // set default info language
                        var info = '';
                        if (value.Comments) {
                            info = '<strong>' + value.Comments + '</strong><br> ' + value.NotationDesc;
                        } else {
                            info = value.NotationDesc;
                        }
                        if (value.Directions) {
                            info = value.Directions + ' ' + info;
                        }
                        if (info) {
                            info =
                                '<p id="info-info"><span class="row-title">Information</span><span>' +
                                info + '</span></p>';
                        }

                        //display reuse paragraph if amount = 2, 7, 8 or 9 (see legend starting on line 109)
                        var reuse = '';
                        if (!(amount == 6 || amount == 7 || amount == 8 || amount == 9)) {
                            reuse = '<p id="info-reuse" class="empty"></p>';
                        } else {
                            reuse = '<p id="info-reuse"><span class="row-title">Reuse Program</span><span>This site gives away for free -- or sells at a nominal cost -- some of the unused paint and other products that are dropped off by others. Please contact site for details.</span></p>';
                        }

                        //create website menu if website value exists
                        var website = '';
                        if (value.Website) {
                            website = '<p id="info-website"><span class="row-title">Website</span><span><a href="' +
                                value.Website + '">' + value.Website + '</a></span></p>';
                        } else {
                            website = '<p id="info-website" class="empty"></p>';
                        }

                        //test if site is in a PaintCare state - if it is, display "products we accept" link - otherwise leave empty
                        var accept = '';
                        var isState = jQuery.inArray(value.State, stateArr) > -1;
                        if (isState === true) {
                            accept = '<p id="info-link"><span class="row-title">&nbsp;</span><span>Visit <a href="http://www.paintcare.org/products-we-accept/" target="_blank">www.paintcare.org/products-we-accept</a> for complete details.</span></p></div></div>';
                        } else {
                            accept = '<p id="info-link" class="empty"></p>';
                        }



                        //  Helps us troubleshoot sites that don't have the correct markers
                        // var siteType = '';
                        // if (amount == 12 && paintcare.map_icons[6]){
                        // 	siteType = 'HHW';
                        // }else if (amount == 1 && paintcare.map_icons[0] ){
                        // 	siteType = 5;
                        // }else if (amount == 6 && paintcare.map_icons[6]){
                        // 	siteType = '5 gal REUSE';
                        // }else if (amount == 3 && paintcare.map_icons[2]){
                        // 	siteType = 20;
                        // }else if (amount == 7 && paintcare.map_icons[3]){
                        // 	siteType = '20 gal REUSE';
                        // }else if (amount == 4 && paintcare.map_icons[4]){
                        // 	siteType = 100;
                        // }else if (amount == 8 && paintcare.map_icons[5]){
                        // 	siteType = '100 gal REUSE';
                        // }else if (amount == 9 && paintcare.map_icons[7]){
                        // 	siteType = 'HHW REUSE';
                        // } else if (amount == 0 && paintcare.map_icons[6]){
                        // 	siteType = 'Undefine';
                        // } else {
                        // 	siteType = 'ERROR!!!!';
                        // }

                        // var actual = value.LeagalRes.match(/\d+/);
                        // if (jQuery.isEmptyObject(actual)){
                        // 	actual = 'ERROR';
                        // } else {
                        // 	actual = actual[0];
                        // }

                        // var siteCheck = '';
                        // if (siteType == 5){
                        // 	if (actual <= 5){
                        // 		siteCheck ='yup';
                        // 	} else{
                        // 		siteCheck ='ERROR';
                        // 	}
                        // } else if (siteType == 20){
                        // 	if (actual > 5 && actual <= 20){
                        // 		siteCheck ='yup';
                        // 	} else{
                        // 		siteCheck ='ERROR';
                        // 	}
                        // } else if (siteType == 100){
                        // 	if (actual > 20 && actual <= 100){
                        // 		siteCheck ='yup';
                        // 	} else {
                        // 		if (actual > 100 && actual <= 200){
                        // 			siteCheck ='big';
                        // 		} else {
                        // 			siteCheck ='ERROR';
                        // 		}

                        // 	}
                        // } else if (siteType == 'HHW'){
                        // 	var nameO = value.Name.toLowerCase();
                        // 	var trans = 'transfer';
                        // 	if (amount == 0){
                        // 		if (nameO.includes(trans)){
                        // 			siteCheck ='TRANSFER';
                        // 		} else {
                        // 			siteCheck ='HHW';
                        // 		}
                        // 	} else {
                        // 		siteCheck ='ERROR';
                        // 	}
                        // } else {
                        // 	if ( !(amount == 2 || amount == 7 || amount == 8 || amount == 9) ){
                        // 		siteCheck = 'ERROR';
                        // 	} else {
                        // 		siteCheck = 'REUSE';
                        // 	}
                        // }

                        // 	console.log(i, value.Name, '\t',siteType + ' ' + actual, '\t\t\t', siteCheck);

                        // info window
                        var message = '<div id="maps-content" data-name="' + value.Id + '">' +
                            '<h4 id="maps-firstHeading" class="maps-firstHeading">' + value.Name +
                            '</h4>' +
                            '<div id="maps-body-content"><p id="info-address"><span class="row-title">Address </span><span>' +
                            value.Address1 + ' ' + value.Address2 + ', ' + value.City + ', ' +
                            value.State + ' ' + value.Zip +
                            ' <br><a href="https://www.google.com/maps/dir/current+location/' +
                            value.Address1 + ' ' + value.Address2 + ' ' + value.City + ', ' +
                            value.State + ' ' + value.Zip +
                            '" target="_blank" >Get Directions</a></span></p><p id="info-phone"><span class="row-title">Phone </span>' + phoneLink + '</p>' + '<p id="info-hours"><span class="row-title">Hours </span><span>' +
                            hours + '</span></p><p id="info-who"><span class="row-title">Available For</span><span>' + who +
                            '</span></p>' + restrict + info + reuse + website + accept;
                        markers.push(location_marker);
                        //add item to mobile cards on screen sizes 1024 and below
                        if (jQuery(window).width() < 1025) {
                            //add item to locations list
                            jQuery('.map-search-list').append(
                                '<article class="map-list-item"><a href="javascript:;" data-name="' +
                                value.Id +
                                '" class="google-maps-trigger-item list-link"></a><h4>' + i +
                                '</h4><div class="map-list-item-title"><div class="address-block"><p class="list-item-name">' +
                                value.Name + '</p><p class="list-item-add-1">' + value.City +
                                ', ' + value.State + '</p><p class="list-item-add-3">' + value.Distance +
                                ' miles away</p></div><i class="fa fa-info-circle" aria-hidden="true"></i></div></article><div class="blank"></div>'
                            );
                            jQuery('.mobile-cards').append(
                                '<div class="mobile-card google-maps-trigger-items block-item" data-name="' +
                                value.Id + '"><h4 class="mobile-heading">' + value.Name +
                                '</h4><a class="close-box" href="javascript:;"><i class="fa fa-times" aria-hidden="true"></i></a>' +
                                '<div class="mobile-card-content"><p id="card-address"><span class="row-title">Address </span><span>' +
                                value.Address1 + ' ' + value.Address2 + ' ' + value.City + ', ' +
                                value.State + ' ' + value.Zip +
                                ' <br><a href="https://www.google.com/maps/dir/current+location/' +
                                value.Address1 + ' ' + value.Address2 + ' ' + value.City + ', ' +
                                value.State + ' ' + value.Zip +
                                '" target="_blank" >Get Directions</a></span></p><p id="card-phone"><span class="row-title">Phone </span><span id="card-phone">' + phoneLink + '</a></span></p>' +
                                '<p id="card-hours"><span class="row-title">Hours </span><span>' +
                                hours +
                                '</span></p><p id="card-who"><span class="row-title">Available For</span><span>' +
                                who +
                                '</span></p><p id="card-limit"><span class="row-title">Restrictions</span><span>' +
                                value.LeagalRes + '</span></p>' + info + website +
                                '<p id="card-link">' + accept + '</p></div></div>'
                            );
                        } else {
                            // leave mobile cards empty
                            //add item to locations list
                            jQuery('.map-search-list').append(
                                '<div><article class="map-list-item"><a href="javascript:;" data-name="' +
                                value.Id +
                                '" class="google-maps-trigger-item block-item"></a><h4>' + i +
                                '</h4><div class="map-list-item-title"><div class="address-block"><p class="list-item-name">' +
                                value.Name + '</p><p class="list-item-add-1">' + value.City +
                                ', ' + value.State + '</p><p class="list-item-add-3">' + value.Distance +
                                ' miles away</p></div><div class="address-block"><p class="phone"><i class="fa fa-phone" aria-hidden="true"></i>' + phoneLink + '</p><p class="directions"><i class="fa fa-map"></i><a href="https://www.google.com/maps/dir/current+location/' +
                                value.Address1 + ' ' + value.Address2 + ' ' + value.City + ', ' +
                                value.State + ' ' + value.Zip +
                                '" target="_blank">Get Directions</a></p></div></div></article></div>'
                            );
                        }
                        //stop css loading graphic once map tiles have loaded
                        //google.maps.event.addListenerOnce(map, 'tilesloaded', stopLoader);
                        //register click event for window
                        google.maps.event.addListener(location_marker, 'click', markerClick);


                        function markerClick() {
                            //remove selected class from previously selected map-search-list item
                            jQuery('.map-search-list article').removeClass('selected');
                            scrollBehavior();
                            // zoom to marker on mobile devices and don't open infowindow
                            if (jQuery(window).width() < 1025) {
                                mobileZoom();
                            } else {
                                desktopZoom();
                                // set infowindow content as defined above
                                infowindow.setOptions({
                                    content: message,
                                });
                                // open infowindow
                                infowindow.open(map, location_marker);
                            }

                            function desktopZoom() {
                                map.setZoom(12);
                                map.setCenter(location_marker.getPosition());
                            }

                            function mobileZoom() {
                                map.setZoom(14);
                                map.setCenter(location_marker.getPosition());
                            }

                            function scrollBehavior() {
                                var match = jQuery(location_marker.data);
                                var container = jQuery('.map-search-list');
                                var listMatch = jQuery('.map-search-list a[data-name="' + match[0] +
                                    '"]');
                                var distance = jQuery(listMatch).offset().top;
                                // scroll to matching map-search-list item
                                paintcare_scroll(container, listMatch);
                                // add selected class to highlight item
                                jQuery(listMatch).parent().addClass('selected');
                            }
                        }
                        i++;
                        hoverOffset += 2;
                    });
                    jQuery('.google-maps-trigger-item').each(function(i) {
                        //remove selected class of previous selection
                        jQuery('body').find('.selected').removeClass('selected');
                        //add selected class highlight
                        jQuery(this).parent().addClass('selected');
                        var dataName = jQuery(this).attr('data-name');
                        jQuery(this).on('click', function() {
                            //startLoader();
                            var topDex = 999;
                            google.maps.event.trigger(markers[i], 'click');
                            google.maps.event.addListener(markers[i], "click", function() {
                                this.setOptions({
                                    zIndex: this.get("topDex")
                                });
                            });
                            //for mobile
                            if (jQuery(window).width() < 1025) {
                                var card = jQuery('.mobile-card[data-name="' + dataName + '"]');

                                jQuery('.mobile-cards').show();
                                jQuery(card).addClass('opened');
                                setTimeout(function() {
                                    jQuery(card).animate({
                                        'margin-top': '0'
                                    }, 200);
                                    setTimeout(function() {
                                        jQuery('html, body').animate({
                                            scrollTop: jQuery(card).offset().top - 10
                                        }, 200);
                                    }, 200);
                                }, 100);
                                var cardHeight = jQuery('.mobile-card.opened .mobile-card-content').height();
                                cardHeight = jQuery(cardHeight * .2);
                                // console.log(cardHeight[0]);
                                jQuery('.mobile-cards').height(cardHeight[0]);
                            }
                            setTimeout(function() {
                                //stopLoader();
                            }, 300);
                        });
                    });
                    var bounds = new google.maps.LatLngBounds();
                    for (var i = 0; i < markers.length; i++) {
                        bounds.extend(markers[i].getPosition());
                    }
                    //fit all markers in locations
                    map.fitBounds(bounds);
                    var currCenter = map.getCenter();
                    if (jQuery(window).width() < 961) {
                        google.maps.event.addListenerOnce(map, 'idle', function() {
                            google.maps.event.trigger(map, 'resize');
                            map.setCenter(currCenter);
                        });
                        //stopLoader();
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
    function paintcare_scroll(container, location) {
        container.animate({
            scrollTop: location.offset().top - container.offset().top + container.scrollTop()
        });
    }

    function OpenInfowindowForMarker(index) {
        hoverOffset = hoverOffset += 100;
        google.maps.event.trigger(markers[index], 'click');
    }

    // function startLoader() {
    // 	jQuery('.uil-load-css').show();
    // }

    // function stopLoader() {
    // 	jQuery('.uil-load-css').hide();
    // }

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
        controlUI.style.height = '30px';
        controlUI.style.marginTop = '5px';
        controlUI.style.marginLeft = '5px';
        controlUI.style.cursor = 'pointer';
        controlUI.title = 'search by your location';
        controlDiv.appendChild(controlUI);
        // Set CSS for the control text
        var controlText = document.createElement('div');
        controlText.style.paddingLeft = '5px';
        controlText.style.paddingRight = '5px';
        controlText.style.paddingTop = '4.75px';
        // controlText.style.marginLeft = '-3px';
        controlText.innerHTML =
            '<img src="/wp-content/plugins/paintcare-locator-master/images/target.svg" onerror="this.onerror=null; this.src="/wp-content/plugins/paintcare-locator-master/images/target.png" width="20px">';
        controlUI.appendChild(controlText);
        // Setup the click event listeners to geolocate user
        google.maps.event.addDomListener(controlUI, 'click', geolocate);
    }

    function geolocate() {
        // startLoader();
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                var geo_pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
               
			    // console.log(geo_pos);
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
                                    // console.log("Zip Code: " + results[0].address_components[j].short_name);
                                    var zipcode = results[0].address_components[j].short_name;
                                    getAddressInfoByZip(zipcode);
                                }
                            }
                        }
                        setTimeout(function() {
                            // stopLoader();
                        }, 8000);
                    } else {
                        setTimeout(function() {
                            // stopLoader();
                            jQuery('.uil-load-css').html(
                                '<p><strong style="color:#f00;">Geolocation failed due to: ' +
                                status + '<strong></p>');
                        }, 8000);
                    }
                });
            }, function() {
                var geo_pos = false;
            });
        } else {
            var geo_pos = false;
            // stopLoader();
        }
    }

    //diagnostic function to print results array to the console. Use if changes are made to database
    function response(obj) {
        // console.log(obj);
    }
	//process results
	
	function pc_process_geocode_results(results,addr){
		
		
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
                        addr.lat = results[0].geometry.location.lat;
                        addr.lng = results[0].geometry.location.lng;
                        addr.place = results[0];
                        addr.success = true;
                        // console.log(addr);
                        setLocationMarkers(addr);
						
						
	}
   
	
	function pc_save_geocode(get_results,address){
			
	
	
		
									jQuery.ajax({
											type: 'POST',
											url: paintcare.ajax_url,
											data: {
												action: 'pc_set_cache_geocode',
												address: address,
												pc_address: JSON.stringify(get_results)
											},
											  success: function(response) {
												  console.log(response);
											  }
											
									});
											
										
		
	}
    // convert the address into coordinates and put all the data in an array
    function getAddressInfoByZip(zip) {
        if (zip.length >= 5 && typeof google != 'undefined') {
            var addr = {};
           
		   
		   
		   jQuery.ajax({
                type: 'POST',
                url: paintcare.ajax_url,
                data: {
                    action: 'pc_get_cache_geocode',
                    pc_address: zip
                },
                success: function(response) {
					
					var obj = jQuery.parseJSON(response);
		   		if(obj.geocode !=""){
					
					 pc_process_geocode_results(obj.geocode,addr);
					
						}else{
								console.log(1);
				   
									var geocoder = new google.maps.Geocoder();
									geocoder.geocode({
										'address': zip
									}, function(results, status) {
										if (status == google.maps.GeocoderStatus.OK) {
										
											pc_save_geocode(results,zip);	
										
									
										
										
											mapFadeOut();
											if (results.length >= 1) {
											  
											  
											   pc_process_geocode_results(results,addr);
											  
											  
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
					
						}
				
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

    //Map Legend and Filters
    var legend = '<div class="legend-container"><ul class="legend"><li><img src="' + paintcare.map_icons[0] +
        '"><p>accepts up to 5 gallons</p></li><li><img src="' + paintcare.map_icons[2] +
        '"><p>accepts up to 10-20 gal.</p></li><li><img src="' + paintcare.map_icons[
            4] + '"><p>accepts up to 100 gal.</p></li><li><img src="' + paintcare.map_icons[
            6] +
        '"><p>HHW Programs (accepts other items)</p></li><li><img src="/wp-content/plugins/paintcare-locator-master/images/star-pin.png"><p>Also has Reuse Program</p></li></ul><div class="legend-title"><img src="/wp-content/plugins/paintcare-locator-master/images/tab-1.svg"></div></div>';
    attachLegend(legend);


}
// load up the map
function loadPlMap() {
    var script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://maps.googleapis.com/maps/api/js?key=" + paintcare.api_key +
        "&callback=initPlMap&v=3";
    document.body.appendChild(script);
}
// console.log(markers);
// console.log(paintcare);
jQuery(function($) {
    loadPlMap();
});

function writeToFile(str) {
    var txtFile = "c:/test.txt";
    var file = new File(txtFile);
    file.open("w"); // open file with write access
    file.writeln("First line of text");
    file.writeln("Second line of text " + str);
    file.write(str);
    file.close();

}

function attachLegend(legend) {
    if (jQuery(window).width() < 961) {
        jQuery('footer').before(legend);
    } else {
        jQuery('.map-search-map').after(legend);
    }
}
jQuery(function($) {
    //reveal "ENTER: Zip Code OR City, State OR Street Address" when user starts typing
    $('#PlMapSearch input').on('keyup', function() {
        $('.map-search-message').slideDown();
    });

    if ($(window).width() < 961) {
        var offset = $('.locations-container #PlMapSearch').offset();
        var contra = offset.top + 260;

        $('body').append('<div style="position:absolute;top:' + contra + 'px;width:100%;height:50px;display:none;background-color:red;z-index:999;">&nbsp;</div>');
    }

    //add class to parent element (in this case "#main-content")
    $('#main-content').addClass('has-map');
    $('.locations-container').parents().eq(2).addClass('tab-map');
    $('.locations-container').parents().addClass('is-map');

    if ($(window).width() < 941) {
        //place map legend as sidebar element
        // $('#PlMapSearch .legend-container').appendTo('.map-search-list');

        //close mobile card when clicking "x"
        $(document).on("click", "a.close-box", function(e) {
            var card = $(this).parent();
            setTimeout(function() {
                jQuery(card).animate({
                    'margin-top': '200%'
                }, 200);
                setTimeout(function() {
                    $(card).removeClass("opened");
                    $('.mobile-cards').hide();
                }, 200);
            }, 200);

        });

        //place map list sidebar below map for mobile devices
        $('.mobile-content .map-search-map, .et_mobile_device .map-search-map').appendTo('#PlMapSearch');
    }
});