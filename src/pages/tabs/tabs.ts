import { Component } from '@angular/core';
import { NavController, Platform, AlertController, LoadingController, Loading } from 'ionic-angular';
import { EventsPage } from '../events/events';
import { HomePage } from '../home/home';
import { CoinPage } from '../coin/coin';
import { NotifyPage } from '../notify/notify';
import { Storage } from '@ionic/storage';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { ContaProvider } from '../../providers/conta/conta';
import { Geolocation } from '@ionic-native/geolocation';
import firebase from 'firebase';
import { Http } from '@angular/http';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';
import { Mixpanel } from '@ionic-native/mixpanel';

@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html'
})
export class TabsPage {
  tab1Root = EventsPage;
  tab2Root = HomePage;
  tab3Root = CoinPage;
  tab4Root = NotifyPage;

  isCasa = false;
  checkqrc = true;
  authentic = false;

  dataQRC;
  eventoConf: FirebaseListObservable<any>;
  userConf: FirebaseListObservable<any>;
  e = [];
  loading: Loading;
  id;
  confirm;
  ischeck = false;
  isAdm = false;

  uid = null;
  data;

  permanencia: number = 0;

  ukey = null;
  ekey = null;
  timeout;
  tzoffset;

  constructor(
    public platform: Platform,
    private storage: Storage,
    afAuth: AngularFireAuth,
    public nav: NavController,
    public loadingCtrl: LoadingController,
    public db: AngularFireDatabase,
    private barcodeScanner: BarcodeScanner,
    public alertCtrl: AlertController,
    public contaData: ContaProvider,
    public geolocation: Geolocation,
    public http: Http,
    private mixpanel: Mixpanel
  ) {
    this.tzoffset = (new Date()).getTimezoneOffset() * 60000;
    this.data = new Date(Date.now() - this.tzoffset).toISOString().slice(0,-1);
    const authObserver = afAuth.authState.subscribe( user => {
      if (user) {
        if (!user.isAnonymous){
          this.authentic = true;
          this.uid = firebase.auth().currentUser.uid;
          authObserver.unsubscribe();
        }
      } else {
        this.authentic = false;
        authObserver.unsubscribe();
      }
    });
  }

  ionViewDidLoad(){
    this.storage.get('first').then((val) => {
      if ( val != null ){
        this.storage.get('checkqrc').then((val) => {
          if ( val == null ){
            this.checkqrc = false;
            setTimeout(() => {
              document.getElementById('cont').style.filter = 'blur(5px)';
              document.getElementById('fundo_tabs').style.opacity = '1';
            },500);
          }
        });
      }
    });

    this.storage.get('casa').then((val) => {
      if ( val != null ){
        this.isCasa = true;
        document.getElementById('tab-t0-1').style.display = 'none';
      }
    });

    if ( this.platform.is('android') ){
      /*document.getElementById('button-qrcode').style.height = document.getElementById('tab-t0-1').offsetWidth+'px';
      document.getElementById('button-qrcode').style.width = document.getElementById('tab-t0-1').offsetWidth+'px';
      document.getElementById('button-qrcode').style.left = 'calc(50% - '+(document.getElementById('tab-t0-1').offsetWidth/2)+'px)';*/
    }
  }

  closeCheckqrc(){
    document.getElementById('cont').style.filter = 'blur(0px)';
    document.getElementById('fundo_tabs').style.opacity = '0';
    setTimeout(() => {
      this.checkqrc = true;
      this.storage.set('checkqrc', true);
    },500);
  }

  readQRC(){
    if ( this.authentic ){
      this.mixpanel.track("Check-in com QR-Code");
      this.e = [];
      this.id = null;
      this.confirm = null;
      this.ischeck = false;
      let options = {
        showTorchButton : true,
        prompt : "Posicione o QRCode na área marcada.",
      }
      this.barcodeScanner.scan(options).then((barcodeData) => {
        if (!barcodeData.cancelled){
          this.dataQRC = barcodeData.text;
          let tzoffset = (new Date()).getTimezoneOffset() * 60000;
          let day1 = new Date(Date.now() - tzoffset);
          let day2 = new Date(Date.now() - tzoffset);
          day1.setHours(day1.getHours()-12);
          let eventos = this.db.list('casas/'+this.dataQRC+'/eventos', {
            query: {
              orderByChild: 'dt',
              startAt: day1.toISOString().slice(0,-1),
              endAt: day2.toISOString().slice(0,-1)
            }
          });
          eventos.forEach(evento => {
            let currentDt = null;
            for(let i=0;i<evento.length;i++){
              if ( currentDt == null || currentDt < evento[i].dt ){
                currentDt = evento[i].dt;
                this.id = evento[i].id;
              }
            }
            this.eventoConf = this.db.list('/eventos/'+this.id+'/confirmados/');
            this.userConf = this.db.list('/usuario/'+firebase.auth().currentUser.uid+'/confirmados/');
            this.checkConf();
            let eve = this.db.list('eventos/'+this.id);
            eve.forEach(even => {
              even.forEach(ev => {
                this.e[ev.$key] = ev.$value;
              });
            });
            this.loading = this.loadingCtrl.create({
              content: "Realizando check-in. Aguarde, isso pode levar alguns segundos...",
              dismissOnPageChange: true,
            });
            this.loading.present();
            setTimeout(() => {
              this.check();
            },1000);
          });
        }
      }, (err) => {
        alert("Error occured : " + err);
      });
    } else {
      let alert = this.alertCtrl.create({
        title: "Você precisa estar logado!",
        message: "Faça seu cadastro ou login para poder fazer seu check-in nos eventos.",
        buttons: [{
          text: "Ok",
          role: 'cancel'
        }]
      });
      alert.present();
    }
  }

