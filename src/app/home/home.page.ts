import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { HealthKit, HealthKitOptions } from '@ionic-native/health-kit/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  height: number;
  currentHeight = 'No Data';
  stepcount = 'No Data';
  workouts = [];

  constructor(private plt: Platform, private healthKit: HealthKit) {
    this.plt.ready().then(() => {
      this.healthKit.available().then(available => {
        if (available) {
          var options: HealthKitOptions = {
            readTypes: ['HKQuantityTypeIdentifierHeight', 'HKQuantityTypeIdentifierStepCount', 'HKWorkoutTypeIdentifier', 'HKQuantityTypeIdentifierActiveEnergyBurned', 'HKQuantityTypeIdentifierDistanceCycling'],
            writeTypes: ['HKQuantityTypeIdentifierHeight', 'HKWorkoutTypeIdentifier', 'HKQuantityTypeIdentifierActiveEnergyBurned', 'HKQuantityTypeIdentifierDistanceCycling']
          }
          this.healthKit.requestAuthorization(options).then(_ => {
            this.loadHealthData();

          });
        }
      });
    });
  }
  saveHeight() {
    console.log('save hight function call ..');
    this.healthKit.saveHeight({ unit: 'cm', amount: this.height }).then(_ => {
      this.height = null;
      this.loadHealthData();
    });
  };

  saveWorkout() {
    console.log('saveWorkout function call ..');
    let workout = {
      'activityType': 'HKWorkoutActivityTypeCycling',
      'quantityType': 'HKQuantityTypeIdentifierDistanceCycling',
      'startDate': new Date(),
      'endDate': null,
      'duration': 6000,
      'energy': 400,
      'energyUnit': 'kcal',
      'distance': 5,
      'distanceUnit': 'km',
    }
    this.healthKit.saveWorkout(workout).then(_ => {
      this.loadHealthData();
    });
  };

  loadHealthData() {
    console.log(' data loaded.... ');
    this.healthKit.readHeight({ unit: 'cm' }).then(val => {
      this.currentHeight = val.value;
    }, err => {
      console.log('error height :', err);
    });
    var stepOptions = {
      startDate: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
      endDate: new Date(),
      unit: 'count',
      sampleType: 'HKQuantityTypeIdentifierStepCount'
    }
    this.healthKit.querySampleType(stepOptions).then(data => {
      let stepSum = data.reduce((a, b) => a + b.quantity, 0);
      this.stepcount = stepSum;
    }, err => {
      console.log('error step: ', err);
    });



    this.healthKit.findWorkouts().then(data =>{
      this.workouts = data;
    },err =>{
      console.log('error workout: ',err);
    });
  };

}
