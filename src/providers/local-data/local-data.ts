import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import 'rxjs/add/operator/map';

@Injectable()
export class LocalDataProvider {

  constructor(public http: HttpClient) {
    console.log('Hello LocalDataProvider Provider');
    // TODO create the enum like environment for simplifying the methods
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
      console.log('Save Activity', 'log', log);
      // Transaction already exists.
      if (log) {
        let index = log.indexOf(listID);
        if (!(index > -1)) {// ListID already exists.
          log.push(listID);
        } else {
          console.log('Save Activity', 'ListID', 'ListID already exists');
        }
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


  deleteActivity(activityID: string): Promise<any> {
    return new Promise(((resolve, reject) => {
      console.log('////////////////////////////////////////////////////////////////////////////////////');
      let token = JSON.parse(localStorage.getItem('token'));
      if (token) {
        // Master-JSON.
        let json = JSON.parse(localStorage.getItem(String(token['x_user_id'])));
        console.log('Delete Activity', 'json', json);

        // Get the activity.
        let activity = JSON.parse(localStorage.getItem(activityID));
        console.log('Delete Activity', 'activity', activity);

        if (activity) {
          // Get the transaction ID.
          let transactionID = String(activity['summary']['transaction-id']);
          console.log('Delete Activity', 'transactionID', transactionID);

          // Delete activityID from its transactionID array.
          let activities = JSON.parse(localStorage.getItem(transactionID));
          console.log('Delete Activity', 'activities', JSON.stringify(activities), String(activityID));
          let activityIndex = activities.indexOf(String(activityID));
          if (activityIndex > -1) {
            activities.splice(activityIndex, 1);
            if (activities.length != 0) {
              console.log('Delete Activity', 'activities.length', '!= 0');
              // More activities are saved under this transactionID.
              localStorage.setItem(transactionID, activities);

              resolve();
            } else {
              console.log('Delete Activity', 'activities.length', '== 0');
              // No more activities are saved under this transactionID.
              localStorage.removeItem(transactionID);

              // Delete transactionID from Master-JSON, if all its activities are deleted.
              let transactions = json['activity-transaction'];
              console.log('Delete Activity', 'transactions 1', transactions);
              let transactionIndex = transactions.indexOf(transactionID);
              if (transactionIndex > -1) {
                transactions.splice(transactionIndex, 1);
                json['activity-transaction'] = transactions;
                console.log('Delete Activity', 'transactions 2', transactions);
                localStorage.setItem(String(token['x_user_id']), JSON.stringify(json));

                resolve();
              } else {
                reject('Unresolvable transactionID');
              }
            }
          } else {
            reject('Unresolvable activityID');
          }
        } else {
          reject('No such activity');
        }
      } else {
        reject('No token');
      }
    }))
  }

  static saveExercise(transactionID: string, listID: string, data: any) {
    let token = JSON.parse(localStorage.getItem('token'));
    if (token) {
      // Master-JSON.
      let json = JSON.parse(localStorage.getItem(String(token['x_user_id'])));

      // Save the transactionID in user profile.
      if (!(json['exercise-transaction'].indexOf(transactionID) > -1)) { // Check if transactionID already exists.
        json['exercise-transaction'].push(transactionID);
      }
      localStorage.setItem(String(token['x_user_id']), JSON.stringify(json));
      console.log('Save Exercise', 'Transaction', json);

      // Saving the exercise under the transactionID id.
      let log = JSON.parse(localStorage.getItem(transactionID));
      console.log('Save Exercise', 'log', log);
      if (log) {
        let index = log.indexOf(listID);
        if (!(index > -1)) {// ListID already exists.
          log.push(listID);
        } else {
          console.log('Save Activity', 'ListID', 'ListID already exists');
        }
      } else { // Does not exist.
        log = [];
        log.push(listID);
      }
      localStorage.setItem(transactionID, JSON.stringify(log));
      console.log('Save Exercise', 'Exercise Id', JSON.parse(localStorage.getItem(transactionID)));

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

  deleteExercise(exerciseID: string): Promise<any> {
    return new Promise(((resolve, reject) => {
      console.log('///////////////////////////////////////////////////////////////////');
      let token = JSON.parse(localStorage.getItem('token'));
      if (token) {
        // Master-JSON.
        let json = JSON.parse(localStorage.getItem(String(token['x_user_id'])));
        console.log('Delete Exercise', 'json', json);

        let exercise = JSON.parse(localStorage.getItem(exerciseID));
        console.log('Delete Exercise', 'exercise', exercise);

        if (exercise) {
          let transactionID = String(exercise['summary']['transaction-id']);
          console.log('Delete Exercise', 'transactionID', transactionID);

          let exercises = JSON.parse(localStorage.getItem(transactionID));
          console.log('Delete Exercise', 'exercises', exercises);

          let exerciseIndex = exercises.indexOf(String(exerciseID));
          if (exerciseIndex > -1) {
            exercises.splice(exerciseIndex, 1);
            if (exercises.length != 0) {
              console.log('Delete Activity', 'activities.length', '!= 0');
              // More activities are saved under this transactionID.
              localStorage.setItem(transactionID, exercises);

              resolve();
            } else {
              console.log('Delete Activity', 'activities.length', '== 0');
              // No more activities are saved under this transactionID.
              localStorage.removeItem(transactionID);

              // Delete transactionID from Master-JSON, if all its activities are deleted.
              let transactions = json['activity-transaction'];
              console.log('Delete Activity', 'transactions 1', transactions);
              let transactionIndex = transactions.indexOf(transactionID);
              if (transactionIndex > -1) {
                transactions.splice(transactionIndex, 1);
                json['activity-transaction'] = transactions;
                console.log('Delete Activity', 'transactions 2', transactions);
                localStorage.setItem(String(token['x_user_id']), JSON.stringify(json));

                resolve();
              } else {
                reject('Unresolvable transactionID');
              }
            }
          } else {
            reject('Unresolvable activityID');
          }
        } else {
          reject('No such exercise');
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
