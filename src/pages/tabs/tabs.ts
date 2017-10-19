import {Component} from '@angular/core';

import {Loading, LoadingController, NavController} from 'ionic-angular';

import {InAppBrowser} from "@ionic-native/in-app-browser";

import {PolarDataProvider} from "../../providers/polar-data/polar-data";

import {TrainingDataPage} from "../training-data/training-data";
import {DailyActivityPage} from "../daily-activity/daily-activity";
import {PhysicalInfoPage} from "../physical-info/physical-info";
import {UserPage} from "../user/user";
import {LoginPage} from "../login/login";

@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html',
})

export class TabsPage {
  page1 = TrainingDataPage;
  page2 = DailyActivityPage;
  page3 = PhysicalInfoPage;

  loading: Loading;
  user: any;

  constructor(private navCtrl: NavController,
              private polarData: PolarDataProvider,
              private loadingCtrl: LoadingController,
              private iab: InAppBrowser) {

  }

  /**
   * Logout user, delete Token and set root to LoginPage.
   */
  logout() {
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
        this.dismissLoading();
      })
    })
  }

  /**
   * Go to user page.
   */
  goToUserPage() {
    this.navCtrl.push(UserPage).then(() => {
      console.log('Pushed to user page');
    }, () => {
      console.log('Pushed to user page failed');
    });
  }

  /**
   * Open Polar Flow website.
   */
  visitPolarFlow() {
    const browser = this.iab.create('https://flow.polar.com/', '_self', 'location=no');
    browser.show();
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
