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
    //localStorage.removeItem('currentUser');
    this.token = JSON.parse(localStorage.getItem('currentUser'));
    let user = JSON.parse(localStorage.getItem('user'));
    console.log('Token logged in ', this.token);
    console.log('User logged in ', user);
    if (this.token) {
      this.rootPage = TabsPage;
    } else {
      this.rootPage = LoginPage;
    }

    platform.ready().then(() => {
      statusBar.styleDefault();
      splashScreen.hide();
      this.localData.startDb();
    });
  }
}

