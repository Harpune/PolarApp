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
  rootPage: any = LoginPage;
  tabsPage: any = TabsPage;

  constructor(platform: Platform,
              statusBar: StatusBar,
              splashScreen: SplashScreen) {
    localStorage.removeItem('currentUser');
    platform.ready().then(() => {
      let token = JSON.parse(localStorage.getItem('currentUser'));

      token = {
        "access_token": "2YotnFZFEjr1zCsicMWpAA",
        "token_type": "bearer",
        "expires_in": 31535999,
        "x_user_id": 10579
      };

      console.log('User logged in ', token);
      if (token) {
        this.rootPage = TabsPage;
      } else {
        this.rootPage = LoginPage;
      }

      statusBar.styleDefault();
      splashScreen.hide();

    });
  }
}

