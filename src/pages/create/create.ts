import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { NewEstabPage } from '../new-estab/new-estab'
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import firebase from 'firebase';
import { Storage } from '@ionic/storage';
import { SplashScreen } from '@ionic-native/splash-screen';

@Component({
  selector: 'page-create',
  templateUrl: 'create.html',
})
export class CreatePage {
  list: FirebaseListObservable<any>;

  constructor(public navCtrl: NavController, public navParams: NavParams, public db: AngularFireDatabase, private storage: Storage, public splashScreen: SplashScreen) {
    this.list = db.list("casas/"+firebase.auth().currentUser.uid+"/");
  }

  ionViewDidLoad() {

  }

  newEstab(){
    this.navCtrl.push(NewEstabPage,null);
  }

  changeProfile(key){
    this.storage.set('casa', key);
    this.splashScreen.show();
    window.location.reload();
  }

}
