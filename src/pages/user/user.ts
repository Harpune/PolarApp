import {Component} from '@angular/core';
import {Loading, LoadingController} from 'ionic-angular';
import {PolarDataProvider} from "../../providers/polar-data/polar-data";

@Component({
  selector: 'page-user',
  templateUrl: 'user.html',
})

export class UserPage {
  loading: Loading;
  user: any = [];

  constructor(public loadingCtrl: LoadingController,
              public polarData: PolarDataProvider) {
  }

  ionViewDidLoad() {
    let token = JSON.parse(localStorage.getItem('token'));
    this.user = JSON.parse(localStorage.getItem(String(token.x_user_id)));
    if (this.user) {
      console.log(this.user);
    } else {
      this.getUserData().then(success => {
        this.user = success;
        console.log('Get User Information', success);
      }, error => {
        console.log('Get User Information', error);
      });
    }

  }

  getUserData(): Promise<any> {
    return new Promise(((resolve, reject) => {

      this.loading = this.loadingCtrl.create({
        content: 'Search for user information',
      });

      this.loading.present().then(() => {
        this.polarData.getUserInformation().then(success => {
          this.dismissLoading();
          resolve(success);
        }, error => {
          this.dismissLoading();
          reject(error);

        });
      });
    }));
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
