import { Component, ViewContainerRef, ViewChild, ComponentFactoryResolver } from "@angular/core";
import { NavController, Platform, PopoverController, AlertController } from 'ionic-angular';
import { GoogleMap, GoogleMapsEvent, GoogleMapsLatLng, GoogleMapsMarker, GoogleMapsAnimation,
         GoogleMapsMarkerOptions, Geocoder, GeocoderRequest, GeocoderResult, Geolocation,
         AnimateCameraOptions } from 'ionic-native';
import 'rxjs/add/operator/map';
import { PopOverComponent } from '../popover/popover';

//even though I've already installed typescript definition file for google.map,
//it's still occur: Error: Cannot find name 'google', so I just use the following method 
declare var google; 

@Component({
    templateUrl: 'google-map.html'
})
export class GoogleMapComponent {    
    //With {read: SomeType}, you tell what type should be returned from the element with the #map_container 
    //template variable.
    //If you don't provide the read parameter, @ViewChild() returns the
    //1. ElementRef instance if there is no component applied, or the
    //2. component instance if there is.
    //3. If you want to get something different you need to explicitely tell using read.
    @ViewChild('map_container', {read: ViewContainerRef}) MapContainerRef: any;    

    map: GoogleMap;    
    location: GoogleMapsLatLng;
    Markers: GoogleMapsLatLng[] = [];
    MapTypeCount: number = 1;
    restaurantEnabled: any;
    cafeEnabled: any;
    schoolEnabled: any;

    constructor(public _navController: NavController, public platform: Platform, 
                public PopoverCtrl: PopoverController, ViewContainer: ViewContainerRef,
                private componentFactoryResolver: ComponentFactoryResolver, public alertCtrl: AlertController) {
        this.platform.ready().then(() => {
            this.loadMap();                        
        });
    }

    private loadMap(): void {        

        Geolocation.getCurrentPosition().then(position => {
            // position.coords.latitude
            // position.coords.longitude                        
            let latlng: GoogleMapsLatLng = new GoogleMapsLatLng(position.coords.latitude, position.coords.longitude);

            //GoogleMapsLatLng will return a _objectInstance object, when we assign this onject into some position value
            //there will be error occur, when you print in screen, you will found that value like:
            //{"target": {"_objectInstance": {"lat": 24.9919378, "lng": 121.2335611}},
            // "zoom":18,
            // "tilt":30,
            // "bearing":140,
            // "duration":5000}
            //But, we need a value like so that we can have google map work:
            //{"target": {"lat": 24.9919378, "lng": 121.2335611},
            // "zoom":18,
            // "tilt":30,
            // "bearing":140,
            // "duration":5000}
            //Therefore, location value should be latlng['_objectInstance'] instead of latlng  
            this.location = latlng['_objectInstance'];

            let option: {} = {
                'backgroundColor': 'white',
                'controls': {
                    'compass': true,
                    'myLocationButton': true,
                    'indoorPicker': true,
                    'zoom': true
                },
                'gestures': {
                    'scroll': true,
                    'tilt': true,
                    'rotate': true,
                    'zoom': true
                },
                'camera': {
                    'latLng': this.location,
                    'tilt': 30,
                    'zoom': 15,
                    'bearing': 50
                }
            };                                                
            this.map = new GoogleMap('map_canvas', option);
            //alert('Success getting location: ' + this.location);
        }).then(() => {                        
            //let latlng: GoogleMapsLatLng = new GoogleMapsLatLng(24.9919378, 121.2335611);            
            this.map.on(GoogleMapsEvent.MAP_READY).subscribe(() => {
                console.log("GoogleMap.onMapReady()");                            
                // Move to the position with animation
                let AnimateCameraOptions: AnimateCameraOptions = {
                    target: this.location,
                    zoom: 18,
                    tilt: 30,
                    bearing: 140,
                    duration: 5000
                };          
                //Change the camera position with animation.      
                this.map.animateCamera(AnimateCameraOptions).then(() => {
                    // Add a maker
                    let MarkerOptions: GoogleMapsMarkerOptions = {
                        title: 'Your favorite marker',                    
                        snippet: 'This marker is awesome!',
                        icon: 'purple',
                        position: this.location,                    
                        draggable: true,
                        animation: GoogleMapsAnimation.DROP
                    };                
                    this.map.addMarker(MarkerOptions).then((marker: GoogleMapsMarker) => {
                        // Show the info window
                        marker.showInfoWindow();
                        marker.getPosition().then((latLng: GoogleMapsLatLng) => {
                            this.Markers.push(latLng);                            
                        });                                        
                        
                        // Catch the Marker click event
                        marker.addEventListener(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {                        
                            console.log('Marker clicked...'); 
                        });

                        //Catch the Marker InfoWindow event
                        marker.addEventListener(GoogleMapsEvent.INFO_CLICK).subscribe(
                            () => {
                                alert('***InfoWindow click***');
                                /**show popover control, it can't be used to edit info on popover page when it exists on map */
                                //let Popover = this.PopoverCtrl.create(PopOverComponent);
                                //Popover.present();                            
                                /**Dynamically append component into DOM */
                                //let factory = this.componentFactoryResolver.resolveComponentFactory(PopOverComponent);
                                //let res = this.MapContainerRef.createComponent(factory);                            
                            }, 
                            (error) => {
                                console.log(error);
                            }
                        );

                        //marker's drag-end Event Listener
                        marker.addEventListener(GoogleMapsEvent.MARKER_DRAG_END).subscribe(
                            (latLng: GoogleMapsLatLng) => {                                                
                                this.getAddress(latLng);
                            }
                        );                    
                    });
                });                                                                            
            });

            //map's long-click Event Listener
            this.map.on(GoogleMapsEvent.MAP_LONG_CLICK).subscribe((latLng: GoogleMapsLatLng) => {                
                this.addMarker(latLng);
            });            
        }).catch((error) => {
            alert('Error getting location: ' + error);
        });                   
    }

