import {Injectable} from '@angular/core';
import {InAppBrowser} from '@ionic-native/in-app-browser';
import {LocalDataProvider} from "../local-data/local-data";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";

@Injectable()
export class PolarDataProvider {
  v3User: string;
  token: any;
  creds_id: string;
  creds_secret: string;

  constructor(private http: HttpClient,
              private localData: LocalDataProvider,
              private iab: InAppBrowser) {
    console.log('Hello PolarDataProvider Provider');

    // URL fpr v3 transactions.
    this.v3User = 'https://www.polaraccesslink.com';

    // Get local stored token if possible;
    this.token = JSON.parse(localStorage.getItem('currentUser'));

    // Get the id and secret.
    this.localData.getIdAndSecret().subscribe(creds => {
      this.creds_id = creds.client_id;
      this.creds_secret = creds.client_secret;
    });
  }

  /*
  Physical info
   */
  /**
   *
   * @returns {Promise<any>}
   */
  createPhysicalInfo(): Promise<any> {
    return new Promise((resolve, reject) => {
      // Get local token.
      let token = JSON.parse(localStorage.getItem('currentUser'));

      if (token) {
        let url = this.v3User + '/v3/users/' + token.x_user_id
          + '/physical-information-transactions';

        let headers = new HttpHeaders()
          .set('Authorization', 'Bearer ' + token.access_token);

        this.http.post(url, JSON.stringify({}), {
          headers: headers,
          responseType: 'text',
          observe: 'response'
        }).subscribe(success => {
          switch (success.status) {
            case 200:
              resolve(success.headers.get('Location'));
              break;
            case 201:
              resolve(success.headers.get('Location'));
              break;
            case 204:
              reject(success);
              break;
            default:
              reject(success);
          }
        }, error => {
          reject(error);
        }, () => {
          console.log('Create Physical Info complete');
        });
      } else {
        reject('No token saved!');
      }
    });
  }

