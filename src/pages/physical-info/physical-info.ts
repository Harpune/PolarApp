import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {PolarDataProvider} from "../../providers/polar-data/polar-data";

@IonicPage()
@Component({
  selector: 'page-physical-info',
  templateUrl: 'physical-info.html',
})
export class PhysicalInfoPage {
  physical: any = null;

  constructor(private navCtrl: NavController,
              private navParams: NavParams,
              private polarData: PolarDataProvider) {

    this.checkForNewData().then(new_data => {
      this.getNewPhysicalInfo(new_data);
    }, () => {
      this.physical = localStorage.getItem('physical-information');
      if (this.physical) {
        console.log('Physical info', JSON.parse(this.physical));
      } else {
        console.log('No physical info');
      }
    });

    this.physical = localStorage.getItem('physical-information');
  }

  refresh(refresher) {
    console.log('Refreshed');
    if (refresher) {
      this.checkForNewData().then(new_data => {
        this.getNewPhysicalInfo(new_data);
      }, () => {
        refresher.complete();
      });
    }
  }

  checkForNewData(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.polarData.listAvailableData().then(new_data => {
        resolve(new_data);
      }, error => {
        reject(error);
      });
    });

  }

  getNewPhysicalInfo(new_data: any) {
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

              for(let info of physicalInfoId['physical-informations']){
                console.log('List physical info', info);
                this.polarData.getPhysicalInfo(info).then(physicalInfo => {
                  console.log('Get physical info', physicalInfo);
                  //TODO save physical info in array to display progress
                  this.physical = physicalInfo;
                  localStorage.setItem('physical-information', JSON.stringify(physicalInfo));
                  //this.saveNewPhysicalData(physicalInfo);
                  /*
                  this.polarData.commitPhysicalInfo(transactionId).then(success => {
                    console.log('Physical info commited', success);
                  }, error => {
                    console.error('Physical info commited', error);
                  })
                  */
                }, error => {
                  console.error(error);
                });
              }//for-loop

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

  saveNewPhysicalData(physicalInfo:any) {
    let physicalInfos = localStorage.getItem('physical-information');
    if(physicalInfos){
      let infos = JSON.parse(physicalInfos);
      console.log('Add physical Data', infos);
      infos.push(physicalInfo);
      console.log('Added physical Data', infos);
      localStorage.setItem('physical-information', JSON.stringify(infos));
    } else {
      console.log('Save physical Data', physicalInfo);
      localStorage.setItem('physical-information', JSON.stringify(physicalInfo));
    }
  }
}
