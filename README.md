# Personal-Assistant-App-Ionic2
A Personal Assistant App developed by Ionic2

There is need to use some plugins such as [Cordova GoogleMaps plugin for iOS and Android](https://github.com/mapsplugin/cordova-plugin-googlemaps)
and [Geolocation](https://github.com/apache/cordova-plugin-geolocation)

Notice I just use the following:
> ionic plugin add cordova-plugin-googlemaps --variable API_KEY_FOR_ANDROID="YOUR_ANDROID_API_KEY_IS_HERE" --variable API_KEY_FOR_IOS="YOUR_IOS_API_KEY_IS_HERE"

instead of
> ionic plugin add https://github.com/phonegap-googlemaps-plugin/cordova-plugin-googlemaps --variable API_KEY_FOR_ANDROID="YOUR_ANDROID_API_KEY_IS_HERE" --variable API_KEY_FOR_IOS="YOUR_IOS_API_KEY_IS_HERE"

Please make sure that the API Key has already be applied before using Google Maps.

## ToDoList:
- [ ] Firebase Realtime Database (https://firebase.google.com/docs/database/)
- [ ] Firebase Authentication (https://firebase.google.com/docs/auth/)
