import {Component} from '@angular/core';
import {Loading} from 'ionic-angular';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  loading: Loading;

  constructor() {
  }
}
