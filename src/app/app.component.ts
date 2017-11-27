import {Component} from '@angular/core';

import {Platform} from 'ionic-angular';

import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';

import {LoginPage} from "../pages/login/login";
import {TabsPage} from "../pages/tabs/tabs";

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  pages: Array<{ title: string, icon: string, component: any }>;
  rootPage: any = LoginPage;
  token: any;

  constructor(private platform: Platform,
              private statusBar: StatusBar,
              private splashScreen: SplashScreen) {
    //localStorage.removeItem('token');
    this.token = JSON.parse(localStorage.getItem('token'));
    console.log('Token logged in ', this.token);

    if (this.token) {
      this.rootPage = TabsPage;
      this.getAllData();
    } else {
      this.rootPage = LoginPage;
    }

    platform.ready().then(() => {
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }

  getAllData() {
    let user = JSON.parse(localStorage.getItem(String(this.token.x_user_id)));

    let a_sum = JSON.parse(localStorage.getItem('activity_sum'));
    let a_step = JSON.parse(localStorage.getItem('activity_step'));
    let a_zone = JSON.parse(localStorage.getItem('activity_zone'));

    let p_info = JSON.parse(localStorage.getItem('physicalInfo'));

    let t_sum = JSON.parse(localStorage.getItem('trainingData'));

    console.log('user', user);
    console.log('activity_sum', a_sum);
    console.log('activity_step', a_step);
    console.log('activity_zone', a_zone);
    console.log('physicalInfo', p_info);
    console.log('trainingData', t_sum);
  }
}

