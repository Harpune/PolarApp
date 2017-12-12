import {Component} from '@angular/core';
import {Loading, LoadingController, NavController, Platform} from 'ionic-angular';
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
      let temp = JSON.parse(localStorage.getItem(String(token['x_user_id'])))
      this.user = temp['user'];
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
              let exist = JSON.parse(localStorage.getItem(String(tokenData['x_user_id'])));
              console.log('Login', 'Existing User?', exist);

              if(exist){
                // Edit the user.
                exist['user'] = success;
                console.log('Register User Success: ', this.json);
                localStorage.setItem(String(tokenData['x_user_id']), JSON.stringify(this.json));
              } else {
                // Save user data.
                this.json['user'] = success;
                console.log('Register User Success: ', this.json);
                localStorage.setItem(String(tokenData['x_user_id']), JSON.stringify(this.json));
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
              console.error('Register User error', error);

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
    //TODO outsource user registration and remove handle409.
    console.log('Handle 409', 'Token', tokenData);
    this.polarData.deleteCurrentUser().then(() => {
      this.polarData.registerUser(tokenData).then(success => {
        let exist = JSON.parse(localStorage.getItem(String(tokenData['x_user_id'])));
        console.log('Login', 'Existing User?', exist);

        if(exist){
          // Edit the user.
          exist['user'] = success;
          console.log('Register User Success: ', exist);
          localStorage.setItem(String(tokenData['x_user_id']), JSON.stringify(exist));
        } else {
          // Save user data.
          this.json['user'] = success;
          console.log('Register User Success: ', this.json);
          localStorage.setItem(String(tokenData['x_user_id']), JSON.stringify(this.json));
        }

        this.dismissLoading();

        this.navCtrl.setRoot(TabsPage).then(() => {
          this.navCtrl.popToRoot().then(() => {
            console.log('Handle 409', 'Pushed to TabsPage');
          });
        });
      }, error => {
        console.log('Handle 409', 'Register User error', error);
        this.dismissLoading();
      })
    })
  }
}
