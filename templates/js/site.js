Site = {
    'map_options': {
        zoom: 11,
        center: new google.maps.LatLng(43.726, -79.385),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
    },

    'initialize': function() {
        this.error_div = $('#error');
        this.hideError();

        this.map_div = $('#map');
        this.map = new google.maps.Map(this.map_div[0], this.map_options);
        this.fetchParkData();

        this.geocoder = new google.maps.Geocoder();
        this.address_box = $('#address');
        this.address_btn = $('#address-button');

        this.address_btn.click(function(event) {
            event.preventDefault();
            Site.searchForAddress();
        });
    },

    'showError': function(errorMessage) {
        this.error_div.show().html(errorMessage);
    },

    'hideError': function() {
        this.error_div.hide();
    },

    'searchForAddress': function() {
        var site = this;
        site.geocoder.geocode(
            {
                address: site.address_box[0].value
            },
            function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    var loc = results[0].geometry.location;
                    var latlng = new google.maps.LatLng(loc.lat(), loc.lng());
                } else {
                    site.setError("<strong>Error!</strong> Could not find any result.");
                }
            }
        );
    },

    'addParkToMap': function(park) {
        var place = new google.maps.LatLng(park.coords[0], park.coords[1]);
        var marker = new google.maps.Marker({
            position: place,
            map: this.map,
            title: park.name,
            scrollWheel: false,
        });
        var info_content = '<div class="infowin_content">'+
            '<h1>' + park.name + '</h1>' +
            '<a href="' + park.url + '" title="' + park.name +
            ' Page"> Park Page on Toronto.ca </a>'+
            '</div>';
        var infowindow = new google.maps.InfoWindow({
            content: info_content
        });
        google.maps.event.addListener(marker, 'click', function() {
            infowindow.open(this.map, marker);
        });
    },

    'fetchParkData': function() {
        var site = this;
        $.ajax(
            '/splash-pads.json',
            {
                'dataType': 'json',
                'error': function() { site.showError("<strong>Error!</strong> Unable to fetch park data."); },
                'success': function(data) {
                    site.park_data = data;
                    for (var i = 0; i < data.length; i++) {
                        site.addParkToMap(data[i]);
                    }
                }
            });
    },
};
