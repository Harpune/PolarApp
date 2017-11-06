import {Injectable} from '@angular/core';
import {HttpRequest, HttpHandler, HttpEvent, HttpInterceptor} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {LocalDataProvider} from "../local-data/local-data";
import {NavController} from "ionic-angular";
import {LoginPage} from "../../pages/login/login";

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  id: string;
  secret: any;

  constructor(private localData: LocalDataProvider,
              private navCtrl: NavController) {
    // Get the id and secret.
    this.localData.getIdAndSecret().subscribe(creds => {
      this.id = creds.client_id;
      this.secret = creds.client_secret;
    });
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log("Interceptor!");
    let token = JSON.parse(localStorage.getItem('currentUser'));

    if (token) {
      let url = new URL(request.url);
      if (~url.pathname.indexOf('/v3/users')) {
        // For /v3/users requests, there need to be the authentication header with a bearer token.
        console.log('Url users', url);
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token.access_token}`
          }
        });
      } else {
        // For not /v3/users requests, there need to be the id:secret base64-encoded authentication header.
        console.log('Url not users', url);
        request = request.clone({
          setHeaders: {
            Authorization: `Basic ${btoa(this.id + ':' + this.secret)}`
          }
        });
      }
    }


    return next.handle(request).do(() => {

    }, error => {
      if (error.status === 401) {
        alert('You are not logged in anymore!');
        localStorage.removeItem('currentUser');
        this.navCtrl.setRoot(LoginPage).then(() => {
          this.navCtrl.popToRoot().then(() => {
            console.log('Pop to root');
          }, () => {
            console.log('Pop to root failed');
          });
        });
      }
    });
  }
}
