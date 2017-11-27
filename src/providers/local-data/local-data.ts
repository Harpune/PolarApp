import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import 'rxjs/add/operator/map';


@Injectable()
export class LocalDataProvider {

  constructor(public http: HttpClient) {
    console.log('Hello LocalDataProvider Provider');
  }

  /**
   * Get the Client-Id and Client-Secret from local file.
   * @returns {Promise<any>}
   */
  getIdAndSecret() {
    return this.http.get('assets/data/config.json');
  }

  static savePhysical(transaction: string, physicals: string[], data: any[]) {
    let token = JSON.parse(localStorage.getItem('token'));
    let user = localStorage.getItem(String(token.x_user_id));
    console.log('Save Physical user before', user);

    if (user['physical-information-transaction']) {
      user['physical-information-transaction'].push(transaction);
    } else {
      user['physical-information-transaction'] = [];
      user['physical-information-transaction'].push(transaction);
    }

    console.log('Save Physical user after', user);
    localStorage.setItem(String(token.x_user_id), user);

    let activity = [];
    activity.push(physicals);
    console.log('Save Physical Activity', activity);
    localStorage.setItem(transaction, JSON.stringify(activity));

    let temp = {};
    for (let i = 0; i < physicals.length; i++) {
      temp['summary'] = data[i][0];
      localStorage.setItem(physicals[i], JSON.stringify(temp));
    }
  }

  getUser(): any {
    let token = JSON.parse(localStorage.getItem('token'));
    if (token) {
      let json = JSON.parse(localStorage.getItem(token['x_user_id']));
      if (json) {
        return json['user'];
      }
    }
    return null;
  }

  saveActivity(transaction: string, activities: string[], data: any[]) {
    let token = JSON.parse(localStorage.getItem('token'));
    let user = localStorage.getItem(String(token.x_user_id));
    user['activity-transaction'].push(transaction);
    console.log('Save activity', user);
    localStorage.setItem('activity-transaction', user);

    let activity = [];
    localStorage.setItem(transaction, JSON.stringify(activity.push(activities)));

    let temp = {};
    for (let i = 0; i < activities.length; i++) {
      temp['summary'] = data[i][0];
      temp['steps'] = data[i][1];
      temp['zones'] = data[i][2];
      localStorage.setItem(activities[i], JSON.stringify(temp));
    }
  }

  saveExercise(transaction: string, trainings: string[], data: any[]) {
    let token = JSON.parse(localStorage.getItem('token'));
    let user = localStorage.getItem(String(token.x_user_id));
    user['exercise-transaction'].push(transaction);
    console.log('Save exercise', user);
    localStorage.setItem('exercise-transaction', user);

    let activity = [];
    localStorage.setItem(transaction, JSON.stringify(activity.push(trainings)));

    let temp = {};
    for (let i = 0; i < trainings.length; i++) {
      temp['summary'] = data[i][0];
      temp['heart-rate-zone'] = data[i][1];
      temp['gpx'] = data[i][2];
      temp['tcx'] = data[i][3];
      temp['samples'] = data[i][4];
      localStorage.setItem(trainings[i], JSON.stringify(temp));
    }
  }
}
