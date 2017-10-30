import {Component, ViewChild} from '@angular/core';
import {NavController, NavParams} from 'ionic-angular';
import {Chart} from 'chart.js';
import {parse, end, toSeconds, pattern} from 'iso8601-duration';

@Component({
  selector: 'page-activity',
  templateUrl: 'activity.html',
})
export class ActivityPage {
  activity: any;
  stepSamples: any;
  zoneSamples: any;
  @ViewChild('stepsCanvas') stepsCanvas;
  stepsChart: any;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.activity = navParams.get('act');
    let index = navParams.get('index');

    console.log('Activity', this.activity);
    this.stepSamples = JSON.parse(localStorage.getItem('activity_step'))[index];
    console.log('Steps', this.stepSamples);
    this.zoneSamples = JSON.parse(localStorage.getItem('activity_zone'))[index];
    console.log('Zones', this.zoneSamples);
  }

  ionViewDidLoad() {
    this.updateChart();
  }

  updateChart() {
    if (this.stepSamples) {
      let steps = [];
      let times = [];
      for (let step of this.stepSamples['samples']) {
        steps.push(step['steps']);
        times.push(step['time']);
      }
      console.log('Steps', steps);
      console.log('Time', times);

      this.stepsChart = new Chart(this.stepsCanvas.nativeElement, {
        type: 'doughnut',
        data: {
          labels: times,
          datasets: [{
            data: steps,
            label: 'Schritte',
            borderColor: '#cf102f',
            backgroundColor: 'rgba(207,16,47,0.4)'
          }]
        }
      });
    }

    if (this.zoneSamples) {
      let zones = [0, 0, 0, 0, 0, 0];
      for (let entry of this.zoneSamples['samples']) {
        console.log(toSeconds(parse(entry['activity-zones'][0]['inzone'])));
        zones[0] = zones[0] + toSeconds(parse(entry['activity-zones'][0]['inzone']));
        zones[1] = zones[1] + toSeconds(parse(entry['activity-zones'][1]['inzone']));
        zones[2] = zones[2] + toSeconds(parse(entry['activity-zones'][2]['inzone']));
        zones[3] = zones[3] + toSeconds(parse(entry['activity-zones'][3]['inzone']));
        zones[4] = zones[4] + toSeconds(parse(entry['activity-zones'][4]['inzone']));
        zones[5] = zones[5] + toSeconds(parse(entry['activity-zones'][5]['inzone']));
      }

      console.log('ZOOONE', zones);

      this.stepsChart = new Chart(this.stepsCanvas.nativeElement, {
        type: 'doughnut',
        data: {
          labels: ['Sleep', 'Sedentary', 'Light', 'Moderate', 'Vigorous', 'Non Wear'],
          datasets: [{
            data: zones,
            backgroundColor: [
              "#2ecc71",
              "#3498db",
              "#95a5a6",
              "#f1c40f",
              "#e74c3c",
              "#34495e"
            ]
          }]
        }
      });
    }
  }
}
