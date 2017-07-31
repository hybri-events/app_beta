import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, Platform, AlertController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { CriarEventoPage } from '../criar-evento/criar-evento';
import { EventDetailPage } from '../event-detail/event-detail';
import { AngularFireAuth } from 'angularfire2/auth';
import { EventoProvider } from '../../providers/evento/evento';
import { ErrorProvider } from '../../providers/error/error';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';

declare var google;

@Component({
  selector: 'page-events',
  templateUrl: 'events.html'
})
export class EventsPage {
  maps: string = "list";
  search: any = false;
  authentic: any = false;

  @ViewChild('map') mapElement: ElementRef;
  map: any;

  lat: any;
  lng: any;
  plat: any;
  events: FirebaseListObservable<any>;

  stDtini;
  stDtfim;
  stTag;
  stFaixa = {lower: 0, upper: 1000};
  stCity;

  eve = [];

  casa = [];
  isCasa = false;

  lastOpenedInfoWindow = null;
  click = [];

  carregando = true;

  constructor(platform: Platform, public filtro: Events, public db: AngularFireDatabase, private storage: Storage, public navCtrl: NavController, afAuth: AngularFireAuth, public geolocation: Geolocation, public evento: EventoProvider, public alertCtrl: AlertController, public err: ErrorProvider) {
    this.plat = platform;
    const authObserver = afAuth.authState.subscribe( user => {
      if (user) {
        if (!user.isAnonymous){
          this.authentic = true;
          authObserver.unsubscribe();
        }
      } else {
        this.authentic = false;
        authObserver.unsubscribe();
      }
    });
    filtro.subscribe('filtro:change', () => {
      this.changeTab();
    });
    this.storage.get('casa').then((val) => {
      if ( val != null ){
        this.isCasa = true;
      }
    });
  }

  ionViewDidLoad(){
    this.db.list('/casas/').subscribe(cas => {
      this.casa = cas;
      this.changeTab();
    });
  }

  changeTab(){
    this.eve = [];
    this.carregando = true;
    this.storage.get('cidade').then((val) => {
      this.stCity = val;
      this.storage.get('dt_filtro').then((val) => {
        this.stDtini = val;
        let date = new Date(val);
        date.setDate(date.getDate()+1);
        date.setHours(20);
        date.setMinutes(59);
    	  if ( this.plat.is('android') ){
    		  date.setDate(new Date(this.stDtini).getDate());
    	  }
        this.stDtfim = date.toISOString().slice(0,-1);
        this.storage.get('tag').then((val) => {
          this.stTag = val;
          this.storage.get('faixa').then((val) => {
            this.stFaixa = val;
            this.events = this.db.list('/evento/'+this.stCity, {
              query: {
                orderByChild: 'dti',
                startAt: this.stDtini,
                endAt: this.stDtfim
              }
            });
            let h = 0;
            this.events.forEach(ev => {
              let t = [];
              h++;
              ev.forEach(e => {
                let ok = false;
                if ( e.faixa_ini >= parseInt(""+this.stFaixa.lower) && e.faixa_fim <= parseInt(""+this.stFaixa.upper) ){
                  if ( this.stTag != null ){
                    if ( e.tags != undefined ){
                      for ( let j=0;j<e.tags.length;j++ ){
                        if ( e.tags[j].nome == this.stTag ){
                          ok = true;
                        }
                      }
                    }
                  } else {
                    ok = true;
                  }
                }
                this.carregando = false;
                if ( ok ){
                  if ( e.criador[0] == "-" ){
                    this.casa.forEach(ca => {
                      if( ca[e.criador] != null ){
                        e['casa'] = ca[e.criador];
                        if ( e.coin ){
                          t.unshift(e);
                        } else {
                          t.push(e);
                        }
                      }
                    });
                  } else {
                    e['casa'] = {bar: false, cozinha: false, fum: false, estac: false, wifi: false, acess: false};
                    if ( e.coin ){
                      t.unshift(e);
                    } else {
                      t.push(e);
                    }
                  }
                  this.eve = t;
                }
                if ( this.maps == "map" ){
                  this.loadMap();
                }
              });
            });
            if ( h == 0 ){
              this.carregando = false;
            }
          });
        });
      });
    });
  }

