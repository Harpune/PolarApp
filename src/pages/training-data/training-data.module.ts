import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TrainingDataPage } from './training-data';

@NgModule({
  declarations: [
    TrainingDataPage,
  ],
  imports: [
    IonicPageModule.forChild(TrainingDataPage),
  ],
})
export class TrainingDataPageModule {}
