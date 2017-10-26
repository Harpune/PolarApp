import {Component} from '@angular/core';
import {App, NavController, NavParams} from 'ionic-angular';
import {PolarDataProvider} from "../../providers/polar-data/polar-data";
import {LocalDataProvider} from "../../providers/local-data/local-data";
import {ActivityPage} from "../activity/activity";
import {parse, end, toSeconds, pattern} from 'iso8601-duration';

@Component({
  selector: 'page-daily-activity',
  templateUrl: 'daily-activity.html',
})
export class DailyActivityPage {
  activity: any = [];
  user: any = {};
  progress: any = [];

  constructor(private polarData: PolarDataProvider,
              private app: App) {
    //localStorage.removeItem('activityLog');
    this.user = JSON.parse(localStorage.getItem('user'));
  }

  /**
   * Ionic View did load.
   */
  ionViewDidLoad() {
    this.activity = JSON.parse(localStorage.getItem('activity_sum')) || [];
    console.log(this.activity);

    if (this.activity) {
      console.log('Daily activity', this.activity);

      this.activity.forEach((act, index) => {
        this.progress[index] = Math.floor((act['active-calories'] * 100) / act['calories']);
        console.log('Progress' + index, this.progress[index]);
      });

    } else {
      console.log('No daily activity');
    }
    this.checkForNewData();
  }

  /**
   * Go to the activityPage.
   * @param {number} index
   */
  showActivity(index: number) {
    let act = this.activity[index];
    console.log('Activity', act);
    console.log('Activity index', index);
    this.app.getRootNav().push(ActivityPage, {act: act, index: index});
  }

  /**
   * Check for new data.
   * @param refresher
   */
  checkForNewData(refresher?) {
    this.polarData.listAvailableData().then(new_data => {
      console.log('New data', new_data);
      this.getActivitySummary(new_data).then(success => {
        console.log('New activity info', success);
        //Do stuff with activity
        if (refresher) {
          refresher.complete();
        }
      }, error => {
        console.error('No activity info', error);
        if (refresher) {
          refresher.complete();
        }
      });
    }, no_data => {
      if (refresher) {
        refresher.complete();
      }
      console.log('No new data ', no_data);
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
          console.log('Index', index);
          let data = all_data[index];
          console.log('Data', data);

          // Create new transaction.
          this.polarData.create(data['url']).then(transactionIdUrl => {
            console.log('Create activity summary');

            this.polarData.list(transactionIdUrl).then(activitySummary => {
              console.log('List activity summary', activitySummary);
              let length = Object.keys(activitySummary['activity-log']).length;
              console.log('Length', length);

              activitySummary['activity-log'].forEach((info, index) => {
                this.polarData.get(info).then(activity_sum => {
                  console.log('Get activity summary', activity_sum);
                  let durationPT = activity_sum['duration'];
                  let durationDate = parse(durationPT);
                  console.log("duration", durationDate);
                  activity_sum['duration'] = durationDate;

                  LocalDataProvider.saveData(activity_sum, 'activity_sum');

                  this.polarData.get(info + '/step-samples').then(activity_step => {
                    console.log('Get step samples', activity_step);
                    LocalDataProvider.saveData(activity_step, 'activity_step');

                    this.polarData.get(info + '/zone-samples').then(activity_zone => {
                      console.log('Get zone samples', activity_zone);
                      LocalDataProvider.saveData(activity_zone, 'activity_zone');

                      if (index >= length) {
                        /*
                        this.polarData.commit(transactionIdUrl).then(success => {
                          console.log('Activity info committed', success);
                          resolve(success);
                        }, error => {
                          console.error('Activity info committed', error);
                          reject(error);
                        })
                         */
                        console.log("ACTIVITY DONE!");

                      }

                    }, error => {
                      console.error(error);
                      if (index >= length) {
                        reject(error);
                      }
                    });
                  }, error => {
                    console.error(error);
                    reject(error);
                  });
                }, error => {
                  console.error(error);
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
