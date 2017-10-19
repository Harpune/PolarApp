import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

/*
  Generated class for the LocalDataProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class LocalDataProvider {

  constructor(public http: Http) {
    console.log('Hello LocalDataProvider Provider');
  }

  /**
   * Get the Client-Id and Client-Secret from local file.
   * @returns {Promise<any>}
   */
  getIdAndSecret() {
    return this.http.get('assets/data/config.json').map(res => res.json());
  }

  /**
   * Save data locally with key.
   * @param data
   * @param {string} key
   */
  static saveData(data: any, key: string) {
    console.log('Save data');
    let local = JSON.parse(localStorage.getItem(key));
    if (local) {
      local.push(data);
      console.log('Added training data', local);
      localStorage.setItem(key, JSON.stringify(local));
    } else {
      let temp = [];
      temp.push(data);
      console.log('New added training data', temp);
      localStorage.setItem(key, JSON.stringify(temp));
    }
  }
}
