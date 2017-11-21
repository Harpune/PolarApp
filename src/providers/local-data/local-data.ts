import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class LocalDataProvider {
  token: any;

  constructor(public http: Http) {
    console.log('Hello LocalDataProvider Provider');
    this.token = JSON.parse(localStorage.getItem('token')) || {};
  }

  /**
   * Get the Client-Id and Client-Secret from local file.
   * @returns {Promise<any>}
   */
  getIdAndSecret() {
    return this.http.get('assets/data/config.json').map(res => res.json());
  }

  saveActivity(transaction: string, activity: string, data: any) {
    let user = localStorage.getItem(String(this.token.x_user_id));
    user['activity-transaction'].push(transaction);
    localStorage.setItem('activity-transaction', user);
    //TODO Save activity!
  }
}
