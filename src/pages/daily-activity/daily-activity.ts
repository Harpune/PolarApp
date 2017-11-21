import {Component} from '@angular/core';
import {App} from 'ionic-angular';
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
  user: any = {};
  progress: any = [];

  constructor(private polarData: PolarDataProvider,
              private localData: LocalDataProvider,
              private app: App) {
    //localStorage.removeItem('activity_sum');
    //localStorage.removeItem('activity_step');
    //localStorage.removeItem('activity_zone');
    let token = JSON.parse(localStorage.getItem('token'));
    console.log('Token', String(token['x_user_id']));
    this.user = JSON.parse(localStorage.getItem(String(token['x_user_id'])));
  }

  /**
   * Ionic View did load.
   */
  ionViewDidLoad() {
    this.activity = JSON.parse(localStorage.getItem('activity_sum')) || [];

    if (this.activity) {
      console.log('Daily activity', this.activity);
      this.updateProgress();
    } else {
      console.log('No daily activity');
    }

    Observable.interval(1000 * 60 * 10).startWith(0).subscribe(trigger => {
      console.log('No. ' + trigger + ': 10 minutes more');
      this.checkForNewData()
    });
  }

  updateProgress() {
    this.activity.forEach((act, index) => {
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

  /**
   * Check for new data.
   */
  checkForNewData() {
    this.polarData.listAvailableData().then(new_data => {
      console.log('New data', new_data);
      this.getActivitySummary(new_data).then(success => {
        //Do stuff with activity
        this.activity.push(success);
        this.updateProgress();

      }, error => {
        console.log('Error daily activity', error);
      });
    }, no_data => {
      console.log('No daily activity', no_data);
      //Loading
    });
  }

  /**
   * Get new activities.
   * @param new_data
   */
  private getActivitySummary(new_data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      console.log('List available data', new_data);
      if (new_data) {
        let all_data = new_data['available-user-data'];
        console.log('All data', all_data);

        this.dataContainsType(all_data, 'ACTIVITY_SUMMARY').then(index => {
          let data = all_data[index];
          console.log('Data', data);

          // Create new transaction.
          this.polarData.create(data['url']).then(transaction => {
            console.log('Create activity summary', transaction);

            this.polarData.list(transaction['resource-uri']).then(activitySummary => {
              console.log('List activity summary', activitySummary);
              let length = Object.keys(activitySummary['activity-log']).length;

              let datas = [];
              let infos = [];

              activitySummary['activity-log'].forEach((info, index) => {
                Observable.forkJoin([
                  this.polarData.get(info),
                  this.polarData.get(info + '/step-samples'),
                  this.polarData.get(info + '/zone-samples'),
                ]).subscribe(data => {

                  datas.push(data);
                  infos.push(info);//TODO change to exercise id.

                  if (index >= length - 1) {
                    // Save the data.
                    this.localData.saveActivity(transaction['transaction-id'], infos, datas);

                    // Commit the transaction.
                    this.polarData.commit(transaction['resource-uri']).then(success => {
                      resolve(success);
                    }, error => {
                      reject(error);
                    });
                  }
                }, error => {
                  reject(error);
                });

              });//for each
            }, error => {
              console.error(error);
              reject(error);
            })
          }, error => {
            console.error('Create activity summary', error);
            reject(error);
          });
        }, () => {
          console.log('NO ACTIVITY_SUMMARY');
          reject('NO ACTIVITY_SUMMARY');
        })
      } else {
        console.log('No new activity summary');
        reject('No new activity summary');
      }
    });
  }

  /**
   * Check if all_data is of type.
   * @param all_data
   * @param {string} type
   * @returns {Promise<number>}
   */
  dataContainsType(all_data: any, type: string): Promise<number> {
    return new Promise((resolve, reject) => {
      all_data.forEach((item, index) => {
        if (item['data-type'] == type) {
          console.log(type, index);
          resolve(index);
        }
      });

      reject(-1);
    });
  }
}
