import {Component, ViewChild} from '@angular/core';
import {AlertController, Events, NavController, NavParams} from 'ionic-angular';
import {Chart} from 'chart.js';
import {parse, toSeconds} from 'iso8601-duration';
import {datatypes} from "../../assets/data/datatypes";
import {LocalDataProvider} from "../../providers/local-data/local-data";

@Component({
  selector: 'page-activity',
  templateUrl: 'activity.html',
})
export class ActivityPage {
  activity: any;

  summary: any;
  stepSamples: any;
  zoneSamples: any;

  @ViewChild('stepsCanvas') stepsCanvas;
  @ViewChild('zonesCanvas') zonesCanvas;
  stepsChart: any;
  zonesChart: any;

  constructor(private navParams: NavParams,
              private localData: LocalDataProvider,
              private events: Events,
              private alertCtrl: AlertController,
              private navCtrl: NavController) {
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
        for (let i = 0; i < entry['activity-zones'].length; i++) {
          zones[i] = zones[i] + toSeconds(parse(entry['activity-zones'][i]['inzone']));
        }

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

  removeActivity() {
    this.alertCtrl.create({
      title: 'Löschen?',
      message: `Wollen Sie diese Aktivität wirklich löschen? Das kann nicht rückgängig gemacht werden!`,
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
            this.localData.delete(this.activity, datatypes['activity']).then(success => {
              console.log('Delete Activity', 'Success', success);

              // Notify the Tab.
              this.events.publish('activity:data', true);

              // Pop to tabs page.
              this.navCtrl.pop();
            }, error => {
              console.log('Delete Activity', 'Error', error);
            });
          }
        }
      ]
    }).present();
  }
}
