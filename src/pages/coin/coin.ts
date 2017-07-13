import { Component } from '@angular/core';
import { NavController, AlertController, Platform } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { CodCadastroPage } from '../cod-cadastro/cod-cadastro';
import { ContaProvider } from '../../providers/conta/conta';
import { ErrorProvider } from '../../providers/error/error';
import { LoginPage } from '../login/login';
import { QrCodePage } from '../qr-code/qr-code';
import { BarcodeScanner ,BarcodeScannerOptions } from '@ionic-native/barcode-scanner';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import firebase from 'firebase';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-coin',
  templateUrl: 'coin.html'
})
export class CoinPage {
  coins: string = "home";
  date1: string;
  date2: string;
  authentic: any = false;
  transacoes: FirebaseListObservable<any>;

  saldoVS = 0;
  saldoRS = 0;

  txtVS: number = 0;
  auxVS: number = 0;
  txtRS: number = 0;
  auxRS: number = 0;
  cRS: number = 0;
  lenRS: number = 99999999999999;
  plat: any;

  options: BarcodeScannerOptions;
  dataQRC = null;
  nome;
  myname;
  equiv;
  vous;
  dt = new Date();
  data = ('0'+this.dt.getDate()).slice(-2)+'/'+('0'+(this.dt.getMonth()+1)).slice(-2)+'/'+this.dt.getFullYear()+' às '+('0'+this.dt.getHours()).slice(-2)+':'+('0'+this.dt.getMinutes()).slice(-2);

  isCasa = false;
  coinCasa = false;
  casa: FirebaseListObservable<any>;
  keyCasa;

  timeout;

  constructor(platform: Platform, public db: AngularFireDatabase, private storage: Storage, public navCtrl: NavController, afAuth: AngularFireAuth, public contaData: ContaProvider, public alertCtrl: AlertController, public err: ErrorProvider, private barcodeScanner: BarcodeScanner) {
    let tzoffset = (new Date()).getTimezoneOffset() * 60000;
    this.plat = platform;
    let fdata = new Date(Date.now() - tzoffset);
    let sdata = new Date(Date.now() - tzoffset);
    sdata.setDate(sdata.getDate()-30);
    fdata.setHours(20);
    fdata.setMinutes(59);
    this.date1 = fdata.toISOString().slice(0,-1);
    this.date2 = sdata.toISOString().slice(0,-1);
    const authObserver = afAuth.authState.subscribe( user => {
      if (!user.isAnonymous) {
        this.authentic = true;
        authObserver.unsubscribe();
      } else {
        this.authentic = false;
        authObserver.unsubscribe();
      }
    });
    storage.get('nomeUsu').then((val) => {
      this.myname = val;
    });

    this.storage.get('casa').then((val) => {
      if ( val != null ){
        this.keyCasa = val;
        this.casa = this.db.list("casas/"+firebase.auth().currentUser.uid+"/"+val+"/");
        this.casa.forEach(ca => {
          ca.forEach(c => {
            if ( c.$key == 'coins' ){
              this.coinCasa = c.$value;
            } else if ( c.$key == 'nome' ){
              this.myname = c.$value;
            }
          });
        });
        this.isCasa = true;
      }
    });
  }

  solicitarCoins(){
    let sol = this.db.list("/solicitCoins/");
    sol.push({idCasa: this.keyCasa});
    let alert = this.alertCtrl.create({
      title: "Solicitação enviada!",
      message: "Sua solicitação foi enviada, aguarde que entraremos em contato. Muito obrigado!",
      buttons: [{
        text: "Ok",
        role: 'cancel'
      }]
    });
    alert.present();
  }

  ionViewDidEnter(){
    if ( this.coins == "home" ){
      if (this.authentic) {
        if ( this.isCasa ){
          this.contaData.getSaldo(this.keyCasa).then( eventListSnap => {
            this.saldoVS = eventListSnap[0].saldo;
            this.saldoRS = eventListSnap[0].saldo * 0.04;
            this.transacoes = this.db.list('conta/'+this.keyCasa+'/transacao',{
              query: {
                orderByChild: 'dt_hr',
                startAt: this.date2,
                endAt: this.date1
              }
            });
          }).catch((error) => {
            console.log(error);
            let alert = this.alertCtrl.create({
              title: "Ocorreu um erro!",
              message: this.err.messageError(error["code"]),
              buttons: [{
                text: "Ok",
                role: 'cancel'
              }]
            });
            alert.present();
          });
        } else {
          this.contaData.getSaldo(firebase.auth().currentUser.uid).then( eventListSnap => {
            this.saldoVS = eventListSnap[0].saldo;
            this.saldoRS = eventListSnap[0].saldo * 0.04;
            this.transacoes = this.db.list('conta/'+firebase.auth().currentUser.uid+'/transacao',{
              query: {
                orderByChild: 'dt_hr',
                startAt: this.date2,
                endAt: this.date1
              }
            });
          }).catch((error) => {
            console.log(error);
            let alert = this.alertCtrl.create({
              title: "Ocorreu um erro!",
              message: this.err.messageError(error["code"]),
              buttons: [{
                text: "Ok",
                role: 'cancel'
              }]
            });
            alert.present();
          });
        }
      }
    } else if (this.coins == "receive"){
      this.coins = 'home';
    }
  }

