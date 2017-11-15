import {Component} from '@angular/core';

import {Loading, LoadingController, NavController} from 'ionic-angular';

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
  menuPages: Array<{ id: number, title: string, icon: string, component: any }>;
  page1: any = TrainingDataPage;
  page2: any = DailyActivityPage;
  page3: any = PhysicalInfoPage;

  loading: Loading;
  user: any;

  constructor(private navCtrl: NavController,
              private polarData: PolarDataProvider,
              private loadingCtrl: LoadingController) {
    this.menuPages = [
      {id: 1, title: 'Mein Profil', icon: 'md-person', component: UserPage},
      {id: 2, title: 'Bye Bye', icon: 'md-log-out', component: LoginPage}
    ];
  }

  goToPage(page) {
    if (page.id == 2) {
      this.logout();
    } else {
      this.navCtrl.push(page.component).then(() => {
        console.log("Pushed to " + page.title);
      })
    }
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
        alert(error.message);
        this.dismissLoading();
      })
    })
  }

  refresh() {
    this.polarData.listAvailableData().then(success => {
      console.log('Refresh', success);
    }, error => {
      console.log('Refresh', error);
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