  checkConf(){
    this.eventoConf.forEach(eve => {
      eve.forEach(c => {
        if ( c.uid == this.uid ){
          this.ekey = c.$key;
          this.ischeck = c.check;
          this.permanencia = c.perm;
          this.confirm = true;
        }
      });
    });
    this.userConf.forEach(eve => {
      eve.forEach(c => {
        if ( c.event == this.id ){
          this.ukey = c.$key;
        }
      });
    });
  }

  conf(){
    if ( this.confirm ){
      this.eventoConf.remove(this.ekey);
      this.userConf.remove(this.ukey);
      this.confirm = false;
    } else {
      let tzoffset = (new Date()).getTimezoneOffset() * 60000;
      this.eventoConf.push({uid: this.uid, perm: 0, check: false, date: new Date(Date.now() - tzoffset).toISOString().slice(0,-1)});
      this.userConf.push({event: this.id, perm: 0, check: false, criador: this.e['criador'], date: new Date(Date.now() - tzoffset).toISOString().slice(0,-1)});
      this.confirm = true;
    }
  }

  check(){
    let adms = this.db.list('casas/'+this.e['criador']+'/adms/');
    adms.forEach(adm => {
      for ( let i=0;i<adm.length;i++ ){
        if ( this.uid == adm[i][0] ){
          this.isAdm = true;
          break;
        }
      }
    });
    let index = this.e['criador'].indexOf('/');
    if ( !this.isAdm || this.uid == this.e['criador'].slice(0,index) ){
      if ( !this.ischeck ){
        this.geolocation.getCurrentPosition({enableHighAccuracy: true}).then((position) => {
          let latitude = position.coords.latitude;
          let longitude = position.coords.longitude;
          let lat = this.e['lat'];
          let lng = this.e['lng'];

          if ( ( this.calcDist(latitude, longitude, lat, lng) - position.coords.accuracy ) <= 50 ){
            let lastCheck = null;
            this.userConf.forEach(eve => {
              eve.forEach(c => {
                if ( c.check ){
                  lastCheck = c.date;
                }
              });
            });
            if ( lastCheck != null ){
              let d = new Date(lastCheck);
              d.setHours(d.getHours()+1);
              console.log(d.toISOString().slice(0,-1))
              console.log(this.data)
              if ( this.data >= d.toISOString().slice(0,-1) ){
                this.backgroundCheck();
              } else {
                this.loading.dismiss();
                let alert = this.alertCtrl.create({
                  title: 'Você já realizou um check-in antes!',
                  subTitle: 'Aguarde um período de 1 hora pra fazer um novo check-in.',
                  buttons: ['OK']
                });
                alert.present();
                this.mixpanel.track("Check-in não realizado",{"motivo":"Já fez check-in em menos de uma hora"});
              }
            } else {
              this.backgroundCheck();
            }
          } else {
            this.loading.dismiss();
            let alert = this.alertCtrl.create({
              title: 'Você está muito longe!',
              subTitle: 'Você não está próximo o suficiente do evento para fazer o check-in.',
              buttons: ['OK']
            });
            alert.present();
            this.mixpanel.track("Check-in não realizado",{"motivo":"Não está próximo o suficiente"});
          }
        }, (err) => {
          this.loading.dismiss();
          console.log(err);
        });
      } else {
        this.loading.dismiss();
        let alert = this.alertCtrl.create({
          title: 'Check-in já realizado!',
          subTitle: 'Você já fez check-in neste evento.',
          buttons: ['OK']
        });
        alert.present();
        this.mixpanel.track("Check-in não realizado",{"motivo":"Já fez check-in neste evento"});
      }
    } else {
      this.loading.dismiss();
      let alert = this.alertCtrl.create({
        title: 'Você é um administrador do local!',
        subTitle: 'Não é possível realizar o check-in em seu prórpio estabelecimento.',
        buttons: ['OK']
      });
      alert.present();
      this.mixpanel.track("Check-in não realizado",{"motivo":"É administrador do estabelecimento"});
    }
  }

