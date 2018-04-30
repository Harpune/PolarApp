import {Component, ElementRef, ViewChild} from '@angular/core';
import {NavParams, PopoverController} from 'ionic-angular';
import {parse, toSeconds} from 'iso8601-duration';
import {Chart} from 'chart.js';
import leaflet from 'leaflet';
import {environment} from '../../assets/data/environment';
import {datatypes} from "../../assets/data/datatypes";
import {PopoverPage} from "../popover/popover";

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
              private popoverCtrl: PopoverController) {
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
      // Display all samples.
      this.sampleChart = new Chart(this.sampleCanvas.nativeElement, {
        type: 'line',
        data: {
          datasets: this.samples,
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

  presentPopover(myEvent) {
    console.log('popover');

    let popover = this.popoverCtrl.create(PopoverPage, {
      'data': this.exercise,
      'type': datatypes.exercise
    });
    popover.present({
      ev: myEvent
    });
  }
}
