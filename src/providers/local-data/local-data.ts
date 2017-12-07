import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import 'rxjs/add/operator/map';

@Injectable()
export class LocalDataProvider {

  constructor(public http: HttpClient) {
    console.log('Hello LocalDataProvider Provider');
    // TODO create the enum like environment for simplifying the methods
    // TODO https://github.com/wesdoyle/ng-run-journal/tree/master/src/app/shared
  }

  /**
   * Get User data.
   * @returns {Promise<JSON>}
   */
  getUser(): Promise<any> {
    return new Promise(((resolve) => {
      let token = JSON.parse(localStorage.getItem('token'));
      if (token) {
        let json = JSON.parse(localStorage.getItem(String(token['x_user_id'])));
        if (json) {
          resolve(json['user']);
        }
      }
    }))
  }


  /**
   * Save Physical data.
   * @param {string} transaction
   * @param {string} listID
   * @param data
   */
  static savePhysical(transaction: string, listID: string, data: any) {
    let token = JSON.parse(localStorage.getItem('token'));
    if (token) {
      // Master-JSON.
      let json = JSON.parse(localStorage.getItem(String(token['x_user_id'])));

      // Save the transaction in user profile.
      let physical = json['physical-information-transaction'];
      if (!(physical.indexOf(transaction) > -1)) {
        json['physical-information-transaction'].push(transaction);
      }
      console.log('Save Physical', 'Physical Information Transaction', json);
      localStorage.setItem(String(token['x_user_id']), JSON.stringify(json));

      // Saving the exercise under the transaction id.
      let log = JSON.parse(localStorage.getItem(transaction));
      if (log) {
        log.push(listID);
      } else {
        log = [];
        log.push(listID);
      }
      localStorage.setItem(transaction, JSON.stringify(log));
      console.log('Save Physical', 'Physical Id', JSON.parse(localStorage.getItem(transaction)));

      // Save the data to given exercise.
      let temp = {};
      temp['summary'] = data[0];
      localStorage.setItem(listID, JSON.stringify(temp));
      console.log('Save Physical', 'Data', JSON.parse(localStorage.getItem(listID)));
    }
  }

  /**
   * Get all physical Data.
   * @returns {Promise<JSON>}
   */
  getPhysical(): Promise<any> {
    return new Promise((resolve => {
      let token = JSON.parse(localStorage.getItem('token'));
      if (token) {
        // Master-JSON.
        let json = JSON.parse(localStorage.getItem(String(token['x_user_id'])));

        // Physical transactionId.
        let physicalTransactions = json['physical-information-transaction'];
        console.log('Get Physical', 'All Transaction', physicalTransactions);

        let physicals = [];

        // Go through all physical transactionIds.
        for (let transaction of physicalTransactions) {

          // Get the ListId.
          let temp = JSON.parse(localStorage.getItem(transaction));

          // Get all physical data save under the listID.
          for (let physical of temp) {
            let data = JSON.parse(localStorage.getItem(physical));
            physicals.push(data['summary']);
          }
        }
        console.log('Get Physical', 'Data', physicals);
        resolve(physicals);
      }
    }))
  }

  /**
   * Save an activity under given transactionId and listID.
   * @param {string} transaction
   * @param {string} listID
   * @param data
   */
  static saveActivity(transaction: string, listID: string, data: any) {
    let token = JSON.parse(localStorage.getItem('token'));
    console.log('Save Activity', 'Token', String(token['x_user_id']));
    if (token) {
      // Master-JSON.
      let json = JSON.parse(localStorage.getItem(String(token['x_user_id'])));

      // Save the transaction in user profile.
      if (!(json['activity-transaction'].indexOf(transaction) > -1)) { // Check if transaction already exists.
        json['activity-transaction'].push(transaction);
      }
      localStorage.setItem(String(token['x_user_id']), JSON.stringify(json));
      console.log('Save Activity', 'Transaction', json);

      // Saving the exercise under the transaction id.
      let log = JSON.parse(localStorage.getItem(transaction));
      if (log) { // Exists already.
        log.push(listID);
      } else { // Does not exist.
        log = [];
        log.push(listID);
      }
      localStorage.setItem(transaction, JSON.stringify(log));
      console.log('Save Activity', 'Activity Id', JSON.parse(localStorage.getItem(transaction)));

      // Save the data to given activity.
      let temp = {};
      temp['summary'] = data[0];
      temp['steps'] = data[1];
      temp['zones'] = data[2];

      localStorage.setItem(listID, JSON.stringify(temp));
      console.log('Save Activity', 'Data', JSON.parse(localStorage.getItem(listID)));
    }
  }

