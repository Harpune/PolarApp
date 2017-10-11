import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DailyActivityPage } from './daily-activity';

@NgModule({
  declarations: [
    DailyActivityPage,
  ],
  imports: [
    IonicPageModule.forChild(DailyActivityPage),
  ],
})
export class DailyActivityPageModule {}
