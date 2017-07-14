import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import firebase from 'firebase/app';

@Component({
  selector: 'page-invite-friends',
  templateUrl: 'invite-friends.html',
})
export class InviteFriendsPage {
  codigo: FirebaseListObservable<any>;
  cod;

  constructor(public navCtrl: NavController, public navParams: NavParams, private db: AngularFireDatabase) {
    this.codigo = db.list('promocoes/convite/');
    this.codigo.forEach(co => {
      co.forEach(c => {
        if ( c.uid == firebase.auth().currentUser.uid ){
          this.cod = c.cod; 
        }
      })
    })
  }

}