  loadMap(){

    this.geolocation.getCurrentPosition().then((position) => {

      this.lat = position.coords.latitude;
      this.lng = position.coords.longitude;

      let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

      let mapOptions = {
        center: latLng,
        zoom: 15,
        disableDefaultUI: true,
        mapTypeControl: false,
        scaleControl: false,
        zoomControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      }

      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

      this.eve.forEach(e => {
        if ( e.criador[0] == "-" ){
          this.casa.forEach(ca => {
            if( ca[e.criador] != null ){
              e['casa'] = ca[e.criador];
            }
          });
        } else {
          e['casa'] = {bar: false, cozinha: false, fum: false, estac: false, wifi: false, acess: false};
        }

        let iconS = {
          url: 'assets/ic_pin_n.png',
          size: new google.maps.Size(36, 36)
        };
        let iconL = {
          url: 'assets/ic_pin_g.png',
          size: new google.maps.Size(48, 48)
        };
        let marker = new google.maps.Marker({
          map: this.map,
          animation: google.maps.Animation.DROP,
          position: new google.maps.LatLng(e.lat, e.lng),
          icon: (e.coin?iconL:iconS)
        });

        let content = '<div class="card-background-page-map" id="'+e.$key+'">'+
                        '<div style="background-image:url('+e.img+')" class="card">'+
                          '<div class="fundo_card">';
                if ( e.coin ){
                  content += '<div class="amigos_list"><img src="assets/selo.png"></div>';
                }
                  content += '<div class="info_list">'+
                                '<div class="icon_list"><ion-icon class="icon-coin"></ion-icon><div>'+(e.faixa_ini==0?'Gratuito':'R$'+e.faixa_ini)+''+(e.faixa_fim==0?'':(e.faixa_fim!=e.faixa_ini?' - R$'+e.faixa_fim:''))+'</div></div>';
                if ( e.criador[0] == '-' ){
                  content += '<div class="icon_list">'+
                                  (e.casa.bar?'<ion-icon class="icon-bar"></ion-icon>':'')+
                                  (e.casa.cozinha?'<ion-icon class="icon-comida"></ion-icon>':'')+
                                  (e.casa.wifi?'<ion-icon class="icon-wifi"></ion-icon>':'')+
                                  (e.casa.fum?'<ion-icon class="icon-fumante"></ion-icon>':'')+
                                  (e.casa.estac?'<ion-icon class="icon-estacionamento"></ion-icon>':'')+
                                  (e.casa.acess?'<ion-icon class="icon-acessibilidade"></ion-icon>':'')+
                                '</div>'+
                                '<div class="icon_list">'+
                                  (e.coin?'<ion-icon class="icon-vous"></ion-icon>':'')+
                                  (e.casa.dinheiro?'<ion-icon class="icon-dinheiro"></ion-icon>':'')+
                                  (e.casa.cartao?'<ion-icon class="icon-cartao"></ion-icon>':'')+
                                '</div>';
                }
                content += '</div>'+
                             '<div class="bottom_list">'+
                               '<div style="display:table-cell;vertical-align:bottom;width:50px;">'+
                                 '<div class="top"><div class="block"></div><div class="block"></div></div>'+
                                 '<div class="date_list">'+
                                   '<div class="mes_list">'+e.mes+'</div>'+
                                   '<div class="dia_list">'+('0'+e.dia).slice(-2)+'</div>'+
                                   '<div class="hr_list">'+e.hr_ini+'</div>'+
                                 '</div>'+
                               '</div>'+
                               '<div class="present_list">'+
                                 '<div class="name_event">'+e.nome+'</div>'+
                                 '<div class="name_create" id="c">'+e.nomeCriador+'</div>'+
                                 '<div class="name_locale" id="l">'+e.cidade+'</div>'+
                               '</div>'+
                             '</div>'+
                          '</div>'+
                        '</div>'+
                      '</div>';

        let infoWindow = new google.maps.InfoWindow({
          content: content,
        });

        google.maps.event.addListener(infoWindow, 'domready', () => {
          let gw = document.getElementsByClassName('gm-style-iw');
          for ( let i=0; i<gw.length; i++ ){
            gw[i].parentElement.setAttribute('class','prim');
            let lp = gw[i].parentElement.style.left;
            let lpi = parseInt(lp.substr(0,lp.length-2));
            gw[i].parentElement.style.left = lpi + 26 +'px';

            let ls = gw[i].parentElement.getElementsByTagName('div')[0].getElementsByTagName('div')[0].style.left;
            let lsi = parseInt(ls.substr(0,ls.length-2));
            gw[i].parentElement.getElementsByTagName('div')[0].getElementsByTagName('div')[0].style.left = lsi - 26 +'px';

            let lt = gw[i].parentElement.getElementsByTagName('div')[0].getElementsByTagName('div')[3].style.left;
            let lti = parseInt(lt.substr(0,lt.length-2));
            gw[i].parentElement.getElementsByTagName('div')[0].getElementsByTagName('div')[3].style.left = lti - 26 +'px';

            let lq = gw[i].parentElement.getElementsByTagName('div')[0].getElementsByTagName('div')[5].style.left;
            let lqi = parseInt(lq.substr(0,lq.length-2));
            gw[i].parentElement.getElementsByTagName('div')[0].getElementsByTagName('div')[5].style.left = lqi - 26 +'px';

            gw[i].parentElement.getElementsByTagName('div')[0].getElementsByTagName('div')[1].setAttribute('class','prim');
            gw[i].parentElement.getElementsByTagName('div')[0].getElementsByTagName('div')[7].setAttribute('class','prim');
          }

          if ( this.click[e.$key] == undefined ){
            document.getElementById(e.$key).addEventListener('click', () => {
              this.closeLastInfo();
              this.openEvent(e.$key);
              this.lastOpenedInfoWindow = null;
            });
            this.click[e.$key] = true;
          }
        });

        google.maps.event.addListener(marker, 'click', () => {
          this.closeLastInfo();
          infoWindow.open(this.map, marker);
          this.lastOpenedInfoWindow = infoWindow;
        });
      });

    }, (err) => {
      console.log(err);
    });

  }

  closeLastInfo(){
    if (this.lastOpenedInfoWindow) {
      this.lastOpenedInfoWindow.close();
    }
  }

  openEvent(id){
    if ( this.authentic ){
      this.navCtrl.push(EventDetailPage, {id: id});
    } else {
      let alert = this.alertCtrl.create({
        title: "Você precisa estar logado!",
        message: "Faça seu cadastro ou login para poder acessar mais informações dos eventos.",
        buttons: [{
          text: "Ok",
          role: 'cancel'
        }]
      });
      alert.present();
    }
  }

  openNewEvent(){
    if ( this.authentic ){
      this.navCtrl.push(CriarEventoPage, null);
    } else {
      let alert = this.alertCtrl.create({
        title: "Você precisa estar logado!",
        message: "Faça seu cadastro ou login para poder criar seus próprios eventos.",
        buttons: [{
          text: "Ok",
          role: 'cancel'
        }]
      });
      alert.present();
    }
  }

}
