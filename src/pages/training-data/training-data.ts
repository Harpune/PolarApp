import {Component} from '@angular/core';
import {PolarDataProvider} from '../../providers/polar-data/polar-data';
import {LocalDataProvider} from "../../providers/local-data/local-data";
import {Observable} from 'rxjs/Observable';
import {Parser} from 'xml2js';
import 'rxjs/Rx'
import 'rxjs/add/observable/forkJoin'
import {App, Events} from "ionic-angular";
import {ActivityPage} from "../activity/activity";
import {ExercisePage} from "../exercise/exercise";

@Component({
  selector: 'page-training-data',
  templateUrl: 'training-data.html',
})

export class TrainingDataPage {
  user: any = {};
  exercise: any = [];
  summary: any = [];

  constructor(private polarData: PolarDataProvider,
              private localData: LocalDataProvider,
              private events: Events,
              private app: App) {
    events.subscribe('exercise:data', isData => {
      console.log('DailyActivityPage', 'Event triggered', isData);
      if (isData) {
        this.getLocalExercises()
      }
    })
  }

  /**
   * Ionic View did load.
   */
  ionViewDidLoad() {
    this.getLocalExercises();
  }

  getLocalExercises() {
    Observable.forkJoin(
      this.localData.getUser(),
      this.localData.getExercise()
    ).subscribe(success => {
      this.user = success[0];
      this.exercise = success[1];
      console.log('Exercise', this.user, this.exercise, this.summary);
      this.summary = this.exercise.map(a => a['summary']);
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
}
