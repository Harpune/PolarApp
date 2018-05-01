import {Component} from '@angular/core';
import {AlertController, App, Events, NavController, NavParams, ViewController} from "ionic-angular";
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
  data: any;

  constructor(private viewCtrl: ViewController,
              private navCtrl: NavController,
              private alertCtrl: AlertController,
              private navParams: NavParams,
              private events: Events,
              private app: App,
              private localData: LocalDataProvider) {
    this.data = navParams.data;
    console.log('popover', this.data);
  }

  close() {
    this.viewCtrl.dismiss();
  }

  remove() {
    console.log('Popover', 'delete');
    this.close();

    let stringType = "dieses Ereignis";

    switch (this.data['type']['id']) {
      case 0:
        stringType = "dieses Training";
        break;
      case 1:
        stringType = "dieses Aktivität";
        break;
      case 2:
        stringType = "diese Information";
        break;
      default:

    }


    this.alertCtrl.create({
      title: 'Löschen?',
      message: `Wollen Sie ${stringType} wirklich löschen? Das kann nicht rückgängig gemacht werden!`,
      buttons: [
        {
          text: 'Nein',
          role: 'cancel',
          handler: () => {
            console.log('Delete', this.data['type'], 'Cancel clicked');
          }
        }, {
          text: 'Ja',
          handler: () => {
            console.log('Delete', this.data['type'], 'Ok clicked');
            this.localData.delete(this.data.data, this.data.type).then(success => {
              switch (this.data['type']['id']) {
                case 0:
                  this.events.publish('exercise:data', true);
                  break;
                case 1:
                  this.events.publish('activity:data', true);
                  break;
                case 2:
                  this.events.publish('physical:data', true);
                  break;
              }

              this.app.getRootNav().pop();
              console.log('Delete Activity', 'Success', success);
            }, error => {
              console.log('Delete Activity', 'Error', error);
            });
          }
        }
      ]
    }).present();
  }

}
