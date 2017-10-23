import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {PolarDataProvider} from "../../providers/polar-data/polar-data";
import {LocalDataProvider} from "../../providers/local-data/local-data";
import {ActivityPage} from "../activity/activity";

@Component({
  selector: 'page-daily-activity',
  templateUrl: 'daily-activity.html',
})
export class DailyActivityPage {
  activity: any = [];
  user: any = {};

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private polarData: PolarDataProvider) {
    //localStorage.removeItem('activityLog');
    this.user = JSON.parse(localStorage.getItem('user'));
  }

  ionViewDidLoad() {
    this.activity = JSON.parse(localStorage.getItem('activityLogs')) || [];
    console.log(this.activity);
    this.activity.push({
      "id": 1234,
      "polar-user": "https://www.polaraccesslink/v3/users/1",
      "transaction-id": 179879,
      "date": "2010-12-31",
      "created": "2016-04-27T20:11:33.000Z",
      "calories": 2329,
      "active-calories": 428,
      "duration": "PT2H44M",
      "active-steps": 250
    }, {
      "id": 12345,
      "polar-user": "https://www.polaraccesslink/v3/users/2",
      "transaction-id": 179880,
      "date": "2010-12-31",
      "created": "2016-04-27T20:11:33.000Z",
      "calories": 2329,
      "active-calories": 428,
      "duration": "PT2H44M",
      "active-steps": 250
    }, {
      "id": 12345,
      "polar-user": "https://www.polaraccesslink/v3/users/2",
      "transaction-id": 179880,
      "date": "2010-12-31",
      "created": "2016-04-27T20:11:33.000Z",
      "calories": 2329,
      "active-calories": 428,
      "duration": "PT2H44M",
      "active-steps": 250
    }, {
      "id": 12345,
      "polar-user": "https://www.polaraccesslink/v3/users/2",
      "transaction-id": 179880,
      "date": "2010-12-31",
      "created": "2016-04-27T20:11:33.000Z",
      "calories": 2329,
      "active-calories": 428,
      "duration": "PT2H44M",
      "active-steps": 250
    }, {
      "id": 12345,
      "polar-user": "https://www.polaraccesslink/v3/users/2",
      "transaction-id": 179880,
      "date": "2010-12-31",
      "created": "2016-04-27T20:11:33.000Z",
      "calories": 2329,
      "active-calories": 428,
      "duration": "PT2H44M",
      "active-steps": 250
    });
    console.log(this.activity);

    if (this.activity) {
      console.log('Daily activity', this.activity);
      //Do stuff with activity
    } else {
      console.log('No daily activity');
    }
    this.checkForNewData();
  }

  showActivity(){
    this.navCtrl.push(ActivityPage);
  }

  /**
   * Checks for new available data.
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
   *
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
                  LocalDataProvider.saveData(activity_sum, 'activity_sum');

                  this.polarData.get(info + '/step-samples').then(activity_step => {
                    console.log('Get step samples', activity_step);
                    LocalDataProvider.saveData(activity_step, 'activity_step');

                    this.polarData.get(info + '/zone-samples').then(activity_zone => {
                      console.log('Get zone samples', activity_zone);
                      LocalDataProvider.saveData(activity_zone, 'activity_zone');

                      if (index >= length) {
                        this.polarData.commit(transactionIdUrl).then(success => {
                          console.log('Activity info committed', success);
                          resolve(success);
                        }, error => {
                          console.error('Activity info committed', error);
                          reject(error);
                        })
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
              });
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
