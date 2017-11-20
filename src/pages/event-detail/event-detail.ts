import { Component, ViewChild, ElementRef, NgZone } from '@angular/core';
import { Platform, NavController, NavParams, Content, AlertController, LoadingController, Loading, Navbar } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import firebase from 'firebase';
import { ContaProvider } from '../../providers/conta/conta';
import { Geolocation } from '@ionic-native/geolocation';
import { Storage } from '@ionic/storage';
import { EditEventPage } from '../edit-event/edit-event';
import { StatusBar } from '@ionic-native/status-bar';
//import { BackgroundGeolocation, BackgroundGeolocationConfig, BackgroundGeolocationResponse } from '@ionic-native/background-geolocation';
import { Http } from '@angular/http';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/toPromise';
import { Mixpanel } from '@ionic-native/mixpanel';
import { PerfilEstabPage } from '../perfil-estab/perfil-estab';
import { LocalNotifications } from '@ionic-native/local-notifications';

declare var google;

@Component({
  selector: 'page-event-detail',
  templateUrl: 'event-detail.html',
})
export class EventDetailPage {
  id;
  event: FirebaseListObservable<any>;
  e = [];

  @ViewChild(Navbar) navBar: Navbar;

  @ViewChild('map') mapElement: ElementRef;
  map: any;

  @ViewChild(Content)
  content:Content;

  uid = firebase.auth().currentUser.uid;
  data;

  numConf = 0;
  numCheck = 0;
  confirm;
  ischeck = false;

  periodoCheck = true;

  eventoConf: FirebaseListObservable<any>;
  userConf: FirebaseListObservable<any>;

  isCasa = false;
  keyCasa;
  isAdm = false;

  timeout = null;

  loading:Loading;

  permanencia: number = 0;

  ukey = null;
  ekey = null;
  tzoffset;
  mediadeta = [0,0,0,0,0];
  isAvaliado = false;

  numdeta = false;

