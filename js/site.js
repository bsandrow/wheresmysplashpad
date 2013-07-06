if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

var App = (function($) {

    var info_template = (
        "<div class=\"infowin_content\">" +
        "  <h1>{0}</h1>" +
        "  <a href=\"{1}\" title=\"{2} Page\"> Park Page on Toronto.ca </a>" +
        "</div>"
    );

    // ====

    var expand_button = {
        init: function() { this.element = $("#excol-button"); },
        set_expanded: function() { this.element.attr('class', 'icon-minus-sign'); },
        set_collapsed: function() { this.element.attr('class', 'icon-plus-sign'); },
    };

    var expandable_click_handler = function(event) {
        event.preventDefault;
        App.expandable_content.toggle();
    };

    var expandable_content = {
        init: function() {
            this.div = $("#expandable");
            this.button.init();
            this.collapse();
            this.button.element.click(expandable_click_handler);
        },
        button: expand_button,
        expand: function() {
            this.div.show();
            this.button.set_expanded();
            this.state = "expanded";
        },
        collapse: function() {
            this.div.hide();
            this.button.set_collapsed();
            this.state = "collapsed";
        },
        toggle: function() {
            if (this.state == "expanded") {
                this.collapse();
            } else {
                this.expand();
            }
        },
    };

    // ====

    var fetch_park_data = function() {
        $.ajax('splash-pads.json', {
            'dataType': 'json',
            'error': function() {
                site.show_error("<strong>Error!</strong> Unable to fetch park data.");
            },
            'success': function(data) {
                //site.park_data = data;
                for (var i = 0; i < data.length; i++) {
                    site.map.add_park(data[i]);
                }
            },
        });
    };


    var map = {
        options: {
            zoom: 11,
            center: new google.maps.LatLng(43.726, -79.385),
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            panControl: false,
            zoomControlOptions: {
                style: google.maps.ZoomControlStyle.SMALL,
            },
        },
        initialize: function() {
            this.div = $("#map")[0];
            this.map = new google.maps.Map(this.div, this.options);
            this.bounds = new google.maps.LatLngBounds();
        },
        add_park: function(park) {
            var coordinates = new google.maps.LatLng(park.coords[0], park.coords[1]);

            var marker = new google.maps.Marker({
                position: coordinates,
                map: this.map,
                title: park.name,
                scrollWheel: false,
            });

            this.bounds.extend(coordinates);
            this.map.fitBounds(this.bounds);

            var infowindow = new google.maps.InfoWindow({
                content: info_template.format(park.name, park.url, park.name),
            });

            google.maps.event.addListener(marker, 'click', function() {
                infowindow.open(App.map.map, marker);
            });
        },
        center_map: function(position) {
            this.map.setCenter(position);
        },
    };

    // ====

    var geocoder = new google.maps.Geocoder();
    var address_search = {
        initialize: function() {
            this.address_box = $('#address');
            this.address_btn = $('#address-button');

            this.address_btn.click(function(event) {
                event.preventDefault();
                address_search.find_address();
            });
        },
        find_address: function() {
            geocoder.geocode({
                    address: address_search.address_box[0].value
                },
                function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        var result = results[0];

                        var latlng = new google.maps.LatLng(
                            result.geometry.location.lat(),
                            result.geometry.location.lng()
                        );

                        App.map.center_map(latlng);
                        App.map.map.setZoom(13);

                        var marker = new google.maps.Marker({
                            position: latlng,
                            map: App.map.map,
                            title: result.formatted_address,
                            icon: {
                                path: google.maps.SymbolPath.CIRCLE,
                                scale: 5,
                            },
                        });
                    } else {
                        App.set_error("<strong>Error!</strong> Could not find any result.");
                    }
                }
            );
        },
    };

    // ====

    var site = {
        initialize: function() {
            this.error_div = $('#error');
            this.hide_error();

            this.map = map;
            this.map.initialize();
            fetch_park_data();

            this.address_search = address_search;
            this.address_search.initialize();

            this.expandable_content = expandable_content;
            this.expandable_content.init();
        },
        show_error: function(error_message) {
            this.error_div.show().html(error_message);
        },
        hide_error: function() {
            this.error_div.hide();
        },
    };
    return site;

})(jQuery);
