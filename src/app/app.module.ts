import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule} from '@angular/core';
import {HttpModule} from '@angular/http';
import {DatePipe} from "@angular/common";
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';
import {SplashScreen} from '@ionic-native/splash-screen';
import {StatusBar} from '@ionic-native/status-bar';
import {InAppBrowser} from '@ionic-native/in-app-browser';

import {SuperTabsModule} from 'ionic2-super-tabs';

import {MyApp} from './app.component';
import {LoginPage} from '../pages/login/login';
import {UserPage} from '../pages/user/user';
import {TabsPage} from '../pages/tabs/tabs';
import {DailyActivityPage} from '../pages/daily-activity/daily-activity';
import {PhysicalInfoPage} from '../pages/physical-info/physical-info';
import {TrainingDataPage} from '../pages/training-data/training-data';
import {ActivityPage} from "../pages/activity/activity";

import {PolarDataProvider} from '../providers/polar-data/polar-data';
import {LocalDataProvider} from '../providers/local-data/local-data';
import {TokenInterceptor} from '../providers/auth/interceptor';


@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    UserPage,
    TabsPage,
    DailyActivityPage,
    PhysicalInfoPage,
    TrainingDataPage,
    ActivityPage
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
    LoginPage,
    UserPage,
    TabsPage,
    DailyActivityPage,
    PhysicalInfoPage,
    TrainingDataPage,
    ActivityPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    InAppBrowser,
    PolarDataProvider,
    LocalDataProvider,
    DatePipe,
    {provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true}
  ]
})
export class AppModule {
}
