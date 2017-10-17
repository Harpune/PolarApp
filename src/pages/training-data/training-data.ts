import {Component} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {PolarDataProvider} from "../../providers/polar-data/polar-data";

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
      console.log('Local training data', this.training);
    } else {
      console.log('No training data');
    }
  }
}
