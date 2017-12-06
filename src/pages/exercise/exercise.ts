import { Component } from '@angular/core';
import { NavParams } from 'ionic-angular';

@Component({
  selector: 'page-exercise',
  templateUrl: 'exercise.html',
})
export class ExercisePage {
  exercise:any;
  summary: any;


  constructor(public navParams: NavParams) {
    this.exercise = navParams.get('exe');

    console.log('Exercise', this.exercise);
  }


}
