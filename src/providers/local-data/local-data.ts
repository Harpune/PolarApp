import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';
import {SQLite, SQLiteObject} from "@ionic-native/sqlite";
import {SQLitePorter} from "@ionic-native/sqlite-porter";

@Injectable()
export class LocalDataProvider {
  db: any;
  json: any;

  constructor(public http: Http,
              public sqlite: SQLite,
              public sqlPorter: SQLitePorter) {
    console.log('Hello LocalDataProvider Provider');

    this.json = {
      'structure': {
        'tables': {
          // Tables.
        }, 'otherSQL': [
          // SQL statement.
        ]
      }, 'data': {
        'inserts': {
          // Data inserted into DB.
        }, 'updates': {
          // Update data in DB.
        }, 'deletes': {
          // Delete data from DB.
        }
      }
    }
  }

  /**
   * Start the DB and create the tables.
   */
  startDb() {
    this.sqlite.create({
      name: 'data.db',
      location: 'default'
    }).then((db: any) => {
      this.db = db._objectInstance;
      this.createTables();
    });
  }

  /**
   * Create all tables.
   * - User.
   * - PhysicalInfo.
   * - ActivitySummary.
   */
  createTables() {
    let temp = this.json;
    temp.structure.tables['User'] = '([polar-user-id] PRIMARY KEY, [member-id], [registration-date], [first-name], [last-name], [birthdate], [gender], [weight], [height], [extra-info])';
    temp.structure.tables['PhysicalInfo'] = '([id] PRIMARY KEY, [transaction-id], [created], [polar-user], [weight], [height], [maximum-heart-rate], [resting-heart-rate], [aerobic-threshold], [anaerobic-threshold], [vo2-max], [weight-source])';
    temp.structure.tables['ActivitySummary'] = '([id] PRIMARY KEY, [transaction-id], [created], [polar-user], [date], [calories], [active-calories], [duration], [active-steps])';
    temp.structure.tables['ActivitySummary'] = '([id] PRIMARY KEY, [interval], [samples])';

    console.log('Create table', temp);
    this.sqlPorter.importJsonToDb(this.db, temp).then(success => {
      console.log('Create tables', success);
    }, error => {
      console.log('Create tables', error);
    });

    this.getAllData().then(success => {
      console.log('Tables', success)
    }, error => {
      console.log('Tables', error)
    });
  }

  getAllData(): Promise<any> {
    return new Promise(((resolve, reject) => {
        this.sqlPorter.exportDbToJson(this.db).then(success => {
          resolve(success);
        }, error => {
          reject(error);
        })
      })
    );
  }

  saveUser(data: any) {
    let temp = this.json;
    temp.data.inserts['User'] = [];
    temp.data.inserts['User'].push(data);
    console.log("Here", temp);
    this.sqlPorter.importJsonToDb(this.db, temp).then(success => {
      console.log('Save User', success);
      this.getAllData().then(success => {
        console.log('saveUser', success)
      }, error => {
        console.log('saveUser', error)
      });
    }, error => {
      console.log('Save User', error);
      this.getAllData().then(success => {
        console.log('saveUser', success)
      }, error => {
        console.log('saveUser', error)
      });
    })
  }

  /**
   * Get the Client-Id and Client-Secret from local file.
   * @returns {Promise<any>}
   */
  getIdAndSecret() {
    return this.http.get('assets/data/config.json').map(res => res.json());
  }

  /**
   * Save data locally with key.
   * @param data
   * @param {string} key
   */
  static saveData(data: any, key: string) {
    console.log('Save data');
    let local = JSON.parse(localStorage.getItem(key));
    if (local) {
      local.push(data);
      console.log('Added training data', local);
      localStorage.setItem(key, JSON.stringify(local));
    } else {
      let temp = [];
      temp.push(data);
      console.log('New added training data', temp);
      localStorage.setItem(key, JSON.stringify(temp));
    }
  }
}