  /**
   * Get all Activities.
   * @returns {Promise<JSON>}
   */
  getActivity(): Promise<any> {
    return new Promise((resolve => {
      let token = JSON.parse(localStorage.getItem('token'));
      if (token) {
        // Master-JSON.
        let json = JSON.parse(localStorage.getItem(String(token['x_user_id'])));

        // Activity transactions.
        let activityTransactions = json['activity-transaction'];
        console.log('Get Activity', 'All Transaction', activityTransactions);

        let activities = [];

        // Go through all transactions.
        for (let transaction of activityTransactions) {
          console.log('Get Activity', 'Transaction', transaction);

          // Read the activity listID under the transactionId.
          let temp = JSON.parse(localStorage.getItem(transaction));
          console.log('Get Activity', 'Activity', temp);

          // Read all activities und the given listId.
          for (let activity of temp) {
            let data = JSON.parse(localStorage.getItem(activity));
            activities.push(data);
          }
        }
        console.log('Get Activity', 'Data', activities);
        resolve(activities);
      }
    }))
  }

  /**
   * Delete specific Activity.
   * @param {string} transactionID
   * @returns {Promise<string>}
   */
  deleteActivity(transactionID: string): Promise<any> {
    return new Promise(((resolve, reject) => {
      let token = JSON.parse(localStorage.getItem('token'));
      if (token) {
        // Master-JSON.
        let json = JSON.parse(localStorage.getItem(String(token['x_user_id'])));

        // Activity-transactions.
        let activityTransactions = json['activity-transaction'];
        console.log('Delete Activity', 'All Transaction', activityTransactions);

        // Check if transactionId exists.
        let index = activityTransactions.indexOf(transactionID, 0);
        if (index > -1) {
          // Find the transactionId in the Master-JSON.
          let temp = JSON.parse(localStorage.getItem(transactionID));
          for (let activity of temp) {

            // Delete the activity (summary, steps, zones).
            localStorage.removeItem(activity);

            // Delete the activity ID.
            localStorage.removeItem(transactionID);
          }

          // Delete the transaction.
          activityTransactions.splice(index, 1);
          json['activity-transaction'] = activityTransactions;
          localStorage.setItem(String(token['x_user_id']), JSON.stringify(json));

          resolve();
        } else {
          reject('Unsolvable transactionID');
        }
      } else {
        reject('No token');
      }
    }))
  }

  /**
   * Delete all activities.
   * @returns {Promise<JSON>}
   */
  deleteAllActivities(): Promise<any> {
    return new Promise(((resolve, reject) => {
      let token = JSON.parse(localStorage.getItem('token'));
      if (token) {
        // Master-JSON.
        let json = JSON.parse(localStorage.getItem(String(token['x_user_id'])));

        // Activity-transactions.
        let activityTransactions = json['activity-transaction'];
        console.log('Delete all activity', 'All transaction', activityTransactions);

        let sLength = Object.keys(activityTransactions).length;

        // Go through all transactions and delete all.
        activityTransactions.forEach((item, index) => {
          this.deleteActivity(item).then(success => {
            if (index >= sLength - 1) {
              resolve(success);
            }
          }, error => {
            reject(error);
          })
        })
      }
    }))
  }

