import {Component} from '@angular/core';
import {NavParams, ViewController} from "ionic-angular";
import {LocalDataProvider} from "../../providers/local-data/local-data";

@Component({
  template: `
    <ion-list>
      <ion-list-header>Ionic</ion-list-header>
      <button ion-item (click)="remove()">Delete</button>
      <button ion-item (click)="close()">Teilen</button>
      <button ion-item (click)="close()">Als Favorite</button>
    </ion-list>
  `
})
export class PopoverPage {
  data:any;

  constructor(private viewCtrl: ViewController,
              private navParams: NavParams,
              private localData: LocalDataProvider) {
    this.data = navParams.data;
    console.log('popover', this.data);
  }

  close() {
    this.viewCtrl.dismiss();
  }

  remove() {
    close();
    this.localData.delete(this.data.data, this.data.type);
    console.log('Popover', 'delete');
  }

}
