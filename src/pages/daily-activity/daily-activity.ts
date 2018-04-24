import {Component} from '@angular/core';
import {AlertController, App, Events} from 'ionic-angular';
import {LocalDataProvider} from "../../providers/local-data/local-data";
import {ActivityPage} from "../activity/activity";
import {Observable} from "rxjs/Rx";
import {datatypes} from "../../assets/data/datatypes";

@Component({
  selector: 'page-daily-activity',
  templateUrl: 'daily-activity.html',
})
export class DailyActivityPage {
  activity: any = [];
  summary: any = [];
  user: any;
  progress: any = [];

  toggleActivity: boolean;

  constructor(private localData: LocalDataProvider,
              private alertCtrl: AlertController,
              private events: Events,
              private app: App) {
    // TODO settings: enable to see all data Or just relevant data.
    this.toggleActivity = JSON.parse(localStorage.getItem('toggleActivity')) === true;
    console.log('Toggle Activity', this.toggleActivity);
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
      this.localData.getUser(),
      this.localData.get(datatypes['activity'])
    ).subscribe(success => {
      console.log('Activity', success);
      this.user = success[0];
      this.activity = success[1].sort((a, b) => {
        return new Date(b['summary']['date']).getTime() - new Date(a['summary']['date']).getTime();
      });
      this.summary = this.activity
        .map(a => a['summary']);

      this.updateProgress();

      console.log('Activity', this.user, this.activity, this.summary, this.progress);
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
    console.log('Show Activity', act);
    this.app.getRootNav().push(ActivityPage, {act: act});
  }

  removeActivity(index: number) {
    let act = this.activity[index];
    console.log('Delete Activity', act);
    this.alertCtrl.create({
      title: 'Löschen?',
      message: `Wollen Sie diese Aktivität wirklich löschen? Das kann nicht rückgängig gemacht werden!`,
      buttons: [
        {
          text: 'Nein',
          role: 'cancel',
          handler: () => {
            console.log('Delete Activity', 'Cancel clicked');
          }
        }, {
          text: 'Ja',
          handler: () => {
            console.log('Delete Activity', 'Ok clicked');
            this.localData.delete(act, datatypes['activity']).then(success => {
              this.getLocalActivities();
              console.log('Delete Activity', 'Success', success);
            }, error => {
              console.log('Delete Activity', 'Error', error);
            });
          }
        }
      ]
    }).present();
  }
}