  static saveExercise(transaction: string, listID: string, data: any) {
    let token = JSON.parse(localStorage.getItem('token'));
    if (token) {
      // Master-JSON.
      let json = JSON.parse(localStorage.getItem(String(token['x_user_id'])));

      // Save the transaction in user profile.
      if (!(json['exercise-transaction'].indexOf(transaction) > -1)) { // Check if transaction already exists.
        json['exercise-transaction'].push(transaction);
      }
      localStorage.setItem(String(token['x_user_id']), JSON.stringify(json));
      console.log('Save Exercise', 'Transaction', json);

      // Saving the exercise under the transaction id.
      let log = JSON.parse(localStorage.getItem(transaction));
      if (log) { // Exists already.
        log.push(listID);
      } else { // Does not exist.
        log = [];
        log.push(listID);
      }
      localStorage.setItem(transaction, JSON.stringify(log));
      console.log('Save Exercise', 'Exercise Id', JSON.parse(localStorage.getItem(transaction)));

      // Save the data to given exercise.
      let temp = {};
      temp['summary'] = data[0];
      temp['heart-rate-zone'] = data[1];
      temp['gpx'] = data[2];
      temp['tcx'] = data[3];
      temp['samples'] = data[4];
      localStorage.setItem(listID, JSON.stringify(temp));
      console.log('Save Exercise', 'Data', JSON.parse(localStorage.getItem(listID)));
    }
  }

  /**
   * Get all exercises.
   * @returns {Promise<JSON>}
   */
  getExercise(): Promise<any> {
    return new Promise((resolve => {
      let token = JSON.parse(localStorage.getItem('token'));
      if (token) {
        // Master-JSON.
        let json = JSON.parse(localStorage.getItem(String(token['x_user_id'])));

        // Exercise transaction.
        let exerciseTransaction = json['exercise-transaction'];
        console.log('Save Exercise', 'All Transaction', json);

        let exercises = [];

        // Go through all transaction.
        for (let transaction of exerciseTransaction) {
          console.log('Get Exercise', 'Transaction', transaction);

          // Read the exercise listID under the transactionID.
          let temp = JSON.parse(localStorage.getItem(transaction));
          console.log('Get Exercise', 'Exercise', temp);

          // Read all activities und the given listId.
          for (let exercise of temp) {
            let data = JSON.parse(localStorage.getItem(exercise));
            exercises.push(data);
          }
        }

        console.log('Get Exercises', 'Data', exercises);
        resolve(exercises);
      }
    }))
  }

  deleteExercise(transactionID:string):Promise<any> {
    return new Promise(((resolve, reject) => {
      let token = JSON.parse(localStorage.getItem('token'));
      if (token) {
        // Master-JSON.
        let json = JSON.parse(localStorage.getItem(String(token['x_user_id'])));

        // Activity-transactions.
        let exerciseTransactions = json['exercise-transaction'];
        console.log('Delete Exercise', 'All Transaction', exerciseTransactions);

        // Check if transactionId exists.
        let index = exerciseTransactions.indexOf(transactionID, 0);
        if (index > -1) {
          // Find the transactionId in the Master-JSON.
          let temp = JSON.parse(localStorage.getItem(transactionID));
          for (let exercise of temp) {

            // Delete the activity (summary, steps, zones).
            localStorage.removeItem(exercise);

            // Delete the activity ID.
            localStorage.removeItem(transactionID);
          }

          // Delete the transaction.
          exerciseTransactions.splice(index, 1);
          json['exercise-transaction'] = exerciseTransactions;
          localStorage.setItem(String(token['x_user_id']), JSON.stringify(json));

          resolve();
        } else {
          reject('Unsolvable transactionID');
        }
      } else {
        reject('No token');
      }
    }))
  }

  deleteAllExercises(): Promise<any> {
    return new Promise(((resolve, reject) => {
      let token = JSON.parse(localStorage.getItem('token'));
      if (token) {
        // Master-JSON.
        let json = JSON.parse(localStorage.getItem(String(token['x_user_id'])));

        // Activity-transactions.
        let exerciseTransactions = json['exercise-transaction'];
        console.log('Delete all exercises', 'All transaction', exerciseTransactions);

        let sLength = Object.keys(exerciseTransactions).length;

        // Go through all transactions and delete all.
        exerciseTransactions.forEach((item, index) => {
          this.deleteExercise(item).then(success => {
            if (index >= sLength - 1) {
              resolve(success);
            }
          }, error => {
            reject(error);
          })
        })
      }
    }))
  }


}
