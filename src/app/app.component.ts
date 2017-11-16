import {Component} from '@angular/core';

import {Platform} from 'ionic-angular';

import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {SQLite, SQLiteObject} from "@ionic-native/sqlite";
import {SQLitePorter} from '@ionic-native/sqlite-porter';

import {LoginPage} from "../pages/login/login";
import {TabsPage} from "../pages/tabs/tabs";

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  pages: Array<{ title: string, icon: string, component: any }>;
  rootPage: any = LoginPage;
  token: any;

  constructor(private platform: Platform,
              private statusBar: StatusBar,
              private splashScreen: SplashScreen,
              private sqlite: SQLite,
              private sqlitePorter: SQLitePorter) {
    //localStorage.removeItem('currentUser');
    this.token = JSON.parse(localStorage.getItem('currentUser'));
    let user = JSON.parse(localStorage.getItem('user'));
    console.log('Token logged in ', this.token);
    console.log('User logged in ', user);
    if (this.token) {
      this.rootPage = TabsPage;
    } else {
      this.rootPage = LoginPage;
    }

    platform.ready().then(() => {
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }

  ngOnInit(): void {
    this.sqlite.create({
      name: 'data.db',
      location: 'default'
    }).then((db: SQLiteObject) => {
      this.createTables(db)
    })
  }

  createTables(db: any) {
    this.sqlitePorter.importJsonToDb(db._objectInstance, this.token).then(success => {
        console.log("SQLite", success)
      }, error => {
        console.log("SQLLite", error)
      }
    );

    this.sqlitePorter.exportDbToJson(db).then(data => {
      console.log("SQLite data", data)
    })
  }

}