  listPhysicalInfo(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      // Get local token.
      let token = JSON.parse(localStorage.getItem('currentUser'));

      if (token) {
        let headers = new HttpHeaders()
          .set('Authorization', 'Bearer ' + token.access_token)
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json');

        this.http.get(url, {headers: headers, observe: 'response'}).subscribe(success => {
          switch (success.status) {
            case 200:
              resolve(success.body);
              break;
            case 204:
              reject(success);
              break;
            case 404:
              reject(success);
              break;
            default:
              reject(success);
          }
        }, error => {
          reject(error);
        }, () => {
          console.log('List Physical Info complete');
        });
      } else {
        reject('No token saved!');
      }
    });
  }

  getPhysicalInfo(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      // Get local token.
      let token = JSON.parse(localStorage.getItem('currentUser'));

      if (token) {

        let headers = new HttpHeaders()
          .set('Authorization', 'Bearer ' + token.access_token)
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json');

        this.http.get(url, {headers: headers}).subscribe(success => {
          resolve(success);
        }, error => {
          reject(error);
        }, () => {
          console.log('Get Physical Info complete');
        });
      } else {
        reject('No token saved!');
      }
    });
  }

  commitPhysicalInfo(transaction_id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      // Get local token.
      let token = JSON.parse(localStorage.getItem('currentUser'));

      if (token) {
        let url = this.v3User + '/v3/users/' + token.x_user_id
          + '/physical-information-transactions/' + transaction_id;

        let headers = new HttpHeaders()
          .set('Authorization', 'Bearer ' + token.access_token)
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json');

        this.http.put(url, JSON.stringify({}), {headers: headers, observe: 'response'}).subscribe(success => {
          switch (success.status) {
            case 200:
              resolve(success);
              break;
            case 204:
              reject(success);
              break;
            default:
              reject(success);
          }
        }, error => {
          reject(error);
        }, () => {
          console.log('Commit Physical Info complete');
        });
      } else {
        reject('No token saved!');
      }
    });
  }

  /*
  Training data
   */
  /**
   * Check for new training data and create a new transaction if found.
   * @returns {Promise<any>}
   */
  createTrainingData(): Promise<any> {
    return new Promise((resolve, reject) => {
      // Get local token.
      let token = JSON.parse(localStorage.getItem('currentUser'));

      if (token) {
        let url = this.v3User + '/v3/users/' + token.x_user_id
          + '/exercise-transactions';

        let headers = new HttpHeaders()
          .set('Authorization', 'Bearer ' + token.access_token)
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json');

        this.http.post(url, {}, {headers: headers}).subscribe(success => {
          resolve(success);
        }, error => {
          reject(error);
        }, () => {
          console.log('Initiate exercise transaction complete');
        });
      } else {
        reject('No token saved!');
      }
    });
  }

  /**
   * After successfully initiating a transaction, training sessions included
   * within it can be retrieved with the provided transactionId.
   * @param {string} transaction_id
   * @returns {Promise<any>}
   */
  listTrainingData(transaction_id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      // Get local token.
      let token = JSON.parse(localStorage.getItem('currentUser'));

      if (token) {
        let url = this.v3User + '/v3/users/' + token.x_user_id
          + '/exercise-transactions/' + transaction_id;

        let headers = new HttpHeaders()
          .set('Authorization', 'Bearer ' + token.access_token)
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json');

        this.http.get(url, {headers: headers}).subscribe(success => {
          resolve(success);
        }, error => {
          reject(error);
        }, () => {
          console.log('List Exercises complete');
        });
      } else {
        reject('No token saved!');
      }
    });
  }

  /**
   * After successfully retrieving training session data within a transaction,
   * partners are expected to commit the transaction.
   * @param {number} transaction_id
   * @returns {Promise<any>}
   */
  commitTrainingData(transaction_id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      // Get local token.
      let token = JSON.parse(localStorage.getItem('currentUser'));

      if (token) {
        let url = this.v3User + '/v3/users/' + token.x_user_id
          + '/exercise-transactions/' + transaction_id;

        let headers = new HttpHeaders()
          .set('Authorization', 'Bearer ' + token.access_token)
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json');

        this.http.put(url, {headers: headers}).subscribe(success => {
          resolve(success);
        }, error => {
          reject(error);
        }, () => {
          console.log('Commit Transaction complete');
        });
      } else {
        reject('No token saved!');
      }
    });
  }


  /**
   * Retrieve training session summary data.
   * @param {number} transaction_id
   * @param {number} exercise_id
   * @returns {Promise<any>}
   */
  getExerciseSummary(transaction_id: number, exercise_id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      // Get local token.
      let token = JSON.parse(localStorage.getItem('currentUser'));

      if (token) {
        let url = this.v3User + '/v3/users/' + token.x_user_id
          + '/exercise-transactions/' + transaction_id
          + '/exercises/' + exercise_id;

        let headers = new HttpHeaders()
          .set('Authorization', 'Bearer ' + token.access_token)
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json');

        this.http.get(url, {headers: headers}).subscribe(success => {
          resolve(success);
        }, error => {
          reject(error);
        }, () => {
          console.log('Get Exercise Summary complete');
        });
      } else {
        reject('No token saved!');
      }
    });
  }

  /**
   * Retrieve training session summary data in GPX format.
   * @param {number} transaction_id
   * @param {number} exercise_id
   * @returns {Promise<any>}
   */
  getGPX(transaction_id: number, exercise_id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      // Get local token.
      let token = JSON.parse(localStorage.getItem('currentUser'));

      if (token) {
        let url = this.v3User + '/v3/users/' + token.x_user_id
          + '/exercise-transactions/' + transaction_id
          + '/exercises/' + exercise_id
          + '/gpx';

        let headers = new HttpHeaders()
          .set('Authorization', 'Bearer ' + token.access_token)
          .set('Accept', 'application/gpx+json')
          .set('Content-Type', 'application/gpx+json');

        this.http.get(url, {headers: headers}).subscribe(success => {
          resolve(success);
        }, error => {
          reject(error);
        }, () => {
          console.log('Get GPX complete');
        });
      } else {
        reject('No token saved!');
      }
    });
  }

  /**
   * Retrieve heart rate zones in training session.
   * @param {number} transaction_id
   * @param {number} exercise_id
   * @returns {Promise<any>}
   */
  getHeartRateZones(transaction_id: number, exercise_id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      // Get local token.
      let token = JSON.parse(localStorage.getItem('currentUser'));

      if (token) {
        let url = this.v3User + '/v3/users/' + token.x_user_id
          + '/exercise-transactions/' + transaction_id
          + '/exercises/' + exercise_id
          + '/heart-rate-zones';

        let headers = new HttpHeaders()
          .set('Authorization', 'Bearer ' + token.access_token)
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json');

        this.http.get(url, {headers: headers}).subscribe(success => {
          resolve(success);
        }, error => {
          reject(error);
        }, () => {
          console.log('Get Heart Rate Zones complete');
        });
      } else {
        reject('No token saved!');
      }
    });
  }

  /**
   * Retrieve list of links to available samples in training session.
   * @param {number} transaction_id
   * @param {number} exercise_id
   * @returns {Promise<any>}
   */
  getAvailableSamples(transaction_id: number, exercise_id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      // Get local token.
      let token = JSON.parse(localStorage.getItem('currentUser'));

      if (token) {
        let url = this.v3User + '/v3/users/' + token.x_user_id
          + '/exercise-transactions/' + transaction_id
          + '/exercises/' + exercise_id
          + '/samples';

        let headers = new HttpHeaders()
          .set('Authorization', 'Bearer ' + token.access_token)
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json');

        this.http.get(url, {headers: headers}).subscribe(success => {
          resolve(success);
        }, error => {
          reject(error);
        }, () => {
          console.log('Get Available Samples complete');
        });
      } else {
        reject('No token saved!');
      }
    });
  }

  /**
   * Retrieve sample data of given type.
   * @param {number} transaction_id
   * @param {number} exercise_id
   * @param {number} type_id
   * @returns {Promise<any>}
   */
  getSamples(transaction_id: number, exercise_id: number, type_id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      // Get local token.
      let token = JSON.parse(localStorage.getItem('currentUser'));

      if (token) {
        let url = this.v3User + '/v3/users/' + token.x_user_id
          + '/exercise-transactions/' + transaction_id
          + '/exercises/' + exercise_id
          + '/samples/' + type_id;

        let headers = new HttpHeaders()
          .set('Authorization', 'Bearer ' + token.access_token)
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json');

        this.http.get(url, {headers: headers}).subscribe(success => {
          resolve(success);
        }, error => {
          reject(error);
        }, () => {
          console.log('Get Samples complete');
        });
      } else {
        reject('No token saved!');
      }
    });
  }

  /**
   * Retrieve exercise in TCX format.
   * @param {number} transaction_id
   * @param {number} exercise_id
   * @returns {Promise<any>}
   */
  getTCX(transaction_id: number, exercise_id: number): Promise<any> {
    return new Promise((resolve, reject) => {
      // Get local token.
      let token = JSON.parse(localStorage.getItem('currentUser'));

      if (token) {
        let url = this.v3User + '/v3/users/' + token.x_user_id
          + '/exercise-transactions/' + transaction_id
          + '/exercises/' + exercise_id
          + '/tcx';

        let headers = new HttpHeaders()
          .set('Authorization', 'Bearer ' + token.access_token)
          .set('Accept', 'application/vnd.garmin.tcx+json')
          .set('Content-Type', 'application/vnd.garmin.tcx+json');

        this.http.get(url, {headers: headers}).subscribe(success => {
          resolve(success);
        }, error => {
          reject(error);
        }, () => {
          console.log('Get Samples complete');
        });
      } else {
        reject('No token saved!');
      }
    });
  }

  /*
  Pull notifications
   */
  /**
   * Get list of available exercises and activities for users.
   * @returns {Promise<any>}
   */
  listAvailableData(): Promise<any> {
    return new Promise((resolve, reject) => {
      // Get local token.
      let token = JSON.parse(localStorage.getItem('currentUser'));

      if (token) {
        let url = this.v3User + '/v3/notifications';

        let base64_auth = 'Basic ' + btoa(this.creds_id + ':' + this.creds_secret);

        let headers = new HttpHeaders()
          .set('Authorization', base64_auth)
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json');

        this.http.get(url, {headers: headers, observe: 'response'}).subscribe(success => {
          switch (success.status) {
            case 200:
              console.log('List available data', 200);
              resolve(success.body);
              break;
            case 201:
              console.log('List available data', 201);
              resolve(success.body);
              break;
            case 204:
              console.log('List available data', 204);
              reject(success);
              break;
            default:
              reject(success);
          }
        }, error => {
          reject(error);
        }, () => {
          console.log('List available data complete');
        });
      } else {
        reject('No token saved!');
      }
    });
  }

  /*
  Users
   */
  /**
   * Once partner has been authorized by user, partner must register user before
   * being able to access her data.
   * @param token
   * @returns {Observable<Object>}
   */
  registerUser(token: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = this.v3User + '/v3/users';

      let user_id = token.x_user_id;
      let user_token = token.access_token;

      console.log('Register User UserId:', user_id, user_token);

      let member_id = '' + performance.now() + Math.random();
      console.log('Register User MemberId', member_id);

      let body = {};
      body['members-id'] = member_id;

      let headers = new HttpHeaders()
        .set('Authorization', 'Bearer ' + user_token)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');

      console.log('Register User Body:', body);
      console.log('Register User Header:', headers);

      this.http.post(url, body, {headers: headers}).subscribe(success => {
        resolve(success);
      }, error => {
        reject(error);
      }, () => {
        console.log('Register user complete');
      });
    });
  }

  /**
   * List user basic information.
   * @returns {Observable<Object>}
   */
  getUserInformation(): Promise<any> {
    return new Promise((resolve, reject) => {
      // Get local token.
      let token = JSON.parse(localStorage.getItem('currentUser'));
      console.log("Get user Information Token: ", token);

      if (token) {
        let url = this.v3User + '/v3/users/' + token.x_user_id;

        let headers = new HttpHeaders()
          .set('Authorization', 'Bearer ' + token.access_token)
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json');

        // Start request.
        this.http.get(url, {headers: headers}).subscribe(success => {
          resolve(success);
        }, error => {
          reject(error);
        }, () => {
          console.log('Get user information complete');
        });
      } else {
        reject('No token saved!');
      }
    });
  }

  /**
   * When partner wishes no longer to receive user data, user can be de-registered.
   * This will revoke the access token authorized by user.
   * @returns {Observable<Object>}
   */
  deleteCurrentUser(): Promise<any> {
    return new Promise((resolve, reject) => {
      // Get local token.
      let token = JSON.parse(localStorage.getItem('currentUser'));
      console.log("Delete current user Token: ", token);

      if (token) {
        let url = this.v3User + '/v3/users/' + token.x_user_id;

        let headers = new HttpHeaders()
          .set('Authorization', 'Bearer ' + token.access_token)
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json');

        /*
        this.http.get('https://flow.polar.com/logout').subscribe(success => {
          console.log('Logout', success);
        }, error => {
          console.error('Logout', error)
        });
        */
        this.http.delete(url, {headers: headers}).subscribe(success => {
          resolve(success);
        }, error => {
          reject(error);
        }, () => {
          console.log('Delete user complete');
        });
      } else {
        reject('No token saved!');
      }
    });
  }

  /*
  Authentication
   */
  /**
   * On success, user will be shown the authorization form.
   * If an error occurs, user will be redirected to location defined in default redirect_uri with error code included.
   * @returns {Promise<Json>}
   */
  getAuthorizationCode(): Promise<any> {
    return new Promise((resolve, reject) => {
      // Url to authorization.
      let authUrl = `https://flow.polar.com/oauth2/authorization?` +
        `response_type=code&` +
        `scope=accesslink.read_all&` +
        `client_id=${this.creds_id}`;

      console.log(authUrl);
      // TODO don't build auth url like this. Use params header!

      // Open InAppBrowser to Login user.
      const browser = this.iab.create(authUrl, '_self', 'location=no');
      browser.on('loadstart').subscribe(event => {
        console.log('In App Browser', 'Event \'Loadstart\' is called');
        console.log(event.url);

        // Check if URL contains callback url.
        if ((event.url).indexOf("https://www.getpostman.com/oauth2/callback") === 0) {
          // Get the URL.
          let url_string = event.url;
          let url = new URL(url_string);
          browser.close();

          // Get the code from URL.
          if (url.searchParams.has("code")) { // The code we want.
            console.log('Code', url.searchParams.get("code"));
            resolve(url.searchParams.get("code"));
            // Get the error from URL.
          } else if (url.searchParams.has("error")) { // User denied authorization.
            //TODO Errors abfangen. (https://www.polar.com/accesslink-api/#authorization-endpoint)
            reject("Ein Fehler ist aufgetreten: " + url.searchParams.get("error"));
          } else {
            reject("Irgendetwas ging da schief.");
          }
        }
      });

      browser.on('exit').subscribe(event => {
        console.log('In App Browser', 'Event \'Exit\' is called');
        reject("Exit");
      });
    });
  }

  /**
   * With authorization code, an access token can be requested by posting authorization code to token endpoint.
   * @param code
   * @returns {Observable<Object>}
   */
  getAccessToken(code: string): Promise<any> {
    return new Promise((resolve, reject) => {
      // Base64 encoding of secret and id: clientId:clientSecret.
      //TODO remove local creds and use this.user_id and this.client_id.
      let base64_auth = 'Basic ' + btoa(this.creds_id + ':' + this.creds_secret);

      // Authorization URL.
      const url = 'https://polarremote.com/v2/oauth2/token';

      let body = new HttpParams()
        .set('grant_type', 'authorization_code')
        .set('code', code);

      let headers = new HttpHeaders()
        .set('Authorization', base64_auth)
        .set('Accept', 'application/json;charset=UTF-8')
        .set('Content-Type', 'application/x-www-form-urlencoded');

      console.log('getAccessToken Body:', body);
      console.log('getAccessToken Header:', headers);

      this.http.post(url, body, {headers: headers}).subscribe(success => {
        resolve(success);
      }, error => {
        reject(error);
      }, () => {
        console.log('Register user complete');
      });
    });
  }

  refreshToken(): Promise<any> {
    return new Promise((resolve, reject) => {
      let base64_auth = 'Basic ' + btoa(this.creds_id + ':' + this.creds_secret);

      let token = JSON.parse(localStorage.getItem('currentUser'));

      let headers = new HttpHeaders()
        .set('Authorization', base64_auth)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/x-www-form-urlencoded');

      let url = 'https://polarremote.com/v2/oauth2/token?grant_type=refresh_token&refresh_token='
        + token.x_user_id;

      this.http.post(url, null, {headers: headers}).subscribe(success => {
        resolve(success);
      }, error => {
        reject(error);
      }, () => {
        console.log('Token refresh complete');
      })
    })
  }
}
