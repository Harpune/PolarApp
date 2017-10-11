import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule} from '@angular/core';
import {HttpModule} from '@angular/http';
import {HttpClientModule} from '@angular/common/http';
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';
import {SplashScreen} from '@ionic-native/splash-screen';
import {StatusBar} from '@ionic-native/status-bar';
import {InAppBrowser} from '@ionic-native/in-app-browser';

import {SuperTabsModule} from 'ionic2-super-tabs';

import {MyApp} from './app.component';
import {HomePage} from '../pages/home/home';
import {LoginPage} from '../pages/login/login';
import {UserPage} from '../pages/user/user';
import {TrainingPage} from '../pages/training/training';
import {TabsPage} from '../pages/tabs/tabs';
import {DailyActivityPage} from '../pages/daily-activity/daily-activity';
import {PhysicalInfoPage} from '../pages/physical-info/physical-info';
import {TrainingDataPage} from '../pages/training-data/training-data';

import {PolarDataProvider} from '../providers/polar-data/polar-data';
import {LocalDataProvider} from '../providers/local-data/local-data';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    LoginPage,
    UserPage,
    TrainingPage,
    TabsPage,
    DailyActivityPage,
    PhysicalInfoPage,
    TrainingDataPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp),
    SuperTabsModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    LoginPage,
    UserPage,
    TrainingPage,
    TabsPage,
    DailyActivityPage,
    PhysicalInfoPage,
    TrainingDataPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    InAppBrowser,
    PolarDataProvider,
    LocalDataProvider
  ]
})
export class AppModule {
}
