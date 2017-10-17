import {Component} from '@angular/core';
import {IonicPage, Loading, LoadingController, NavController} from 'ionic-angular';
import {PolarDataProvider} from "../../providers/polar-data/polar-data";

@IonicPage()
@Component({
  selector: 'page-training',
  templateUrl: 'training.html',
})
export class TrainingPage {


  constructor(public navCtrl: NavController,
              private polarData: PolarDataProvider,
              public loadingCtrl: LoadingController) {

  }

}
