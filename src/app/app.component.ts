import {Component} from '@angular/core';

import {Platform} from 'ionic-angular';

import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';

import {LoginPage} from "../pages/login/login";
import {TabsPage} from "../pages/tabs/tabs";
import {LocalDataProvider} from "../providers/local-data/local-data";

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  pages: Array<{ title: string, icon: string, component: any }>;
  rootPage: any = LoginPage;
  token: any;

  constructor(private platform: Platform,
              private statusBar: StatusBar,
              private splashScreen: SplashScreen,
              private localData: LocalDataProvider) {

    //localStorage.removeItem('token');
    this.token = JSON.parse(localStorage.getItem('token'));
    console.log('Token logged in ', this.token);

    if (this.token) {
      this.rootPage = TabsPage;
      this.saveDummyData();
      //this.getAllData(this.token);
    } else {
      this.rootPage = LoginPage;
    }

    platform.ready().then(() => {
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }

  saveDummyData() {
    let activityData = [
      {
        "id": 123,
        "polar-user": "https://www.polaraccesslink/v3/users/1",
        "transaction-id": 1234,
        "date": "2010-12-31",
        "created": "2016-04-27T20:11:33.000Z",
        "calories": 2329,
        "active-calories": 428,
        "duration": {"hours": 2, "minutes":45, "seconds": 0},
        "active-steps": 1600
      }, {
        "interval": 0,
        "samples": [
          {
            "steps": 0,
            "time": "12:37:33.000"
          }
        ]
      }, {
        "interval": 0,
        "samples": [
          {
            "activity-zones": [
              {
                "index": 1,
                "inzone": "PT51M5S"
              }
            ],
            "time": "string"
          }
        ]
      }
    ];
    LocalDataProvider.saveActivity("1234", "123", activityData);

    let trainingData = [
      {
        "upload-time": "2008-10-13T10:40:02.000Z",
        "id": 567,
        "polar-user": "https://www.polaraccesslink/v3/users/1",
        "transaction-id": 5678,
        "device": "Polar M400",
        "start-time": "2008-10-13T10:40:02.000Z",
        "duration": {"hours": 2, "minutes":45, "seconds": 0},
        "calories": 530,
        "distance": 1600,
        "heart-rate": {
          "average": 129,
          "maximum": 147
        },
        "training-load": 143.22,
        "sport": "RUNNING",
        "has-route": true,
        "club-id": 999,
        "club-name": "Polar Club",
        "detailed-sport-info": "RUNNING"
      }, {
        "zone": [
          {
            "index": 1,
            "lower-limit": 110,
            "upper-limit": 130,
            "in-zone": "PT4S"
          }
        ]
      }, {}, {}, {
        "recording-rate": 5000,
        "sample-type": "1",
        "data": "0,100,102,97,97,101,103,106,96,89,88,87,98,108,113,112,114,115,118,121,121,121,121,123,117,119,122"
      }
    ];
    LocalDataProvider.saveExercise('5678', '567', trainingData);
  }

  getAllData(token: any) {
    let json = JSON.parse(localStorage.getItem(String(token['x_user_id'])));

    let a_sum = JSON.parse(localStorage.getItem('activity_sum'));
    let a_step = JSON.parse(localStorage.getItem('activity_step'));
    let a_zone = JSON.parse(localStorage.getItem('activity_zone'));

    let p_info = JSON.parse(localStorage.getItem('physicalInfo'));

    let t_sum = JSON.parse(localStorage.getItem('trainingData'));

    console.log('json', json);
    console.log('activity_sum', a_sum);
    console.log('activity_step', a_step);
    console.log('activity_zone', a_zone);
    console.log('physicalInfo', p_info);
    console.log('trainingData', t_sum);
  }
}

