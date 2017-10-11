import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {PolarDataProvider} from "../../providers/polar-data/polar-data";

@IonicPage()
@Component({
  selector: 'page-training-data',
  templateUrl: 'training-data.html',
})
export class TrainingDataPage {

  constructor(private navCtrl: NavController,
              private navParams: NavParams,
              private polarData: PolarDataProvider) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad TrainingDataPage');
  }

}
