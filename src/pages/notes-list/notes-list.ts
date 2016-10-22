import { Component, OnInit } from '@angular/core';
import { NavController, NavParams, Platform, AlertController, PopoverController } from 'ionic-angular';
import { SQLite } from 'ionic-native';
import { NotesDetailComponent } from '../notes-detail/notes-detail';
import { PopOverComponent } from '../popover/popover';

@Component({
    templateUrl: 'notes-list.html'
})
export class NotesListComponent implements OnInit{

    notesitems: any[] = [];    

    constructor(public navCtrl: NavController, public navParams: NavParams, public platform: Platform,
                public alertCtrl: AlertController, public PopoverCtrl: PopoverController) {
        
    }

    ngOnInit() {
        for(let i = 0; i < 8; i++) {
            let itemObject: {} = {
                title: 'Favorite Restaurant: ' + i,
                position: 'Taoyuan',
                rate: 5
            };
            this.notesitems.push(itemObject);
        }        
    }

    showAlert(notesitem: {}, action: string) {
        let alert = this.alertCtrl.create({
            title: 'New Friend: ' + action,
            subTitle: 'Your friend, Obi wan Kenobi, just accepted your friend request! ' + notesitem['title'],
            buttons: ['OK']
        });
        
        alert.present();
    }

    showPopover(notesitem: {}) {
        let params: {} = {
            title: notesitem['title'],
            position: notesitem['position'],
            rate: notesitem['rate']
        };
        let Popover = this.PopoverCtrl.create(PopOverComponent, params);
        Popover.present();
    }

    onCreate(): void {
        this.navCtrl.push(NotesDetailComponent);
    }

    onModify(notesitem: {}): void {
        this.navCtrl.push(NotesDetailComponent, notesitem);
    }
}