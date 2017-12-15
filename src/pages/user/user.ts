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
  }

  ionViewDidLoad() {
    let token = JSON.parse(localStorage.getItem('token'));
    if (token) {
      let json = JSON.parse(localStorage.getItem(String(token['x_user_id'])));
      this.user = json['user'];

      this.getUserData().then(user => {
        this.user = user;
        console.log('User Page', 'Get User Data', 'success', user);
      }, error => {
        console.log('User Page', 'Get User Data', 'error', error);
      });

    }
  }

  getUserData(): Promise<any> {
    return new Promise(((resolve, reject) => {
      this.polarData.getUserInformation().then(success => {
        resolve(success);
      }, error => {
        reject(error);

      });
    }));
  }
}
