import {Component} from '@angular/core';
import {IonicPage, Loading, LoadingController, NavController} from 'ionic-angular';
import {PolarDataProvider} from "../../providers/polar-data/polar-data";

@IonicPage()
@Component({
  selector: 'page-training',
  templateUrl: 'training.html',
})
export class TrainingPage {
  refreshed: boolean;
  loading: Loading;

  constructor(public navCtrl: NavController,
              private polarData: PolarDataProvider,
              public loadingCtrl: LoadingController) {
    this.refreshed = false;
    this.listAvailableData();
    this.initiateExerciseTransaction();
  }

  listAvailableData() {
    this.polarData.listAvailableData().then(success => {
      console.log('List available data', success);
      this.refreshed = true;
    }, error => {
      console.error('List available data', error);

      this.refreshed = false;
    })
  }

  private initiateExerciseTransaction() {
    this.polarData.createTrainingData().then(success => {
      console.log('initiate exercise transaction', success);
    }, error => {
      console.error('initiate exercise transaction', error);
    })
  }
}
