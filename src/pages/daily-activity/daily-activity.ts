import {Component} from '@angular/core';
import {App, Events} from 'ionic-angular';
import {PolarDataProvider} from "../../providers/polar-data/polar-data";
import {LocalDataProvider} from "../../providers/local-data/local-data";
import {ActivityPage} from "../activity/activity";
import {parse, end, toSeconds, pattern} from 'iso8601-duration';
import {Observable} from "rxjs/Rx";

@Component({
  selector: 'page-daily-activity',
  templateUrl: 'daily-activity.html',
})
export class DailyActivityPage {
  activity: any = [];
  summary:any = [];
  user: any;
  progress: any = [];

  constructor(private polarData: PolarDataProvider,
              private localData: LocalDataProvider,
              private events: Events,
              private app: App) {
    events.subscribe('activity:data', isData => {
      console.log('DailyActivityPage', 'Event triggered', isData);
      if(isData){
        this.getLocalActivities()
      }
    })
  }

  /**
   * Ionic View did load.
   */
  ionViewDidLoad() {
    this.getLocalActivities();
  }

  getLocalActivities(){
    Observable.forkJoin(
      this.localData.getUser(),
      this.localData.getActivity()
    ).subscribe(success => {
      this.user = success[0];
      this.activity = success[1];
      this.activity.forEach(item => {
        let temp = item['summary'];
        let dur = temp['duration'];
        temp['duration'] = parse[dur];
        item['summary'] = temp;
        //TODO Save activity here
      });

      this.summary = this.activity.map(a => a['summary']);
      this.updateProgress();

      console.log('Activity', this.user, this.activity, this.summary);
    });
  }

  updateProgress() {
    this.summary.forEach((act, index) => {
      this.progress[index] = Math.floor((act['active-calories'] * 100) / act['calories']);
    });
  }

  /**
   * Go to the activityPage.
   * @param {number} index
   */
  showActivity(index: number) {
    let act = this.activity[index];
    this.app.getRootNav().push(ActivityPage, {act: act, index: index});
  }
}
