import {Injectable} from '@angular/core';
import {parse, end, toSeconds, pattern} from 'iso8601-duration';
import {dictionary} from "../../assets/data/dictionary";
import {datatypes} from "../../assets/data/datatypes";
import parseGPX from '@mapbox/togeojson'
import parseTcx from 'tcx';
import 'rxjs/add/operator/map';
import {Observable} from "rxjs/Observable";

@Injectable()
export class LocalDataProvider {

  constructor() {
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

  /**
   * Save data with given type-configuration.
   * @param type Type of the data to save.
   * @param data Data to savve.
   */
  static save(type: any, data: any) {
    console.log('Save', 'type', type);

    /**
     * Parse the data before saving it.
     */
    switch (type['id']) {
      case 0: // physical
              // Nothing
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
          let gpx = new DOMParser().parseFromString(data[2], 'text/xml');
          data[2] = parseGPX.gpx(gpx);
          console.log('GPX', data[2]);
        }

        // Parse TCX to geoJSON.
        if (data[3]) {
          let tcx = new DOMParser().parseFromString(data[3], 'text/xml');
          data[3] = parseTcx(tcx);
          console.log('TCX', data[3]);
        }

        // Parse sample data to be readable for chart.js.
        if (data[4]) {
          let datasets = [];
          for (let sample of data[4]) {
            let data = sample['data'].split(',');
            console.log('UpdateCharts', data, sample);
            switch (sample['sample-type']) {
              case 0://Heart rate	bpm
                datasets.push({
                  label: 'Herzfrequenz',
                  data: data,
                  borderColor: '#009de1',
                });
                break;
              case 1://Speed  km/h
                datasets.push({
                  label: 'Geschwindigkeit',
                  data: data,
                  borderColor: '#cf102f',
                });
                break;
              case 2://Cadence	rpm
                datasets.push({
                  label: 'Kandenz',
                  data: data,
                  borderColor: '#f0ad4e',
                });
                break;
              case 3://Altitude	m
                datasets.push({
                  label: 'Höhe',
                  data: data,
                  borderColor: '#0EC639',
                });
                break;
              case 4://Power	W
                datasets.push({
                  label: 'Kraft',
                  data: data,
                  borderColor: '#009de1',
                });
                break;
              case 5://Power pedaling index	%
                datasets.push({
                  label: 'Power pedaling index',
                  data: data,
                  borderColor: '#009de1',
                });
                break;
              case 6://Power left-right balance	%
                datasets.push({
                  label: 'Power left-right balance',
                  data: data,
                  borderColor: '#009de1',
                });
                break;
              case 7://Air pressure	hpa
                datasets.push({
                  label: 'Luftdruck',
                  data: data,
                  borderColor: '#009de1',
                });
                break;
              case 8://Running cadence	spm
                datasets.push({
                  label: 'Laufkadenz',
                  data: data,
                  borderColor: '#009de1',
                });
                break;
              case 9://Temperature	ºC
                datasets.push({
                  label: 'Temperatur',
                  data: data,
                  borderColor: '#009de1',
                });
                break;
              case 10://Distance	m
                datasets.push({
                  label: 'Distanz',
                  data: data,
                  borderColor: '#0EC639',
                });
                break;
              case 11://RR Interval	ms

                break;
              default:
            }
          }

          console.log('Save', 'datasets', datasets);
          data[4] = datasets;
        }
        break;
      default:
        console.log('Save', 'Default', 'Something went wrong');
    }

    /**
     * Save Data locally with LocalStorage.
     */
      // Token.
    let token = JSON.parse(localStorage.getItem('token'));
    if (token) {
      // Master-JSON.
      let json = JSON.parse(localStorage.getItem(String(token['x_user_id'])));

      // Setup data.
      let transactionID = data[0]['transaction-id'];
      let listID = data[0]['id'];

      // Add the transactionID to Master-JSON if it doesn't exists already.
      let jsonType = json[type['name']];
      if (!(jsonType.indexOf(transactionID) > -1)) {
        json[type['name']].push(transactionID);
      }

      // Save updated Master-JSON.
      localStorage.setItem(String(token['x_user_id']), JSON.stringify(json));

      // Get item stored under transaction-ID.
      let log = JSON.parse(localStorage.getItem(String(transactionID)));

      // Check if Transaction-ID already exits.
      if (log) { // entry exists.
        // Check if ID already exits.
        if (!(log.indexOf(listID) > -1)) {
          log.push(listID);
        }
      } else { // New entry.
        log = [];
        log.push(listID);
      }

      // Save IDs under the transaction-ID.
      localStorage.setItem(String(transactionID), JSON.stringify(log));

      // Dynamically ave the data to given exercise.
      let temp = {};
      type['types'].forEach((item, index) => {
        temp[item] = data[index];
      });

      // Save data under ID.
      localStorage.setItem(listID, JSON.stringify(temp));
    }
  }

  /**
   * Get all the data of given type.
   * @param type Type to return.
   * @returns {Promise<any>} Returns all data in Promise.
   */
  get(type: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let token = JSON.parse(localStorage.getItem('token'));
      if (token) {
        // Master-JSON.
        let json = JSON.parse(localStorage.getItem(String(token['x_user_id'])));

        // Type transaction-ID.
        let transactions = json[type['name']];

        // Initialize data to return.
        let data = [];

        // Go through all transaction-IDs.
        for (let transaction of transactions) {

          // Get the ID.
          let list = JSON.parse(localStorage.getItem(String(transaction)));

          // Get all physical data save under the listID.
          for (let item of list) {
            data.push(JSON.parse(localStorage.getItem(String(item))));
          }
        }

        console.log('Get', 'data', data);
        resolve(data);
      } else {
        reject();
      }
    });
  }

  /**
   * Delete data of given type.
   * @param data Data to delete.
   * @param type Type of data to delete.
   * @returns {Promise<any>}
   */
  delete(data: any, type: any): Promise<any> {
    console.log('Delete', 'data', data, 'type', type);
    return new Promise(((resolve, reject) => {
      let token = JSON.parse(localStorage.getItem('token'));
      if (token) {
        // Master-JSON.
        let json = JSON.parse(localStorage.getItem(String(token['x_user_id'])));

        // Setup data.
        let transactionID = data['summary']['transaction-id'];
        let listID = data['summary']['id'];

        // Delete ID from its transaction-ID array.
        let list = JSON.parse(localStorage.getItem(String(transactionID)));

        let listIndex = list.indexOf(listID);
        if (listIndex > -1) {
          list.splice(listIndex, 1);

          // Check if more data is saved under this transaction-ID.
          if (list.length != 0) {
            // More activities are saved under this transactionID.
            localStorage.setItem(String(transactionID), JSON.stringify(list));
            resolve();
          } else {
            // No more data is saved under this transaction-ID.
            localStorage.removeItem(String(transactionID));

            // Delete transactionID from Master-JSON.
            let transactions = json[type['name']];
            console.log('Delete', 'transactions', transactions);

            let transactionIndex = transactions.indexOf(transactionID);
            if (transactionIndex > -1) {
              transactions.splice(transactionIndex, 1);
              json[type['name']] = transactions;

              // Save updated Masster-JSON.
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

  /**
   * Deletes all data of given type.
   * @param type Type to delete.
   * @returns {Promise<any>} Resolves on success.
   */
  deleteAll(type: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {

      // Get all data of given type.
      this.get(type).then(success => {
        let length = Object.keys(success).length;

        // Loop through every item to delete each.
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

  /**
   * Resets all data.
   * @returns {Promise<any>}
   */
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
