import {Component} from '@angular/core';
import {NavParams} from 'ionic-angular';

@Component({
  selector: 'page-exercise',
  templateUrl: 'exercise.html',
})
export class ExercisePage {
  exercise: any;

  summary: any;
  samples: any;
  heartRateZone: any;
  gpx: any;
  tcx: any;


  constructor(public navParams: NavParams) {
    this.exercise = navParams.get('exe');

    this.summary = this.exercise['summary'];
    this.samples = this.exercise['samples'];
    this.heartRateZone = this.exercise['heart-rate-zone'];
    this.gpx = this.exercise['gpx'];
    this.tcx = this.exercise['tcx'];

    console.log('Exercise', this.exercise);
  }


}
