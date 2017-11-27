import {Component, ViewChild} from '@angular/core';

import {AlertController, Loading, LoadingController, NavController, Tabs} from 'ionic-angular';

import {PolarDataProvider} from "../../providers/polar-data/polar-data";

import {TrainingDataPage} from "../training-data/training-data";
import {DailyActivityPage} from "../daily-activity/daily-activity";
import {PhysicalInfoPage} from "../physical-info/physical-info";

import {UserPage} from "../user/user";
import {LoginPage} from "../login/login";
import {Observable} from "rxjs/Observable";

@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html',
})

export class TabsPage {
  @ViewChild('myTabs') tabs: Tabs;

  menuPages: Array<{ id: number, title: string, icon: string, component: any }>;
  page1: any = TrainingDataPage;
  page2: any = DailyActivityPage;
  page3: any = PhysicalInfoPage;

  loading: Loading;
  user: any;

  constructor(private navCtrl: NavController,
              private polarData: PolarDataProvider,
              private loadingCtrl: LoadingController,
              private alertCtrl: AlertController) {
    this.menuPages = [
      {id: 1, title: 'Mein Profil', icon: 'md-person', component: UserPage},
      {id: 2, title: 'Bye Bye', icon: 'md-log-out', component: LoginPage}
    ];
  }

  ionViewDidLoad() {
    Observable.interval(1000 * 60 * 10).startWith(0).subscribe(trigger => {
      console.log('No. ' + trigger + ': 10 minutes more');
      this.getNewData()
    });
  }

  getNewData() {
    this.loading = this.loadingCtrl.create({
      content: 'Getting data ...',
    });

    this.loading.present().then(() => {
      this.polarData.listAvailableData().then(success => {
        success['available-user-data'].forEach((item, index) => {
          console.log('Available user data', item);
          this.polarData.create(item['url']).then(transactionId => {
            console.log('Create', item);
            this.polarData.list(transactionId['resource-uri']).then(data => {
              console.log('List', item);

              let exerciseLength = Object.keys(data['exercise']).length;
              let exerciseData = [];
              let exerciseInfo = [];
              data['exercise'].forEach((item, index) => {
                console.log('Exercise', item);
              });

              let activityLength = Object.keys(data['activity-log']).length;
              let activityData = [];
              let activityInfo = [];
              data['activity-log'].forEach((item, index) => {
                console.log('Activity log', item);
              });

              let physicalLength = Object.keys(data['physical-informations']).length;
              let physicalData = [];
              let physicalInfo = [];
              data['physical-information'].forEach((info, physicalIndex) => {
                console.log('Physical Information', item);
                Observable.forkJoin(
                  this.polarData.get(item)
                ).subscribe(success => {
                  let splitUrl = info.split('/');
                  let last = splitUrl.length - 1;

                  physicalData.push(data);
                  physicalInfo.push(splitUrl[last]);//TODO change to exercise id.

                  console.log('Data', physicalData);
                  console.log('Info', physicalInfo);
                  /*
                  if (physicalIndex >= physicalLength - 1) {
                    // Save the data.
                    LocalDataProvider.savePhysical(transaction['transaction-id'], _info, _data);

                    // Commit the transaction.
                    this.polarData.commit(transaction['resource-uri']).then(success => {
                      resolve(success);
                    }, error => {
                      reject(error);
                    })
                  }
                  */
                }, error => {

                })
              });
            })
          }, error => {
            console.log(error);
          })
        });
      }, error => {
        console.log(error);
      })
    })
  }

  goToPage(page) {
    if (page.id == 2) {
      this.logout();
    } else {
      this.navCtrl.push(page.component).then(() => {
        console.log("Pushed to " + page.title);
      })
    }
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
        alert(error.message);
        this.dismissLoading();
      })
    })
  }

  refresh() {
    this.polarData.listAvailableData().then(success => {
      console.log('Refresh', success);
      let alert = this.alertCtrl.create({
        title: 'Neue Daten!',
        message: 'Wollen Sie die neuen Daten herunterladen?',
        buttons: [
          {
            text: 'Nein',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Ja',
            handler: () => {
              console.log('Buy clicked');
            }
          }
        ]
      });
      alert.present();
    }, error => {
      console.log('Refresh', error);
      alert('Keine neuen Daten')
    })
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
