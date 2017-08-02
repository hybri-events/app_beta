import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import firebase from 'firebase';

@Component({
  selector: 'page-indicacao',
  templateUrl: 'indicacao.html',
})
export class IndicacaoPage {
  indi: FirebaseListObservable<any>;
  ind = '';
  cidade = '';
  tipoInd = 'evento';
  isResp = false;
  nome = '';
  telefone = '';
  email = '';

  constructor(public navCtrl: NavController, public navParams: NavParams, public db: AngularFireDatabase, public alertCtrl: AlertController) {
    this.indi = this.db.list('/indEstab/');
    this.cidade = navParams.data.city;
  }

  indicar(){
    this.indi.push({uid: firebase.auth().currentUser.uid, estab: this.ind, cidade: this.cidade, tipo: this.tipoInd, resp: {nome: this.nome, fone: this.telefone, email: this.email}});
    this.ind = '';
    this.tipoInd = 'evento';
    let alert = this.alertCtrl.create({
      title: "Obrigado pela indicação!",
      message: "Deseja indicar outro evento ou lugar?",
      buttons: [{
        text: "Nao",
        handler: () => {
          this.navCtrl.pop();
        }
      },{
        text: "Sim",
        handler: () => {
          this.ind = '';
          this.cidade = this.navParams.data.city;
          this.tipoInd = 'evento';
          this.isResp = false;
          this.nome = '';
          this.telefone = '';
          this.email = '';
        }
      }]
    });
    alert.present();
  }

}
