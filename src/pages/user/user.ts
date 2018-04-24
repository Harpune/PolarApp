import {Component} from '@angular/core';
import {PolarDataProvider} from "../../providers/polar-data/polar-data";
import {LocalDataProvider} from "../../providers/local-data/local-data";

@Component({
  selector: 'page-user',
  templateUrl: 'user.html',
})

export class UserPage {
  user: any;

  constructor(public localData: LocalDataProvider,
              public polarData: PolarDataProvider) {
    localData.getUser().then(user => {
      this.user = user;
    }, error => {
      console.log(error);
    });
  }

  ionViewDidLoad() {
    this.getUserData().then(user => {
      console.log('UserPage', 'get User data', user);
      this.user = user;
    },error => {
      console.log('UserPage', 'get User data', error);
    });
  }

  getUserData():Promise<any> {
    return new Promise<any>((resolve, reject)=> {
      this.polarData.getUserInformation().then(data => {
        resolve(data);
      },error => {
        reject(error);
      })
    });

  }
}
