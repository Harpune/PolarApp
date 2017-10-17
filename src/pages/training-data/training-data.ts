import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {PolarDataProvider} from "../../providers/polar-data/polar-data";

@IonicPage()
@Component({
  selector: 'page-training-data',
  templateUrl: 'training-data.html',
})
export class TrainingDataPage {
  training: any = [];

  constructor(private navCtrl: NavController,
              private navParams: NavParams,
              private polarData: PolarDataProvider) {
    //localStorage.removeItem('physicalInfo');
    this.training = JSON.parse(localStorage.getItem('trainingData'));
    if (this.training) {
      console.log('Local physical info', this.training);
    } else {
      console.log('No physical info');
    }

    this.polarData.listAvailableData().then(new_data => {
      console.log('New data', new_data);
      this.getNewTrainingData(new_data);
    }, no_data => {
      console.log('No new data ', no_data);
    });
  }

  private getNewTrainingData(new_data: any, refresher?) {
    console.log('List available data', new_data);
    if (new_data) {
      let all_data = new_data['available-user-data'];
      this.dataContainsTrainingData(all_data).then(index => {
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
                this.saveData(physicalInfo);
                count++;
                if (count >= length) {
                  //this.updateCharts();
                  //this.commitData(transactionIdUrl, refresher);
                }
              }, error => {
                console.error(error);
                count++;
                if (count >= length) {
                  //this.commitData(transactionIdUrl, refresher);
                  alert('Commit didn\'t work!');
                }
              });
            }//for-loop

          }, error => {
            console.error('List physical info', error);
          })
        }, error => {
          console.error('Create physical info', error);
        })
      }, error => {
        console.log('NO PHYSICAL_INFORMATION');
        if (refresher) {
          refresher.complete();
        }
      });

    } else {
      console.log('No new physical info');
    }
  }

  private dataContainsTrainingData(all_data: any): Promise<number> {
    return new Promise((resolve, reject) => {
      all_data.forEach((item, index) => {
        if (item['data-type'] == 'PHYSICAL_INFORMATION') {
          console.log('PHYSICAL_INFORMATION', index);
          resolve(index);
        }
      });
      reject(-1);
    });
  }

  /**
   * Save data locally.
   * @param trainingData
   */
  saveData(trainingData: any) {
    console.log('Save physical Data', trainingData);
    let trainingDatas = localStorage.getItem('trainingData');
    if (trainingDatas) {
      this.training = JSON.parse(trainingDatas);
      console.log('Add training data', this.training);
      this.training.push(trainingData);
      console.log('Added training data', this.training);
      localStorage.setItem('trainingData', JSON.stringify(this.training));
    } else {
      let temp = [];
      temp.push(trainingData);
      this.training = temp;
      console.log('New training data', this.training);
      localStorage.setItem('trainingData', JSON.stringify(this.training));
    }
  }
}
