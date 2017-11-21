import {Injectable} from '@angular/core';
import {HttpRequest, HttpHandler, HttpEvent, HttpInterceptor} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {LocalDataProvider} from "../local-data/local-data";

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  id: string = '31496f50-2e27-4f94-8cd3-5e75249656ec';
  secret: string = '99f506b3-48c8-489e-a1e5-8c3379cce491';

  constructor() {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get the Url passing by.
    let url = new URL(request.url);

    if (~url.pathname.indexOf('/v2/oauth2')) { // If the pathname includes /v2/oauth2 add the Basic header.
      console.log('Interceptor for v2!');

      // Update the headers.
      let basic = btoa(this.id + ':' + this.secret);
      request = request.clone({
        setHeaders: {
          Authorization: `Basic ${basic}`
        }
      });

    } else if (~url.pathname.indexOf('/v3/users')) { // If the pathname includes /v3/user add the Bearer header.
      console.log('Interceptor for v3 user!');

      // Get the token of current user.
      let token = JSON.parse(localStorage.getItem('token'));

      // Update the headers.
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token.access_token}`
        }
      });
      return next.handle(request);
    } else { // If the pathname is neither add the Basic header.
      console.log('Interceptor for v3 not user!');

      // Update the headers.
      let basic = btoa(this.id + ':' + this.secret);
      request = request.clone({
        setHeaders: {
          Authorization: `Basic ${basic}`
        }
      });
    }

    // Send updated request.
    return next.handle(request);

  }
}
