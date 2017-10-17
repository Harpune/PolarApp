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

    this.polarData.listAvailableData().then(new_data => {
      console.log('New data', new_data);
      this.getNewActivitySummary(new_data);
    }, no_data => {
      console.log('No new data ', no_data);
    });
  }

  /**
   * Refresh and check for new data with 'Pull notifications'.
   * @param refresher
   */
  refresh(refresher) {
    console.log('Refreshed');
    if (refresher) {
      this.polarData.listAvailableData().then(new_data => {
        console.log('New data', new_data);
        this.getNewActivitySummary(new_data, refresher);
      }, no_data => {
        console.log('No new data ', no_data);
        refresher.complete();
      });
    }
  }

  private getNewActivitySummary(new_data: any, refresher?) {
    console.log('List available data', new_data);
    if(new_data){
      let all_data = new_data['available-user-data'];
      console.log('All data', all_data);
      this.dataContainsActivitySummary(all_data).then(index => {
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

            for(let info of activitySummary['activity-log']){
              this.polarData.get(info).then(activityLog => {
                console.log('activityLog', activityLog);
                this.saveData(activityLog);
                count++;
                if (count >= length) {
                  console.log('DONE');
                  //this.updateCharts();
                  //this.commitData(transactionIdUrl, refresher);
                }
              }, error=> {
                console.error(error);
                count++;
                if (count >= length) {
                  //this.commitData(transactionIdUrl, refresher);
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
        if (refresher) {
          refresher.complete();
        }
      })
    } else {
      console.log('No new activity summary');
    }
  }

  /**
   * Save data locally.
   * @param activityLog
   */
  saveData(activityLog: any) {
    console.log('Save activity logs', activityLog);
    let activityLogs = localStorage.getItem('activityLog');
    if (activityLogs) {
      this.activity = JSON.parse(activityLogs);
      console.log('Add activity log', this.activity);
      this.activity.push(activityLog);
      console.log('Added activity logs', this.activity);
      localStorage.setItem('activityLog', JSON.stringify(this.activity));
    } else {
      let temp = [];
      temp.push(activityLog);
      this.activity = temp;
      console.log('New activity logs', this.activity);
      localStorage.setItem('activityLog', JSON.stringify(this.activity));
    }
  }

  /**
   * Check in all_data for ACTIVITY_SUMMARY.
   * @param all_data
   * @returns {Promise<number>}
   */
  dataContainsActivitySummary(all_data: any): Promise<number> {
    return new Promise((resolve, reject) => {
      all_data.forEach((item, index) => {
        if (item['data-type'] == 'ACTIVITY_SUMMARY') {
          console.log('PHYSICAL_INFORMATION', index);
          resolve(index);
        }
      });
      reject(-1);
    });
  }
}