  calcDist(latitude, longitude, lat, lng){
    let radLat1 = latitude * 0.01745;
    let radLng1 = longitude * 0.01745;
    let radLat2 = lat * 0.01745;
    let radLng2 = lng * 0.01745;

    let difLat = radLat1 - radLat2;
    let difLng = radLng1 - radLng2;

    let a = ( Math.pow(Math.sin(difLat/2),2) + Math.cos(radLat1) ) * Math.cos(radLat2) * Math.pow(Math.sin(difLng/2),2);
    let c = 2 * Math.atan(Math.sqrt(a) / Math.sqrt(1 - a));
    let d = 6371 * c;

    console.log(d * 1000);
    console.log(parseInt(''+(d * 1000))+' metros');

    return parseInt(''+(d * 1000));
  }

  backgroundCheck(){
    if ( !this.confirm ){
      this.conf();
    } else {
      let tzoffset = (new Date()).getTimezoneOffset() * 60000;
      if ( this.permanencia == 0 ){
        this.eventoConf.update(this.ekey,{date: new Date(Date.now() - tzoffset).toISOString().slice(0,-1)});
        this.userConf.update(this.ukey,{date: new Date(Date.now() - tzoffset).toISOString().slice(0,-1)});
      }
    }
    this.loading.dismiss();
    this.confirmCheck();
  }

  confirmCheck(){
    this.eventoConf.update(this.ekey,{check: true, mode: 'qr-code'});
    this.userConf.update(this.ukey,{check: true, mode: 'qr-code'});
    if ( this.e['coin'] ){
      let cont = 0;
      this.userConf.forEach(us => {
        us.forEach(u => {
          if ( u.criador == this.e['criador'] && u.check ){
            cont++;
          }
        })
      });
      console.log(cont);
      let valor = 0;
      cont -= 1;
      console.log(cont);
      if ( cont == 0 || (cont+1) % 5 == 0 ){
        valor = 50;
      } else {
        valor = 30;
      }
      console.log('check value')
      let index = this.e['criador'].indexOf('/');

      this.timeout = setTimeout(() => {
        this.loading.dismiss();
        this.mixpanel.track("Check-in não realizado",{"motivo":"Sem conexão com a internet"});
        let al = this.alertCtrl.create({
          title: "Problemas de conexão!",
          message: "Verifique sua conexão com a internet e tente novamente.",
          buttons: [{
            text: "Ok",
            handler: d => {
              clearTimeout(this.timeout);
            }
          }]
        });
        al.present();
      },7000);

      let de = this.e['criador'].slice(index+1,this.e['criador'].length);
      let para = firebase.auth().currentUser.uid;
      let vezes = cont + 1;

      let date = new Date(Date.now());

      this.contaData.getSaldo(para).then((value) => {
        console.log(value)
        let keyPara = value[0].id;
        let saldoPara = value[0].saldo;
        this.contaData.getSaldo(de).then((value) => {
          let keyDe = value[0].id;
          let saldoDe = value[0].saldo;
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
            descricao: "Check-in no evento \""+this.e['nome']+"\". "+vezes+"ª vez neste estabelecimento.",
            dia: date.getDate(),
            dt_hr: date.toISOString().slice(0,-1),
            hora: date.getHours(),
            mes: date.getMonth()+1,
            min: date.getMinutes(),
            operador: "+",
            tipo: "Entrada",
            valor: valor
          };
          update[de+"/transacao/"+key2] = {
            ano: date.getFullYear(),
            classe: "saida",
            descricao: "Check-in no seu evento \""+this.e['nome']+"\".",
            dia: date.getDate(),
            dt_hr: date.toISOString().slice(0,-1),
            hora: date.getHours(),
            mes: date.getMonth()+1,
            min: date.getMinutes(),
            operador: "-",
            tipo: "Saída",
            valor: valor
          };
          update[para+"/"+keyPara] = {saldo: (saldoPara + valor)}
          update[de+"/"+keyDe] = {saldo: (saldoDe - valor)}
          let trans = this.db.list('/');
          trans.update('conta',update).then(value => {
            this.loading.dismiss();
            let alert = this.alertCtrl.create({
              title: 'Check-in realizado com sucesso!',
              subTitle: 'O check-in neste evento foi realizado com sucesso, agora vamos nos divertir.',
              buttons: [{
                text: "Ok",
                handler: d => {
                  clearTimeout(this.timeout);
                }
              }]
            });
            alert.present();
            this.mixpanel.track("Check-in realizado com sucesso");
          });
        });
      });
      console.log('finish')
    } else {
      let alert = this.alertCtrl.create({
        title: 'Check-in realizado com sucesso!',
        subTitle: 'O check-in neste evento foi realizado com sucesso, agora vamos nos divertir.',
        buttons: ['OK']
      });
      alert.present();
      this.mixpanel.track("Check-in realizado com sucesso");
    }
  }
}
