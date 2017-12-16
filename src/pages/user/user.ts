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
    let token = JSON.parse(localStorage.getItem('token'));
    if (token) {
      let json = JSON.parse(localStorage.getItem(String(token['x_user_id'])));
      this.user = json['user'];
    } else{
      console.log('UserPage', 'token', token);
    }
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
