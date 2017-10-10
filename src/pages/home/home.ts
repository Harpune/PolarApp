import {Component} from '@angular/core';
import {Loading} from 'ionic-angular';
import {PolarDataProvider} from "../../providers/polar-data/polar-data";


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  loading: Loading;

  constructor(private polarData:PolarDataProvider) {
    this.polarData.checkForPhysicalInfo().then(success => {
      console.log('Check for physical info', success);
    }, error => {
      console.error('Check for physical info', error);
    })
  }
}
