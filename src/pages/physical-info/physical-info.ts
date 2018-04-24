import {Component, ViewChild} from '@angular/core';
import {Chart} from 'chart.js';
import {DatePipe} from "@angular/common";
import {LocalDataProvider} from "../../providers/local-data/local-data";
import {Observable} from 'rxjs/Rx';
import {Events} from "ionic-angular";
import {datatypes} from "../../assets/data/datatypes";
import {PolarDataProvider} from "../../providers/polar-data/polar-data";

@Component({
  selector: 'page-physical-info',
  templateUrl: 'physical-info.html',
})
export class PhysicalInfoPage {
  user: any = {};
  physical: any = [];
  weight: string;
  height: string;

  @ViewChild('statureCanvas') statureCanvas;
  @ViewChild('heartRateCanvas') heartRateCanvas;
  @ViewChild('aerobCanvas') aerobCanvas;
  statureChart: any;
  heartRateChart: any;
  aerobChart: any;

  constructor(private datePipe: DatePipe,
              private events: Events,
              private polarData: PolarDataProvider,
              private localData: LocalDataProvider) {
  }

  /**
   * Ionic View did load.
   */
  ionViewDidLoad() {
    this.getLocalPhysical();
    this.getUserData();

    this.events.subscribe('physical:data', isData => {
      console.log('PhysicalInfoPage', 'Event triggered', isData);
      if (isData) {
        this.getLocalPhysical()
      }
    })
  }

  getUserData() {
      this.localData.getMasterJson().then(json => {
        this.polarData.getUserInformation().then(user => {
          this.user = user;
          json['user'] = user;
          this.localData.setMasterJson(json).then(() => {
            console.log('GetUserData', 'Success', user);
          });
        }, error => {
          console.log('GetUserData', 'Error', error);
        })
      });
  }

  getLocalPhysical() {
    Observable.forkJoin(
      this.localData.getUser(),
      this.localData.get(datatypes['physical'])
    ).subscribe(success => {
      this.user = success[0];
      this.physical = success[1]
        .map(a => a['summary'])
        .sort((a, b) => {
          return new Date(a.created).getTime() - new Date(b.created).getTime();
        });


      console.log('Physical', this.user, this.physical);

      if (this.physical.length > 0) {
        this.weight = this.physical[this.physical.length - 1]['weight'];
        this.height = this.physical[this.physical.length - 1]['height'];
        this.updateCharts();
      } else {
        console.log('No physical info');
      }
    });
  }

  updateCharts() {
    // TODO check if there is any data, if not: dont show canvas OR show note that there is no data.
    if (this.physical) {
      let createdData = [];
      let heightData = [];
      let weightData = [];
      let maxHeartRate = [];
      let restHeartRate = [];
      let aerobThreshold = [];
      let anaerobThreshold = [];
      let vo2Max = [];

      for (let entry of this.physical) {
        createdData.push(this.datePipe.transform(entry['created'], 'dd-MM-yy'));
        heightData.push(entry['height']);
        weightData.push(entry['weight']);
        maxHeartRate.push(entry['maximum-heart-rate']);
        restHeartRate.push(entry['resting-heart-rate']);
        aerobThreshold.push(entry['aerobic-threshold']);
        anaerobThreshold.push(entry['anaerobic-threshold']);
        vo2Max.push(entry['vo2-max']);
      }

      this.statureChart = new Chart(this.statureCanvas.nativeElement, {
        type: 'line',
        data: {
          labels: createdData,
          datasets: [{
            data: weightData,
            label: 'Gewicht',
            borderColor: '#cf102f',
            backgroundColor: 'rgba(207,16,47,0.4)'
          }, {
            data: heightData,
            label: 'Größe',
            borderColor: '#009de1',
            backgroundColor: 'rgba(0,157,225,0.4)'
          }]
        }
      });

      this.heartRateChart = new Chart(this.heartRateCanvas.nativeElement, {
        type: 'line',
        data: {
          labels: createdData,
          datasets: [{
            data: maxHeartRate,
            label: 'maximal Puls',
            borderColor: '#cf102f',
            backgroundColor: 'rgba(207,16,47,0.4)'
          }, {
            data: restHeartRate,
            label: 'Ruhepuls',
            borderColor: '#009de1',
            backgroundColor: 'rgba(0,157,225,0.4)'
          }]
        }
      });

      this.aerobChart = new Chart(this.aerobCanvas.nativeElement, {
        type: 'line',
        data: {
          labels: createdData,
          datasets: [{
            data: aerobThreshold,
            label: 'Aerobe Schwelle',
            borderColor: '#cf102f',
            backgroundColor: 'rgba(207,16,47,0.2)'
          }, {
            data: anaerobThreshold,
            label: 'Anaerobe Schwelle',
            borderColor: '#009de1',
            backgroundColor: 'rgba(0,157,225,0.2)'
          }, {
            data: vo2Max,
            label: 'Maximale Sauerstoffaufnahme',
            borderColor: '#f0ad4e',
            backgroundColor: 'rgba(240,173,78,0.2)'
          }]
        }
      });
    }
  }
}
