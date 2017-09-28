import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {InAppBrowser} from '@ionic-native/in-app-browser';
import {LocalDataProvider} from "../local-data/local-data";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";

@Injectable()
export class PolarDataProvider {
  baseVariable: string;
  creds_id: string;
  creds_secret: string;

  constructor(private http: HttpClient,
              private localData: LocalDataProvider,
              private iab: InAppBrowser) {
    console.log('Hello PolarDataProvider Provider');
    this.baseVariable = 'https://www.polaraccesslink.com';
    // TODO User id and secret at start
  }

  registerUser(jsonData: any) {
    let url = this.baseVariable + '/v3/users';

    let user_id = jsonData.x_user_id;
    let user_token = jsonData.access_token;

    console.log('Register User UserId:', user_id);
    console.log('Register User UserToken:', user_token);


    let bodyss = new HttpParams()
      .set("member-id", user_id.toString());
    let bodys = {
      'member-id': user_id.toString()
    };
    let body = {};
    body['member-id'] = user_id.toString();

    let headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + user_token)
      .set('Accept', 'application/json; charset=utf-8')
      .set('Content-Type', 'application/json; charset=utf-8');

    console.log('Register User Body:', body);
    console.log('Register User Header:', headers);

    return this.http.post(url, body, {headers: headers});
  }

  getAccessToken(code: string, creds: any) {
    // Base64 encoding of secret and id: clientId:clientSecret.
    let base64_auth = 'Basic ' + btoa(creds.client_id + ':' + creds.client_secret);

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

    return this.http.post(url, body,{headers: headers});
  }

  getAuthorizationCode(): Promise<any> {
    return new Promise((resolve, reject) => {
      // Client-ID.
      let clientId = '59c76763-db24-4d9e-9d1e-9f7b4ca99814';

      // Url to authorization.
      let authUrl = `https://flow.polar.com/oauth2/authorization?` +
        `response_type=code&` +
        `scope=accesslink.read_all&` +
        `client_id=${clientId}`;

      console.log(authUrl);

      const browser = this.iab.create(authUrl, '_self', 'location=no');
      browser.on('loadstart').subscribe(event => {
        console.log('In App Browser', 'Event \'Loadstart\' is called');

        // Check if URL contains callback url.
        if ((event.url).indexOf("http://localhost:8100/callback") === 0) {
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
