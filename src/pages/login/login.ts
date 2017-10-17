import {Component} from '@angular/core';
import {Loading, LoadingController, NavController, Platform} from 'ionic-angular';
import {PolarDataProvider} from "../../providers/polar-data/polar-data";
import {TabsPage} from "../tabs/tabs";
import {InAppBrowser} from "@ionic-native/in-app-browser";

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  loading: Loading;

  constructor(public navCtrl: NavController,
              private platform: Platform,
              public polarData: PolarDataProvider,
              public loadingCtrl: LoadingController,
              public iab: InAppBrowser) {

    // TODO: Angemeldet als Lukas - Nicht Lukas
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
              this.dismissLoading();
              this.navCtrl.setRoot(TabsPage).then(() => {
                this.navCtrl.popToRoot().then(() => {
                  console.log('Pop to root');
                }, () => {
                  console.log('Pop to root failed');
                });
              });
            }, error => {
              console.error('Register User error: ' + error);
              console.error('Register User error: ' + error.status);
              console.error('Register User error: ' + error.error);

              if(error.status == 409){
                this.handle409(tokenData);
              }

            });
          }, accessTokenError => {
            console.error('Get Access Token', accessTokenError);
            this.dismissLoading();
          });//getAccessToken
        }, loadingError => {
          console.error('Present Loading', loadingError);
          this.dismissLoading();
        });//loading
      }, authError => {
        console.error('Get Authorization Code', authError);
      });//getAuthorizationCode
    }, idSecretError => {
      console.error('Get ID and secret', idSecretError);
    });//platform.
  }

  register() {
    this.platform.ready().then(() => {
      let browser = this.iab.create('https://flow.polar.com/register', '_self', 'location=no');
      browser.on('loadstart').subscribe(event => {
        console.log('In App Browser', 'Event \'Loadstart\' is called');
        console.log(event.url);
      });
    })
  }

  dismissLoading() {
    this.loading.dismiss().then(() => {
      console.log('Loading dismissed');
    }, () => {
      console.error('Present Loading');
    });
    this.loading = null;
  }

  private handle409(tokenData:any) {
    console.log('409 response');
    this.polarData.deleteCurrentUser().then(() => {
      this.polarData.registerUser(tokenData).then(success => {
        console.log('Register User Success: ', success);
        localStorage.setItem('user', JSON.stringify(success));
        this.navCtrl.setRoot(TabsPage);
        this.navCtrl.popToRoot();
        this.dismissLoading();
      }, error => {
        console.error('Register User error: ' + error);
        console.error('Register User error: ' + error.status);
        console.error('Register User error: ' + error.error);
        this.dismissLoading();
      })
    })

  }
}
