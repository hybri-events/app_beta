import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import firebase from 'firebase';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-qr-code',
  templateUrl: 'qr-code.html',
})
export class QrCodePage {
  data;

  uid;
  nome;
  vous;
  time = new Date().getTime();
  json;

  constructor(public navCtrl: NavController, public navParams: NavParams, private storage: Storage) {

  }

  ionViewDidLoad() {
    this.storage.get('nomeUsu').then((val) => {
      this.uid = firebase.auth().currentUser.uid;
      this.nome = val;
      this.vous = this.navParams.get('vous');
      this.json = [{uid:this.uid, nome: this.nome, vous: this.vous, time: this.time}];
      this.data = JSON.stringify(this.json);
      setInterval(() => {
        this.time = new Date().getTime();
        this.json = [{uid:this.uid, nome: this.nome, vous: this.vous, time: this.time}];
        this.data = JSON.stringify(this.json);
      }, 30000)
    });

  }

}
