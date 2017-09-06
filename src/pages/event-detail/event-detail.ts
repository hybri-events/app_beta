import { Component, ViewChild, ElementRef, NgZone } from '@angular/core';
import { Platform, NavController, NavParams, Content, AlertController, LoadingController, Loading, Navbar } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import firebase from 'firebase';
import { ContaProvider } from '../../providers/conta/conta';
import { Geolocation } from '@ionic-native/geolocation';
import { Storage } from '@ionic/storage';
import { EditEventPage } from '../edit-event/edit-event';
import { StatusBar } from '@ionic-native/status-bar';
import { BackgroundGeolocation, BackgroundGeolocationConfig, BackgroundGeolocationResponse } from '@ionic-native/background-geolocation';

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
    private backgroundGeolocation: BackgroundGeolocation,
    private zone: NgZone
  ) {
    this.id = navParams.data.id;
    console.log(this.id);
    let tzoffset = (new Date()).getTimezoneOffset() * 60000;
    this.data = new Date(Date.now() - tzoffset).toISOString().slice(0,-1);

    this.event = db.list('/evento/'+this.id+'/');
    this.eventoConf = db.list('/evento/'+this.id+'/confirmados/');
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
              cas.forEach(ca => {
                this.e['casa'][ca.$key] = ca.$value;
              })
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
      if ( this.data < this.e['dti'] && !this.isCasa && this.e['coin'] ){
        if ( (data.scrollTop - 38) >= (document.getElementById('fundo').offsetHeight - h) ){
          document.getElementById('tabs').style.position = 'fixed';
          document.getElementById('list').style.paddingTop = '91px';
        } else {
          document.getElementById('tabs').style.position = 'initial';
          document.getElementById('list').style.paddingTop = '8px';
        }
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

          console.log(latitude)
          console.log(longitude)
          console.log(lat)
          console.log(lng)

          console.log("Accuracy: "+position.coords.accuracy)

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
              d.setHours(d.getHours()+12);
              if ( this.data >= d.toISOString().slice(0,-1) ){
                this.backgroundCheck();
              } else {
                this.loading.dismiss();
                let alert = this.alertCtrl.create({
                  title: 'Você já realizou um check-in antes!',
                  subTitle: 'Você já fez outro check-in nas últimas 12 horas.',
                  buttons: ['OK']
                });
                alert.present();
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
      }
    } else {
      if ( this.e['coin'] ){
        let tzoffset = (new Date()).getTimezoneOffset() * 60000;
        let index = this.e['criador'].indexOf('/');
        this.contaData.cadTransacao(firebase.auth().currentUser.uid, "Check-in no evento \""+this.e['nome']+"\".", 50, 'Entrada', new Date(Date.now() - tzoffset).toISOString().slice(0,-1), 'entrada','+');
        this.contaData.getSaldo(firebase.auth().currentUser.uid).then(s => {
          this.contaData.altSaldo(1, s[0].id, s[0].saldo, 50, firebase.auth().currentUser.uid);
          this.contaData.cadTransacao(this.e['criador'].slice(index+1,this.e['criador'].length), "Check-in no seu evento \""+this.e['nome']+"\".", 50, 'Saída', new Date(Date.now() - tzoffset).toISOString().slice(0,-1), 'saida','-');
          this.contaData.getSaldo(this.e['criador'].slice(index+1,this.e['criador'].length)).then(s => {
            this.contaData.altSaldo(0, s[0].id, s[0].saldo, 50, this.e['criador'].slice(index+1,this.e['criador'].length));
          });
        });
      }
      let alert = this.alertCtrl.create({
        title: 'Check-in realizado com sucesso!',
        subTitle: 'O check-in neste evento foi realizado com sucesso, agora vamos nos divertir.',
        buttons: ['OK']
      });
      alert.present();
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

    const config: BackgroundGeolocationConfig = {
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

    this.backgroundGeolocation.start();

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
      if ( cont == 0 || cont % 5 == 0 ){
        valor = 50;
      } else {
        valor = 30;
      }
      console.log('check value')
      let tzoffset = (new Date()).getTimezoneOffset() * 60000;
      let index = this.e['criador'].indexOf('/');
      this.contaData.cadTransacao(firebase.auth().currentUser.uid, "Check-in no evento \""+this.e['nome']+"\". "+(cont+1)+"ª vez neste estabelecimento.", valor, 'Entrada', new Date(Date.now() - tzoffset).toISOString().slice(0,-1), 'entrada','+');
      this.contaData.getSaldo(firebase.auth().currentUser.uid).then(s => {
        this.contaData.altSaldo(1, s[0].id, s[0].saldo, valor, firebase.auth().currentUser.uid);
        this.contaData.cadTransacao(this.e['criador'].slice(index+1,this.e['criador'].length), "Check-in no seu evento \""+this.e['nome']+"\".", valor, 'Saída', new Date(Date.now() - tzoffset).toISOString().slice(0,-1), 'saida','-');
        this.contaData.getSaldo(this.e['criador'].slice(index+1,this.e['criador'].length)).then(s => {
          this.contaData.altSaldo(0, s[0].id, s[0].saldo, valor, this.e['criador'].slice(index+1,this.e['criador'].length));
        });
      });
      console.log('finish')
    }
    let alert = this.alertCtrl.create({
      title: 'Check-in realizado com sucesso!',
      subTitle: 'O check-in neste evento foi realizado com sucesso, agora vamos nos divertir.',
      buttons: ['OK']
    });
    alert.present();
  }

  editEvent(){
    this.navCtrl.push(EditEventPage,{id: this.id});
  }

  removeEvent(){
    let alert = this.alertCtrl.create({
      title: 'Excluir evento',
      subTitle: 'Tem certeza que você deseja excluir este evento?',
      buttons: [{text: 'Não', handler: () => {}},{text: 'Sim', handler: () => {
        let list = this.db.list('/evento/');
        list.remove(this.id);
        let casa = this.db.list('/casas/'+this.keyCasa+'/eventos');
        casa.forEach(cas => {
          for (let i=0;i<cas.length;i++){
            if ( cas[i].evento == this.id ){
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
