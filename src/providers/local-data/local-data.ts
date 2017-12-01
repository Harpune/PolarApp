import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import 'rxjs/add/operator/map';

@Injectable()
export class LocalDataProvider {

  constructor(public http: HttpClient) {
    console.log('Hello LocalDataProvider Provider');
  }

  getUser(): Promise<any> {
    return new Promise(((resolve) => {
      let token = JSON.parse(localStorage.getItem('token'));
      if (token) {
        let json = JSON.parse(localStorage.getItem(String(token['x_user_id'])));
        if (json) {
          resolve(json['user']);
        }
      }
    }))
  }

  static savePhysical(transaction: string, listID: string, data: any) {
    let token = JSON.parse(localStorage.getItem('token'));
    console.log('Save Physical', 'Token', String(token['x_user_id']));
    if (token) {
      let json = JSON.parse(localStorage.getItem(String(token['x_user_id'])));

      // Save the transaction in user profile.
      let physical = json['physical-information-transaction'];
      if (!(physical.indexOf(transaction) > -1)) {
        json['physical-information-transaction'].push(transaction);
      }
      console.log('Save Physical', 'Physical Information Transaction', json);
      localStorage.setItem(String(token['x_user_id']), JSON.stringify(json));

      // Saving the exercise under the transaction id.
      let log = JSON.parse(localStorage.getItem(transaction));
      if (log) {
        log.push(listID);
      } else {
        log = [];
        log.push(listID);
      }
      localStorage.setItem(transaction, JSON.stringify(log));
      console.log('Save Physical', 'Physical Id', JSON.parse(localStorage.getItem(transaction)));

      // Save the data to given exercise.
      let temp = {};
      temp['summary'] = data[0];
      localStorage.setItem(listID, JSON.stringify(temp));
      console.log('Save Physical', 'Data', JSON.parse(localStorage.getItem(listID)));
    }
  }

  getPhysical(): Promise<any> {
    return new Promise((resolve => {
      let token = JSON.parse(localStorage.getItem('token'));
      if (token) {
        let json = JSON.parse(localStorage.getItem(String(token['x_user_id'])));
        let physicals = [];

        let physicalTransactions = json['physical-information-transaction'];
        console.log('Get Physical', 'All Transaction', physicalTransactions);

        for (let transaction of physicalTransactions) {
          let temp = JSON.parse(localStorage.getItem(transaction));
          for (let physical of temp) {
            let data = JSON.parse(localStorage.getItem(physical));
            physicals.push(data['summary']);
          }
        }
        console.log('Get Physical', 'Data', physicals);
        resolve(physicals);
      }
    }))
  }

  static saveActivity(transaction: string, listID: string, data: any) {
    let token = JSON.parse(localStorage.getItem('token'));
    console.log('Save Activity', 'Token', String(token['x_user_id']));
    if (token) {
      let json = JSON.parse(localStorage.getItem(String(token['x_user_id'])));

      // Save the transaction in user profile.
      let physical = json['activity-transaction'];
      if (!(physical.indexOf(transaction) > -1)) {
        json['activity-transaction'].push(transaction);
      }
      localStorage.setItem(String(token['x_user_id']), JSON.stringify(json));
      console.log('Save Activity', 'Transaction', json);

      // Saving the exercise under the transaction id.
      let log = JSON.parse(localStorage.getItem(transaction));
      if (log) {
        log.push(listID);
      } else {
        log = [];
        log.push(listID);
      }
      localStorage.setItem(transaction, JSON.stringify(log));
      console.log('Save Activity', 'Activity Id', JSON.parse(localStorage.getItem(transaction)));

      // Save the data to given exercise.
      let temp = {};
      temp['summary'] = data[0];
      temp['steps'] = data[1];
      temp['zones'] = data[2];

      localStorage.setItem(listID, JSON.stringify(temp));
      console.log('Save Activity', 'Data', JSON.parse(localStorage.getItem(listID)));
    }
  }

  getActivity(): Promise<any> {
    return new Promise((resolve => {
      let token = JSON.parse(localStorage.getItem('token'));
      if (token) {
        let json = JSON.parse(localStorage.getItem(String(token['x_user_id'])));
        let activities = [];

        let activityTransactions = json['activity-transaction'];
        console.log('Get Activity', 'All Transaction', activityTransactions);

        for (let transaction of activityTransactions) {
          console.log('Get Activity', 'Transaction', transaction);
          let temp = JSON.parse(localStorage.getItem(transaction));
          console.log('Get Activity', 'Activity', temp);
          for (let activity of temp) {
            let data = JSON.parse(localStorage.getItem(activity));
            activities.push(data);
          }
        }
        console.log('Get Activity', 'Data', activities);
        resolve(activities);
      }
    }))
  }

  static saveExercise(transaction: string, trainings: string[], data: any[]) {
    let token = JSON.parse(localStorage.getItem('token'));
    if (token) {
      let json = JSON.parse(localStorage.getItem(String(token['x_user_id'])));

      json['exercise-transaction'].push(transaction);
      console.log('Save exercise', json);
      localStorage.setItem('exercise-transaction', json);

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
}
