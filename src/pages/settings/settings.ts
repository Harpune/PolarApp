import {Component} from '@angular/core';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {
  toggleActivity: boolean;

  constructor() {
    this.toggleActivity = JSON.parse(localStorage.getItem('toggleActivity')) === true;
    console.log('constructor', 'toggleActivity', this.toggleActivity);
    // TODO ionic modals with map-chooser
    // TODO reset data
    // TODO show all dailyactivity or just those with steps
  }

  updateActivites() {
    console.log('toggleActivity', this.toggleActivity);
    localStorage.setItem('toggleActivity', JSON.stringify(this.toggleActivity));
  }


  resetData() {

  }

}
