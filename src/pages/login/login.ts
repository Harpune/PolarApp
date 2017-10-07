import {Component} from '@angular/core';
import {Loading, LoadingController, NavController, Platform} from 'ionic-angular';
import {PolarDataProvider} from "../../providers/polar-data/polar-data";
import {TabsPage} from "../tabs/tabs";

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  loading: Loading;

  constructor(public navCtrl: NavController,
              private platform: Platform,
              public polarData: PolarDataProvider,
              public loadingCtrl: LoadingController) {
  }

  login() {
    // Triggered when Platform is ready.
    this.platform.ready().then(() => {
      // Start Authorization Process.
      this.polarData.getAuthorizationCode().then(code => {

        this.loading = this.loadingCtrl.create({
          content: 'micro momentito',
          dismissOnPageChange: true
        });

        // Presents the loading Icon.
        this.loading.present().then(() => {
          // Get the Access-Token.
          this.polarData.getAccessToken(code).then(tokenData => {
            // Parse data to Json and read.
            console.log('AccessToken', tokenData);
            localStorage.setItem('currentUser', JSON.stringify(tokenData));
            // Register the User. ionic-native.
            this.polarData.registerUser(tokenData).then(success => {
              console.log('Register User Success: ', success);
              localStorage.setItem('user', JSON.stringify(success));
              this.navCtrl.setRoot(TabsPage);
              this.navCtrl.popToRoot();
              this.dismissLoading();
            }, error => {
              console.log('Register User error: ' + error);
              console.log('Register User error: ' + error.status);
              console.log('Register User error: ' + error.error);
              this.dismissLoading();
            });
          }, accessTokenError => {
            console.log('Get Access Token', accessTokenError);
            this.dismissLoading();
          });//getAccessToken
        }, loadingError => {
          console.log('Present Loading', loadingError);
          this.dismissLoading();
        });//loading
      }, authError => {
        console.log('Get Authorization Code', authError);
      });//getAuthorizationCode
    }, idSecretError => {
      console.log('Get ID and secret', idSecretError);
    });//platform.
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
