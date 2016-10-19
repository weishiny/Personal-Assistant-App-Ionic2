import { Component } from '@angular/core';
import { NavController, NavParams, Platform} from 'ionic-angular';
import { SQLite } from 'ionic-native';

@Component({
    templateUrl: 'notes-detail.html'
})
export class NotesDetailComponent {
    lat: string;
    lng: string;

    constructor(public navCtrl: NavController, public navParams: NavParams, public platform: Platform) {        
        console.log('***notes***');
        this.lat = navParams.get('lat');
        this.lng = navParams.get('lng');

        this.platform.ready().then(() => {
            console.log('***Start to create SQLite db***');            
            let db = new SQLite();
            db.openDatabase({
                name: "passistant.db",
                location: "default"
            }).then(() => {
                db.executeSql("CREATE TABLE IF NOT EXISTS notesInfo (id INTEGER PRIMARY KEY AUTOINCREMENT, Latitude TEXT, Longitude TEXT)", {})
                  .then((results) => {
                    console.log("TABLE CREATED: ", results);
                }, (error) => {
                    console.error("Unable to execute sql", error);
                })
            }, (error) => {
                console.error("Unable to open database", error);
            });
        });
    }
}