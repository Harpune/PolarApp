import {Injectable} from '@angular/core';
import {InAppBrowser} from '@ionic-native/in-app-browser';
import {LocalDataProvider} from "../local-data/local-data";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";

@Injectable()
export class PolarDataProvider {
  v3User: string;
  token: any;
  id: string;

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
      this.id = creds.client_id;
    });
  }

  /*
  Physical info
   */
  /**
   *
   * @returns {Promise<any>}
   */
  create(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let headers = new HttpHeaders();

      this.http.post(url, null, {
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
        console.log('Create complete');
      });
    });
  }

  list(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let headers = new HttpHeaders()
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
        console.log('List complete');
      });
    });
  }

  get(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let headers = new HttpHeaders()
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');

      // let data = response.text() ? response.json() : [{}];

      this.http.get(url, {headers: headers}).subscribe(success => {
        resolve(success);
      }, error => {
        reject(error);
      }, () => {
        console.log('Get complete');
      });
    });
  }

  getGPX(url: string): Promise<any> {
    return new Promise((resolve, reject) => {

      let headers = new HttpHeaders()
        .set('Accept', ' application/gpx+xml')
        .set('Content-Type', 'application/gpx+xml');

      this.http.get(url, {headers: headers, responseType: 'text'}).subscribe(success => {
        resolve(success);
      }, error => {
        reject(error);
      }, () => {
        console.log('Get complete');
      });

    });
  }

  getTCX(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let headers = new HttpHeaders()
        .set('Accept', ' application/vnd.garmin.tcx+xml')
        .set('Content-Type', 'application/vnd.garmin.tcx+xml');

      this.http.get(url, {headers: headers, responseType: 'text'}).subscribe(success => {
        resolve(success);
      }, error => {
        reject(error);
      }, () => {
        console.log('Get complete');
      });

    });
  }

  commit(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let headers = new HttpHeaders()
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');

      this.http.put(url, null, {headers: headers, responseType: 'text', observe: 'response'}).subscribe(success => {
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
        console.log('Commit complete');
      });

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
      let url = this.v3User + '/v3/notifications';

      let headers = new HttpHeaders()
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
      });

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

      this.token = token;

      let member_id = '' + performance.now() + Math.random() + token.access_token;
      console.log('Register User MemberId', member_id);

      let body = {};
      body['members-id'] = member_id;

      let headers = new HttpHeaders()
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
      let url = this.v3User + '/v3/users/' + this.token.x_user_id;

      let headers = new HttpHeaders()
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
    });
  }

  /**
   * When partner wishes no longer to receive user data, user can be de-registered.
   * This will revoke the access token authorized by user.
   * @returns {Observable<Object>}
   */
  deleteCurrentUser(): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = this.v3User + '/v3/users/' + this.token.x_user_id;

      let headers = new HttpHeaders()
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json');

      this.http.delete(url, {headers: headers}).subscribe(success => {
        resolve(success);
      }, error => {
        reject(error);
      }, () => {
        console.log('Delete user complete');
      });
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
        `client_id=${this.id}`;

      console.log(authUrl);
      // TODO don't build auth url like this. Use params header!

      // Open InAppBrowser to Login user.
      const browser = this.iab.create(authUrl, '_self', 'location=no');
      browser.on('loadstart').subscribe(event => {
        console.log('In App Browser', 'Event \'Loadstart\' is called');
        console.log(event.url);

        // Check if URL contains callback url.
        if ((event.url).indexOf('https://www.getpostman.com/oauth2/callback') === 0) {
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

      browser.on('exit').subscribe(() => {
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
      // Authorization URL.
      const url = 'https://polarremote.com/v2/oauth2/token';

      let body = new HttpParams()
        .set('grant_type', 'authorization_code')
        .set('code', code);

      let headers = new HttpHeaders()
        .set('Accept', 'application/json;charset=UTF-8')
        .set('Content-Type', 'application/x-www-form-urlencoded');

      this.http.post(url, body, {headers: headers}).subscribe(success => {
        resolve(success);
      }, error => {
        reject(error);
      }, () => {
        console.log('Register user complete');
      });
    });
  }
}
