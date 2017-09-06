import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, Platform, AlertController, LoadingController, Loading } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { CriarEventoPage } from '../criar-evento/criar-evento';
import { EventDetailPage } from '../event-detail/event-detail';
import { IndicacaoPage } from '../indicacao/indicacao';
import { AngularFireAuth } from 'angularfire2/auth';
import { EventoProvider } from '../../providers/evento/evento';
import { ErrorProvider } from '../../providers/error/error';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Storage } from '@ionic/storage';
import { Events } from 'ionic-angular';
import { ContaProvider } from '../../providers/conta/conta';
import firebase from 'firebase';

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
  cidade;

  cidades: FirebaseListObservable<any>;
  showCity = false;

  dataQRC;
  eventoConf: FirebaseListObservable<any>;
  userConf: FirebaseListObservable<any>;
  e = [];
  loading: Loading;
  id;
  confirm;
  ischeck = false;

  constructor(
    platform: Platform,
    public filtro: Events,
    public db: AngularFireDatabase,
    private storage: Storage,
    public navCtrl: NavController,
    afAuth: AngularFireAuth,
    public geolocation: Geolocation,
    public evento: EventoProvider,
    public alertCtrl: AlertController,
    public err: ErrorProvider,
    public contaData: ContaProvider,
    private barcodeScanner: BarcodeScanner,
    public loadingCtrl: LoadingController
  ) {
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
    this.cidades = db.list('/cidades');
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
      if ( val == null ){
        this.stCity = "Jaraguá do Sul";
        this.cidade = "Jaraguá do Sul";
      } else {
        this.stCity = val;
        this.cidade = val;
      }
      this.cidades.forEach(cid => {
        let j = 0;
        cid.forEach(ci => {
          if ( ci.nome != this.cidade ){
            j++;
          }
        });
        if ( cid.length == j ){
          this.showCity = true;
        }
      });
      this.storage.get('dt_filtro').then((val) => {
        this.stDtini = val;
        let date = new Date(val);
        let lastDay = new Date(date.getFullYear(), date.getMonth()+1, 0).getDate();
        if ( this.plat.is('android') ){
          date.setDate(new Date(this.stDtini).getDate());
        } else {
          date.setDate(date.getDate()+1);
        }
        if ( lastDay == date.getDate() ){
          date.setMonth(new Date(this.stDtini).getMonth());
        }
        date.setHours(20);
        date.setMinutes(59);
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
                if ( parseInt(""+this.stFaixa.upper) == 200 && e.faixa_ini >= parseInt(""+this.stFaixa.lower) ){
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
                } else if ( e.faixa_ini >= parseInt(""+this.stFaixa.lower) && e.faixa_fim <= parseInt(""+this.stFaixa.upper) ){
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
                  let casa = this.db.list('/casas/'+e.criador);
                  casa.forEach(cas => {
                    e['casa'] = [];
                    cas.forEach(ca => {
                      e['casa'][ca.$key] = ca.$value;
                    })
                  });
                  if ( e.coin ){
                    t.unshift(e);
                  } else {
                    t.push(e);
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

    this.geolocation.getCurrentPosition({enableHighAccuracy: true}).then((position) => {

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
        let casa = this.db.list('/casas/'+e.criador);
        casa.forEach(cas => {
          e['casa'] = [];
          cas.forEach(ca => {
            e['casa'][ca.$key] = ca.$value;
          })
        });

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
                          '<div class="fundo_card ';
                if ( e.coin ){
                  content += 'coin"><div class="amigos_list"><img src="assets/selo.png"></div>';
                } else {
                  content += '">';
                }
                  content += '<div class="info_list">'+
                                '<div class="icon_list"><ion-icon class="icon-coin"></ion-icon><div>'+(e.faixa_ini==0?'Gratuito':'R$'+e.faixa_ini)+''+(e.faixa_fim==0?'':(e.faixa_fim!=e.faixa_ini?' - R$'+e.faixa_fim:''))+'</div></div>';
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
      this.navCtrl.push(EventDetailPage, {id: this.stCity+'/'+id});
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

  indicar(){
    this.navCtrl.push(IndicacaoPage,{city: this.cidade});
  }

  readQRC(){
    this.e = [];
    this.id = null;
    this.confirm = null;
    this.ischeck = false;
    let options = {
      showTorchButton : true,
      prompt : "Posicione o QRCode na área marcada.",
    }
    this.barcodeScanner.scan(options).then((barcodeData) => {
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
            this.id = evento[i].evento;
          }
        }
        this.eventoConf = this.db.list('/evento/'+this.id+'/confirmados/');
        this.userConf = this.db.list('/usuario/'+firebase.auth().currentUser.uid+'/confirmados/');
        this.checkConf();
        let eve = this.db.list('evento/'+this.id);
        eve.forEach(even => {
          even.forEach(ev => {
            this.e[ev.$key] = ev.$value;
          });
        });
        this.check();
      });
    }, (err) => {
      alert("Error occured : " + err);
    });
  }

  conf(){
    if ( this.confirm ){
      let ekey;
      let ukey;
      this.eventoConf.forEach(eve => {
        eve.forEach(c => {
          if ( c.uid == firebase.auth().currentUser.uid ){
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
      let tzoffset = (new Date()).getTimezoneOffset() * 60000;
      this.eventoConf.push({uid: firebase.auth().currentUser.uid, check: false, date: new Date(Date.now() - tzoffset).toISOString().slice(0,-1)});
      this.userConf.push({event: this.id, check: false, criador: this.e['criador'], date: new Date(Date.now() - tzoffset).toISOString().slice(0,-1)});
      this.confirm = true;
    }
  }

  checkConf(){
    this.eventoConf.forEach(eve => {
      eve.forEach(c => {
        if ( c.uid == firebase.auth().currentUser.uid ){
          this.ischeck = c.check;
          this.confirm = true;
        }
      });
    });
  }

  check(){
    if ( !this.ischeck ){
      this.loading = this.loadingCtrl.create({
        content: "Realizando check-in. Aguarde...",
        dismissOnPageChange: true,
      });
      this.loading.present();
      this.geolocation.getCurrentPosition({enableHighAccuracy: true}).then((position) => {
        let latitude = position.coords.latitude;
        let longitude = position.coords.longitude;
        let lat = this.e['lat'];
        let lng = this.e['lng'];

        if ( (latitude*-1) <= ((lat*-1)+0.0003) && (latitude*-1) >= ((lat*-1)-0.0003) && (longitude*-1) <= ((lng*-1)+0.0003) && (longitude*-1) >= ((lng*-1)-0.0003) ){
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
            let tzoffset = (new Date()).getTimezoneOffset() * 60000;
            let datenow = new Date(Date.now() - tzoffset).toISOString().slice(0,-1);
            if ( datenow >= d.toISOString().slice(0,-1) ){
              this.loading.dismiss();
              if ( !this.confirm ){
                this.conf();
              }
              this.confirmCheck();
            } else {
              this.loading.dismiss();
              let al = this.alertCtrl.create({
                title: 'Você já realizou um check-in antes!',
                subTitle: 'Você já fez outro check-in nas últimas 12 horas.',
                buttons: ['OK']
              });
              al.present();
            }
          } else {
            this.loading.dismiss();
            if ( !this.confirm ){
              this.conf();
            }
            this.confirmCheck();
          }
        } else {
          this.loading.dismiss();
          let al = this.alertCtrl.create({
            title: 'Você está muito longe!',
            subTitle: 'Você não está próximo o suficiente do evento para fazer o check-in.',
            buttons: ['OK']
          });
          al.present();
        }
      }, (err) => {
        this.loading.dismiss();
        console.log(err);
      });
    } else {
      let al = this.alertCtrl.create({
        title: 'Check-in já realizado!',
        subTitle: 'Você já fez check-in neste evento.',
        buttons: ['OK']
      });
      al.present();
    }
  }

  confirmCheck(){
    let ekey;
    let ukey;
    this.eventoConf.forEach(eve => {
      eve.forEach(c => {
        if ( c.uid == firebase.auth().currentUser.uid ){
          ekey = c.$key;
        }
      });
    });
    this.eventoConf.update(ekey,{check: true, mode: 'qrcode'});
    this.userConf.forEach(eve => {
      eve.forEach(c => {
        if ( c.event == this.id ){
          ukey = c.$key;
        }
      });
    });
    this.userConf.update(ukey,{check: true, mode: 'qrcode'});
    if ( this.e['coin'] ){
      let cont = 0;
      this.userConf.forEach(us => {
        us.forEach(u => {
          if ( u.criador == this.e['criador'] && u.check ){
            cont++;
          }
        })
      });
      let valor = 0;
      cont -= 1;
      if ( cont == 0 || cont % 10 == 5 ){
        valor = 50;
      } else if ( cont % 10 == 0 ){
        valor = 100;
      } else {
        valor = 30;
      }
      let tzoffset = (new Date()).getTimezoneOffset() * 60000;
      let index = this.e['criador'].indexOf('/');
      this.e['criador'] = this.e['criador'].slice(index+1,this.e['criador'].length);
      this.contaData.cadTransacao(firebase.auth().currentUser.uid, "Check-in no evento \""+this.e['nome']+"\". "+(cont+1)+"ª vez neste estabelecimento.", valor, 'Entrada', new Date(Date.now() - tzoffset).toISOString().slice(0,-1), 'entrada','+');
      this.contaData.getSaldo(firebase.auth().currentUser.uid).then(s => {
        this.contaData.altSaldo(1, s[0].id, s[0].saldo, valor, firebase.auth().currentUser.uid);
        this.contaData.cadTransacao(this.e['criador'], "Check-in no seu evento \""+this.e['nome']+"\".", valor, 'Saída', new Date(Date.now() - tzoffset).toISOString().slice(0,-1), 'saida','-');
        this.contaData.getSaldo(this.e['criador']).then(s => {
          this.contaData.altSaldo(0, s[0].id, s[0].saldo, valor, this.e['criador']);
        });
      });
    }
    this.loading.dismiss();
    let al = this.alertCtrl.create({
      title: 'Check-in realizado com sucesso!',
      subTitle: 'O check-in neste evento foi realizado com sucesso, agora vamos nos divertir.',
      buttons: ['OK']
    });
    al.present();
  }

}
