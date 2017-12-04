import {Component, ViewChild} from '@angular/core';

import {AlertController, Loading, LoadingController, NavController, Tabs, Events} from 'ionic-angular';


import {PolarDataProvider} from "../../providers/polar-data/polar-data";

import {TrainingDataPage} from "../training-data/training-data";
import {DailyActivityPage} from "../daily-activity/daily-activity";
import {PhysicalInfoPage} from "../physical-info/physical-info";

import {UserPage} from "../user/user";
import {LoginPage} from "../login/login";
import {Observable} from "rxjs/Observable";
import {LocalDataProvider} from "../../providers/local-data/local-data";
import {parse, end, toSeconds, pattern} from 'iso8601-duration';

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
              private localData: LocalDataProvider,
              private events: Events,
              private loadingCtrl: LoadingController,
              private alertCtrl: AlertController) {
    this.menuPages = [
      {id: 0, title: 'Über geiler JSON', icon: 'md-person', component: UserPage},
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
    //TODO add refresh icon animation instead of alert
    this.loading = this.loadingCtrl.create({
      content: 'Getting data ...',
    });

    this.loading.present().then(() => {
      this.polarData.listAvailableData().then(success => {
        console.log('Refresh', 'Neue Daten', success);
        let alert = this.alertCtrl.create({
          title: 'Neue Daten!',
          message: 'Wollen Sie die neuen Daten herunterladen?',
          buttons: [
            {
              text: 'Nein',
              role: 'cancel',
              handler: () => {
                console.log('Refresh', 'Cancel clicked');
                this.dismissLoading();
              }
            }, {
              text: 'Ja',
              handler: () => {
                console.log('Refresh', 'Ok clicked');
                this.getNewData(success).then(success => {
                  console.log('Refresh', 'Success', success);
                  this.dismissLoading();
                }, error => {
                  console.error('Refresh', 'Error', error);
                  this.dismissLoading();
                });
              }
            }
          ]
        });
        alert.present();
      }, error => {
        this.dismissLoading();
        console.log('Refresh', 'Keine neue Daten', error);
        if (error == 'Timeout') {
          alert('Das hat zu lange gedauert. Bitte überprüfe deine Internetverbingung.')
        }
      })
    });
  }

  getNewData(success: any): Promise<any> {
    return new Promise(((resolve, reject) => {
      success['available-user-data'].forEach((item, index) => {
        console.log('Get new data', 'Available user data', item);
        this.polarData.create(item['url']).then(create => {
          console.log('Get new data', 'Create', create);

          this.polarData.list(create['resource-uri']).then(list => {
            console.log('Get new data', 'List', list);

            let exercise = list['exercise'];
            console.log('Get new data', 'Exercise', exercise);
            if (exercise != null && exercise.constructor === Object) {
              let exerciseLength = Object.keys(exercise).length;
              exercise.forEach((info, exerciseIndex) => {
                console.log('Get new data', 'Exercise', info);
              });
            }

            let activity = list['activity-log'];
            console.log('Get new data', 'Activity', activity);
            if (activity) {
              let activityLength = Object.keys(activity).length;
              activity.forEach((info, activityIndex) => {
                console.log('Get new data', 'Activity log', info);

                Observable.forkJoin(
                  this.polarData.get(info),
                  this.polarData.get(info + '/step-samples'),
                  this.polarData.get(info + '/zone-samples'),
                ).subscribe(get => {

                  let splitUrl = info.split('/');
                  let last = splitUrl.length - 1;

                  console.log('Get new data', 'Activity', 'Data', get);
                  console.log('Get new data', 'Activity', 'Info', splitUrl[last]);

                  let temp = get[0];
                  get[0]['duration'] = parse(temp['duration']);

                  // Save the data.
                  LocalDataProvider.saveActivity(create['transaction-id'], splitUrl[last], get);

                  if (activityIndex >= activityLength - 1) {
                    console.log('Get new data', 'Activity', 'Done');

                    // Commit the transaction.
                    this.polarData.commit(create['resource-uri']).then(success => {
                      this.events.publish('activity:data', true);
                      resolve(success);
                    }, error => {
                      reject(error);
                    })
                  }

                  reject('Hallo');
                }, error => {
                  reject(error);
                })
              });
            }

            let physical = list['physical-informations'];
            console.log('Get new data', 'Physical', physical);
            if (physical) {
              let physicalLength = Object.keys(physical).length;
              physical.forEach((info, physicalIndex) => {
                console.log('Get new data', 'Physical Information', info);

                Observable.forkJoin(
                  this.polarData.get(info)
                ).subscribe(get => {

                  let splitUrl = info.split('/');
                  let last = splitUrl.length - 1;

                  console.log('Get new data', 'Physical', 'Data', get);
                  console.log('Get new data', 'Physical', 'Info', splitUrl[last]);

                  // Save the data.
                  LocalDataProvider.savePhysical(create['transaction-id'], splitUrl[last], get);


                  if (physicalIndex >= physicalLength - 1) {
                    console.log('Get new data', 'Physical', 'Done');

                    // Commit the transaction.
                    this.polarData.commit(create['resource-uri']).then(success => {
                      this.events.publish('physical:data', true);
                      resolve(success);
                    }, error => {
                      reject(error);
                    })
                  }
                }, error => {
                  reject(error);
                })
              });
            } else {
              reject();
            }
          })
        }, error => {
          reject(error);
        })
      });
    }))
  }

  goToPage(page) {
    if (page.id == 0) {
      let token = JSON.parse(localStorage.getItem('token'));
      let json = JSON.parse(localStorage.getItem(String(token['x_user_id'])));

      console.log('Da hast du ihn', json);

      this.localData.getPhysical().then(success => {
        console.log('Das auch noch', 'Physical', 'Success', success);
      }, error => {
        console.log('Das nicht', 'Physical', 'Error', error);
      });

      this.localData.getActivity().then(success => {
        console.log('Das auch noch', 'Activity', 'Success', success);
      }, error => {
        console.log('Das nicht', 'Activity', 'Error', error);
      });

    } else if (page.id == 2) {
      this.logout();
    } else {
      this.navCtrl.push(page.component).then(() => {
        console.log('Go To Page', page.title);
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
        console.log('Logout', success);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('user');
        this.dismissLoading();
        this.navCtrl.setRoot(LoginPage).then(() => {
          this.navCtrl.popToRoot().then(() => {
            console.log('Logout', 'TabsPage left')
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
