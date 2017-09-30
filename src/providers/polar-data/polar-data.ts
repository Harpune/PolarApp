import {Injectable} from '@angular/core';
import {InAppBrowser} from '@ionic-native/in-app-browser';
import {LocalDataProvider} from "../local-data/local-data";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";

import 'rxjs/add/operator/timeout';

@Injectable()
export class PolarDataProvider {
  v3Url: string;
  token: any;
  creds_id: string;
  creds_secret: string;

  constructor(private http: HttpClient,
              private localData: LocalDataProvider,
              private iab: InAppBrowser) {
    console.log('Hello PolarDataProvider Provider');

    // URL fpr v3 transactions.
    this.v3Url = 'https://www.polaraccesslink.com';

    // Get local stored token if possible;
    this.token = JSON.parse(localStorage.getItem('currentUser'));

    // Get the id and secret.
    this.localData.getIdAndSecret().subscribe(creds => {
      this.creds_id = creds.client_id;
      this.creds_secret = creds.client_secret;
    });
  }

  /**
   * Deletes user from own registration.
   * @returns {Observable<Object>}
   */
  deleteCurrentUser(): Promise<any> {
    return new Promise((resolve, reject) => {
      let token = JSON.parse(localStorage.getItem('currentUser'));
      console.log("Delete current user Token: ", token);

      if (token) {
        let url = this.v3Url + '/v3/users/' + token.x_user_id;

        let headers = new HttpHeaders()
          .set('Authorization', 'Bearer ' + token.access_token)
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json');

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

  /**
   * Get all user information provided by Polar.
   * @returns {Observable<Object>}
   */
  getUserInformation(): Promise<any> {
    return new Promise((resolve, reject) => {
      let token = JSON.parse(localStorage.getItem('currentUser'));
      console.log("Get user Information Token: ", token);

      if (token) {
        let url = this.v3Url + '/v3/users/' + token.x_user_id;

        let headers = new HttpHeaders()
          .set('Authorization', 'Bearer ' + token.access_token)
          .set('Accept', 'application/json')
          .set('Content-Type', 'application/json');

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
   * Register user with own member ID.
   * @param token
   * @returns {Observable<Object>}
   */
  registerUser(token: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = this.v3Url + '/v3/users';

      let user_id = token.x_user_id;
      let user_token = token.access_token;

      console.log('Register User UserId:', user_id);
      console.log('Register User UserToken:', user_token);


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
   * Get the access-token with the code and client credentials.
   * @param code
   * @param creds
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

  /**
   * Get authorization code.
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
        reject("Abbruch des Authentifizierungsvorgangs");
      });
    });
  }
}
