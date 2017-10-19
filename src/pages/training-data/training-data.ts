import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {PolarDataProvider} from "../../providers/polar-data/polar-data";

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

  private getTrainingData(new_data: any) {
    console.log('List available data', new_data);
    if (new_data) {
      let all_data = new_data['available-user-data'];
      this.dataContainsType(all_data, 'PHYSICAL_INFORMATION').then(index => {
        let data = all_data[index];
        console.log('Data ', data);
        // Create new transaction.
        this.polarData.create(data['url']).then(transactionIdUrl => {

          // List new physical information.
          this.polarData.list(transactionIdUrl).then(physicalInfoId => {
            let length = Object.keys(physicalInfoId['physical-informations']).length;
            let count = 0;

            for (let info of physicalInfoId['physical-informations']) {
              // Get new physical information.
              this.polarData.get(info).then(physicalInfo => {
                console.log('Get physical info', physicalInfo);
                this.saveData(physicalInfo, 'trainingData');
                count++;
                if (count >= length) {
                  this.commitData(transactionIdUrl);
                }
              }, error => {
                console.error(error);
                count++;
                if (count >= length) {
                  alert('Commit didn\'t work!');
                }
              });
            }//for-loop

          }, error => {
            console.error('List training info', error);
          })
        }, error => {
          console.error('Create training info', error);
        })
      }, () => {
        console.log('NO TRAINING_DATA');
        //Loading
      });
    } else {
      console.log('No new training info');
    }
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

  /**
   * Save data locally with key.
   * @param data
   * @param {string} key
   */
  saveData(data: any, key: string) {
    console.log('Save data', data);
    let datas = JSON.parse(localStorage.getItem(key));
    if (datas) {
      datas.push(data);
      console.log('Added training data', datas);
      localStorage.setItem(key, JSON.stringify(data));
    } else {
      let temp = [];
      temp.push(data);
      console.log('New training data', temp);
      localStorage.setItem(key, JSON.stringify(temp));
    }
  }

  /**
   * Commit the data to polar.
   * @param {string} transactionIdUrl
   * @param refresher
   */
  private commitData(transactionIdUrl: string) {
    // Commit transaction.
    this.polarData.commit(transactionIdUrl).then(success => {
      console.log('Physical info committed', success);
      //Loading
    }, error => {
      console.error('Physical info committed', error);
      //Loading
    })
  }
}
