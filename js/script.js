//declare namespace
var flickrmap = {};
//declare map
var map;
//marker array
var Points = [];
//info window
var infowindow = new google.maps.InfoWindow();
//trace function for debugging
function trace(message) {
    if (typeof console != 'undefined') {
        console.log(message);
    }
}
//Function to create Flickr Marker
flickrmap.createFlickrMarker = function(i, latitude, longitude, infowindowcontent, icon) {
    var markerLatLng = new google.maps.LatLng(latitude, longitude);

    //set marker to be the flickr image, resizing it to 32 by 32 pixels
    var image = new google.maps.MarkerImage(icon, null, null, null, new google.maps.Size(32, 32));
    //create and map the marker
    Points[i] = new google.maps.Marker({
        position: markerLatLng,
        map: map,
        title: infowindowcontent,
        //icon: image
    });
    //add an onclick event
    google.maps.event.addListener(Points[i], 'click', function() {
        infowindow.setContent(infowindowcontent);
        infowindow.open(map, Points[i]);
        toggleBounce(Points[i]);
        map.setZoom(20);
    });
}

var photoPoints;

function toggleBounce(marker) {
    if (marker.getAnimation() != null) {
        marker.setAnimation(null);
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            marker.setAnimation(null);
        }, 750);
    }
}
//Function to get data from Flickr
flickrmap.getFlickr = function(search) {
        $.getJSON('https://api.flickr.com/services/rest/?method=flickr.photos.search&format=json&api_key=c7da18f4cdc5e79a5f073858e7871a53&text=' + search + '&lat=41.8781&lon=-87.6298&extras=geo,url_t,url_m,url_sq&radius=10&accuracy=13&per_page=100&jsoncallback=?',

            function(data) {
                trace(data);
                //empty place list
                $('ul.place-list').children().remove();
                $.each(data.photos.photo, function(i, item) {
                    infowindowcontent = '<strong>' + item.title + '</strong><br>';
                    infowindowcontent += '<a href="' + item.url_m + '" target="_blank">';
                    infowindowcontent += '<img src="' + item.url_t + '"></a>';
                    populateSideList(i, item);
                    flickrmap.createFlickrMarker(i, item.latitude, item.longitude, infowindowcontent, item.url_sq);
                });
            }
        );
    }
    //Function that gets run when the document loads
flickrmap.initialize = function() {
    var latlng = new google.maps.LatLng(41.8781, -87.6298);
    var myOptions = {
        zoom: 13,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    //clear markers
    function clearOverlays() {
        if (Points) {
            for (i in Points) {
                Points[i].setMap(null);
            }
        }
    }
    //Function to get search term, clear markers
    function searchterm() {
        var term = $("#q").val();
        clearOverlays();
        flickrmap.getFlickr(term);
        var wait = window.setTimeout(emptyList, 500);
    }
    $("button").click(searchterm);
    searchterm();

}

var markersArray = ko.observableArray([]);


//check if place list is empty after everything loads 




function emptyList() {
    var placeList = $('ul.place-list li').length;
    console.log(placeList);
    if (placeList == 0) {
        $('ul.place-list').append('<li >No results found.</li>');
    }
}

function populateSideList(i, item) { //, index, array


    $('ul.place-list').append('<li ><a href="#" class="place-image-li' + i + '"><span class="title"><strong>' + item.title + '</strong></span><br><img src="' + item.url_t + '"><hr><span style="display:none" class="this-location"><span class="lat">' + item.latitude + '</span><span class="long">' + item.longitude + '</span><span class="pos">' + i + '</span></span></a></li>');

    $('.place-image-li' + i).click(function(e) {
        e.preventDefault();

        var longitude = $(this).find('.this-location .long').text();
        var latitude = $(this).find('.this-location .lat').text();
        var title = $(this).find('title').text();
        var pos = $(this).find('.this-location .pos').text();
        var image = $(this).find('img');
        var icon = image.attr('src');

        moveMap(icon, latitude, longitude, title, i);
    });


}




function moveMap(image, latitude, longitude, title, i) {
    var infowindowcontent = null;
    var markerLatLng = new google.maps.LatLng(latitude, longitude);
    //set marker to be the flickr image, resizing it to 32 by 32 pixels
    //var image = new google.maps.Marker(icon, null, null, null, new google.maps.Size(32,32));
    //create and map the marker
    Points[i] = new google.maps.Marker({
        position: markerLatLng,
        map: map,
        title: infowindowcontent,
        //icon: image
    });
    infowindowcontent = '<strong>' + title + '</strong><br>';
    infowindowcontent += '<a href="#" target="_blank">';
    infowindowcontent += '<img src="' + image + '"></a>';

    infowindow.setContent(infowindowcontent);

    infowindow.open(map, Points[i]);

    toggleBounce(Points[i]);

    map.setZoom(20);

}


function viewModel() {


}
ko.applyBindings(new viewModel()); 