  constructor(
    public platform: Platform,
    public navCtrl: NavController,
    public navParams: NavParams,
    public db: AngularFireDatabase,
    public alertCtrl: AlertController,
    public geolocation: Geolocation,
    public contaData: ContaProvider,
    private storage: Storage,
    public loadingCtrl: LoadingController,
    private statusBar: StatusBar,
    /*private backgroundGeolocation: BackgroundGeolocation,*/
    private zone: NgZone,
    public http: Http,
    private mixpanel: Mixpanel,
    private localNotifications: LocalNotifications
  ) {
    this.id = navParams.data.id;
    this.mixpanel.track("Detalhe do evento",{"id":this.id});
    console.log(this.id);
    this.tzoffset = (new Date()).getTimezoneOffset() * 60000;
    this.data = new Date(Date.now() - this.tzoffset).toISOString().slice(0,-1);

    this.event = db.list('/eventos/'+this.id+'/');
    this.eventoConf = db.list('/eventos/'+this.id+'/confirmados/');
    this.userConf = db.list('/usuario/'+this.uid+'/confirmados/');

    this.storage.get('casa').then((val) => {
      if ( val != null ){
        this.keyCasa = val;
        this.isCasa = true;
      }
    });
    this.event.forEach( evento => {
      evento.forEach( eve => {
        if ( eve.$key == "tags" ){
          this.e[eve.$key] = [];
          eve.forEach(ev => {
            this.e[eve.$key].push(ev);
          });
        } else if ( eve.$key == "confirmados" ){
          this.eventoConf.forEach(j => {
            this.numCheck = 0;
            j.forEach(i => {
              if ( i.check ){
                this.numCheck++;
              }
            });
            this.numConf = j.length;
          });
        } else {
          if ( eve.$key == 'dti' ){
            if ( this.e['dtf'] != "" ){
              let dtf = new Date(this.e['dtf']);
              console.log(this.data >= dtf.toISOString().slice(0,-1));
              if ( this.data >= dtf.toISOString().slice(0,-1) ){
                this.periodoCheck = false;
              }
            } else {
              let dti = new Date(eve.$value);
              dti.setHours(dti.getHours() + 12);
              if ( this.data >= dti.toISOString().slice(0,-1) ){
                this.periodoCheck = false;
              }
            }
          } else if ( eve.$key == 'criador' ){
            let casa = this.db.list('/casas/'+eve.$value);
            casa.forEach(cas => {
              this.e['casa'] = [];
              for ( let i=0;i<cas.length;i++ ){
                this.e['casa'][cas[i].$key] = cas[i].$value;
              }
            });
            this.e['nota'] = 0;
            this.e['otherNota'] = [0,0,0,0,0];
            let total = [0,0,0,0,0];
            let ava = this.db.list('/avaliacao/'+eve.$value);
            ava.forEach(a => {
              for ( let i=0;i<a.length;i++ ){
                if ( a[i].uid == firebase.auth().currentUser.uid ){
                  this.isAvaliado = true;
                }
                this.e['nota'] += a[i].nota;
                if ( a[i].other != {teste:'teste'} && a[i].other != undefined ){
                  if ( a[i].other['amb'] != undefined ){
                    this.e['otherNota'][0] += a[i].other['amb'];
                    total[0]++;
                    this.numdeta = true;
                  }
                  if ( a[i].other['ate'] != undefined ){
                    this.e['otherNota'][1] += a[i].other['ate'];
                    total[1]++;
                    this.numdeta = true;
                  }
                  if ( a[i].other['bar'] != undefined ){
                    this.e['otherNota'][2] += a[i].other['bar'];
                    total[2]++;
                    this.numdeta = true;
                  }
                  if ( a[i].other['coz'] != undefined ){
                    this.e['otherNota'][3] += a[i].other['coz'];
                    total[3]++;
                    this.numdeta = true;
                  }
                  if ( a[i].other['pre'] != undefined ){
                    this.e['otherNota'][4] += a[i].other['pre'];
                    total[4]++;
                    this.numdeta = true;
                  }
                }
              }
              if ( a.length > 0 ){
                this.e['nota'] /= a.length;
                if ( this.e['otherNota'][0] != 0 ){
                  this.mediadeta[0] = this.e['otherNota'][0] / total[0];
                }
                if (this.e['otherNota'][1] != 0 ){
                  this.mediadeta[1] = this.e['otherNota'][1] / total[1];
                }
                if ( this.e['otherNota'][2] != 0 ){
                  this.mediadeta[2] = this.e['otherNota'][2] / total[2];
                }
                if ( this.e['otherNota'][3] != 0 ){
                  this.mediadeta[3] = this.e['otherNota'][3] / total[3];
                }
                if ( this.e['otherNota'][4] != 0 ){
                  this.mediadeta[4] = this.e['otherNota'][4] / total[4];
                }
              } else {
                this.e['nota'] = null;
              }
              console.log(this.e['nota'])
            });
          }
          this.e[eve.$key] = eve.$value;
        }
      });
    });
	  platform.ready().then(() => {
      if ( platform.is('ios') ){
        statusBar.styleLightContent();
      }
    });
  }

  openPerfilEstab(key){
    this.navCtrl.push(PerfilEstabPage, {id: key});
  }

  parseInt(valor){
    return parseInt(valor);
  }

  ngAfterViewInit() {
    this.navBar.backButtonClick = (e:UIEvent)=>{
      if ( this.platform.is('ios') ){
        this.statusBar.styleDefault();
      }
      this.navCtrl.pop();
    }
    this.content.ionScroll.subscribe((data) => {
      let h;
      if ( this.platform.is('ios') ){
        h = 44;
      } else {
        h = 56;
        if ( this.data < this.e['dti'] && !this.isCasa && this.e['coin'] ){
          if ( (data.scrollTop - 38) >= (document.getElementById('fundo').offsetHeight - h) ){
            document.getElementById('tabs').style.position = 'fixed';
            document.getElementById('list').style.paddingTop = '91px';
          } else {
            document.getElementById('tabs').style.position = 'initial';
            document.getElementById('list').style.paddingTop = '8px';
          }
        }
      }
      if ( data.scrollTop < (document.getElementById('fundo').offsetHeight - h)  ){
        document.getElementById('fundo').style.opacity = ''+(1 - (data.scrollTop / (document.getElementById('fundo').offsetHeight - h)));
        document.getElementById('title').style.opacity = ''+(data.scrollTop / (document.getElementById('fundo').offsetHeight - h));
        document.getElementById('tool').style.background = 'transparent';
        document.getElementById('tool').classList.remove('header_af');
      } else if ( data.scrollTop >= (document.getElementById('fundo').offsetHeight - h) ) {
        document.getElementById('tool').style.background = '#652C90';
        document.getElementById('tool').classList.add('header_af');
        document.getElementById('fundo').style.opacity = '1';
        document.getElementById('title').style.opacity = '1';
      }
    });
    this.checkConf();
    this.loadMap(this.e['lat'], this.e['lng']);
  }

