import {Component, ElementRef, ViewChild} from '@angular/core';
import {AlertController, Events, NavController, NavParams} from 'ionic-angular';
import {parse, toSeconds} from 'iso8601-duration';
import {Chart} from 'chart.js';
import leaflet from 'leaflet';
import toGeoJson from '@mapbox/togeojson'
import {environment} from '../../assets/data/environment';
import {datatypes} from "../../assets/data/datatypes";
import {LocalDataProvider} from "../../providers/local-data/local-data";

let apiToken = environment.mapbox_id;

@Component({
  selector: 'page-exercise',
  templateUrl: 'exercise.html',
})

export class ExercisePage {
  @ViewChild('map') mapContainer: ElementRef;
  map: any;

  @ViewChild('sampleCanvas') sampleCanvas;
  @ViewChild('heartRateCanvas') heartRateCanvas;
  sampleChart: any;
  heartRateChart: any;

  exercise: any;
  summary: any;
  samples: any;
  heartRateZone: any;
  gpx: any;
  tcx: any;

  constructor(public navParams: NavParams,
              private localData: LocalDataProvider,
              private events: Events,
              private alertCtrl: AlertController,
              private navCtrl: NavController) {
    this.exercise = navParams.get('exe');

    this.summary = this.exercise['summary'];
    this.samples = this.exercise['samples'];
    this.heartRateZone = this.exercise['heart-rate-zone']['zone'];
    this.gpx = this.exercise['gpx'];
    this.tcx = this.exercise['tcx'];

    console.log('Exercise', this.exercise);
  }

  ionViewDidLoad() {
    this.updateCharts();
    this.loadMap();
  }

  loadMap() {
    this.map = leaflet.map('map').fitWorld();

    // Setup the map.
    leaflet.tileLayer('https://api.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18,
      id: 'mapbox.run-bike-hike',
      accessToken: apiToken
    }).addTo(this.map);

    // Add geoJson data and find its bounds.
    let jsonLayer = leaflet.geoJSON(this.gpx).addTo(this.map);
    this.map.fitBounds(jsonLayer.getBounds())

  }

  private updateCharts() {
    if (this.samples) {
      let datasets = [];
      for (let sample of this.samples) {
        let data = sample['data'].split(',');
        console.log('UpdateCharts', data, sample);
        switch (sample['sample-type']) {
          case '0'://Heart rate	bpm
            datasets.push({
              label: 'Herzfrequenz',
              data: data,
              borderColor: '#009de1',
            });
            break;
          case '1'://Speed  km/h
            datasets.push({
              label: 'Geschwindigkeit',
              data: data,
              borderColor: '#cf102f',
            });
            break;
          case '2'://Cadence	rpm
            datasets.push({
              label: 'Kandenz',
              data: data,
              borderColor: '#f0ad4e',
            });
            break;
          case '3'://Altitude	m
            datasets.push({
              label: 'Höhe',
              data: data,
              borderColor: '#0EC639',
            });
            break;
          case '4'://Power	W
            datasets.push({
              label: 'Kraft',
              data: data,
              borderColor: '#009de1',
            });
            break;
          case '5'://Power pedaling index	%
            datasets.push({
              label: 'Power pedaling index',
              data: data,
              borderColor: '#009de1',
            });
            break;
          case '6'://Power left-right balance	%
            datasets.push({
              label: 'Power left-right balance',
              data: data,
              borderColor: '#009de1',
            });
            break;
          case '7'://Air pressure	hpa
            datasets.push({
              label: 'Luftdruck',
              data: data,
              borderColor: '#009de1',
            });
            break;
          case '8'://Running cadence	spm
            datasets.push({
              label: 'Laufkadenz',
              data: data,
              borderColor: '#009de1',
            });
            break;
          case '9'://Temperature	ºC
            datasets.push({
              label: 'Temperatur',
              data: data,
              borderColor: '#009de1',
            });
            break;
          case '10'://Distance	m
            datasets.push({
              label: 'Distanz',
              data: data,
              borderColor: '#0EC639',
            });
            break;
          case '11'://RR Interval	ms

            break;
          default:
        }
      }

      console.log('UpdateCharts', 'datasets', datasets);
      // Display all samples.
      this.sampleChart = new Chart(this.sampleCanvas.nativeElement, {
        type: 'line',
        data: {
          datasets: datasets,
        }
      });

      // Update Heart-Rate-Zones.
      let zoneDuration = this.heartRateZone.map(a => toSeconds(parse(a['in-zone'])));
      let zoneHeartRateLimit = this.heartRateZone.map(a => a['lower-limit'] + ' bis ' + a['upper-limit']);
      console.log('UpdateCharts', 'zoneDuration', zoneDuration);
      this.heartRateChart = new Chart(this.heartRateCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels: zoneHeartRateLimit,
          datasets: [{
            label: 'Herzfrequenzzone',
            data: zoneDuration,
            backgroundColor: [
              '#f2637a',
              '#e22954',
              '#cf102f',
              '#a6041e',
              '#810014'
            ]
          }],
        },
        options: {
          legend: {
            display: false
          },
          tooltips: {
            callbacks: {
              label: function (tooltipItem) {
                return tooltipItem.yLabel;
              }
            }
          }
        }
      });
    }
  }

  removeExercise() {
    this.alertCtrl.create({
      title: 'Löschen?',
      message: `Wollen Sie dieses Training wirklich löschen? Das kann nicht rückgängig gemacht werden!`,
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
            this.localData.delete(this.exercise, datatypes['exercise']).then(success => {
              console.log('Delete Exercise', 'Success', success);

              // Notify the Tab.
              this.events.publish('exercise:data', true);

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
