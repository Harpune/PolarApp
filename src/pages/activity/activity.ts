import {Component, ViewChild} from '@angular/core';
import {NavParams} from 'ionic-angular';
import {Chart} from 'chart.js';
import {parse, end, toSeconds, pattern} from 'iso8601-duration';
import {DatePipe} from "@angular/common";

@Component({
  selector: 'page-activity',
  templateUrl: 'activity.html',
})
export class ActivityPage {
  activity: any;

  summary:any;
  stepSamples: any;
  zoneSamples: any;

  @ViewChild('stepsCanvas') stepsCanvas;
  @ViewChild('zonesCanvas') zonesCanvas;
  stepsChart: any;
  zonesChart: any;

  constructor(private navParams: NavParams) {
    this.activity = navParams.get('act');

    this.summary = this.activity['summary'];
    this.stepSamples = this.activity['steps'];
    this.zoneSamples = this.activity['zones'];

    console.log('Activity', this.activity);
    console.log('Step samples', this.stepSamples);
    console.log('ZoneSamples', this.zoneSamples);
  }

  ionViewDidLoad() {
    this.updateCharts();
  }

  updateCharts() {
    if (this.stepSamples) {
      let steps = [];
      let times = [];
      let count = 0;
      for (let step of this.stepSamples['samples']) {
        steps.push(step['steps']);
        times.push(count++ + ':00');
      }

      this.stepsChart = new Chart(this.stepsCanvas.nativeElement, {
        type: 'line',
        data: {
          labels: times,
          datasets: [{
            data: steps,
            label: 'Schritte',
            borderColor: '#009de1',
            backgroundColor: 'rgba(0,157,225,0.4)'
          }]
        }
      });
    }
    /*
     * backgroundColor: [
     '#24BBFC',
     '#07B4FF',
     '#009DE1',
     '#006F9E',
     '#00577D',
     '#666'
     ]
     */
    // TODO zone zeit ordentlich dartestellen (nicht in Sekunden)
    // TODO zusätzliche Bar mit den Zeiten (dann ohne oberes TODO eventuell)
    if (this.zoneSamples) {
      let zones = [0, 0, 0, 0, 0, 0];
      for (let entry of this.zoneSamples['samples']) {
        zones[0] = zones[0] + toSeconds(parse(entry['activity-zones'][0]['inzone']));
        zones[1] = zones[1] + toSeconds(parse(entry['activity-zones'][1]['inzone']));
        zones[2] = zones[2] + toSeconds(parse(entry['activity-zones'][2]['inzone']));
        zones[3] = zones[3] + toSeconds(parse(entry['activity-zones'][3]['inzone']));
        zones[4] = zones[4] + toSeconds(parse(entry['activity-zones'][4]['inzone']));
        zones[5] = zones[5] + toSeconds(parse(entry['activity-zones'][5]['inzone']));
      }

      this.zonesChart = new Chart(this.zonesCanvas.nativeElement, {
        type: 'doughnut',
        data: {
          labels: ['Ruhe', 'Sitzen', 'Niedrig', 'Mittel', 'Hoch', 'Nicht an'],
          datasets: [{
            data: zones,
            backgroundColor: [
              '#f2637a',
              '#e22954',
              '#cf102f',
              '#a6041e',
              '#810014',
              '#666'
            ]
          }]
        },
        options: {
          maintainAspectRatio: false
        }
      });
    }
  }
}
