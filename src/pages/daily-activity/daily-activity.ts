import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {PolarDataProvider} from "../../providers/polar-data/polar-data";

@IonicPage()
@Component({
  selector: 'page-daily-activity',
  templateUrl: 'daily-activity.html',
})
export class DailyActivityPage {
  activity: any = [];

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private polarData: PolarDataProvider) {
    //localStorage.removeItem('activityLog');
    this.activity = JSON.parse(localStorage.getItem('activityLog'));
    if (this.activity) {
      console.log('Daily activity', this.activity);
    } else {
      console.log('No daily activity');
    }
  }
}
