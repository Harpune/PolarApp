import {Component} from '@angular/core';
import {ModalController, NavController, NavParams} from 'ionic-angular';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public modalCtrl: ModalController) {
    // TODO ionic modals with map-chooser
    // TODO reset data
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad SettingsPage');
  }

  resetData() {

  }

}
