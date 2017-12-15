import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {parse, end, toSeconds, pattern} from 'iso8601-duration';
import toGeoJson from '@mapbox/togeojson'
import 'rxjs/add/operator/map';
import {datatypes} from "../../assets/data/datatypes";
import {dictionary} from "../../assets/data/dictionary";

@Injectable()
export class LocalDataProvider {

  constructor(public http: HttpClient) {
    console.log('Hello LocalDataProvider Provider');
    // TODO create the enum like environment for simplifying the methods
  }

  /**
   * Get User data.
   * @returns {Promise<JSON>}
   */
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

  static save(type: any, data: any) {
    console.log('Save', 'type', type);

    // Parse data.
    switch (type['id']) {
      case 0: // physical

        break;
      case 1: // activity
              // Change duration format.
        data[0]['duration'] = parse(data[0]['duration']);
        break;
      case 2: // exercise
              // Change duration format.
        data[0]['duration'] = parse(data[0]['duration']);
        data[0]['detailed-sport-info'] = dictionary[data[0]['detailed-sport-info']];

        // Parse GPX to geoJSON.
        if (data[2]) {
          let gpx = new DOMParser().parseFromString(data[2]['gpx'], 'text/xml');
          data[2] = toGeoJson.gpx(gpx);
        }
        break;
      default:
        console.log('Save', 'Default', 'Something went wrong');
    }

    // Save data.
    let token = JSON.parse(localStorage.getItem('token'));
    if (token) {
      // Master-JSON.
      let json = JSON.parse(localStorage.getItem(String(token['x_user_id'])));
      console.log('Save', 'json', json);

      // Setup data.
      let transactionID = data[0]['transaction-id'];
      let listID = data[0]['id'];

      // Save the transactionID.
      let jsonType = json[type['name']];
      if (!(jsonType.indexOf(transactionID) > -1)) {
        json[type['name']].push(transactionID);
      }
      console.log('Save', type['name'], 'json', json);
      localStorage.setItem(String(token['x_user_id']), JSON.stringify(json));

      // Saving the exercise under the transaction id.
      let log = JSON.parse(localStorage.getItem(transactionID));
      if (log) {
        if (!(log.indexOf(listID) > -1)) {
          console.log('Save', 'log', 'doesn\'t exists');
          log.push(listID);
        } else {
          console.log('Save', 'log', 'exists');
        }

      } else {
        log = [];
        log.push(listID);
      }
      console.log('Save', type['name'], 'log', log);
      localStorage.setItem(transactionID, JSON.stringify(log));

      // Save the data to given exercise.
      let temp = {};
      type['types'].forEach((item, index) => {
        temp[item] = data[index];
      });
      console.log('Save', type['name'], 'temp', temp);
      localStorage.setItem(listID, JSON.stringify(temp));
    }
  }

  get(type: any): Promise<any> {
    return new Promise((resolve => {

      console.log('Get', 'type', type);
      let token = JSON.parse(localStorage.getItem('token'));
      if (token) {
        // Master-JSON.
        let json = JSON.parse(localStorage.getItem(String(token['x_user_id'])));

        // Physical transactionId.
        let transactions = json[type['name']];
        console.log('Get', 'All Transaction', transactions);

        let data = [];

        // Go through all physical transactionIds.
        for (let transaction of transactions) {

          // Get the ListId.
          let log = JSON.parse(localStorage.getItem(transaction));

          // Get all physical data save under the listID.
          for (let item of log) {
            data.push(JSON.parse(localStorage.getItem(item)));
          }
        }
        console.log('Get', 'Data', data);
        resolve(data);
      }
    }))
  }

  delete(transactionID: number, logID: number, type: any): Promise<any> {
    console.log('Delete', transactionID, logID, type);
    return new Promise(((resolve, reject) => {
      let token = JSON.parse(localStorage.getItem('token'));
      if (token) {

        // Get the activity.
        let item = JSON.parse(localStorage.getItem(String(logID)));
        console.log('Delete', 'activity', item);

        if (item) {
          // Master-JSON.
          let json = JSON.parse(localStorage.getItem(String(token['x_user_id'])));
          console.log('Delete', 'json', json);

          // Delete activityID from its transactionID array.
          let log = JSON.parse(localStorage.getItem(String(transactionID)));
          console.log('Delete', 'activities', JSON.stringify(log), String(logID));

          let index = log.indexOf(String(logID));
          if (index > -1) {
            log.splice(index, 1);

            if (log.length != 0) {
              console.log('Delete', 'length', '!= 0');
              // More activities are saved under this transactionID.
              localStorage.setItem(String(transactionID), log);

              resolve();
            } else {
              console.log('Delete', 'length', '== 0');
              // No more activities are saved under this transactionID.
              localStorage.removeItem(String(transactionID));

              // Delete transactionID from Master-JSON, if all its activities are deleted.
              let transactions = json[type['name']];
              console.log('Delete', 'transactions 1', transactions);

              let transactionIndex = transactions.indexOf(transactionID);
              if (transactionIndex > -1) {
                transactions.splice(transactionIndex, 1);
                json[type['name']] = transactions;

                console.log('Delete', 'transactions 2', transactions);
                localStorage.setItem(String(token['x_user_id']), JSON.stringify(json));

                resolve();
              } else {
                reject('Unresolvable transactionID');
              }
            }
          } else {
            reject('Unresolvable listID');
          }
        } else {
          reject('No such item');
        }
      } else {
        reject('No token');
      }
    }))
  }
}
