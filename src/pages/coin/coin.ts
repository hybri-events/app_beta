import { Component } from '@angular/core';
import { NavController, AlertController, Platform, LoadingController, Loading } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { CadastroPage } from '../cadastro/cadastro';
import { ContaProvider } from '../../providers/conta/conta';
import { ErrorProvider } from '../../providers/error/error';
import { LoginPage } from '../login/login';
import { QrCodePage } from '../qr-code/qr-code';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import firebase from 'firebase';
import { Storage } from '@ionic/storage';
import { Http } from '@angular/http';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';
import { Mixpanel } from '@ionic-native/mixpanel';

declare var navigator: any;
declare var Connection: any;

@Component({
  selector: 'page-coin',
  templateUrl: 'coin.html'
})
export class CoinPage {
  coins: string = "home";
  date1: string;
  date2: string;
  tzoffset;
  authentic: any = false;
  transacoes: FirebaseListObservable<any>;

  saldoVS = 0;
  saldoRS = 0;

  txtVS: number = 0;
  txtRS: number = 0;
  timePay = null;
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

  loading: Loading;

  constructor(
    public platform: Platform,
    public db: AngularFireDatabase,
    private storage: Storage,
    public navCtrl: NavController,
    afAuth: AngularFireAuth,
    public contaData: ContaProvider,
    public alertCtrl: AlertController,
    public err: ErrorProvider,
    private barcodeScanner: BarcodeScanner,
    public loadingCtrl: LoadingController,
    public http: Http,
    private mixpanel: Mixpanel
  ) {
    this.tzoffset = (new Date()).getTimezoneOffset() * 60000;
    this.plat = platform;
    let fdata = new Date(Date.now() - this.tzoffset);
    let sdata = new Date(Date.now() - this.tzoffset);
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
        this.casa = this.db.list("casas/"+val+"/");
        let index = val.indexOf('/');
        val = val.slice(index+1,val.length);
        this.keyCasa = val;
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
      if ( this.coins == "home" ){
        this.changeTabs();
      } else if (this.coins == "receive"){
        this.coins = 'home';
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

  }

  changeTabs(){
    if ( this.coins == "home" ){
      if (this.authentic) {
        this.mixpanel.track("Vous",{"tab":"conta"});
        this.changeDate();
      }
    } else if (this.coins == "pay"){
      this.mixpanel.track("Vous",{"tab":"pagamento"});
      this.txtVS = 0;
      this.txtRS = 0;
    } else if (this.coins == "receive"){
      this.mixpanel.track("Vous",{"tab":"receber"});
      if ( this.authentic ){
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
  }

  changeDate(){
    console.log("change")
    if ( this.isCasa && this.coinCasa ){
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
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
          this.loading.dismiss();
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
    this.loading = this.loadingCtrl.create({
      content: "Realizando transação. Aguarde...",
    });
    this.loading.present();

    this.timeout = setTimeout(() => {
      this.loading.dismiss();
      this.mixpanel.track("Transferência não realizada",{"motivo":"Problemas de conexão"});
      let al = this.alertCtrl.create({
        title: "Problemas de conexão!",
        message: "Verifique sua conexão com a internet e tente novamente.",
        buttons: [{
          text: "Ok",
          handler: d => {
            clearTimeout(this.timeout);
            this.coins = 'home';
            this.changeTabs();
          }
        }]
      });
      al.present();
    },7000);

    let de = this.dataQRC.uid;
    let valor = this.dataQRC.vous;
    let para;
    if ( this.isCasa ){
      para = this.keyCasa;
    } else {
      para = firebase.auth().currentUser.uid;
    }

    let date = new Date(Date.now());

    this.contaData.getSaldo(para).then((value) => {
      let keyPara = value[0].id;
      let saldoPara = value[0].saldo;
      this.contaData.getSaldo(de).then((value) => {
        let keyDe = value[0].id;
        let saldoDe = value[0].saldo;
        if ( (saldoDe - valor) >= 0 ){
          let trans1 = this.db.list("/conta/"+para+"/transacao");
          let trans2 = this.db.list("/conta/"+de+"/transacao");
          let push2 = trans2.push({});
          let push1 = trans1.push({});
          let key1 = push1.key;
          let key2 = push2.key;
          let update = {};
          update[para+"/transacao/"+key1] = {
            ano: date.getFullYear(),
            classe: "entrada",
            descricao: "Pagamento recebido de "+this.dataQRC.nome,
            dia: date.getDate(),
            dt_hr: date.toISOString().slice(0,-1),
            hora: date.getHours(),
            mes: date.getMonth()+1,
            min: date.getMinutes(),
            operador: "+",
            tipo: "Entrada",
            valor: (valor * 0.8)
          };
          update[de+"/transacao/"+key2] = {
            ano: date.getFullYear(),
            classe: "saida",
            descricao: "Pagamento recebido de "+this.myname,
            dia: date.getDate(),
            dt_hr: date.toISOString().slice(0,-1),
            hora: date.getHours(),
            mes: date.getMonth()+1,
            min: date.getMinutes(),
            operador: "-",
            tipo: "Saída",
            valor: valor
          };
          update[para+"/"+keyPara] = {saldo: (saldoPara + (valor * 0.8))}
          update[de+"/"+keyDe] = {saldo: (saldoDe - valor)}
          let trans = this.db.list('/');
          trans.update('conta',update).then(value => {
            console.log(value);
            this.loading.dismiss();
            this.mixpanel.track("Transferência realizada com sucesso");
            let al = this.alertCtrl.create({
              title: "Tranferência executada com sucesso!",
              message: "Sua transferência foi executada com sucesso. Muito obrigado!",
              buttons: [{
                text: "Ok",
                handler: data => {
                  clearTimeout(this.timeout);
                  this.coins = 'home';
                  this.changeTabs();
                }
              }]
            });
            al.present();
          });
        } else {
          this.loading.dismiss();
          this.mixpanel.track("Transferência não realizada",{"motivo":"Saldo insuficiente"});
          let al = this.alertCtrl.create({
            title: "Saldo insuficiente!",
            message: this.dataQRC.nome+" não tem saldo suficiente para completar a tranferência.",
            buttons: [{
              text: "Ok",
              handler: data => {
                clearTimeout(this.timeout);
                this.coins = 'home';
                this.changeTabs();
              }
            }]
          });
          al.present();
        }
      });
    });
  }

  aumentar(){
    this.txtVS += 25;
    this.txtRS += 1;
    this.timePay = setInterval(() => {
      if ( (this.txtVS + 25) <= this.saldoVS ){
        this.txtVS += 25;
        this.txtRS += 1;
      } else {
        this.parar();
      }
    },100);
  }

  parar(){
    clearInterval(this.timePay);
  }

  diminuir(){
    this.txtVS -= 25;
    this.txtRS -= 1;
    this.timePay = setInterval(() => {
    if ( this.txtVS >= 25 ){
      this.txtVS -= 25;
      this.txtRS -= 1;
    } else {
      this.parar();
    }
    },100);
  }

  openButtonPage(i) {
    if ( i == 0 ){
      this.navCtrl.push(CadastroPage, null);
    } else if ( i == 1 ){
      this.navCtrl.push(LoginPage, null);
    }
  }

  genQRCode(){
	if ( this.txtVS == 0 ){
	  let al = this.alertCtrl.create({
        title: "Valor nulo!",
        message: "Selecione um valor acima de 0 para gerar o QRCode.",
        buttons: [{
          text: "Ok",
          handler: data => {}
        }]
      });
      al.present();
	} else {
	  this.navCtrl.push(QrCodePage, {vous: this.txtVS});
	}
  }

}
