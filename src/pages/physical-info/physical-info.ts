import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {PolarDataProvider} from "../../providers/polar-data/polar-data";

@IonicPage()
@Component({
  selector: 'page-physical-info',
  templateUrl: 'physical-info.html',
})
export class PhysicalInfoPage {
  physical:any = [];

  constructor(private navCtrl: NavController,
              private navParams: NavParams,
              private polarData: PolarDataProvider) {

    this.polarData.listAvailableData().then(new_data => {
      console.log('New data', new_data);
      this.getNewPhysicalInfo(new_data);
    }, no_data => {
      console.log('No new data ', no_data);
      this.physical = JSON.parse(localStorage.getItem('physicalInfo'));
      if (this.physical) {
        console.log('Physical info', this.physical);
      } else {
        console.log('No physical info');
      }
    });
  }

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

  getNewPhysicalInfo(new_data: any, refresher?) {
    console.log('List available data', new_data);
    if (new_data) {
      let all_data = new_data['available-user-data'];
      console.log('All data', all_data);

      for (let data of all_data) {
        if (data['data-type'] == 'PHYSICAL_INFORMATION') {
          console.log('PHYSICAL_INFORMATION');
          this.polarData.createPhysicalInfo().then(transactionId => {
            console.log('Create physical info', transactionId);
            this.polarData.listPhysicalInfo(transactionId).then(physicalInfoId => {
              console.log('List physical infos', physicalInfoId);
              let length = physicalInfoId.length;
              console.log('Length', length);
              let count = 0;
              for (let info of physicalInfoId['physical-informations']) {
                console.log('List physical info', info);
                this.polarData.getPhysicalInfo(info).then(physicalInfo => {
                  console.log('Get physical info', physicalInfo);
                  this.saveNewPhysicalData(physicalInfo);
                  console.log('Count: ' + count + 'Legnth: ' + length);
                  count++;
                }, error => {
                  console.error(error);
                });
              }//for-loop

              if(count >= length){
                console.log('Count: ' + count + 'Legnth: ' + length);
                refresher.complete();
                /*
                this.polarData.commitPhysicalInfo(transactionId).then(success => {
                  console.log('Physical info commited', success);
                  refresher.complete();
                }, error => {
                  console.error('Physical info commited', error);
                  refresher.complete();
                })
                */
              }

            }, error => {
              console.error('List physical info', error);
            })
          }, error => {
            console.error('Create physical info', error);
          })
        }
      }
    } else {
      console.log('No new physical info');
    }
  }

  saveNewPhysicalData(physicalInfo: any) {

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
}
