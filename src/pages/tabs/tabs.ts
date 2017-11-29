import {Component, ViewChild} from '@angular/core';

import {AlertController, Loading, LoadingController, NavController, Tabs} from 'ionic-angular';

import {PolarDataProvider} from "../../providers/polar-data/polar-data";

import {TrainingDataPage} from "../training-data/training-data";
import {DailyActivityPage} from "../daily-activity/daily-activity";
import {PhysicalInfoPage} from "../physical-info/physical-info";

import {UserPage} from "../user/user";
import {LoginPage} from "../login/login";
import {Observable} from "rxjs/Observable";
import {LocalDataProvider} from "../../providers/local-data/local-data";

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
      this.refresh()
    });
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
          }, {
            text: 'Ja',
            handler: () => {
              console.log('Ok clicked');
              this.getNewData(success).then(success => {
                console.log('Get new data', success);
                this.dismissLoading();
              }, error => {
                console.error('Get new data', error);
                this.dismissLoading();
              });
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

  getNewData(success: any): Promise<any> {
    this.loading = this.loadingCtrl.create({
      content: 'Getting data ...',
    });

    return new Promise(((resolve, reject) => {
      this.loading.present().then(() => {
        success['available-user-data'].forEach((item, index) => {
          console.log('Available user data', item);
          this.polarData.create(item['url']).then(create => {
            console.log('Create', create);

            this.polarData.list(create['resource-uri']).then(list => {
              console.log('List', list);

              let exercise = list['exercise'];
              console.log('Exercise', exercise);
              if (exercise != null && exercise.constructor === Object) {
                let exerciseLength = Object.keys(exercise).length;
                let exerciseData = [];
                let exerciseInfo = [];
                exercise.forEach((item, index) => {
                  console.log('Exercise', item);
                });
              }

              let activity = list['activity-log'];
              console.log('Activity', activity);
              if (activity != null && activity.constructor === Object) {
                let activityLength = Object.keys(activity).length;
                let activityData = [];
                let activityInfo = [];
                activity.forEach((item, index) => {
                  console.log('Activity log', item);
                });
              }

              let physical = list['physical-informations'];
              console.log('Physical', physical);
              if (physical) {
                let physicalLength = Object.keys(physical).length;
                let physicalData = [];
                physical.forEach((info, physicalIndex) => {
                  console.log('Physical Information', info);

                  Observable.forkJoin(
                    this.polarData.get(info)
                  ).subscribe(get => {
                    physicalData.push(get);

                    let splitUrl = info.split('/');
                    let last = splitUrl.length - 1;

                    console.log('Data', get, physicalData);
                    console.log('Info', splitUrl[last]);

                    if (physicalIndex >= physicalLength - 1) {
                      console.log('DONE');
                      // Save the data.
                      LocalDataProvider.savePhysical(create['transaction-id'], splitUrl[last], physicalData);

                      // Commit the transaction.
                      this.polarData.commit(create['resource-uri']).then(success => {
                        console.log(success);
                        resolve(success);
                      }, error => {
                        reject(error);
                      })

                    }


                  }, error => {
                    console.log(error);
                    reject(error);
                  })
                });

                resolve('TOPKEK');
              }
            })
          }, error => {
            console.log(error);
            reject(error);
          })
        });
      })
    }))
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
    //TODO Do not delete token, rather than push to LoginPAge
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
