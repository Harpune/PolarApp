import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {PolarDataProvider} from "../../providers/polar-data/polar-data";
import {LocalDataProvider} from "../../providers/local-data/local-data";

@Component({
  selector: 'page-training-data',
  templateUrl: 'training-data.html',
})
export class TrainingDataPage {
  training: any = [];

  constructor(private navCtrl: NavController,
              private navParams: NavParams,
              private polarData: PolarDataProvider) {
    //localStorage.removeItem('trainingData');
    this.training = JSON.parse(localStorage.getItem('trainingData'));
    if (this.training) {
      console.log('Local training data', this.training);
    } else {
      console.log('No training data');
    }

    //this.checkForNewData();
  }

  checkForNewData() {
    this.polarData.listAvailableData().then(new_data => {
      console.log('New data', new_data);
      this.getTrainingData(new_data);
    }, no_data => {
      console.log('No new data ', no_data);
      //Loading
    });
  }

  private getTrainingData(new_data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      console.log('List available data', new_data);
      if (new_data) {
        let all_data = new_data['available-user-data'];
        this.dataContainsType(all_data, 'PHYSICAL_INFORMATION').then(index => {
          let data = all_data[index];
          console.log('Data ', data);

          // Create new transaction.
          this.polarData.create(data['url']).then(transactionIdUrl => {
            console.log('Create training data', transactionIdUrl);

            // List new physical information.
            this.polarData.list(transactionIdUrl).then(physicalInfoId => {
              let length = Object.keys(physicalInfoId['physical-informations']).length;

              physicalInfoId['physical-informations'].forEach((info, index) => {
                console.log('Training info', info);

                // Get new physical information.
                this.polarData.get(info).then(training_sum => {
                  console.log('Get training summary', training_sum);
                  LocalDataProvider.saveData(training_sum, 'training_sum');

                  this.polarData.getGPX(info + '/gpx').then(training_gpx => {
                    console.log('Get training GPX', training_gpx);
                    LocalDataProvider.saveData(training_gpx, 'training_gpx');

                    this.polarData.get(info + '/heart-rate-zones').then(training_heart_rate => {
                      console.log('Get training heart rate', training_heart_rate);
                      LocalDataProvider.saveData(training_heart_rate, 'training_heart_rate');

                      this.polarData.getTCX(info + '/tcx').then(training_tcx => {
                        console.log('Get training TCX', training_tcx);
                        LocalDataProvider.saveData(training_tcx, 'training_tcx');

                        this.polarData.get(info + '/samples').then(training_all_samples => {
                          console.log('Get training TCX', training_all_samples);
                          let s_length = Object.keys(training_all_samples['samples']).length;

                          training_all_samples['samples'].forEach((sample, index) => {
                            this.polarData.get(sample).then(training_sample => {
                              console.log(training_sample);
                            }, error => {
                              reject(error);
                              //TODO hier weiter machen: Aber vorher Activity
                            });
                          });

                        }, error => {
                          reject(error);
                        })
                      }, error => {
                        reject(error);
                      });
                    }, error => {
                      reject(error);
                    });
                  }, error => {
                    reject(error);
                  });


                  if (index >= length) {
                    this.polarData.commit(transactionIdUrl).then(success => {
                      console.log('Physical info committed', success);
                      //Loading
                    }, error => {
                      console.error('Physical info committed', error);
                      //Loading
                    })
                  }
                }, error => {
                  console.error(error);
                  reject(error);
                });
              });
            }, error => {
              console.error('List training info', error);
              reject(error);
            })
          }, error => {
            console.error('Create training info', error);
            reject(error);
          })
        }, () => {
          console.log('NO TRAINING_DATA');
          reject('NO TRAINING_DATA');
        });
      } else {
        console.log('No new training info');
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
