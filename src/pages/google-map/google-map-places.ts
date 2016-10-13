import { Component, OnInit } from "@angular/core";
import { NavController, NavParams, Platform, AlertController } from 'ionic-angular';
import { GoogleMapsLatLng } from 'ionic-native';
//even though I've already installed typescript definition file for google.map,
//it's still occur: Error: Cannot find name 'google', so I just use the following method 
declare var google;

@Component({
    templateUrl: 'google-map-places.html'
})
export class GoogleMapPlacesComponent implements OnInit{
    restaurantEnabled: any;
    cafeEnabled: any;
    schoolEnabled: any;
    inquirytype: string;
    location: GoogleMapsLatLng;

    constructor(public platform: Platform, public alertCtrl: AlertController,
                public navCtrl: NavController, navParams: NavParams) {
        this.restaurantEnabled = navParams.get('restaurantEnabled');
        this.cafeEnabled = navParams.get('cafeEnabled');
        this.schoolEnabled = navParams.get('schoolEnabled');
        this.inquirytype = navParams.get('inquirytype');
        this.location= navParams.get('location');
    }

    ngOnInit() {
        this.platform.ready().then(() => {
            this.loadjsMap();                        
        });        
    }

    loadjsMap(): void {
        //Use setTimeout to let ionic toggle animation can be showed
        setTimeout(() => {
            if (this.restaurantEnabled === true || this.cafeEnabled === true || this.schoolEnabled === true) {
                /**
                 * We're writing an Ionic 2 app in TypeScript. But we don’t have the typescript definitions for google maps API. 
                 * First of all, we'll need to install them. 
                 * typings for Google Maps JS SDK: Syntax => 
                 * 1. typings search google.maps
                 * 2. typings install dt~google.maps --global
                 * After this action, we can use google maps JS
                 */            
                   
                let nowLocation = new google.maps.LatLng(this.location.lat, this.location.lng);
                let jsMap = new google.maps.Map(document.getElementById('jsmap_canvas'), {
                    center: nowLocation,
                    zoom: 15,
                    scrollwheel: false
                });
                                                                                
                // Specify location, radius and place types for your Places API search.
                // Create the PlaceService and send the request.
                // Handle the callback with an anonymous function.
                let placeService = new google.maps.places.PlacesService(jsMap);
                let option:{} = {
                    location: nowLocation,
                    radius: 1500,
                    types: [this.inquirytype]
                };                        
                placeService.nearbySearch(option, (results, status) => {                
                    if (status === google.maps.places.PlacesServiceStatus.OK) {
                        for (let i = 0; i < results.length; i++) {
                            let place = results[i];
                            // If the request succeeds, draw the place location on the map as a marker, 
                            //and register an event to handle a click on the marker.                            
                            let imageUrl: string;                                                        
                            if (this.restaurantEnabled === true)
                                imageUrl = 'assets/images/RestaurantIcon.png';
                            else if (this.cafeEnabled === true)
                                imageUrl = 'assets/images/CafeIcon.png';
                            else if (this.schoolEnabled === true)
                                imageUrl = 'assets/images/SchoolIcon.png';
                            else
                                imageUrl = '';

                            let marker = new google.maps.Marker({
                                map: jsMap,
                                icon: imageUrl,
                                position: place.geometry.location
                            });
                            let infowindow = new google.maps.InfoWindow();
                            google.maps.event.addListener(marker, 'click', function() {
                                infowindow.setContent('<div><img src="' + place.icon + '"><strong>' + place.name + '</strong><br>' +
                                '<strong>Vicinity:</strong> ' + place.vicinity + '<br>' + '</div>');
                                infowindow.open(jsMap, this);
                            });
                        }
                    }
                });                                                                    
            } else {

            }
        }, 500);  
    }

    changeToOriginalMap() {
        this.navCtrl.pop();
    }
}
