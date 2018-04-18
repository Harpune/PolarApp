import {Component, ViewChild} from '@angular/core';

import {AlertController, Loading, LoadingController, NavController, Tabs, Events} from 'ionic-angular';

import {PolarDataProvider} from "../../providers/polar-data/polar-data";
import {LocalDataProvider} from "../../providers/local-data/local-data";

import {TrainingDataPage} from "../training-data/training-data";
import {DailyActivityPage} from "../daily-activity/daily-activity";
import {PhysicalInfoPage} from "../physical-info/physical-info";
import {SettingsPage} from "../settings/settings";
import {UserPage} from "../user/user";
import {LoginPage} from "../login/login";

import {datatypes} from "../../assets/data/datatypes";

import {Observable} from 'rxjs/Rx';
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

  refreshing: boolean = false;

  constructor(private navCtrl: NavController,
              private polarData: PolarDataProvider,
              private localData: LocalDataProvider,
              private events: Events,
              private loadingCtrl: LoadingController,
              private alertCtrl: AlertController) {
    this.menuPages = [
      {id: 0, title: 'Mein Profil', icon: 'person', component: UserPage},
      {id: 1, title: 'Über geiler JSON', icon: 'bug', component: null},
      {id: 2, title: 'Einstellungen', icon: 'settings', component: SettingsPage},
      {id: 3, title: 'Bye Bye', icon: 'exit', component: LoginPage}
    ];
  }

  ionViewDidLoad() {
    Observable.interval(1000 * 60 * 10).startWith(0).subscribe(trigger => {
      console.log('No. ' + trigger + ': 10 minutes more');
      this.refresh()
    });
  }

  refresh() {
    this.refreshing = true;

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
              this.refreshing = false;
            }
          }, {
            text: 'Ja',
            handler: () => {
              console.log('Refresh', 'Ok clicked');
              this.getNewData(success).then(success => {
                console.log('Refresh', 'Success', success);
                this.refreshing = false;
              }, error => {
                console.error('Refresh', 'Error', error);
                this.refreshing = false;
              });
            }
          }
        ]
      });
      alert.present();
    }, error => {
      this.refreshing = false;
      console.log('Refresh', 'Keine neue Daten', error);
      if (error == 'Timeout') {
        alert('Das hat zu lange gedauert. Bitte überprüfe deine Internetverbingung.')
      }
    })
  }

  /**
   * Get all the data provided by the Polar API.
   * @param success
   * @returns {Promise<JSON>}
   */
  getNewData(success: any): Promise<any> {
    return new Promise(((resolve, reject) => {
      // Run through the available user data.
      success['available-user-data'].forEach((item) => {
        console.log('Get new data', 'Available user data', item);

        // Create the transaction.
        this.polarData.create(item['url']).then(create => {
          console.log('Get new data', 'Create', create);

          // List the transaction.
          this.polarData.list(create['resource-uri']).then(list => {
            console.log('Get new data', 'List', list);
            // TODO change duration format in save method.

            //////////////////////////////////////////////////////////////////////
            // Get the exercise of the available data                           //
            //////////////////////////////////////////////////////////////////////
            let exercise = list['exercises'];
            console.log('Get new data', 'Exercise', exercise);

            if (exercise) { // If true there is new exercise data.
              let exerciseLength = Object.keys(exercise).length;

              // Get all exercise data.
              exercise.forEach((info, exerciseIndex) => {
                console.log('Get new data', 'Exercise', info);

                // Get all data.
                Observable.forkJoin([
                  this.polarData.get(info),
                  this.polarData.get(info + '/heart-rate-zones'),
                  this.polarData.getGPX(info + '/gpx'),
                  this.polarData.getTCX(info + '/tcx'),
                  this.polarData.get(info + '/samples')
                ]).subscribe(get => {


                  // Get sample length.
                  let sampleLength = Object.keys(get[4]['samples']).length;
                  let samples = [];

                  // Get all the samples.
                  get[4]['samples'].forEach((sample, sampleIndex) => {
                    this.polarData.get(sample).then(s => {
                      samples.push(s);

                      // When all sample responded.
                      if (sampleIndex >= sampleLength - 1) {
                        // Save the data.
                        get[4] = samples;
                        console.log('Get new data', 'Exercise', 'Data', get);

                        // Save the data.
                        LocalDataProvider.save(datatypes['exercise'], get);

                        // When all exercises responded.
                        if (exerciseIndex >= exerciseLength - 1) {
                          // Commit the transaction.
                          this.polarData.commit(create['resource-uri']).then(success => {

                            // Notify the Tab.
                            this.events.publish('exercise:data', true);

                            resolve(success);
                          }, error => {
                            reject(error);
                          });

                        }
                      }
                    })
                  })
                })
              });
            }

            //////////////////////////////////////////////////////////////////////
            // Get the activity of the available data                           //
            //////////////////////////////////////////////////////////////////////
            let activity = list['activity-log'];
            console.log('Get new data', 'Activity', activity);
            if (activity) { // If true there is new activity data.
              let activityLength = Object.keys(activity).length;

              // Get all activity data.
              activity.forEach((info, activityIndex) => {
                console.log('Get new data', 'Activity log', info);

                // Get all data.
                Observable.forkJoin(
                  this.polarData.get(info),
                  this.polarData.get(info + '/step-samples'),
                  this.polarData.get(info + '/zone-samples'),
                ).subscribe(get => {
                  console.log('Get new data', 'Activity', 'Data', get);

                  // Save the data.
                  LocalDataProvider.save(datatypes['activity'], get);

                  if (activityIndex >= activityLength - 1) {
                    console.log('Get new data', 'Activity', 'Done');

                    // Commit the transaction.
                    this.polarData.commit(create['resource-uri']).then(success => {
                      /*
                      TODO firgure out when to publish
                      - after commit
                      - before commit after done with requests
                      - after every save
                       */
                      // Notify the Tab.
                      this.events.publish('activity:data', true);

                      resolve(success);
                    }, error => {
                      reject(error);
                    })
                  }
                }, error => {
                  reject(error);
                })
              });
            }

            //////////////////////////////////////////////////////////////////////
            // Get the physical of the available data                           //
            //////////////////////////////////////////////////////////////////////
            let physical = list['physical-informations'];
            console.log('Get new data', 'Physical', physical);
            if (physical) { // If true there is new physical data.
              let physicalLength = Object.keys(physical).length;

              // Get all physical data.
              physical.forEach((info, physicalIndex) => {
                console.log('Get new data', 'Physical Information', info);

                // Get all data.
                Observable.forkJoin(
                  this.polarData.get(info)
                ).subscribe(get => {
                  // Change duration format.
                  console.log('Get new data', 'Physical', 'Data', JSON.stringify(get));

                  // Save the data.
                  LocalDataProvider.save(datatypes['physical'], get);

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
            }
          })
        }, error => {
          reject(error);
        })
      });
    }))
  }

  goToPage(page) {
    this.menuPages = [
      {id: 0, title: 'Mein Profil', icon: 'person', component: UserPage},
      {id: 1, title: 'Über geiler JSON', icon: 'bug', component: null},
      {id: 2, title: 'Einstellungen', icon: 'settings', component: SettingsPage},
      {id: 3, title: 'Bye Bye', icon: 'exit', component: LoginPage}
    ];

    console.log('Page', page);
    switch (page.id) {
      case 1:
        let token = JSON.parse(localStorage.getItem('token'));
        let json = JSON.parse(localStorage.getItem(String(token['x_user_id'])));

        console.log('Da hast du ihn', json);

        this.localData.get(datatypes['physical']).then(success => {
          console.log('Das auch noch', 'Physical', 'Success', success);
        }, error => {
          console.log('Das nicht', 'Physical', 'Error', error);
        });

        this.localData.get(datatypes['activity']).then(success => {
          console.log('Das auch noch', 'Activity', 'Success', success);
        }, error => {
          console.log('Das nicht', 'Activity', 'Error', error);
        });

        this.localData.get(datatypes['exercise']).then(success => {
          console.log('Das auch noch', 'Exercise', 'Success', success);
        }, error => {
          console.log('Das nicht', 'Exercise', 'Error', error);
        });
        break;
      case 3:
        this.navCtrl.setRoot(LoginPage).then(() => {
          this.navCtrl.popToRoot().then(() => {
            console.log('Logout', 'TabsPage left')
          });
        });
        break;
      default:
        this.navCtrl.push(page.component).then(() => {
          console.log('Go To Page', page.title);
        })
    }
  }
}
