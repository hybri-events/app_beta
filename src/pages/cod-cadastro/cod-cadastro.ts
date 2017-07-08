import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { ContaProvider } from '../../providers/conta/conta';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import firebase from 'firebase';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-cod-cadastro',
  templateUrl: 'cod-cadastro.html',
})
export class CodCadastroPage {
  codigo: string = "";
  validation:any = false;

  promo: FirebaseListObservable<any>;
  con: FirebaseListObservable<any>;
  user: FirebaseListObservable<any>;
  p = [];
  c = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, private storage: Storage, public alertCtrl: AlertController, public db: AngularFireDatabase, public contaData: ContaProvider) {
    this.promo = this.db.list('/promocoes/cadastro/promo/');
    this.con = this.db.list('/promocoes/cadastro/convite/');
    this.user = this.db.list('/usuario/'+firebase.auth().currentUser.uid+'/');
    this.promo.subscribe(list => this.p = list);
    this.con.subscribe(list => this.c = list);
  }

  num(numero){
    if ( this.codigo.length < 6 ){
      this.codigo += numero + "";
      document.getElementById(this.codigo.length+"").style.background = "#652C90";
      if ( this.codigo.length == 6 ){
        let error = 0;
        this.p.forEach(item => {
          if ( item.$key == this.codigo ){
            if ( item[0].usado ){
              let alert = this.alertCtrl.create({
                title: "Esse código já está em uso!",
                message: "Esse código promocional já está em uso. Caso esse código seja seu, contate-nos pelo e-mail 'gustavo@usevou.com' relatando o problema.",
                buttons: [{
                  text: "Ok",
                  role: 'cancel'
                }]
              });
              alert.present();
              for ( let i=0;i<6;i++ ){
                this.apagar();
              }
            } else {
              let alert = this.alertCtrl.create({
                title: "Código correto!",
                message: "Parabéns você acabou de ganhar V$50.",
                buttons: [{
                  text: "Ok",
                  handler: data => {
                    this.promo.update(this.codigo,{0:{usado: true}});
                    let pu = this.db.list('/promocoes/cadastro/promo/'+this.codigo+'/0/');
                    pu.push({uid: firebase.auth().currentUser.uid});
                    this.user.forEach(u => {
                      this.user.update(u[0].$key,{codcad: true});
                      this.storage.set('codcad', true);
                    });
                    this.contaData.cadTransacao(firebase.auth().currentUser.uid, "Bônus pelo seu cadastro prévio.", 50, 'Entrada', new Date().toISOString(), 'entrada','+');
                    this.contaData.getSaldo(firebase.auth().currentUser.uid).then(s => {
                      this.contaData.altSaldo(1, s[0].id, s[0].saldo, 50, firebase.auth().currentUser.uid);
                      this.navCtrl.pop();
                      this.navCtrl.pop();
                    });
                  }
                }]
              });
              alert.present();
            }
          } else {
            error++;
          }
        });
        if ( error == this.p.length ){
          error = 0;
          this.c.forEach(item => {
            let key = item.$key;
            if ( key == firebase.auth().currentUser.uid ){
              let alert = this.alertCtrl.create({
                title: "Esse código é seu!",
                message: "Você não pode cadastrar seu próprio código de convite.",
                buttons: [{
                  text: "Ok",
                  role: 'cancel'
                }]
              });
              alert.present();
              for ( let i=0;i<6;i++ ){
                this.apagar();
              }
            } else if ( item[this.codigo] != undefined ){
              let alert = this.alertCtrl.create({
                title: "Código correto!",
                message: "Parabéns você acabou de ganhar V$10.",
                buttons: [{
                  text: "Ok",
                  handler: data => {
                    let uid = firebase.auth().currentUser.uid;
                    this.con.update(key,{[this.codigo]:{[uid]: 'ok'}});
                    this.user.forEach(u => {
                      this.user.update(u[0].$key,{codcad: true});
                      this.storage.set('codcad', true);
                    });
                    this.contaData.cadTransacao(firebase.auth().currentUser.uid, "Bônus pelo código de cadastro.", 10, 'Entrada', new Date().toISOString(), 'entrada','+');
                    this.contaData.getSaldo(firebase.auth().currentUser.uid).then(s => {
                      this.contaData.altSaldo(1, s[0].id, s[0].saldo, 10, firebase.auth().currentUser.uid);
                      this.contaData.cadTransacao(key, "Bônus pelo convite para cadastro.", 10, 'Entrada', new Date().toISOString(), 'entrada','+');
                      this.contaData.getSaldo(key).then(s => {
                        this.contaData.altSaldo(1, s[0].id, s[0].saldo, 10, key);
                        this.navCtrl.pop();
                        this.navCtrl.pop();
                      });
                    });
                  }
                }]
              });
              alert.present();
            } else {
              error++;
            }
          });
          if ( error == this.c.length ){
            let alert = this.alertCtrl.create({
              title: "Esse código não existe!",
              message: "Verifique se você está preenchendo o código corretamente.",
              buttons: [{
                text: "Ok",
                role: 'cancel'
              }]
            });
            alert.present();
            for ( let i=0;i<6;i++ ){
              this.apagar();
            }
          }
        }
      }
    }
  }

  apagar(){
    if ( this.codigo.length > 0 ){
      document.getElementById(this.codigo.length+"").style.background = "transparent";
      this.codigo = this.codigo.substr(0,this.codigo.length-1);
    }
  }

}
