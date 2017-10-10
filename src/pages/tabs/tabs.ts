import {Component} from '@angular/core';

import {Loading, LoadingController, NavController, Platform} from 'ionic-angular';

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

  constructor(private navCtrl: NavController,
              private polarData: PolarDataProvider,
              private loadingCtrl: LoadingController,
              private iab: InAppBrowser) {
  }

  logout() {
    this.loading = this.loadingCtrl.create({
      content: 'Logging out ... ',
    });

    this.loading.present().then(() => {
      this.polarData.deleteCurrentUser().then(success => {
        console.log('Logout user', success);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('user');
        this.navCtrl.setRoot(LoginPage).then(() => {
          this.navCtrl.popToRoot();
          this.dismissLoading();
        });
      }, error => {
        console.error('Logout user', error);
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
      console.log('Loading dismissed');
    }, () => {
      console.error('Dismiss Loading');
    });
    this.loading = null;
  }
}
