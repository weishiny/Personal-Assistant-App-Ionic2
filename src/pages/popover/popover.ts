import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';

@Component({
    templateUrl: 'popover.html'
})
export class PopOverComponent {    
    title: string;
    position: string;
    rate: number;

    constructor(public navParams: NavParams) {
        this.title = navParams.get('title');
        this.position = navParams.get('position');
        this.rate = navParams.get('rate');    
    }    
}