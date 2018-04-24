import {Component} from '@angular/core';
import {Events, IonicPage, NavController, NavParams} from 'ionic-angular';
import {Observable} from "rxjs/Rx";
import {datatypes} from "../../assets/data/datatypes";
import {LocalDataProvider} from "../../providers/local-data/local-data";

/**
 * Generated class for the StatsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-stats',
  templateUrl: 'stats.html',
})
export class StatsPage {

  activities: any;
  summaries: any;

  totalSteps: number;
  averageSteps: number;

  totalCalories: number;
  averageCalories: number;

  totalDuration: number;
  averageDuration: number;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private localData: LocalDataProvider,
              private events: Events) {
  }

  /**
   * Ionic View did load.
   */
  ionViewDidLoad() {
    this.getLocalActivities();

    this.events.subscribe('activity:data', isData => {
      console.log('DailyActivityPage', 'Event triggered', isData);
      if (isData) {
        this.getLocalActivities()
      }
    });
  }

  getLocalActivities() {
    Observable.forkJoin(
      this.localData.get(datatypes['activity'])
    ).subscribe(success => {
      this.activities = success[1].sort((a, b) => {
        return new Date(b['summary']['date']).getTime() - new Date(a['summary']['date']).getTime();
      });
      this.summaries = this.activities.map(a => a['summary']);
      this.summaries.map(a => {
        this.totalCalories = this.totalCalories + a['active-calories'];
        this.totalDuration = this.totalDuration + a['duration'];
        this.totalSteps = this.totalSteps + a['active-steps'];
      });

      console.log('Activity', this.activities, this.summaries);
    });
  }

}