    private addMarker(latlng: GoogleMapsLatLng): void {
        // Add a maker
        let MarkerOptions: GoogleMapsMarkerOptions = {
            title: 'Your favorite marker',
            snippet: 'This marker is awesome!',
            position: latlng,                    
            draggable: true,
            animation: GoogleMapsAnimation.BOUNCE
        };
        
        this.map.addMarker(MarkerOptions).then((marker: GoogleMapsMarker) => {
            // Show the info window
            marker.showInfoWindow();
            marker.getPosition().then((latLng: GoogleMapsLatLng) => {
                this.Markers.push(latLng);
                alert(JSON.stringify(this.Markers));
            });                  

            // Catch the Marker click event
            marker.addEventListener(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {                        
                console.log('Marker clicked...'); 
            });
            
            //Catch the Marker InfoWindow event
            marker.addEventListener(GoogleMapsEvent.INFO_CLICK).subscribe(
                () => {
                    alert('***InfoWindow click***');
                    /**show popover control, it can't be used to edit info on popover page when it exists on map */
                    //let Popover = this.PopoverCtrl.create(PopOverComponent);
                    //Popover.present();
                    /**Dynamically append component into DOM */
                    //let factory = this.componentFactoryResolver.resolveComponentFactory(PopOverComponent);
                    //let res = this.MapContainerRef.createComponent(factory);                    
                }, 
                (error) => {
                    console.log(error);
                }
            );

            //marker's drag-end Event Listener
            marker.addEventListener(GoogleMapsEvent.MARKER_DRAG_END).subscribe(
                (latLng: GoogleMapsLatLng) => {                                                
                    this.getAddress(latLng);
                }
            );                   
        });
    }

    /**
     * Reverse geocoding: Get an address from latitude and longitude
     */
    getAddress(latLng: GoogleMapsLatLng): void {
        let geocoderRequest: GeocoderRequest = { 'position': latLng };
        Geocoder.geocode(geocoderRequest).then((results: GeocoderResult[]) => {            
            if (results.length) {
                let result = results[0];
                let position = result.position; 
                let address = [
                    result.subThoroughfare || "",
                    result.thoroughfare || "",
                    result.locality || "",
                    result.adminArea || "",
                    result.postalCode || "",
                    result.country || ""
                ].join(", ");

                let alert = this.alertCtrl.create({
                    title: 'New Address!',
                    subTitle: 'Your are at ' + '\n' + address,
                    buttons: ['OK']
                });
                alert.present();
            } else {
                alert("Not found");
            }
        });        
    }

    /**
     * Geocoding: Get latitude and longitude of an address
     */
    getPosition(event: any): void {
        let searchValue: string = event.target.value;

        // if the value is an empty string don't filter the items
        if (searchValue && searchValue.trim() != '') {
            let geocoderRequest: GeocoderRequest = { 'address': searchValue }; 
            Geocoder.geocode(geocoderRequest).then((results: GeocoderResult[]) => {
                if (results.length) {
                    let result = results[0];
                    let latLngPosition: GoogleMapsLatLng = result.position as GoogleMapsLatLng;                                        
                    // Move to the position with animation
                    let AnimateCameraOptions: AnimateCameraOptions = {
                        target: latLngPosition,
                        zoom: 18,
                        tilt: 30,
                        bearing: 140,
                        duration: 5000
                    };         
                    //Change the camera position with animation.       
                    this.map.animateCamera(AnimateCameraOptions).then(() => {
                        // Add a maker
                        let MarkerOptions: GoogleMapsMarkerOptions = {
                            title: 'Your search result',
                            snippet: 'This marker is awesome!',
                            icon: 'darkgreen',
                            position: latLngPosition,                    
                            draggable: true,
                            animation: GoogleMapsAnimation.DROP
                        };                    
                        
                        this.map.addMarker(MarkerOptions).then((marker: GoogleMapsMarker) => {
                            // Show the info window
                            marker.showInfoWindow();
                            marker.getPosition().then((latLng: GoogleMapsLatLng) => {
                                this.Markers.push(latLng);                            
                            });                  

                            // Catch the Marker click event
                            marker.addEventListener(GoogleMapsEvent.MARKER_CLICK).subscribe(() => {                        
                                console.log('Marker clicked...'); 
                            });

                            //marker's drag-end Event Listener
                            marker.addEventListener(GoogleMapsEvent.MARKER_DRAG_END).subscribe(
                                (latLng: GoogleMapsLatLng) => {                                                
                                    this.getAddress(latLng);
                                }
                            );                                                              
                        });
                    });                                        
                } else {
                    alert("Not found");
                }
            }).catch(this.handleError);
        }
    }

    changeMapType(): void {
        let MapTypeDef: string[] = ['MAP_TYPE_NORMAL', 'MAP_TYPE_SATELLITE', 'MAP_TYPE_HYBRID', 'MAP_TYPE_TERRAIN'];
        //this definition is based on the source code of google maps plugin
        //please see the googlemaps-cdv-plugin.js: App.prototype.setMapTypeId
        //There are some remark you can examine                        
        this.map.setMapTypeId(MapTypeDef[this.MapTypeCount++ % MapTypeDef.length]);
    }

    ToggleChange(event: any, inquirytype: string): void {
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
                let jsMap = new google.maps.Map(document.getElementById('map_canvas'), {
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
                    types: [inquirytype]
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

    changeToOriginalMap(): void {
        this.loadMap();
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }    
}