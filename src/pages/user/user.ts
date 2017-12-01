import {Component} from '@angular/core';
import {Loading, LoadingController} from 'ionic-angular';
import {PolarDataProvider} from "../../providers/polar-data/polar-data";
import {LocalDataProvider} from "../../providers/local-data/local-data";

@Component({
  selector: 'page-user',
  templateUrl: 'user.html',
})

export class UserPage {
  loading: Loading;
  user: any = [];

  constructor(public loadingCtrl: LoadingController,
              public localData: LocalDataProvider,
              public polarData: PolarDataProvider) {
  }

  ionViewDidLoad() {

    this.localData.getUser()
      .then(success => {
        this.user = success;
      }, error => {
        console.log('User Page', 'Get User', error);
      }).then(() => {
      this.getUserData().then(user => {
        this.user = user;
      }, error => {
        console.log('User Page', 'Get User Data', error);
      });
    })
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