  loadMap(lat, lng){
    let latLng = new google.maps.LatLng(lat, lng);

    let mapOptions = {
      center: latLng,
      zoom: 15,
      disableDefaultUI: true,
      mapTypeControl: false,
      scaleControl: false,
      zoomControl: false,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      draggable: false
    }

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    let iconS = {
      url: 'assets/ic_pin_n.png',
      size: new google.maps.Size(36, 36)
    };
    let marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: new google.maps.LatLng(lat, lng),
      icon: iconS
    });

    google.maps.event.addListener(marker, 'click', () => {

    });
  }

  startExternalMap() {
    this.platform.ready().then(() => {
      if (this.platform.is('ios')) {
        window.open('maps://?q=' + this.e['nomeCriador'] + '&saddr=' + this.e['lat'] + ',' + this.e['lng'] + '&daddr=' + this.e['lat'] + ',' + this.e['lng'], '_system');
      }
      if (this.platform.is('android')) {
        window.open('geo://' + this.e['lat'] + ',' + this.e['lng'] + '?q=' + this.e['lat'] + ',' + this.e['lng'] + '(' + this.e['nomeCriador'] + ')', '_system');
      }
    });
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
      this.mixpanel.track("Cancelou presença");
    } else {
      let tzoffset = (new Date()).getTimezoneOffset() * 60000;
      this.eventoConf.push({uid: this.uid, perm: 0, check: false, date: new Date(Date.now() - tzoffset).toISOString().slice(0,-1)});
      this.userConf.push({event: this.id, perm: 0, check: false, criador: this.e['criador'], date: new Date(Date.now() - tzoffset).toISOString().slice(0,-1)});
      this.confirm = true;
      this.mixpanel.track("Confirmou presença");
    }
  }

  check(){
    this.mixpanel.track("Iniciou check-in");
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
        this.loading = this.loadingCtrl.create({
          content: "Realizando check-in. Aguarde, isso pode levar alguns segundos...",
          dismissOnPageChange: true,
        });
        this.loading.present();
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
              d = new Date(d.getTime() - this.tzoffset);
              d.setHours(d.getHours()+1);
              console.log(d.toISOString().slice(0,-1))
              console.log(this.data);
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
        let alert = this.alertCtrl.create({
          title: 'Check-in já realizado!',
          subTitle: 'Você já fez check-in neste evento.',
          buttons: ['OK']
        });
        alert.present();
        this.mixpanel.track("Check-in não realizado",{"motivo":"Já fez check-in neste evento"});
      }
    } else {
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

    this.confirmCheck();

    /*const config: BackgroundGeolocationConfig = {
      desiredAccuracy: 0,
      stationaryRadius: 10,
      distanceFilter: 10,
      debug: false,
      notificationTitle: "Verificação de permanência",
      notificationText: "Permaneça por, no mínimo, 1 hora neste evento",
      notificationIconColor: "#652C90",
      stopOnTerminate: true,
      url: 'http://www.usevou.com/api/teste.php',
    };

    this.backgroundGeolocation.configure(config).subscribe((location: BackgroundGeolocationResponse) => {
      console.log(location);
      this.zone.run(() => {
        let dt = new Date().getTime();
        let latitude = location.latitude;
        let longitude = location.longitude;
        let lat = this.e['lat'];
        let lng = this.e['lng'];

        if ( ( this.calcDist(latitude, longitude, lat, lng) - location.accuracy ) <= 50 ){
          this.loading.dismiss().then(() => {
            let al = this.alertCtrl.create({
              title: 'Aguarde a validação do check-in!',
              subTitle: 'Não feche o aplicativo, apenas minimize-o e aguarde, no mínimo, 1 hora no evento. Caso o aplicativo seja fechado, faça o check-in novamente que ele continuará de onde parou.',
              buttons: ['OK']
            });
            al.present();
          });
          let date;
          this.eventoConf.forEach(eve => {
            eve.forEach(c => {
              if ( c.uid == this.uid ){
                date = new Date(c.date).getTime();
                this.permanencia = (dt - date);
              }
            });
          });
          this.eventoConf.update(this.ekey,{perm: (dt - date)});
          this.userConf.update(this.ukey,{perm: (dt - date)});
          console.log(this.ischeck)
          if ( (dt - date) >= 3600000 && !this.ischeck ){
            this.confirmCheck();
          }
        } else {
          this.loading.dismiss().then(() => {
            let al = this.alertCtrl.create({
              title: 'Check-in não realizado!',
              subTitle: 'Tente novamente mais tarde.',
              buttons: ['OK']
            });
            al.present();
          });
          let date;
          this.eventoConf.forEach(eve => {
            eve.forEach(c => {
              if ( c.uid == this.uid ){
                date = new Date(c.date).getTime();
              }
            });
          });
          this.eventoConf.update(this.ekey,{perm: (dt - date)});
          this.userConf.update(this.ukey,{perm: (dt - date)});
          this.backgroundGeolocation.stop();
          this.backgroundGeolocation.finish();
        }
      });
    });

    this.backgroundGeolocation.start();*/

    /*this.bgGeo.on('location', (location, taskId) => {
        var coords = location.coords;
        var lat    = coords.latitude;
        var lng    = coords.longitude;
        console.log('- Location: ', JSON.stringify(location));

        //this.bgGeo.finish(taskId);
        //this.bgGeo.stop();
    }, (errorCode) => {
        console.warn('- BackgroundGeoLocation error: ', errorCode);
    });

    this.bgGeo.on('motionchange', (isMoving) => {
      console.log('- onMotionChange: ', isMoving);
    });

    this.bgGeo.on('geofence', (geofence) => {
      console.log('- onGeofence: ', geofence.identifier, geofence.location);
    });

    this.bgGeo.on('http', (response) => {
      console.log('http success: ', response.responseText);
    }, function(response) {
      console.log('http failure: ', response.status);
    });

    this.bgGeo.configure({

        desiredAccuracy: 0,
        distanceFilter: 10,
        stationaryRadius: 10,

        activityRecognitionInterval: 10000,
        stopTimeout: 5,

        debug: true,
        stopOnTerminate: false,
        startOnBoot: true,

        url: "http://usevou.com/api/teste.php",
        method: "POST",
        autoSync: true,
        maxDaysToPersist: 3,
        httpRootProperty: 'data',
        locationTemplate: '{ "lat":<%= latitude %>, "lng":<%= longitude %> }',
        extras: {
          "auth_token": firebase.auth().currentUser.uid
        }
    }, (state) => {
        console.log("BackgroundGeolocation ready: ", state);
        if (!state.enabled) {
            this.bgGeo.start();
        }
    });

    this.bgGeo.start();*/
  }

  confirmCheck(){
    this.eventoConf.update(this.ekey,{check: true, mode: 'button'});
    this.userConf.update(this.ukey,{check: true, mode: 'button'});
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
                  this.storage.set('notiCheckin',date.toISOString());
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
    }
    if ( !this.isAvaliado ){
      let dtNoti = new Date(Date.now());
      //dtNoti.setDate(dtNoti.getDate()+1);
      dtNoti.setMinutes(dtNoti.getMinutes()+1);
      console.log(dtNoti)
      this.localNotifications.schedule({
        id: 65290,
        title: '',
        text: 'Se divertiu muito ontem em '+this.e['nomeCriador']+'? 🎉 Então avalie o local e ajude outras pessoas a se divertirem também! 😀',
        at: dtNoti,
        led: '652C90',
        icon: "res://ic_stat_onesignal_default",
        color: '652C90'
      });
    }
  }

  editEvent(){
    this.navCtrl.push(EditEventPage,{id: this.id});
  }

  removeEvent(){
    this.mixpanel.track("Deletou evento");
    let alert = this.alertCtrl.create({
      title: 'Excluir evento',
      subTitle: 'Tem certeza que você deseja excluir este evento?',
      buttons: [{text: 'Não', handler: () => {}},{text: 'Sim', handler: () => {
        let list = this.db.list('/eventos/');
        list.remove(this.id);
        let casa = this.db.list('/casas/'+this.keyCasa+'/eventos');
        casa.forEach(cas => {
          for (let i=0;i<cas.length;i++){
            if ( cas[i].id == this.id ){
              casa.remove(cas[i].$key);
            }
          }
        });
        this.navCtrl.pop();
      }}]
    });
    alert.present();
  }

}
