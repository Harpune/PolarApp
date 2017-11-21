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
  json: any;
  loading: Loading;

  constructor(public navCtrl: NavController,
              private platform: Platform,
              public polarData: PolarDataProvider,
              public loadingCtrl: LoadingController,
              public iab: InAppBrowser) {

    this.json = {
      'exercise-transaction': [],
      'activity-transaction': [],
      'physical-information-transaction': [],
      'user': {}
    }


    // TODO: Angemeldet als Lukas - Nicht Lukas
  }

  login() {
    // Triggered when Platform is ready.
    this.platform.ready().then(() => {

      // Start Authorization Process.
      this.polarData.getAuthorizationCode().then(code => {

        this.loading = this.loadingCtrl.create({
          content: 'Micro momentito...',
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

              // Save user data.
              this.json['user'] = success;
              console.log('Register User Success: ', this.json);

              if (!localStorage.getItem(String(tokenData.x_user_id))) {
                localStorage.setItem(String(tokenData.x_user_id), JSON.stringify(this.json));
              }

              this.dismissLoading();

              // Set new root and go to TabsPage.
              this.navCtrl.setRoot(TabsPage).then(() => {
                this.navCtrl.popToRoot().then(() => {
                  console.log('Pop to root');
                }, () => {
                  console.log('Pop to root failed');
                });
              });
            }, error => {
              // Error by registration.
              console.error('Register User error: ' + error);

              // Handle if user already exists.
              if (error.status == 409) {
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

  /**
   * Open InAppBrowser and let user register.
   */
  register() {
    this.platform.ready().then(() => {
      let browser = this.iab.create('https://flow.polar.com/register', '_self', 'location=no');
      browser.on('loadstart').subscribe(event => {
        console.log('In App Browser', 'Event \'Loadstart\' is called', event.url);
      });
    })
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

  /**
   * User is already registered in Polar. So delete and re-register again.
   * @param tokenData
   */
  private handle409(tokenData: any) {
    console.log('409 response');
    this.polarData.deleteCurrentUser().then(() => {
      this.polarData.registerUser(tokenData).then(success => {
        console.log('Register User Success: ', success);
        localStorage.setItem('user', JSON.stringify(success));
        this.navCtrl.setRoot(TabsPage).then(() => {
          this.navCtrl.popToRoot().then(() => {
            console.log('Pushed to TabsPage')
          });
        });

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
