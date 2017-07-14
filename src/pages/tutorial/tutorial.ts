import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import firebase from 'firebase';

@Component({
  selector: 'page-tutorial',
  templateUrl: 'tutorial.html',
})
export class TutorialPage {
  promo: FirebaseListObservable<any>;
  cod

  constructor(public navCtrl: NavController, public navParams: NavParams, public db: AngularFireDatabase) {
    this.promo = db.list('promocoes/convite/');
    let e = 1;
    //while( e > 0 ){
      this.cod = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
      this.promo.forEach(pr => {
        pr.forEach(p => {
          console.log(p);
        });
      });
    //}
    this.promo.push({cod: this.cod, uid: firebase.auth().currentUser.uid});
  }

  ionViewDidLoad() {

  }

  close(){
    this.navCtrl.pop();
  }

}
