import {Component} from '@angular/core';
import {AlertController, Loading, LoadingController, NavController, Platform} from 'ionic-angular';
import {PolarDataProvider} from "../../providers/polar-data/polar-data";
import {TabsPage} from "../tabs/tabs";
import {InAppBrowser} from "@ionic-native/in-app-browser";
import {LocalDataProvider} from "../../providers/local-data/local-data";

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  user: any;
  json: any;
  loading: Loading;

  constructor(public navCtrl: NavController,
              public platform: Platform,
              public polarData: PolarDataProvider,
              public localData: LocalDataProvider,
              public loadingCtrl: LoadingController,
              private alertCtrl: AlertController,
              public iab: InAppBrowser) {

    this.json = {
      'exercise-transaction': [],
      'activity-transaction': [],
      'physical-information-transaction': [],
      'user': {}
    }
  }

  ionViewDidLoad() {
    let token = JSON.parse(localStorage.getItem('token'));
    if (token) {
      this.localData.getUser().then(user => {
        this.user = user;
      });
    } else {
      console.log('Login Page', 'No token');
    }

  }

  goToHome() {
    // Set new root and go to TabsPage.
    this.navCtrl.setRoot(TabsPage).then(() => {
      this.navCtrl.popToRoot().then(() => {
        console.log('Pop to root');
      }, () => {
        console.log('Pop to root failed');
      });
    });
  }

  tryLogin() {
    let token = JSON.parse(localStorage.getItem('token'));
    if (token) {
      this.alertCtrl.create({
        title: 'Sind sie sicher?',
        message: `${this.user['first-name']} ${this.user['last-name']} wird damit abgemeldet! Der Fortschritt geht jedoch nicht verloren.`,
        buttons: [
          {
            text: 'Nein',
            role: 'cancel',
            handler: () => {
              console.log('tryLogin', 'Cancel clicked');
            }
          }, {
            text: 'Ja',
            handler: () => {
              console.log('tryLogin', 'Ok clicked');
              this.loading = this.loadingCtrl.create({
                content: `${this.user['first-name']} ${this.user['last-name']} wird abgemeldet!`,
                dismissOnPageChange: true
              });

              // Presents the loading Icon.
              this.loading.present().then(() => {
                this.polarData.deleteCurrentUser().then(success => {
                  console.log('tryLogin', 'Success', success);
                  this.dismissLoading();
                  this.login();
                }, error => {
                  console.log('tryLogin', 'Error', error);
                  this.dismissLoading();
                })
              });
            }
          }
        ]
      }).present();
    }
  }

  login() {
    // Start Authorization Process.
    this.polarData.getAuthorizationCode().then(code => {

      this.loading = this.loadingCtrl.create({
        content: 'Einen Moment...',
        dismissOnPageChange: true
      });

      // Presents the loading Icon.
      this.loading.present().then(() => {

        // Get the Access-Token.
        this.polarData.getAccessToken(code).then(tokenData => {

          // Parse data to Json and read.
          console.log('AccessToken', tokenData);
          localStorage.setItem('token', JSON.stringify(tokenData));

          // Register the User.
          this.polarData.registerUser(tokenData).then(success => {
            this.localData.getMasterJson().then(exist => {
              console.log('Login', 'Existing User?', exist);

              if (exist) {
                // Edit the user.
                exist['user'] = success;
                console.log('Register User Success: ', exist);
                this.localData.setMasterJson(exist).then(() => {
                  this.dismissLoading();
                  this.goToHome();
                }, () => {
                  this.dismissLoading();
                });
              } else {
                // Save user data.
                this.json['user'] = success;
                console.log('Register User Success: ', this.json);
                this.localData.setMasterJson(this.json).then(() => {
                  this.dismissLoading();
                  this.goToHome();
                }, () => {
                  this.dismissLoading();
                })
              }
            });
          }, error => {
            // Error by registration.
            console.error('Register User error', error);
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

  }

  /**
   * Dismiss this loading and make loading reusable.
   */
  dismissLoading() {
    this.loading.dismiss().then(() => {
      console.log('Loading dismissed');
    }, () => {
      console.error('Present Loading');
    });
    this.loading = null;
  }
}