  changeTabs(){
    if ( this.coins == "home" ){
      if (this.authentic) {
        if ( this.isCasa ){
          this.contaData.getSaldo(this.keyCasa).then( eventListSnap => {
            this.saldoVS = eventListSnap[0].saldo;
            this.saldoRS = eventListSnap[0].saldo * 0.04;
            this.transacoes = this.db.list('conta/'+this.keyCasa+'/transacao',{
              query: {
                orderByChild: 'dt_hr',
                startAt: this.date2,
                endAt: this.date1
              }
            });
          }).catch((error) => {
            console.log(error);
            let alert = this.alertCtrl.create({
              title: "Ocorreu um erro!",
              message: this.err.messageError(error["code"]),
              buttons: [{
                text: "Ok",
                role: 'cancel'
              }]
            });
            alert.present();
          });
        } else {
          this.contaData.getSaldo(firebase.auth().currentUser.uid).then( eventListSnap => {
            this.saldoVS = eventListSnap[0].saldo;
            this.saldoRS = eventListSnap[0].saldo * 0.04;
            this.transacoes = this.db.list('conta/'+firebase.auth().currentUser.uid+'/transacao',{
              query: {
                orderByChild: 'dt_hr',
                startAt: this.date2,
                endAt: this.date1
              }
            });
          }).catch((error) => {
            console.log(error);
            let alert = this.alertCtrl.create({
              title: "Ocorreu um erro!",
              message: this.err.messageError(error["code"]),
              buttons: [{
                text: "Ok",
                role: 'cancel'
              }]
            });
            alert.present();
          });
        }
      }
    } else if (this.coins == "receive"){
      if ( !this.isCasa ){
        let alert = this.alertCtrl.create({
          title: "Tranferência de V$!",
          message: "Para esta operação cobraremos uma taxa de transação no valor de 20%. Deseja prosseguir?",
          buttons: [{text: 'Não', handler: () => {this.coins = 'home'}},{text: 'Sim', handler: () => {this.lerQR()} }]
        });
        alert.present();
      } else {
        this.lerQR();
      }
    }
  }

  lerQR(){
    this.options = {
      showTorchButton : true,
      prompt : "Posicione o QRCode na área marcada.",
    }
    this.barcodeScanner.scan(this.options).then((barcodeData) => {
      if (barcodeData.cancelled){
        this.coins = "home";
      }
      let time = new Date().getTime();
      if ( time > (JSON.parse(barcodeData.text)[0].time + 30000) ){
        let al = this.alertCtrl.create({
          title: "QRCode expirado!",
          message: "Um novo QRCode é gerado a cada 30 segundos. Por favor, tente novamente.",
          buttons: [{
            text: "Ok",
            handler: data => {
              this.changeTabs();
            }
          }]
        });
        al.present();
      } else {
        this.dataQRC = JSON.parse(barcodeData.text)[0];
        this.nome = this.dataQRC.nome;
        this.vous = 'V$ '+this.dataQRC.vous;
        this.equiv = 'R$ '+(this.dataQRC.vous * 0.04).toFixed(2);
        this.timeout = setTimeout(() => {
          let alert = this.alertCtrl.create({
            title: "Transferência expirada!",
            message: "Você tem 1 minuto para confirmar a transferência, caso contrário, a operação é cancelada. Tente novamente.",
            buttons: [{
              text: "Ok",
              handler: data => {
                this.changeTabs();
              }
            }]
          });
          alert.present();
        },60000);
      }
    }, (err) => {
      alert("Error occured : " + err);
      this.coins = "home";
    });
  }

