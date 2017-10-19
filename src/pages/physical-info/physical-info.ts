import {Component, ViewChild} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {PolarDataProvider} from "../../providers/polar-data/polar-data";
import {Chart} from 'chart.js';
import {DatePipe} from "@angular/common";
import {LocalDataProvider} from "../../providers/local-data/local-data";

@Component({
  selector: 'page-physical-info',
  templateUrl: 'physical-info.html',
})
export class PhysicalInfoPage {
  physical: any = [];

  @ViewChild('statureCanvas') statureCanvas;
  @ViewChild('heartRateCanvas') heartRateCanvas;
  @ViewChild('aerobCanvas') aerobCanvas;
  statureChart: any;
  heartRateChart: any;
  aerobChart: any;

  constructor(private navCtrl: NavController,
              private navParams: NavParams,
              private polarData: PolarDataProvider,
              private datePipe: DatePipe) {
    //localStorage.removeItem('physicalInfo');

  }

  ionViewDidLoad() {
    this.physical = JSON.parse(localStorage.getItem('physicalInfo'));
    if (this.physical) {
      console.log('Local physical info', this.physical);
      this.updateCharts();
    } else {
      console.log('No physical info');
    }

    this.checkForNewData();

  }


  checkForNewData(refresher?) {
    this.polarData.listAvailableData().then(new_data => {
      console.log('New data', new_data);
      this.getPhysicalInfo(new_data).then(success => {
        console.log('New Physical info', success);
        this.updateCharts();
        if (refresher) {
          refresher.complete();
        }
      }, error => {
        console.error('New Physical info', error);
        if (refresher) {
          refresher.complete();
        }
      });
    }, no_data => {
      if (refresher) {
        refresher.complete();
      }
      console.log('No new data ', no_data);
      //Loading
    });
  }

  /**
   * This resource allows partners to access their users’ physical information. Whenever some user’s physical
   * information changes, new entry containing full physical info is stored to AccessLink.
   * @param new_data
   */
  getPhysicalInfo(new_data: any): Promise<any> {
    return new Promise((resolve, reject) => {
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
                  LocalDataProvider.saveData(physicalInfo, 'physicalInfo');
                  count++;
                  if (count >= length) {
                    // Commit the transaction.
                    this.polarData.commit(transactionIdUrl).then(success => {
                      console.log('Physical info committed', success);
                      resolve(success);
                    }, error => {
                      console.error('Physical info committed', error);
                      reject(error);
                      //Loading
                    })
                  }
                }, error => {
                  console.error(error);
                  count++;
                  if (count >= length) {
                    reject(error);
                  }
                });
              }//for-loop

            }, error => {
              console.error('List physical info', error);
              reject(error);
            })
          }, error => {
            console.error('Create physical info', error);
            reject(error);
          })
        }, () => {
          console.log('NO PHYSICAL_INFORMATION');
          reject('NO PHYSICAL_INFORMATION');
        });

      } else {
        console.log('No new physical info');
        reject('No new physical info');
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

  updateCharts() {
    if (this.physical) {
      let createdData = [];
      let heightData = [];
      let weightData = [];
      let maxHeartRate = [];
      let restHeartRate = [];
      let aerobThreshold = [];
      let anaerobThreshold = [];
      let vo2Max = [];
      for (let entry of this.physical) {
        createdData.push(this.datePipe.transform(entry['created'], 'dd-MM-yy'));
        heightData.push(entry['height']);
        weightData.push(entry['weight']);
        maxHeartRate.push(entry['maximum-heart-rate']);
        restHeartRate.push(entry['resting-heart-rate']);
        aerobThreshold.push(entry['aerobic-threshold']);
        anaerobThreshold.push(entry['anaerobic-threshold']);
        vo2Max.push(entry['vo2-max']);
      }

      this.statureChart = new Chart(this.statureCanvas.nativeElement, {
        type: 'line',
        data: {
          labels: createdData,
          datasets: [{
            data: weightData,
            label: 'Gewicht',
            borderColor: '#cf102f',
            backgroundColor: 'rgba(207,16,47,0.4)'
          }, {
            data: heightData,
            label: 'Größe',
            borderColor: '#009de1',
            backgroundColor: 'rgba(0,157,225,0.4)'
          }]
        }
      });

      this.heartRateChart = new Chart(this.heartRateCanvas.nativeElement, {
        type: 'line',
        data: {
          labels: createdData,
          datasets: [{
            data: maxHeartRate,
            label: 'maximal Puls',
            borderColor: '#cf102f',
            backgroundColor: 'rgba(207,16,47,0.4)'
          }, {
            data: restHeartRate,
            label: 'Ruhepuls',
            borderColor: '#009de1',
            backgroundColor: 'rgba(0,157,225,0.4)'
          }]
        }
      });

      this.aerobChart = new Chart(this.aerobCanvas.nativeElement, {
        type: 'line',
        data: {
          labels: createdData,
          datasets: [{
            data: aerobThreshold,
            label: 'Aerobe Schwelle',
            borderColor: '#cf102f',
            backgroundColor: 'rgba(207,16,47,0.4)'
          }, {
            data: anaerobThreshold,
            label: 'Anaerobe Schwelle',
            borderColor: '#009de1',
            backgroundColor: 'rgba(0,157,225,0.4)'
          }, {
            data: vo2Max,
            label: 'Maximale Sauerstoffaufnahme',
            borderColor: '#f0ad4e',
            backgroundColor: 'rgba(240,173,78,0.4)'
          }]
        }
      });
    }
  }
}
