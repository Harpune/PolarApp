import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PhysicalInfoPage } from './physical-info';

@NgModule({
  declarations: [
    PhysicalInfoPage,
  ],
  imports: [
    IonicPageModule.forChild(PhysicalInfoPage),
  ],
})
export class PhysicalInfoPageModule {}