  trans(){
    let tzoffset = (new Date()).getTimezoneOffset() * 60000;
    if ( this.isCasa ){
      this.contaData.cadTransacao(this.keyCasa, "Pagamento recebido de "+this.dataQRC.nome+".", (this.dataQRC.vous * 0.8), 'Entrada', new Date(Date.now() - tzoffset).toISOString().slice(0,-1), 'entrada','+');
      this.contaData.getSaldo(this.keyCasa).then(s => {
        this.contaData.altSaldo(1, s[0].id, s[0].saldo, (this.dataQRC.vous * 0.8), this.keyCasa);

        this.contaData.cadTransacao(this.dataQRC.uid, "Pagamento efetuado para "+this.myname+".", this.dataQRC.vous, 'Saída', new Date(Date.now() - tzoffset).toISOString().slice(0,-1), 'saida','-');
        this.contaData.getSaldo(this.dataQRC.uid).then(s => {
          this.contaData.altSaldo(0, s[0].id, s[0].saldo, this.dataQRC.vous, this.dataQRC.uid);

          let alert = this.alertCtrl.create({
            title: "Tranferência executada com sucesso!",
            message: "Sua transferência foi executada com sucesso. Muito obrigado!",
            buttons: [{
              text: "Ok",
              handler: data => {
                this.coins = 'home';
                this.changeTabs();
                clearTimeout(this.timeout);
              }
            }]
          });
          alert.present();
        });
      });
    } else {
      this.contaData.cadTransacao(firebase.auth().currentUser.uid, "Pagamento recebido de "+this.dataQRC.nome+".", (this.dataQRC.vous * 0.8), 'Entrada', new Date(Date.now() - tzoffset).toISOString().slice(0,-1), 'entrada','+');
      this.contaData.getSaldo(firebase.auth().currentUser.uid).then(s => {
        this.contaData.altSaldo(1, s[0].id, s[0].saldo, (this.dataQRC.vous * 0.8), firebase.auth().currentUser.uid);

        this.contaData.cadTransacao(this.dataQRC.uid, "Pagamento efetuado para "+this.myname+".", this.dataQRC.vous, 'Saída', new Date(Date.now() - tzoffset).toISOString().slice(0,-1), 'saida','-');
        this.contaData.getSaldo(this.dataQRC.uid).then(s => {
          this.contaData.altSaldo(0, s[0].id, s[0].saldo, this.dataQRC.vous, this.dataQRC.uid);

          let alert = this.alertCtrl.create({
            title: "Tranferência executada com sucesso!",
            message: "Sua transferência foi executada com sucesso. Muito obrigado!",
            buttons: [{
              text: "Ok",
              handler: data => {
                this.coins = 'home';
                this.changeTabs();
                clearTimeout(this.timeout);
              }
            }]
          });
          alert.present();
        });
      });
    }
  }

  keyUpVS(evt){
    //if (evt.keyCode == 229 ){
    if (evt.keyCode == 110 ){
      this.txtVS = this.auxVS;
    } else {
      this.auxVS = this.txtVS;
    }
    this.txtRS = parseFloat((this.txtVS * 0.04).toFixed(2));
  }

  keyUpRS(evt){
    //if (evt.keyCode == 229 ){
    if (evt.keyCode == 110 ){
      if ( this.cRS > 0 ){
        this.txtRS = this.auxRS;
      } else {
        this.lenRS = (''+this.auxRS).length;
        this.auxRS = this.txtRS;
        this.cRS++;
        console.log(this.lenRS);
      }
    } else {
      if ( this.lenRS > (''+this.txtRS).length ){
        this.cRS = 0;
      }
      this.txtRS = parseFloat((parseFloat(''+this.txtRS)).toFixed(2));
      this.auxRS = this.txtRS;
    }
    this.txtVS = parseInt((this.txtRS / 0.04).toFixed(0));
  }

  openButtonPage(i) {
    if ( i == 0 ){
      this.navCtrl.push(CodCadastroPage, null);
    } else if ( i == 1 ){
      this.navCtrl.push(LoginPage, null);
    }
  }

  genQRCode(){
    if ( this.txtVS > this.saldoVS ){
      let alert = this.alertCtrl.create({
        title: "Saldo insuficiente!",
        message: "Seu saldo é menor que o valor digitado.",
        buttons: [{
          text: "Ok",
          role: 'cancel'
        }]
      });
      alert.present();
    } else if ( this.txtVS == 0 || this.txtVS == null ){
      let alert = this.alertCtrl.create({
        title: "Digite um valor!",
        message: "Digite um valor para gerar o QRCode.",
        buttons: [{
          text: "Ok",
          role: 'cancel'
        }]
      });
      alert.present();
    } else {
      this.navCtrl.push(QrCodePage, {vous: parseInt(''+this.txtVS)});
    }
  }

}
