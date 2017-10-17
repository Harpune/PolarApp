import {Component} from '@angular/core';

import {Loading, LoadingController, NavController} from 'ionic-angular';

import {InAppBrowser} from "@ionic-native/in-app-browser";

import {PolarDataProvider} from "../../providers/polar-data/polar-data";

import {TrainingDataPage} from "../training-data/training-data";
import {DailyActivityPage} from "../daily-activity/daily-activity";
import {PhysicalInfoPage} from "../physical-info/physical-info";
import {UserPage} from "../user/user";
import {LoginPage} from "../login/login";

@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html',
})

export class TabsPage {
  page1 = TrainingDataPage;
  page2 = DailyActivityPage;
  page3 = PhysicalInfoPage;

  TDone: boolean = false;
  PDone: boolean = false;
  ADone: boolean = false;

  loading: Loading;
  user: any;

  constructor(private navCtrl: NavController,
              private polarData: PolarDataProvider,
              private loadingCtrl: LoadingController,
              private iab: InAppBrowser) {

    this.checkForNewData();
  }

  checkForNewData() {
    this.loading = this.loadingCtrl.create({
      content: 'Loading',
    });

    this.loading.present().then(() => {
      this.polarData.listAvailableData().then(new_data => {
        console.log('New data', new_data);
        this.getTrainingData(new_data);
        this.getPhysicalInfo(new_data);
        this.getActivitySummary(new_data);
      }, no_data => {
        console.log('No new data ', no_data);
        this.dismissLoading();
      });
    });

  }

  private getTrainingData(new_data: any) {
    console.log('List available data', new_data);
    if (new_data) {
      let all_data = new_data['available-user-data'];
      this.dataContainsType(all_data, 'PHYSICAL_INFORMATION').then(index => {
        let data = all_data[index];
        console.log('Data ', data);
        // Create new transaction.
        this.polarData.create(data['url']).then(transactionIdUrl => {

          // List new physical information.
          this.polarData.list(transactionIdUrl).then(physicalInfoId => {
            let length = Object.keys(physicalInfoId['physical-informations']).length;
            let count = 0;

            for (let info of physicalInfoId['physical-informations']) {
              // Get new physical information.
              this.polarData.get(info).then(physicalInfo => {
                console.log('Get physical info', physicalInfo);
                this.saveData(physicalInfo, 'trainingData');
                count++;
                if (count >= length) {
                  this.TDone = true;
                  if (this.ADone && this.PDone && this.TDone) {
                    this.commitData(transactionIdUrl);
                  }
                }
              }, error => {
                console.error(error);
                count++;
                if (count >= length) {
                  alert('Commit didn\'t work!');
                }
              });
            }//for-loop

          }, error => {
            console.error('List training info', error);
          })
        }, error => {
          console.error('Create training info', error);
        })
      }, () => {
        console.log('NO TRAINING_DATA');
        this.TDone = true;
      });
    } else {
      console.log('No new training info');
    }
  }

  /**
   * This resource allows partners to access their users’ physical information. Whenever some user’s physical
   * information changes, new entry containing full physical info is stored to AccessLink.
   * @param new_data
   */
  getPhysicalInfo(new_data: any) {
    console.log('List available data', new_data);
    if (new_data) {
      let all_data = new_data['available-user-data'];
      this.dataContainsType(all_data, 'PHYSICAL_INFORMATION').then(index => {
        let data = all_data[index];
        console.log('Data ', data);
        // Create new transaction.
        this.polarData.create(data['url']).then(transactionIdUrl => {

          // List new physical information.
          this.polarData.list(transactionIdUrl).then(physicalInfoId => {
            let length = Object.keys(physicalInfoId['physical-informations']).length;
            let count = 0;

            for (let info of physicalInfoId['physical-informations']) {
              // Get new physical information.
              this.polarData.get(info).then(physicalInfo => {
                console.log('Get physical info', physicalInfo);
                this.saveData(physicalInfo, 'physicalInfo');
                count++;
                if (count >= length) {
                  this.PDone = true;
                  if (this.ADone && this.PDone && this.TDone) {
                    this.commitData(transactionIdUrl);
                  }
                }
              }, error => {
                console.error(error);
                count++;
                if (count >= length) {
                  alert('Commit didn\'t work!');
                }
              });
            }//for-loop

          }, error => {
            console.error('List physical info', error);
          })
        }, error => {
          console.error('Create physical info', error);
        })
      }, () => {
        console.log('NO PHYSICAL_INFORMATION');
        this.PDone = true;
      });

    } else {
      console.log('No new physical info');
    }
  }

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
                  this.ADone = true;
                  if (this.ADone && this.PDone && this.TDone) {
                    this.commitData(transactionIdUrl);
                  }
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
        this.ADone = true;
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
      this.dismissLoading();
    }, error => {
      console.error('Physical info committed', error);
      this.dismissLoading();
    })
  }

  /**
   * Logout user, delete Token and set root to LoginPage.
   */
  logout() {
    this.loading = this.loadingCtrl.create({
      content: 'Logging out ... ',
    });

    this.loading.present().then(() => {
      this.polarData.deleteCurrentUser().then(success => {
        console.log('Logout user', success);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('user');
        this.dismissLoading();
        this.navCtrl.setRoot(LoginPage).then(() => {
          this.navCtrl.popToRoot().then(() => {
            console.log('TabsPage left')
          });
        });
      }, error => {
        console.error('Logout user', error);
        this.dismissLoading();
      })
    })
  }

  /**
   * Go to user page.
   */
  goToUserPage() {
    this.navCtrl.push(UserPage).then(() => {
      console.log('Pushed to user page');
    }, () => {
      console.log('Pushed to user page failed');
    });
  }

  /**
   * Open Polar Flow website.
   */
  visitPolarFlow() {
    const browser = this.iab.create('https://flow.polar.com/', '_self', 'location=no');
    browser.show();
  }

  refresh() {
    console.log('Refresh');
    this.checkForNewData();

  }

  /**
   * Dismiss loading.
   */
  dismissLoading() {
    this.loading.dismiss().then(() => {
      console.log('Loading dismissed');
    }, () => {
      console.error('Dismiss Loading');
    });
    this.loading = null;
  }
}
