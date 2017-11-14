import {Component, ViewChild} from '@angular/core';

import {Nav, Platform} from 'ionic-angular';

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

  constructor(private platform: Platform,
              private statusBar: StatusBar,
              private splashScreen: SplashScreen,) {
    //localStorage.removeItem('currentUser');
    let token = JSON.parse(localStorage.getItem('currentUser'));
    console.log('User logged in ', token);
    if (token) {
      this.rootPage = TabsPage;
    } else {
      this.rootPage = LoginPage;
    }

    platform.ready().then(() => {
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }

}

