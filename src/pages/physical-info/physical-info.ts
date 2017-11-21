import {Component, ViewChild} from '@angular/core';
import {PolarDataProvider} from "../../providers/polar-data/polar-data";
import {Chart} from 'chart.js';
import {DatePipe} from "@angular/common";
import {LocalDataProvider} from "../../providers/local-data/local-data";
import {Observable} from 'rxjs/Rx';
import {SQLitePorter} from "@ionic-native/sqlite-porter";

@Component({
  selector: 'page-physical-info',
  templateUrl: 'physical-info.html',
})
export class PhysicalInfoPage {
  physical: any = [];
  user: any = {};
  weight: string;

  @ViewChild('statureCanvas') statureCanvas;
  @ViewChild('heartRateCanvas') heartRateCanvas;
  @ViewChild('aerobCanvas') aerobCanvas;
  statureChart: any;
  heartRateChart: any;
  aerobChart: any;

  constructor(private polarData: PolarDataProvider,
              private datePipe: DatePipe,
              private localData: LocalDataProvider) {
    //localStorage.removeItem('physicalInfo');
    let token = JSON.parse(localStorage.getItem('token'));
    this.user = JSON.parse(localStorage.getItem(String(token.x_user_id))) || {};
  }

  ionViewDidLoad() {
    this.physical = JSON.parse(localStorage.getItem('physicalInfo')) || [];

    if (this.physical) {
      console.log('Physical info', this.physical);
      this.weight = this.physical[this.physical.length - 1]['weight'];
      this.updateCharts();
    } else {
      console.log('No physical info');
    }

    Observable.interval(1000 * 60 * 10).startWith(0).subscribe(trigger => {
      console.log('No. ' + trigger + ': 10 minutes more');
      this.checkForNewData()
    });

  }

  /**
   * Check for a new update.
   */
  checkForNewData() {
    this.polarData.listAvailableData().then(new_data => {
      console.log('New data', new_data);
      this.getPhysicalInfo(new_data).then(success => {
        this.updateCharts();
      }, error => {
        console.error('Error physical info', error);
      });
    }, no_data => {
      console.log('No physical info', no_data);
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
          this.polarData.create(data['url']).then(transaction => {
            console.log('Create physical info', transaction);

            // List new physical information.
            this.polarData.list(transaction['resource-uri']).then(physicalInfoId => {
              console.log('List physical info', physicalInfoId);
              let length = Object.keys(physicalInfoId['physical-informations']).length;

              let datas = [];
              let infos = [];

              physicalInfoId['physical-informations'].forEach((info, index) => {

                Observable.forkJoin(
                  this.polarData.get(info)
                ).subscribe(data => {

                  datas.push(data);
                  infos.push(info);//TODO change to exercise id.

                  if (index >= length - 1) {
                    // Save the data.
                    this.localData.savePhysical(transaction['transaction-id'], infos, datas);

                    // Commit the transaction.
                    this.polarData.commit(transaction['resource-uri']).then(success => {
                      resolve(success);
                    }, error => {
                      reject(error);
                    })
                  }
                }, error => {
                  reject(error);
                });
              });
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
