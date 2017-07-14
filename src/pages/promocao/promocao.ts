import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ListPromoPage } from '../list-promo/list-promo';
import { Storage } from '@ionic/storage';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import firebase from 'firebase/app';

@Component({
  selector: 'page-promocao',
  templateUrl: 'promocao.html',
})
export class PromocaoPage {
  codcad = false;

  codigos: FirebaseListObservable<any>;

  constructor(private storage: Storage, public navCtrl: NavController, public db: AngularFireDatabase) {
    storage.get('codcad').then((val) => {
      this.codcad = val;
    });
    this.codigos = db.list('/usuario/'+firebase.auth().currentUser.uid+'/codigos/');
  }

  openAddPromo(){
    this.navCtrl.push(ListPromoPage,null)
  }

}
