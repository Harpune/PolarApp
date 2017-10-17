import {Component, ViewChild} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {PolarDataProvider} from "../../providers/polar-data/polar-data";
import {Chart} from 'chart.js';
import {DatePipe} from "@angular/common";
import {CombineLatestOperator} from "rxjs/operator/combineLatest";
import {Color} from "ng2-charts";

@IonicPage()
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
    this.physical = JSON.parse(localStorage.getItem('physicalInfo'));
    if (this.physical) {
      console.log('Local physical info', this.physical);
    } else {
      console.log('No physical info');
    }

    this.polarData.listAvailableData().then(new_data => {
      console.log('New data', new_data);
      this.getNewPhysicalInfo(new_data);
    }, no_data => {
      console.log('No new data ', no_data);
    });
  }

  ionViewDidLoad() {
    this.updateCharts();
  }

  /**
   * Refresh and check for new data with 'Pull notifications'.
   * @param refresher
   */
  refresh(refresher) {
    console.log('Refreshed');
    if (refresher) {
      this.polarData.listAvailableData().then(new_data => {
        console.log('New data', new_data);
        this.getNewPhysicalInfo(new_data, refresher);
      }, no_data => {
        console.log('No new data ', no_data);
        refresher.complete();
      });
    }
  }

  /**
   * This resource allows partners to access their users’ physical information. Whenever some user’s physical
   * information changes, new entry containing full physical info is stored to AccessLink.
   * @param new_data
   * @param refresher
   */
  getNewPhysicalInfo(new_data: any, refresher?) {
    console.log('List available data', new_data);
    if (new_data) {
      let all_data = new_data['available-user-data'];
      this.dataContainsPhysicalInfo(all_data).then(index => {
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
                  this.updateCharts();
                  this.commitData(transactionIdUrl, refresher);
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

  showStature() {

  }

  /**
   *
   * @param all_data
   * @returns {Promise<number>}
   */
  dataContainsPhysicalInfo(all_data: any): Promise<number> {
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
   * @param physicalInfo
   */
  saveData(physicalInfo: any) {
    console.log('Save physical Data', physicalInfo);
    let physicalInfos = localStorage.getItem('physicalInfo');
    if (physicalInfos) {
      this.physical = JSON.parse(physicalInfos);
      console.log('Add physical Data', this.physical);
      this.physical.push(physicalInfo);
      console.log('Added physical Data', this.physical);
      localStorage.setItem('physicalInfo', JSON.stringify(this.physical));
    } else {
      let temp = [];
      temp.push(physicalInfo);
      this.physical = temp;
      console.log('New physical Data', this.physical);
      localStorage.setItem('physicalInfo', JSON.stringify(this.physical));
    }
  }

  /**
   *
   * @param {string} transactionIdUrl
   * @param refresher
   */
  private commitData(transactionIdUrl: string, refresher ?) {
    // Commit transaction.
    this.polarData.commit(transactionIdUrl).then(success => {
      console.log('Physical info committed', success);
      if (refresher) {
        refresher.complete();
      }
    }, error => {
      console.error('Physical info committed', error);
      if (refresher) {
        refresher.complete();
      }
    })
  }
}
