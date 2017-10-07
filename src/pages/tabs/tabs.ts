import {Component} from '@angular/core';

import {Loading, LoadingController, NavController} from 'ionic-angular';

import {InAppBrowser} from "@ionic-native/in-app-browser";

import {TrainingPage} from "../training/training";
import {HomePage} from "../home/home";
import {UserPage} from "../user/user";
import {LoginPage} from "../login/login";
import {PolarDataProvider} from "../../providers/polar-data/polar-data";

@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html',
})
export class TabsPage {
  page1 = HomePage;
  page2 = TrainingPage;
  page3 = UserPage;

  loading: Loading;
  user: any;

  constructor(public navCtrl: NavController,
              private polarData: PolarDataProvider,
              public loadingCtrl: LoadingController,
              private iab: InAppBrowser) {
  }

  logout() {
    this.loading = this.loadingCtrl.create({
      content: 'Logging out ... ',
      dismissOnPageChange: true
    });

    this.loading.present().then(() => {
      this.polarData.deleteCurrentUser().then(success => {
        console.log('Logout user success', success);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('user');
        this.navCtrl.setRoot(LoginPage);
        this.navCtrl.popToRoot();
        this.dismissLoading();
      }, error => {
        console.log('Logout user error', error);
        this.dismissLoading();
      })
    })
  }

  visitPolarFlow() {
    const browser = this.iab.create('https://flow.polar.com/', '_self', 'location=no');
    browser.show();
  }

  dismissLoading() {
    this.loading.dismiss().then(() => {
      console.log('Dismiss Loading succeeded');
    }, () => {
      console.log('Present Loading error');
    });
    this.loading = null;
  }
}
