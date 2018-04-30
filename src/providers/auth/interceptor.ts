import {Injectable} from '@angular/core';
import {HttpRequest, HttpHandler, HttpEvent, HttpInterceptor} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {environment} from "../../assets/data/environment";

let polar_id = environment.polar_id;
let polar_secret = environment.polar_secret;

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor() {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get the Url passing by.
    let url = new URL(request.url);

    if (~url.pathname.indexOf('/v3/users')) { // If the pathname includes /v3/user add the Bearer header.
      console.log('Interceptor', '/v3/users');

      // Get the token of current user.
      let token = JSON.parse(localStorage.getItem('token'));

      // Update the headers.
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token.access_token}`
        }
      });
    } else { // If the pathname includes /v2/oauth2 add the Basic header.
      console.log('Interceptor', '/v3/pull-notifications or v2');

      // Update the headers.
      let basic = btoa(polar_id + ':' + polar_secret);
      request = request.clone({
        setHeaders: {
          Authorization: `Basic ${basic}`
        }
      });

    }

    console.log('Interceptor', request.body, request.headers);

    // Send updated request.
    return next.handle(request).timeoutWith(30000, Observable.throw('Timeout'));
  }
}
