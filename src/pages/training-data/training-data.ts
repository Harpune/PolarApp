import {Component} from '@angular/core';
import {PolarDataProvider} from '../../providers/polar-data/polar-data';
import {LocalDataProvider} from "../../providers/local-data/local-data";
import {Observable} from 'rxjs/Observable';
import {Parser} from 'xml2js';
import 'rxjs/Rx'
import 'rxjs/add/observable/forkJoin'
import * as xml2js from 'xml2js';

@Component({
  selector: 'page-training-data',
  templateUrl: 'training-data.html',
})

export class TrainingDataPage {
  user: any = {};
  training: any = [];

  constructor(private polarData: PolarDataProvider,
              private localData: LocalDataProvider) {
    //localStorage.removeItem('trainingData');
    let token = JSON.parse(localStorage.getItem('token'));
    this.user = JSON.parse(localStorage.getItem(String(token.x_user_id))) || {};
  }

  /**
   * Ionic View did load.
   */
  ionViewDidLoad() {
    this.training = JSON.parse(localStorage.getItem('training_sum')) || [];

    if (this.training) {
      console.log('Training data', this.training);
    } else {
      console.log('No training data');
    }

    Observable.interval(1000 * 60 * 10).startWith(0).subscribe(trigger => {
      console.log('No. ' + trigger + ': 10 minutes more');
      this.checkForNewData()
    });
  }

  checkForNewData() {
    this.polarData.listAvailableData().then(new_data => {
      console.log('New data', new_data);
      this.getTrainingData(new_data).then(success => {
        this.training.push(success);
      }, error => {
        console.error('Error training data', error);
      });
    }, no_data => {
      console.log('No training data', no_data);
      //Loading
    });
  }

  private getTrainingData(new_data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      console.log('List available data', new_data);
      if (new_data) {
        let all_data = new_data['available-user-data'];
        console.log('All data', all_data);

        this.dataContainsType(all_data, 'EXERCISE').then(index => {
          let data = all_data[index];
          console.log('Data ', data);

          // Create new transaction.
          this.polarData.create(data['url']).then(transaction => {
            console.log('Create training data', transaction);

            // List new physical information.
            this.polarData.list(transaction['resource-uri']).then(trainingId => {
              console.log('After list', trainingId);
              let length = Object.keys(trainingId['exercises']).length;

              let datas = [];
              let infos = [];

              trainingId['exercises'].forEach((info, index) => {
                Observable.forkJoin([
                  this.polarData.get(info),
                  this.polarData.get(info + '/heart-rate-zones'),
                  this.polarData.getGPX(info + '/gpx'),
                  this.polarData.getTCX(info + '/tcx'),
                  this.polarData.get(info + '/samples')
                ]).subscribe(data => {
                  let parser = new DOMParser();
                  let gpxData = parser.parseFromString(data[2], 'application/xml');
                  let tcxData = parser.parseFromString(data[3], 'application/xml');

                  //TODO ToJson.
                  console.log('GPX', gpxData);
                  console.log('TCX', tcxData);

                  datas.push(data);
                  infos.push(info);//TODO change to exercise id.

                  let sLength = Object.keys(data[4]['samples']).length;
                  let samples = [];
                  data[4]['samples'].forEach((sample, sIndex) => {
                    this.polarData.get(sample).then((s) => {
                      samples.push(s);

                      if (sIndex >= sLength - 1) {
                        if (index >= length - 1) {
                          data[4] = samples;
                          /*
                          // Save the data.
                          this.localData.saveExercise(transaction['transaction-id'], infos, datas);

                          // Commit the transaction.
                          this.polarData.commit(transaction['resource-uri']).then(success => {
                            resolve(success);
                          }, error => {
                            reject(error);
                          });
                          */
                        }
                      }
                    })
                  });
                });
              });
            }, error => {
              reject(error);
            })
          }, error => {
            reject(error);
          })
        }, () => {
          reject('No training data');
        });
      } else {
        reject('No new training info');
      }
    });
  }

  /**
   * Check if all_data is of type.
   * @param all_data
   * @param {string} type
   * @returns {Promise<number>}
   */
  dataContainsType(all_data: any, type: string): Promise<number> {
    return new Promise((resolve, reject) => {
      all_data.forEach((item, index) => {
        if (item['data-type'] == type) {
          console.log(type, index);
          resolve(index);
        }
      });

      reject(-1);
    });
  }
}
