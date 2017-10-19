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

    //this.checkForNewData();
  }

  /**
   * Checks for new available data.
   */
  checkForNewData() {
    this.polarData.listAvailableData().then(new_data => {
      console.log('New data', new_data);
      this.getActivitySummary(new_data);
    }, no_data => {
      console.log('No new data ', no_data);
      //Loading
    });
  }

  /**
   *
   * @param new_data
   */
  private getActivitySummary(new_data: any) {
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
            let count = 0;

            for (let info of activitySummary['activity-log']) {
              this.polarData.get(info).then(activityLog => {
                console.log('activityLog', activityLog);
                this.saveData(activityLog, 'activityLog');
                count++;
                if (count >= length) {
                  this.commitData(transactionIdUrl);
                }
              }, error => {
                console.error(error);
                count++;
                if (count >= length) {
                  alert('Commit didn\'t work!');
                }
              })
            }
          })
        }, error => {
          console.error('Create activity summary', error);
        });
      }, () => {
        console.log('NO ACTIVITY_SUMMARY');
        //Loading
      })
    } else {
      console.log('No new activity summary');
    }
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

  /**
   * Save data locally with key.
   * @param data
   * @param {string} key
   */
  saveData(data: any, key: string) {
    console.log('Save data', data);
    let datas = JSON.parse(localStorage.getItem(key));
    if (datas) {
      datas.push(data);
      console.log('Added training data', datas);
      localStorage.setItem(key, JSON.stringify(data));
    } else {
      let temp = [];
      temp.push(data);
      console.log('New training data', temp);
      localStorage.setItem(key, JSON.stringify(temp));
    }
  }

  /**
   * Commit the data to polar.
   * @param {string} transactionIdUrl
   * @param refresher
   */
  private commitData(transactionIdUrl: string) {
    // Commit transaction.
    this.polarData.commit(transactionIdUrl).then(success => {
      console.log('Physical info committed', success);
      // Loading
    }, error => {
      console.error('Physical info committed', error);
      // Loading
    })
  }
}
