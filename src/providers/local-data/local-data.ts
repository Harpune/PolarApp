import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {parse, end, toSeconds, pattern} from 'iso8601-duration';
import {dictionary} from "../../assets/data/dictionary";
import {datatypes} from "../../assets/data/datatypes";
import {Storage} from '@ionic/storage';
import parseGPX from '@mapbox/togeojson'
import parseTcx from 'tcx';
import 'rxjs/add/operator/map';
import {Observable} from "rxjs/Observable";

@Injectable()
export class LocalDataProvider {

  constructor(public http: HttpClient,
              private storage: Storage) {
    console.log('Hello LocalDataProvider Provider');
    console.dir(parseTcx);
    // TODO save with token: user-id:id und user-id:transaction-id
  }

  getMasterJson(): Promise<any> {
    const token = JSON.parse(localStorage.getItem('token'));
    console.log('getMasterJson', 'token', token);
    return this.storage.get(String(token['x_user_id']));
  }

  setMasterJson(json: any): Promise<any> {
    const token = JSON.parse(localStorage.getItem('token'));
    console.log('setMasterJson', 'json', json, 'token', token);
    return this.storage.set(String(token['x_user_id']), json);
  }

  getUser(): Promise<any> {
    return new Promise(((resolve, reject) => {
      this.getMasterJson().then(json => {
        console.log('get User', 'json', json);
        resolve(json['user']);
      }, error => {
        reject(error);
      })
    }))
  }

  setUser(user: any): Promise<any> {
    return new Promise<any>(((resolve, reject) => {
      this.getMasterJson().then(json => {
        json['user'] = user;

        this.setMasterJson(json).then(success => {
          resolve(success);
        }, error => {
          reject(error);
        });
      }, error => {
        reject(error);
      })
    }))
  }

  save(type: any, data: any): Promise<any> {
    console.log('Save', 'type', type, 'data', data);

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

    return new Promise<any>(((resolve, reject) => {

      this.getMasterJson().then(json => {
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
        this.setMasterJson(json).then(() => {
          console.log('save', 'transactionID', transactionID);

          // Saving the exercise under the transaction id.
          this.storage.get(String(transactionID)).then(log => {
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
            this.storage.set(String(transactionID), log).then(success => {
              console.log('save', success, 'log', log);

              // Save the data to given exercise.
              let temp = {};
              type['types'].forEach((item, index) => {
                temp[item] = data[index];
              });
              console.log('Save', type['name'], 'temp', temp);
              this.storage.set(String(listID), temp).then(success => {
                console.log('save', success, 'listID', listID);
                resolve();
              }, error => {
                reject(error);
              });
            }, error => {
              reject(error);
            });
          }, error => {
            reject(error);
          });
        }, error => {
          reject(error);
        });
      }, error => {
        reject(error);
      });
    }));
  }

  get(type: any): Promise<any> {
    return new Promise(((resolve, reject) => {

      console.log('Get', 'type', type);

      this.getMasterJson().then(json => {
        // Physical transactionId.
        let transactions = json[type['name']];
        console.log('Get', 'transactions', transactions);

        let transactionsLength = Object.keys(transactions).length;
        let data = [];

        // Go through all physical transactionIds.
        transactions.forEach((transaction, transactionIndex) => {
          console.log('Get', 'transaction', transaction);

          // Get the ListId.
          this.storage.get(String(transaction)).then(list => {
            console.log('Get', 'list', list);

            let listLength = Object.keys(list).length;

            // Get all physical data save under the listID.
            list.forEach((item, listIndex) => {
              console.log('Get', 'item', item);
              this.storage.get(String(item)).then(temp => {
                data.push(temp);

                if (transactionIndex >= transactionsLength - 1) {
                  if (listIndex >= listLength - 1) {
                    console.log('Get', 'data', data);
                    resolve(data);
                  }
                }
              }, error => {
                reject(error);
              })
            });
          }, error => {
            reject(error);
          });
        });
      }, error => {
        reject(error);
      });
    }))
  }

  delete(data: any, type: any): Promise<any> {
    console.log('Delete', 'data', data, 'type', type);
    return new Promise(((resolve, reject) => {
      this.getMasterJson().then(json => {
        console.log('Delete', 'json', json);

        // Setup data.
        let userID = json['user']['polar-user-id'];
        let transactionID = data['summary']['transaction-id'];
        let listID = data['summary']['id'];
        console.log('Delete', type['name'], 'userId', userID, 'transactionID', transactionID, 'listID', listID);

        this.storage.get(String(transactionID)).then(list => {
          console.log('Delete', type['name'], 'list', list);

          let listIndex = list.indexOf(listID);
          if (listIndex > -1) {
            list.splice(listIndex, 1);

            console.log('Delete', 'list', list);
            if (list.length != 0) {
              // More activities are saved under this transactionID.
              console.log('Delete', 'length', '> 0');

              this.storage.set(String(transactionID), list).then(() => {
                resolve();
              }, error => {
                reject(error);
              });

            } else {
              console.log('Delete', 'length', '== 0');
              // No more activities are saved under this transactionID.
              this.storage.remove(String(transactionID)).then(() => {
                // Delete transactionID from Master-JSON.
                let transactions = json[type['name']];
                console.log('Delete', 'transactions', transactions);

                let transactionIndex = transactions.indexOf(transactionID);
                if (transactionIndex > -1) {
                  transactions.splice(transactionIndex, 1);
                  json[type['name']] = transactions;

                  console.log('Delete', 'transactions', transactions);
                  this.setMasterJson(json).then(() => {
                    resolve();
                  }, error => {
                    reject(error);
                  })
                } else {
                  reject('Unresolvable transactionID');
                }
              }, error => {
                reject(error);
              });
            }
          } else {
            reject('Unresolvable listID');
          }
        }, error => {
          reject(error);
        });
      }, error => {
        reject(error);
      });
    }))
  }

  deleteAll(type: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.get(type).then(success => {
        let length = Object.keys(success).length;
        success.forEach((data, index) => {
          this.delete(data, type).then(done => {
            if (index >= length - 1) {
              resolve();
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

  clear(): Promise<any> {
    return this.storage.clear()
  }
}
