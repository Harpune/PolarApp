import {Component} from '@angular/core';
import {Loading, LoadingController, NavController, Platform} from 'ionic-angular';
import {LocalDataProvider} from "../../providers/local-data/local-data";
import {PolarDataProvider} from "../../providers/polar-data/polar-data";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  token: any;
  loading: Loading;

  constructor(public navCtrl: NavController,
              private platform: Platform,
              private polarData: PolarDataProvider,
              private localData: LocalDataProvider,
              public loadingCtrl: LoadingController) {
  }

  start() {
    // Triggered when Platform is ready.
    this.platform.ready().then(() => {
      // Get Secret and Id from local json file.
      this.localData.getIdAndSecret().subscribe(creds => {
        // Start Authorization Process.
        this.polarData.getAuthorizationCode().then(code => {

          this.loading = this.loadingCtrl.create({
            content: 'micro momentito',
            dismissOnPageChange: true
          });

          // Presents the loading Icon.
          this.loading.present().then(() => {
            // Get the Access-Token.
            this.polarData.getAccessToken(code, creds).subscribe(tokenData => {
              // Parse data to Json and read.
              console.log('AccessToken', tokenData);
              localStorage.setItem('currentUser', JSON.stringify(tokenData));
              // Register the User. ionic-native.
              this.polarData.registerUser(tokenData).subscribe(success => {
                console.log('Register User Success: ' + success);
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
      });//GetIdAndSecret
    });//platform.
  }

  getUserData(){
    this.loading = this.loadingCtrl.create({
      content: 'Search for user information',
    });

    this.loading.present().then(() => {
      this.polarData.getUserInformation().subscribe(success => {
        console.log('Get User Information', success);
      }, error => {
        console.log('Get User Information', error);
      },() => {
        this.dismissLoading();
      });
    });

  }

  deleteUser(){
    this.loading = this.loadingCtrl.create({
      content: 'I\'m sorry to see you leave',
    });

    this.loading.present().then(() => {
      this.polarData.deleteCurrentUser().subscribe(success => {
        console.log('Delete User Success', success);
        localStorage.removeItem('currentUser');
      }, error => {
        console.log('Delete User Error', error);
      },() => {
        this.dismissLoading();
      });
    });
  }

  dismissLoading() {
    this.loading.dismiss().then(success => {
      console.log('Dismiss Loading', success);
    }, loadingError => {
      console.log('Present Loading', loadingError);
    });
    this.loading = null;
  }

}
