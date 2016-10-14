import { Component, ViewContainerRef, ViewChild, ComponentFactoryResolver } from "@angular/core";
import { NavController, Platform, PopoverController, AlertController } from 'ionic-angular';
import { GoogleMap, GoogleMapsEvent, GoogleMapsLatLng, GoogleMapsMarker, GoogleMapsAnimation,
         GoogleMapsMarkerOptions, Geocoder, GeocoderRequest, GeocoderResult, Geolocation,
         AnimateCameraOptions } from 'ionic-native';
import 'rxjs/add/operator/map';
//import { PopOverComponent } from '../popover/popover';
import { GoogleMapPlacesComponent } from './google-map-places';

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

    constructor(public navCtrl: NavController, public platform: Platform, 
                public PopoverCtrl: PopoverController, ViewContainer: ViewContainerRef,
                private componentFactoryResolver: ComponentFactoryResolver, public alertCtrl: AlertController) {
        this.platform.ready().then(() => {
            this.loadMap();                        
        });
    }

    /**
     * If we're running in Ionic, the OnInit will only fire when the view is loaded. That means, it will only fire once. 
     * Ionic 2's navigation module caches views in the DOM the same way Ionic 1 does, so the view is generally only loaded 
     * once.
     * Fortunately, Ionic packages a set of view lifecycle hooks into the NavController – part of the Ionic module. 
     * They follow four patterns of event handlers:
     * ionViewDidLoaded works the same way as ngOnInit, fires once when the view is initially loaded into the DOM
     * ionViewWillEnter and ionViewDidEnter are hooks that are available before and after the page in question becomes active
     * ionViewWillLeave and ionViewDidLeave are hooks that are available before and after the page leaves the viewport
     * ionViewWillUnload and ionViewDidUnload are hooks that are available before and after the page is removed from the DOM
     * 
     * So, we want to avoid the issue of google map disappeared after navigation, we need to use ionViewDidEnter, which the 
     * one we're looking for, which fires every time a page becomes the active view.
     */
    ionViewDidEnter() {
        //There is need to trigger the resize event on the google maps object everytime you enter the specific page. 
        //So place the following code in the ionViewDidEnter() event.
        console.log('didenter');
        this.map.remove();
        this.loadMap();
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
        //Destroy the native map completely so that we can operate google-map-places, otherwise, we can't click or move map
        this.map.remove();

        this.navCtrl.push(GoogleMapPlacesComponent, {
            restaurantEnabled: this.restaurantEnabled,
            cafeEnabled: this.cafeEnabled,
            schoolEnabled: this.schoolEnabled,
            inquirytype: inquirytype,
            location: this.location
        });                
    }     

    changeToOriginalMap(): void {
        this.map.remove(); //Destroy the native map completely        
        this.Markers.length = 0; //Clear all marker data
        this.loadMap();
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }    
}