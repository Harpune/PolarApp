import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';


@Component({
  selector: 'page-activity',
  templateUrl: 'activity.html',
})
export class ActivityPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    let activity = navParams.get('act');
    let index = navParams.get('index');

    console.log('Activity', activity);
    let steps = JSON.parse(localStorage.getItem('activity_step'))[index];
    console.log('Steps', steps);
    let zones = JSON.parse(localStorage.getItem('activity_zone'))[index];
    console.log('Zones', zones);

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ActivityPage');
  }

}
