import { Component, ViewChild, ElementRef } from '@angular/core';
import { Platform, NavController, NavParams, Content, AlertController } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import firebase from 'firebase';
import { ContaProvider } from '../../providers/conta/conta';
import { Geolocation } from '@ionic-native/geolocation';

declare var google;

@Component({
  selector: 'page-event-detail',
  templateUrl: 'event-detail.html',
})
export class EventDetailPage {
  id;
  event: FirebaseListObservable<any>;
  e = [];

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

  constructor(public platform: Platform, public navCtrl: NavController, public navParams: NavParams, public db: AngularFireDatabase, public alertCtrl: AlertController, public geolocation: Geolocation, public contaData: ContaProvider) {
    this.id = navParams.data.id;
    let tzoffset = (new Date()).getTimezoneOffset() * 60000;
    this.data = new Date(Date.now() - tzoffset).toISOString().slice(0,-1);

    this.event = db.list('/evento/'+this.id+'/');
    this.eventoConf = db.list('/evento/'+this.id+'/confirmados/');
    this.userConf = db.list('/usuario/'+this.uid+'/confirmados/');
    this.event.forEach( evento => {
      evento.forEach( eve => {
        if ( eve.$key == "tags" ){
          this.e[eve.$key] = [];
          eve.forEach(ev => {
            this.e[eve.$key].push(ev);
          });
        } else if ( eve.$key == "confirmados" ){
          this.eventoConf.forEach(j => {
            j.forEach(i => {
              if ( i.check ){
                this.numCheck++;
              }
            });
            this.numConf = j.length;
          });
        } else {
          if ( eve.$key == 'dti' ){
            let dti = new Date(eve.$value);
            dti.setHours(dti.getHours() + 12);
            if ( this.data >= dti.toISOString().slice(0,-1) ){
              this.periodoCheck = false;
            }
          }
          this.e[eve.$key] = eve.$value;
        }
      });
    });
  }

  ngAfterViewInit() {
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
      if ( this.data < this.e['dti'] ){
        if ( (data.scrollTop - 38) >= (document.getElementById('fundo').offsetHeight - h) ){
          document.getElementById('tabs').style.position = 'fixed';
          document.getElementById('list').style.paddingTop = '91px';
        } else {
          document.getElementById('tabs').style.position = 'initial';
          document.getElementById('list').style.paddingTop = '8px';
        }
      }
    });
    this.loadMap(this.e['lat'], this.e['lng']);
    this.checkConf();
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

  checkConf(){
    this.eventoConf.forEach(eve => {
      eve.forEach(c => {
        if ( c.uid == this.uid ){
          this.ischeck = c.check;
          this.confirm = true;
        }
      });
    });
  }

  conf(){
    if ( this.confirm ){
      let ekey;
      let ukey;
      this.eventoConf.forEach(eve => {
        eve.forEach(c => {
          if ( c.uid == this.uid ){
            ekey = c.$key;
          }
        });
      });
      this.eventoConf.remove(ekey);
      this.userConf.forEach(eve => {
        eve.forEach(c => {
          if ( c.event == this.id ){
            ukey = c.$key;
          }
        });
      });
      this.userConf.remove(ukey);
      this.confirm = false;
    } else {
      this.eventoConf.push({uid: this.uid, check: false});
      this.userConf.push({event: this.id, check: false});
      this.confirm = true;
    }
  }

  check(){
    if ( !this.ischeck ){
      this.geolocation.getCurrentPosition().then((position) => {
        let latitude = position.coords.latitude;
        let longitude = position.coords.longitude;
        let lat = this.e['lat'];
        let lng = this.e['lng'];

        console.log(latitude)
        console.log(lat)
        console.log(longitude)
        console.log(lng)

        if ( (latitude*-1) <= ((lat*-1)+0.0003) && (latitude*-1) >= ((lat*-1)-0.0003) && (longitude*-1) <= ((lng*-1)+0.0003) && (longitude*-1) >= ((lng*-1)-0.0003) ){
          let ekey;
          let ukey;
          this.eventoConf.forEach(eve => {
            eve.forEach(c => {
              if ( c.uid == this.uid ){
                ekey = c.$key;
              }
            });
          });
          this.eventoConf.update(ekey,{check: true});
          this.userConf.forEach(eve => {
            eve.forEach(c => {
              if ( c.event == this.id ){
                ukey = c.$key;
              }
            });
          });
          this.userConf.update(ukey,{check: true});
          if ( this.e['coin'] ){
            let tzoffset = (new Date()).getTimezoneOffset() * 60000;
            this.contaData.cadTransacao(firebase.auth().currentUser.uid, "Check-in no evento \""+this.e['nome']+"\".", 50, 'Entrada', new Date(Date.now() - tzoffset).toISOString().slice(0,-1), 'entrada','+');
            this.contaData.getSaldo(firebase.auth().currentUser.uid).then(s => {
              this.contaData.altSaldo(1, s[0].id, s[0].saldo, 50, firebase.auth().currentUser.uid);
            });
          }
        } else {
          console.log('não');
        }
      }, (err) => {
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
  }

}
