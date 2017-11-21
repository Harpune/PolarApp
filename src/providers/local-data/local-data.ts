import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';

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

  savePhysical(transaction: string, physicals: string[], data: any[]) {
    let token = JSON.parse(localStorage.getItem('token'));
    let user = localStorage.getItem(String(token.x_user_id));
    user['physical-information-transaction'].push(transaction);
    console.log('Save physical', user);
    localStorage.setItem('physical-information-transaction', user);

    let activity = [];
    localStorage.setItem(transaction, JSON.stringify(activity.push(physicals)));

    let temp = {};
    for (let i = 0; i < physicals.length; i++) {
      temp['summary'] = data[i][0];
      localStorage.setItem(physicals[i], JSON.stringify(temp));
    }
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
