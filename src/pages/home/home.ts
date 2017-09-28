import {Component} from '@angular/core';
import {Loading, LoadingController, NavController, Platform} from 'ionic-angular';
import {LocalDataProvider} from "../../providers/local-data/local-data";
import {PolarDataProvider} from "../../providers/polar-data/polar-data";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  data: any;
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
      // Start Authorization Process.
      this.polarData.getAuthorizationCode().then(code => {

        this.loading = this.loadingCtrl.create({
          content: 'micro momentito',
          dismissOnPageChange: true
        });

        // Presents the loading Icon.
        this.loading.present().then(() => {
          // Get Secret and Id from local json file.
          this.localData.getIdAndSecret().subscribe(creds => {
            // Get the Access-Token.
            this.polarData.getAccessToken(code, creds).subscribe(tokenData => {
              // Parse data to Json and read.
              console.log('AccessToken', tokenData);
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
            }, error => {
              console.log("getAccessToken", error);
              this.dismissLoading();
            });//getAccessToken
          }, error => {
            console.log("GetIdAndSecret", error);
            this.dismissLoading();
          });//GetIdAndSecret
        });//loading
      }, (error) => {
        alert(error);
      });//getAuthorizationCode
    });//platform.
  }

  dismissLoading() {
    this.loading.dismiss();
    this.loading = null;
  }

}
