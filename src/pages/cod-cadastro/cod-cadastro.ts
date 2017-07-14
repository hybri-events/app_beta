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
  info: FirebaseListObservable<any>;
  user: FirebaseListObservable<any>;

  valor;
  nome;

  p = [];
  u = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, private storage: Storage, public alertCtrl: AlertController, public db: AngularFireDatabase, public contaData: ContaProvider) {
    this.promo = this.db.list('/promocoes/'+navParams.data.id+'/');
    this.info = this.db.list('/promocoes/ativas/');
    this.user = this.db.list('/usuario/'+firebase.auth().currentUser.uid+'/codigos/');
    this.promo.subscribe(list => this.p = list);
    this.user.subscribe(list => this.u = list);

    this.info.forEach(inf => {
      inf.forEach(i => {
        if ( i.id == navParams.data.id ){
          this.valor = i.valor;
          this.nome = i.nome;
        }
      });
    });
  }

  num(numero){
    if ( this.codigo.length < 6 ){
      this.codigo += numero + "";
      document.getElementById(this.codigo.length+"").style.background = "#652C90";
      if ( this.codigo.length == 6 ){
        let error = 0;
        this.p.forEach(i => {
          if ( i.cod == this.codigo ){ 
            if ( this.navParams.data.id == 'convite' ){
              if ( i.uid == firebase.auth().currentUser.uid ){
                let alert = this.alertCtrl.create({
                  title: "Esse código é seu!",
                  message: "Você não pode cadastrar seu próprio código promocional.",
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
                  message: "Parabéns, você  ganhou V$"+this.valor+"!",
                  buttons: [{
                    text: "Ok",
                    handler: data => {
                      let p = this.db.list('/promocoes/'+this.navParams.data.id+'/'+this.codigo);
                      p.push({[firebase.auth().currentUser.uid]: "ok"});
                      this.user.push({id: this.navParams.data.id, codigo: this.codigo, nome: this.nome, valor: this.valor});
                      let tzoffset = (new Date()).getTimezoneOffset() * 60000;
                      this.contaData.cadTransacao(firebase.auth().currentUser.uid, "Código promocional de "+this.nome+" confirmado.", this.valor, 'Entrada', new Date(Date.now() - tzoffset).toISOString().slice(0,-1), 'entrada','+');
                      this.contaData.getSaldo(firebase.auth().currentUser.uid).then(s => {
                        this.contaData.altSaldo(1, s[0].id, s[0].saldo, this.valor, firebase.auth().currentUser.uid);
                        this.contaData.cadTransacao(i.uid, "Código promocional de "+this.nome+" utilizado.", this.valor, 'Entrada', new Date(Date.now() - tzoffset).toISOString().slice(0,-1), 'entrada','+');
                        this.contaData.getSaldo(i.uid).then(s => {
                          this.contaData.altSaldo(1, s[0].id, s[0].saldo, this.valor, i.uid);
                          this.navCtrl.pop();
                          this.navCtrl.pop();
                        });
                      });
                    }
                  }]
                });
                alert.present();
              }
            } else {
              let alert = this.alertCtrl.create({
                title: "Código correto!",
                message: "Parabéns, você  ganhou V$"+this.valor+"!",
                buttons: [{
                  text: "Ok",
                  handler: data => {
                    let p = this.db.list('/promocoes/'+this.navParams.data.id+'/'+this.codigo);
                    p.push({[firebase.auth().currentUser.uid]: "ok"});
                    this.user.push({id: this.navParams.data.id, codigo: this.codigo, nome: this.nome, valor: this.valor});
                    let tzoffset = (new Date()).getTimezoneOffset() * 60000;
                    this.contaData.cadTransacao(firebase.auth().currentUser.uid, "Código promocional de "+this.nome+".", this.valor, 'Entrada', new Date(Date.now() - tzoffset).toISOString().slice(0,-1), 'entrada','+');
                    this.contaData.getSaldo(firebase.auth().currentUser.uid).then(s => {
                      this.contaData.altSaldo(1, s[0].id, s[0].saldo, this.valor, firebase.auth().currentUser.uid);
                      this.navCtrl.pop();
                      this.navCtrl.pop();
                    });
                  }
                }]
              });
              alert.present();
            }
          } else {
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
        });
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
