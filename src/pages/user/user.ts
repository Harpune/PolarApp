import {Component} from '@angular/core';
import {Loading, LoadingController, NavController, NavParams} from 'ionic-angular';
import {PolarDataProvider} from "../../providers/polar-data/polar-data";

@Component({
  selector: 'page-user',
  templateUrl: 'user.html',
})

export class UserPage {
  loading: Loading;
  user: any;

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public loadingCtrl: LoadingController,
              public polarData: PolarDataProvider) {
    let user = localStorage.getItem('user');
    this.user = JSON.parse(user);
    console.log(this.user);
  }

  getUserData() {
    this.loading = this.loadingCtrl.create({
      content: 'Search for user information',
    });

    this.loading.present().then(() => {
      this.polarData.getUserInformation().then(success => {
        this.user = success;
        console.log('Get User Information', success);
        this.dismissLoading();
      }, error => {
        console.log('Get User Information', error);
        this.dismissLoading();
      });
    });
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
