import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {parse, end, toSeconds, pattern} from 'iso8601-duration';
import {dictionary} from "../../assets/data/dictionary";
import {datatypes} from "../../assets/data/datatypes";
import parseGPX from '@mapbox/togeojson'
import parseTcx from 'tcx';
import 'rxjs/add/operator/map';
import {Observable} from "rxjs/Observable";


function sortByDate(a, b) {
  console.log('a: ', a, 'b: ', b);
  return new Date(a['summary']['start-time']).getTime() - new Date(b['summary']['start-time']).getTime();
}

@Injectable()
export class LocalDataProvider {

  constructor(public http: HttpClient) {
    console.log('Hello LocalDataProvider Provider');
    console.dir(parseTcx);
    // TODO save with token: user-id:id und user-id:transaction-id
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
          // Remove GPX.
          let gpx = new DOMParser().parseFromString(data[2], 'text/xml');
          data[2] = parseGPX.gpx(gpx);
          console.log('GPX', data[2]);
        }

        // Parse TCX to geoJSON.
        if (data[3]) {
          // Remove TCX.
          let tcx = new DOMParser().parseFromString(data[3], 'text/xml');
          data[3] = parseTcx(tcx);
          console.log('TCX', data[3]);
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
      let userID = json['user']['polar-user-id'];
      let transactionID = data[0]['transaction-id'];
      let listID = data[0]['id'];
      console.log('Save', 'userId', userID, 'transactionID', transactionID, 'listID', listID);

      // Save the transactionID.
      let jsonType = json[type['name']];
      if (!(jsonType.indexOf(transactionID) > -1)) {
        json[type['name']].push(transactionID);
      }
      console.log('Save', type['name'], 'json', json);
      localStorage.setItem(String(token['x_user_id']), JSON.stringify(json));

      // Saving the exercise under the transaction id.
      let log = JSON.parse(localStorage.getItem(String(transactionID)));
      console.log('Save', type['name'], 'log', log);
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
      localStorage.setItem(String(transactionID), JSON.stringify(log));

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
        console.log('Get', 'transactions', transactions);

        let data = [];

        // Go through all physical transactionIds.
        for (let transaction of transactions) {
          console.log('Get', 'transaction', transaction);

          // Get the ListId.
          let list = JSON.parse(localStorage.getItem(String(transaction)));
          console.log('Get', 'list', list);

          // Get all physical data save under the listID.
          for (let item of list) {
            console.log('Get', 'item', item);
            data.push(JSON.parse(localStorage.getItem(String(item))));
          }
        }

        console.log('Get', 'data', data);
        resolve(data);
      }
    }))
  }

  delete(data: any, type: any): Promise<any> {
    console.log('Delete', 'data', data, 'type', type);
    return new Promise(((resolve, reject) => {
      let token = JSON.parse(localStorage.getItem('token'));
      if (token) {
        // Master-JSON.
        let json = JSON.parse(localStorage.getItem(String(token['x_user_id'])));
        console.log('Delete', 'json', json);

        // Setup data.
        let userID = json['user']['polar-user-id'];
        let transactionID = data['summary']['transaction-id'];
        let listID = data['summary']['id'];
        console.log('Delete', type['name'], 'userId', userID, 'transactionID', transactionID, 'listID', listID);

        // Delete activityID from its transactionID array.
        let list = JSON.parse(localStorage.getItem(String(transactionID)));
        console.log('Delete', type['name'], 'list', list);

        let listIndex = list.indexOf(listID);
        if (listIndex > -1) {
          list.splice(listIndex, 1);

          console.log('Delete', 'list', list);
          if (list.length != 0) {
            // More activities are saved under this transactionID.
            console.log('Delete', 'length', '> 0');

            localStorage.setItem(String(transactionID), JSON.stringify(list));

            resolve();
          } else {
            console.log('Delete', 'length', '== 0');
            // No more activities are saved under this transactionID.
            localStorage.removeItem(String(transactionID));

            // Delete transactionID from Master-JSON.
            let transactions = json[type['name']];
            console.log('Delete', 'transactions', transactions);

            let transactionIndex = transactions.indexOf(transactionID);
            if (transactionIndex > -1) {
              transactions.splice(transactionIndex, 1);
              json[type['name']] = transactions;

              console.log('Delete', 'transactions', transactions);
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
        reject('No token');
      }
    }))
  }

  deleteAll(type: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.get(type).then(success => {
        let length = Object.keys(success).length;
        success.forEach((data, index) => {
          this.delete(data, type).then(done => {
            if (index >= length - 1) {
              resolve(done);
            }
          }, error => {
            reject(error);
          })
        })
      }, error => {
        reject(error);
      })
    });
  }

  reset(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      Observable.forkJoin([
        this.deleteAll(datatypes['exercise']),
        this.deleteAll(datatypes['activity']),
        this.deleteAll(datatypes['physical'])
      ]).subscribe(success => {
        resolve(success);
      }, error => {
        reject(error);
      })
    })

  }
}
