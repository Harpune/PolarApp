import {Component} from '@angular/core';
import {PolarDataProvider} from '../../providers/polar-data/polar-data';
import {SQLitePorter} from "@ionic-native/sqlite-porter";
import {SQLite, SQLiteObject} from '@ionic-native/sqlite';
import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx'
import 'rxjs/add/observable/forkJoin'

@Component({
  selector: 'page-training-data',
  templateUrl: 'training-data.html',
})
export class TrainingDataPage {
  user: any = {};
  training: any = [];

  constructor(private polarData: PolarDataProvider,
              private sqlite: SQLite,
              private sqlitePorter: SQLitePorter) {
    localStorage.removeItem('trainingData');
    this.user = JSON.parse(localStorage.getItem('user'));
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
          this.polarData.create(data['url']).then(transactionIdUrl => {
            console.log('Create training data', transactionIdUrl);

            // List new physical information.
            this.polarData.list(transactionIdUrl).then(trainingId => {
              console.log('After list', trainingId);
              let length = Object.keys(trainingId['exercises']).length;

              trainingId['exercises'].forEach((info, index) => {
                console.log('Training info', info);

                Observable.forkJoin([
                  this.polarData.get(info),
                  this.polarData.get(info + '/heart-rate-zones'),
                  this.polarData.getGPX(info + '/gpx'),
                  this.polarData.getTCX(info + '/tcx'),
                  this.polarData.get(info + '/samples')
                ]).subscribe(data => {
                  console.log('000', data[0]);
                  console.log('111', data[1]);
                  console.log('222', data[2]);
                  console.log('333', data[3]);
                  console.log('444', data[4]);

                  let parser = new DOMParser();
                  let gpxData = parser.parseFromString(data[2], 'application/xml');
                  let tcxData = parser.parseFromString(data[3], 'application/xml');

                  console.log('GPX', gpxData);
                  console.log('TCX', tcxData);

                  let sLength = Object.keys(data[4]['samples']).length;
                  let samples = [];
                  data[4]['samples'].forEach((sample, sIndex) => {
                    this.polarData.get(sample).then((s) => {
                      console.log('Sample', s);
                      samples.push(s);
                      console.log('sindex', sIndex);
                      console.log('sLength', sLength);
                      console.log('index', index);
                      console.log('length', length);
                      if (sIndex >= sLength - 1) {
                        console.log("Done with sample!");
                        // Fertig mit diesen samples. -> Alles speichern!
                        if (index >= length - 1) {
                          // Ganz fertig! -> Commit.
                          console.log("Done with life!");
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
