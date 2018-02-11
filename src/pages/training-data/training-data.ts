import {Component} from '@angular/core';
import {LocalDataProvider} from "../../providers/local-data/local-data";
import {Observable} from 'rxjs/Observable';
import {AlertController, App, Events} from "ionic-angular";
import {ExercisePage} from "../exercise/exercise";
import {datatypes} from "../../assets/data/datatypes";
import 'rxjs/Rx'
import 'rxjs/add/observable/forkJoin'


@Component({
  selector: 'page-training-data',
  templateUrl: 'training-data.html',
})

export class TrainingDataPage {
  user: any = {};
  exercise: any = [];
  summary: any = [];

  constructor(private localData: LocalDataProvider,
              private alertCtrl: AlertController,
              private events: Events,
              private app: App) {
  }

  /**
   * Ionic View did load.
   */
  ionViewDidLoad() {
    this.getLocalExercises();

    this.events.subscribe('exercise:data', isData => {
      console.log('DailyActivityPage', 'Event triggered', isData);
      if (isData) {
        this.getLocalExercises()
      }
    })
  }

  getLocalExercises() {
    Observable.forkJoin(
      this.localData.getUser(),
      this.localData.get(datatypes['exercise'])
    ).subscribe(success => {
      this.user = success[0];
      this.exercise = success[1];
      this.summary = this.exercise
        .map(a => a['summary'])
        .sort((a, b) => {
          return new Date(b['start-time']).getTime() - new Date(a['start-time']).getTime();
        });


      console.log('Exercise', this.user, this.exercise, this.summary);
    });
  }

  /**
   * Go to the activityPage.
   * @param {number} index
   */
  showExercise(index: number) {
    let exe = this.exercise[index];
    console.log('Show Exercise', exe);
    this.app.getRootNav().push(ExercisePage, {exe: exe});
  }

  removeExercise(index: number) {
    let exe = this.exercise[index];
    console.log('Delete Exercise', exe);

    this.alertCtrl.create({
      title: 'Löschen?',
      message: `Wollen Sie dieses Trainging wirklich löschen? Das kann nicht rückgängig gemacht werden!`,
      buttons: [
        {
          text: 'Nein',
          role: 'cancel',
          handler: () => {
            console.log('Delete Activity', 'Cancel clicked');
          }
        }, {
          text: 'Ja',
          handler: () => {
            console.log('Delete Activity', 'Ok clicked');
            this.localData.delete(exe, datatypes['exercise']).then(success => {
              this.getLocalExercises();
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
