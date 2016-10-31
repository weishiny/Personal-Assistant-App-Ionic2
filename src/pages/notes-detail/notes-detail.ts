import { Component } from '@angular/core';
import { NavController, NavParams, Platform} from 'ionic-angular';
import { SQLite } from 'ionic-native';

@Component({
    templateUrl: 'notes-detail.html'
})
export class NotesDetailComponent {
    lat: string;
    lng: string;
    notesInfoArray: any[];

    database: SQLite;

    TitleValue: string;
    PositionValue: string;
    RestaurantValue: string; 
    MealValue: string;
    PriceValue: string; 
    NotesDateValue: string;
    DescriptionValue: string;

    constructor(public navCtrl: NavController, public navParams: NavParams, public platform: Platform) {        
        console.log('***notes***');
        this.lat = navParams.get('lat');
        this.lng = navParams.get('lng');

        this.platform.ready().then(() => {
            this.database = new SQLite();
            this.openDB();
        });
    }

    openDB() {
        console.log('***Start to create SQLite db***');                    
        this.database.openDatabase({
            name: 'passistant.db',
            location: 'default'
        }).then(() => {
            let createstatement = 
                `CREATE TABLE IF NOT EXISTS notesInfo (id INTEGER PRIMARY KEY AUTOINCREMENT, Latitude TEXT, Longitude TEXT, Title TEXT
                ,Position TEXT, Restaurant TEXT, Meal TEXT, Price TEXT, Date TEXT, Description TEXT, Rate TEXT)`;
            this.database.transaction((tx) => {
                tx.executeSql("DROP TABLE IF EXISTS notesInfo");
                tx.executeSql(createstatement, []);
            });                        
        }, (error) => {
            console.error('Unable to open database', error);
        });
    }

    onCancel() {
        this.navCtrl.pop();
    }

    onSave() {
        console.log('***Start to Insert one record into SQLite db***');
        if (!this.database || this.database === null) {
            console.log('ERROR: ' + this.database);
        }
                            
        let insertStatement = 
                `INSERT INTO notesInfo (Latitude, Longitude, Title, Position, Restaurant, Meal, 
                 Price, Date, Description, Rate) VALUES (?,?,?,?,?,?,?,?,?,?)`; 
            //executeSql(): Execute SQL on the opened database. Note, you must call openDatabase first, and ensure it resolved and successfully opened the database.        
        this.database.executeSql(insertStatement, ['lat', 'lng', this.TitleValue, this.PositionValue, this.RestaurantValue, 
            this.MealValue, this.PriceValue, this.NotesDateValue, this.DescriptionValue, '5'])
            .then((results) => {
                console.log("Insert Data OK: " + JSON.stringify(results));
                /*
                for (var i = 0; i < results.length; i++) {
                    console.log('Insert Data OK: ', JSON.stringify(results.rows.item(i)));
                }
                */                
        }, (error) => {
            console.error('Unable to execute sql', error);
        })
    }

    onSelect() {        
        let selectStatement = 'SELECT * FROM notesInfo';
        //executeSql(): Execute SQL on the opened database. Note, you must call openDatabase first, and ensure it resolved and successfully opened the database.        
        this.database.executeSql(selectStatement, []).then((results) => {
            this.notesInfoArray = [];
            if(results.rows.length > 0) {
                for(var i = 0; i < results.rows.length; i++) {
                    this.notesInfoArray.push({Latitude: results.rows.item(i).Latitude, Longitude: results.rows.item(i).Longitude,
                        Position: results.rows.item(i).Position, Restaurant: results.rows.item(i).Restaurant, 
                        Meal: results.rows.item(i).Meal, Price: results.rows.item(i).Price, Date: results.rows.item(i).Date,
                        Description: results.rows.item(i).Description, Rate: results.rows.item(i).Rate});
                }
                console.log("Results: " + JSON.stringify(this.notesInfoArray));    
            }
        }, (error) => {
            console.log("ERROR: " + JSON.stringify(error));
        });
    }
}