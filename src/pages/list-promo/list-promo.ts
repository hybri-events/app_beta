import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import firebase from 'firebase/app';
import { CodCadastroPage } from '../cod-cadastro/cod-cadastro';

@Component({
  selector: 'page-list-promo',
  templateUrl: 'list-promo.html',
})
export class ListPromoPage {

  codigos: FirebaseListObservable<any>;
  ativas: FirebaseListObservable<any>;

  show = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, public db: AngularFireDatabase, public alertCtrl: AlertController) {
    this.codigos = db.list('/usuario/'+firebase.auth().currentUser.uid+'/codigos/');
    this.ativas = db.list('/promocoes/ativas/');
    this.ativas.forEach(at => {
      at.forEach(a => {
        this.show.push(a);
      })
    })
  }

  openCod(id) {
    let e = 0;
    this.codigos.forEach(co => {
      co.forEach(c => {
        if ( c.id == id ){
          e++;
        }
      })
    })
    if ( e == 0 ){
      this.navCtrl.push(CodCadastroPage,{id: id});
    } else {
      let alert = this.alertCtrl.create({
        title: "Código já cadastrado!",
        message: "Você já participou desta promoção.",
        buttons: [{
          text: "Ok",
          role: 'cancel'
        }]
      });
      alert.present();
    }
  }

}
