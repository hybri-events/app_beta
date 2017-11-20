import { Component, ViewChild, ElementRef } from '@angular/core';
import { Platform, NavController, NavParams, Navbar, Content, AlertController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { StatusBar } from '@ionic-native/status-bar';
import { Chart } from 'chart.js';
import { Slides } from 'ionic-angular';
import firebase from 'firebase';
import { EventDetailPage } from '../event-detail/event-detail';
import { EditCasaPage } from '../edit-casa/edit-casa';

declare var google;

@Component({
  selector: 'page-perfil-estab',
  templateUrl: 'perfil-estab.html',
})
export class PerfilEstabPage {
  keyCasa;
  casa: FirebaseListObservable<any>;
  details = [];
  tab = "comentarios";

  @ViewChild(Navbar) navBar: Navbar;
  @ViewChild('map') mapElement: ElementRef;
  @ViewChild(Content) content:Content;
  @ViewChild('canvas') canvas;
  @ViewChild('avaliacoes') canvasAva;

  map: any;
  chart: any;

  checkins = [0,0,0,0,0,0,0];
  eAnteriores = [];

  desc: string = "";
  lineHeight: any = 34;
  txtArea: any;
  @ViewChild('ionTxtArea') ionTxtArea;

  @ViewChild(Slides) slides: Slides;

  txtBtnAva = "Enviar";
  lock = true;
  stars = 0;
  nivel = ['','Não volto mais!','Poderia ser melhor!','Curti!','Já considero pakas!','Simplesmente F#d@!'];
  avaliado = false;
  reava = false;
  idava;
  avaOther = false;
  slide = 0;
  starsOther = [];
  numava = 0;
  somaava = 0;
  mediaava = 0;
  avaliacoes = [0,0,0,0,0];
  showMedia;
  numdeta = [0,0,0,0,0];
  somadeta = [0,0,0,0,0];
  mediadeta = [0,0,0,0,0];

  comentarios = [];

  nome;
  foto;

  eventNext = [];
  nLoadNext = 0;
  eventPrev = [];
  nLoadPrev = 0;
  currentDate;

  tzoffset;
  currentScroll = 0;

  myEstab = false;

  constructor(
    public navCtrl: NavController,
    public platform: Platform,
    public navParams: NavParams,
    public db: AngularFireDatabase,
    private statusBar: StatusBar,
    public alertCtrl: AlertController,
    private storage: Storage
  ) {
    let val = this.navParams.data.id;
    this.storage.get('casa').then((value) => {
      if ( val == value ){
        this.myEstab = true;
      }
    });
    this.keyCasa = val;
    this.casa = this.db.list("casas/"+val);
    this.casa.forEach(cas => {
      for ( let i=0;i<cas.length;i++ ){
        if ( cas[i].$key == 'dias' || cas[i].$key == 'eventos' || cas[i].$key == 'faixa' || cas[i].$key == 'hora' || cas[i].$key == 'tags' ){
          this.details[cas[i].$key] = cas[i];
        } else {
          this.details[cas[i].$key] = cas[i].$value;
        }
      }
      this.tzoffset = (new Date()).getTimezoneOffset() * 60000;
      let d1 = new Date(Date.now() - this.tzoffset);
      let d2 = new Date(Date.now() - this.tzoffset);
      d2.setDate(0);
      d2.setHours(20);
      d2.setMinutes(59);
      d1.setDate(0);
      d1.setHours(21);
      d1.setMinutes(0);
      d1.setMonth(d2.getMonth()-1);
      console.log(d1.toISOString())
      console.log(d2.toISOString())
      let eventos = this.db.list("casas/"+val+"/eventos/",{
        query: {
          orderByChild: 'dt',
          startAt: d1.toISOString(),
          endAt: d2.toISOString()
        }
      });
      eventos.forEach(evento => {
        this.checkins = [0,0,0,0,0,0,0];
        for( let j=0;j<evento.length;j++ ){
          let dt = new Date(evento[j].dt);
          let eve = this.db.list("eventos/"+evento[j].id+"/confirmados");
          eve.forEach(e => {
            this.checkins[dt.getDay()] += e.length;
          })
        }
      });
    });
    let ava = this.db.list("avaliacao/"+val);
    ava.forEach(a => {
      this.somaava = 0;
      this.numava = 0;
      this.mediaava = 0;
      this.somadeta = [0,0,0,0,0];
      this.numdeta = [0,0,0,0,0];
      this.mediadeta = [0,0,0,0,0];
      this.avaliacoes = [0,0,0,0,0];
      this.comentarios = [];
      for ( let k=0;k<a.length;k++ ){
        this.avaliacoes[5-a[k].nota] += 1;
        this.somaava += a[k].nota;
        this.numava += 1;
        this.mediaava = this.somaava / this.numava;

        if ( a[k].comentario != "" ){
          let usu = this.db.list("usuario/"+a[k].uid);
          usu.forEach(u => {
            this.comentarios.unshift({
              uid: a[k].uid,
              nome: u[0].nome,
              ft_perfil: u[0].ft_perfil,
              comentario: a[k].comentario
            });
          })
        }

        if ( a[k].uid == firebase.auth().currentUser.uid ){
          this.stars = a[k].nota;
          this.desc = a[k].comentario;
          this.avaliado = true;
          this.idava = a[k].$key;
          if ( a[k].other != {teste:'teste'} && a[k].other != undefined ){
            this.starsOther = a[k].other;
            this.avaOther = true;
          }
        }
        if ( a[k].other != {teste:'teste'} && a[k].other != undefined ){
          if ( a[k].other['amb'] != undefined ){
            this.numdeta[0]++;
            this.somadeta[0] += a[k].other['amb'];
            this.mediadeta[0] = this.somadeta[0] / this.numdeta[0];
          }
          if ( a[k].other['ate'] != undefined ){
            this.numdeta[1]++;
            this.somadeta[1] += a[k].other['ate'];
            this.mediadeta[1] = this.somadeta[1] / this.numdeta[1];
          }
          if ( a[k].other['bar'] != undefined ){
            this.numdeta[2]++;
            this.somadeta[2] += a[k].other['bar'];
            this.mediadeta[2] = this.somadeta[2] / this.numdeta[2];
          }
          if ( a[k].other['coz'] != undefined ){
            this.numdeta[3]++;
            this.somadeta[3] += a[k].other['coz'];
            this.mediadeta[3] = this.somadeta[3] / this.numdeta[3];
          }
          if ( a[k].other['pre'] != undefined ){
            this.numdeta[4]++;
            this.somadeta[4] += a[k].other['pre'];
            this.mediadeta[4] = this.somadeta[4] / this.numdeta[4];
          }
        }
        this.changeTabs();
      }
    });
    this.storage.get('nomeUsu').then((val) => {
      this.nome = val;
      this.storage.get('fotoUsu').then((val) => {
        this.foto = val;
      });
    });
  }

  loadEventsNext(){
    let d = new Date(Date.now() - this.tzoffset);
    this.nLoadNext += 4;
    this.eventNext = [];
    let eventos = this.db.list("casas/"+this.keyCasa+"/eventos/",{
      query: {
        orderByChild: 'dt',
        startAt: d.toISOString(),
        limitToFirst: this.nLoadNext
      }
    });
    eventos.forEach(e => {
      for ( let i=0;i<e.length;i++ ){
        let evento = this.db.list("eventos/"+e[i].id)
        evento.forEach(v => {
          let j = [];
          for ( let k=0;k<v.length;k++ ){
            j[v[k].$key] = v[k].$value;
          }
          j['id'] = e[i].id;
          this.eventNext.push(j);
        });
      }
      this.content.scrollTo(0,this.currentScroll,40);
    })
  }

  loadEventsPrev(){
    let d = new Date(Date.now() - this.tzoffset);
    this.nLoadPrev += 4;
    this.eventPrev = [];
    let eventos = this.db.list("casas/"+this.keyCasa+"/eventos/",{
      query: {
        orderByChild: 'dt',
        endAt: d.toISOString(),
        limitToLast: this.nLoadPrev
      }
    });
    eventos.forEach(e => {
      for ( let i=0;i<e.length;i++ ){
        if ( i >= 4 ){
          setTimeout(() => {
            this.db.list("eventos/"+e[i].id).subscribe(v => {
              let j = [];
              for ( let k=0;k<v.length;k++ ){
                j[v[k].$key] = v[k].$value;
              }
              j['id'] = e[i].id;
              this.eventPrev.unshift(j);
            });
          },500);
        } else {
          this.db.list("eventos/"+e[i].id).subscribe(v => {
            let j = [];
            for ( let k=0;k<v.length;k++ ){
              j[v[k].$key] = v[k].$value;
            }
            j['id'] = e[i].id;
            this.eventPrev.unshift(j);
          });
        }
      }
    })
  }

  openEvent(id){
    this.navCtrl.push(EventDetailPage, {id: id});
  }

  editEstab(){
    this.navCtrl.push(EditCasaPage, {id: this.keyCasa});
  }

  ngAfterViewInit() {
    this.setStarsNota('perfil');
    this.navBar.backButtonClick = (e:UIEvent)=>{
      if ( this.platform.is('ios') ){
        this.statusBar.styleDefault();
      }
      this.navCtrl.pop();
    }
    this.content.ionScroll.subscribe((data) => {
      this.currentScroll = data.scrollTop;
      let h = document.getElementById('tool_estab').offsetHeight;
      if ( data.scrollTop < (document.getElementById('header_af').offsetHeight - h)  ){
        let op = data.scrollTop / (document.getElementById('header_af').offsetHeight - h);
        document.getElementById('title_estab').style.opacity = ''+op;
        document.getElementById('conteudo_af').style.opacity = ''+(1 - op);
        document.getElementById('header_af').style.backgroundImage = 'linear-gradient(rgba(101,44,144,'+(0.2 + (op * 0.7))+'),rgba(101,44,144,'+(0.75 + (op * 0.25))+'))';
        document.getElementById('tabs_estab').style.backgroundImage = 'linear-gradient(rgba(101,44,144,'+(0.75 + (op * 0.25))+'),rgba(101,44,144,1))';
        document.getElementById('tool_estab').style.background = 'transparent';
        document.getElementById('tabs_estab').style.position = 'initial';
        document.getElementById('tabs_estab').style.top = '0px';
        document.getElementById('list').style.marginTop = '10px';
      } else if ( data.scrollTop >= (document.getElementById('header_af').offsetHeight - h) ) {
        document.getElementById('tool_estab').style.background = '#652C90';
        document.getElementById('conteudo_af').style.opacity = '0';
        document.getElementById('header_af').style.backgroundImage = 'linear-gradient(rgba(101,44,144,1),rgba(101,44,144,1))';
        document.getElementById('tabs_estab').style.backgroundImage = 'linear-gradient(rgba(101,44,144,1),rgba(101,44,144,1))';
        document.getElementById('title_estab').style.opacity = '1';
        document.getElementById('tabs_estab').style.position = 'fixed';
        document.getElementById('tabs_estab').style.top = h+'px';
        document.getElementById('list').style.marginTop = (h + 10)+'px';
      }
    });
  }

  onChange(newValue){
    this.txtArea.style.height = this.lineHeight + "px";
    this.txtArea.style.height =  this.txtArea.scrollHeight + "px";
  }

  setStarsNota(classe){
    if ( this.mediaava >= 1 ){
      if ( this.platform.is('ios') ){
        document.getElementById('star_'+classe+'_1').setAttribute('class','icon icon-md ion-ios-icon-star-full');
      } else {
        document.getElementById('star_'+classe+'_1').setAttribute('class','icon icon-md ion-md-icon-star-full');
      }
      document.getElementById('star_'+classe+'_1').setAttribute('name','icon-star-full');
      document.getElementById('star_'+classe+'_1').setAttribute('ng-reflect-name','icon-star-full');
      document.getElementById('star_'+classe+'_1').setAttribute('aria-label','icon-star-full');
    } else if ( this.mediaava >= 0.5 ){
      if ( this.platform.is('ios') ){
        document.getElementById('star_'+classe+'_1').setAttribute('class','icon icon-md ion-ios-icon-star-half');
      } else {
        document.getElementById('star_'+classe+'_1').setAttribute('class','icon icon-md ion-md-icon-star-half');
      }
      document.getElementById('star_'+classe+'_1').setAttribute('name','icon-star-half');
      document.getElementById('star_'+classe+'_1').setAttribute('ng-reflect-name','icon-star-half');
      document.getElementById('star_'+classe+'_1').setAttribute('aria-label','icon-star-half');
    }

    if ( this.mediaava >= 2 ){
      if ( this.platform.is('ios') ){
        document.getElementById('star_'+classe+'_2').setAttribute('class','icon icon-md ion-ios-icon-star-full');
      } else {
        document.getElementById('star_'+classe+'_2').setAttribute('class','icon icon-md ion-md-icon-star-full');
      }
      document.getElementById('star_'+classe+'_2').setAttribute('name','icon-star-full');
      document.getElementById('star_'+classe+'_2').setAttribute('ng-reflect-name','icon-star-full');
      document.getElementById('star_'+classe+'_2').setAttribute('aria-label','icon-star-full');
    } else if ( this.mediaava >= 1.5 ){
      if ( this.platform.is('ios') ){
        document.getElementById('star_'+classe+'_2').setAttribute('class','icon icon-md ion-ios-icon-star-half');
      } else {
        document.getElementById('star_'+classe+'_2').setAttribute('class','icon icon-md ion-md-icon-star-half');
      }
      document.getElementById('star_'+classe+'_2').setAttribute('name','icon-star-half');
      document.getElementById('star_'+classe+'_2').setAttribute('ng-reflect-name','icon-star-half');
      document.getElementById('star_'+classe+'_2').setAttribute('aria-label','icon-star-half');
    }

    if ( this.mediaava >= 3 ){
      if ( this.platform.is('ios') ){
        document.getElementById('star_'+classe+'_3').setAttribute('class','icon icon-md ion-ios-icon-star-full');
      } else {
        document.getElementById('star_'+classe+'_3').setAttribute('class','icon icon-md ion-md-icon-star-full');
      }
      document.getElementById('star_'+classe+'_3').setAttribute('name','icon-star-full');
      document.getElementById('star_'+classe+'_3').setAttribute('ng-reflect-name','icon-star-full');
      document.getElementById('star_'+classe+'_3').setAttribute('aria-label','icon-star-full');
    } else if ( this.mediaava >= 2.5 ){
      if ( this.platform.is('ios') ){
        document.getElementById('star_'+classe+'_3').setAttribute('class','icon icon-md ion-ios-icon-star-half');
      } else {
        document.getElementById('star_'+classe+'_3').setAttribute('class','icon icon-md ion-md-icon-star-half');
      }
      document.getElementById('star_'+classe+'_3').setAttribute('name','icon-star-half');
      document.getElementById('star_'+classe+'_3').setAttribute('ng-reflect-name','icon-star-half');
      document.getElementById('star_'+classe+'_3').setAttribute('aria-label','icon-star-half');
    }

    if ( this.mediaava >= 4 ){
      if ( this.platform.is('ios') ){
        document.getElementById('star_'+classe+'_4').setAttribute('class','icon icon-md ion-ios-icon-star-full');
      } else {
        document.getElementById('star_'+classe+'_4').setAttribute('class','icon icon-md ion-md-icon-star-full');
      }
      document.getElementById('star_'+classe+'_4').setAttribute('name','icon-star-full');
      document.getElementById('star_'+classe+'_4').setAttribute('ng-reflect-name','icon-star-full');
      document.getElementById('star_'+classe+'_4').setAttribute('aria-label','icon-star-full');
    } else if ( this.mediaava >= 3.5 ){
      if ( this.platform.is('ios') ){
        document.getElementById('star_'+classe+'_4').setAttribute('class','icon icon-md ion-ios-icon-star-half');
      } else {
        document.getElementById('star_'+classe+'_4').setAttribute('class','icon icon-md ion-md-icon-star-half');
      }
      document.getElementById('star_'+classe+'_4').setAttribute('name','icon-star-half');
      document.getElementById('star_'+classe+'_4').setAttribute('ng-reflect-name','icon-star-half');
      document.getElementById('star_'+classe+'_4').setAttribute('aria-label','icon-star-half');
    }

    if ( this.mediaava == 5 ){
      if ( this.platform.is('ios') ){
        document.getElementById('star_'+classe+'_5').setAttribute('class','icon icon-md ion-ios-icon-star-full');
      } else {
        document.getElementById('star_'+classe+'_5').setAttribute('class','icon icon-md ion-md-icon-star-full');
      }
      document.getElementById('star_'+classe+'_5').setAttribute('name','icon-star-full');
      document.getElementById('star_'+classe+'_5').setAttribute('ng-reflect-name','icon-star-full');
      document.getElementById('star_'+classe+'_5').setAttribute('aria-label','icon-star-full');
    } else if ( this.mediaava >= 4.5 ){
      if ( this.platform.is('ios') ){
        document.getElementById('star_'+classe+'_5').setAttribute('class','icon icon-md ion-ios-icon-star-half');
      } else {
        document.getElementById('star_'+classe+'_5').setAttribute('class','icon icon-md ion-md-icon-star-half');
      }
      document.getElementById('star_'+classe+'_5').setAttribute('name','icon-star-half');
      document.getElementById('star_'+classe+'_5').setAttribute('ng-reflect-name','icon-star-half');
      document.getElementById('star_'+classe+'_5').setAttribute('aria-label','icon-star-half');
    }
    this.showMedia = this.mediaava.toFixed(1);
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
    new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: new google.maps.LatLng(lat, lng),
      icon: iconS
    });
  }

  parseInt(valor){
    return parseInt(valor);
  }

  changeTabs(){
    if ( this.tab == "sobre" ){
      setTimeout(() => {
        this.loadMap(this.details['lat'], this.details['lng']);
        this.createChart(this.checkins);
      },500);
    } else if ( this.tab == "comentarios" ){
      setTimeout(() => {
        this.setStars(this.stars);
        this.setStarsNota('grafico');
        if ( this.numava > 0 ){
            this.createChartAvaliacoes();
        }
        if ( !this.details['cozinha'] || !this.details['bar'] ){
          let de = document.getElementsByClassName("detalhe");
          for ( let i=0;i<de.length;i++ ){
            de[i]['style'].marginLeft = "16px";
            de[i]['style'].marginRight = "16px";
          }
        }
        if ( !this.avaliado ){
          this.slides.lockSwipes(true);
          this.txtArea = this.ionTxtArea._elementRef.nativeElement.children[0];
          this.txtArea.style.height = this.lineHeight + "px";
        } else if ( this.starsOther['amb'] != undefined ){
          this.slides.lockSwipes(false);
          this.lock = false;
          document.getElementsByClassName('swiper-pagination')[0]['style'].display = "block";
          this.setStarsOther('amb',this.starsOther['amb']);
          this.setStarsOther('ate',this.starsOther['ate']);
          this.setStarsOther('pre',this.starsOther['pre']);
          if ( this.starsOther['bar'] != null ){
              this.setStarsOther('bar',this.starsOther['bar']);
          }
          if ( this.starsOther['coz'] != null ){
              this.setStarsOther('coz',this.starsOther['coz']);
          }
        } else {
          this.slides.lockSwipes(true);
        }
      },200);
    } else if ( this.tab == "eventos" ){
      this.nLoadNext = 0;
      this.nLoadPrev = 0;
      this.loadEventsNext();
      this.loadEventsPrev();
    }
  }

  sendAva(){
    if ( this.txtBtnAva == "Enviar" ){
      this.slides.lockSwipes(false);
      this.lock = false;
      this.slides.slideNext();
      this.slide = this.slides.getActiveIndex();
      this.txtBtnAva = "Concluir";
      document.getElementsByClassName('swiper-pagination')[0]['style'].display = "block";
    } else if ( this.txtBtnAva == "Concluir" ){
      if ( !this.avaOther ){
        let alert = this.alertCtrl.create({
          title: 'Continue sua avaliação!',
          subTitle: 'Deseja fazer uma avaliação mais detalhada do local?',
          buttons: [{text: 'Não', handler: () => {
            let comentarios = this.db.list('avaliacao/'+this.keyCasa);
            if ( this.reava ){
              comentarios.update(this.idava,{nota: this.stars, comentario: this.desc, uid: firebase.auth().currentUser.uid, dt: new Date(Date.now() - this.tzoffset).toISOString().slice(0,-1), other: {'teste': 'teste'}});
            } else {
              comentarios.push({nota: this.stars, comentario: this.desc, uid: firebase.auth().currentUser.uid, dt: new Date(Date.now() - this.tzoffset).toISOString().slice(0,-1), other: {'teste': 'teste'}});
            }
            this.slides.slideTo(0);
            this.changeTabs();
            let al = this.alertCtrl.create({
              title: 'Obrigado pela sua avaliação!',
              subTitle: '',
              buttons: ['OK']
            });
            al.present();
          }},{text: 'Sim', handler: () => {
            this.avaOther = true;
            setTimeout(() => {
              this.slides.slideNext();
              this.slide = this.slides.getActiveIndex();
            }, 100);
          }}]
        });
        alert.present();
      } else {
        let comentarios = this.db.list('avaliacao/'+this.keyCasa);
        if ( this.reava ){
          console.log(this.starsOther);
          comentarios.update(this.idava,{nota: this.stars, comentario: this.desc, uid: firebase.auth().currentUser.uid, dt: new Date(Date.now() - this.tzoffset).toISOString().slice(0,-1), other: this.starsOther});
        } else {
          comentarios.push({nota: this.stars, comentario: this.desc, uid: firebase.auth().currentUser.uid, dt: new Date(Date.now() - this.tzoffset).toISOString().slice(0,-1), other: this.starsOther});
        }
        this.avaOther = false;
        this.slides.slideTo(0);
        this.changeTabs();
        let al = this.alertCtrl.create({
          title: 'Obrigado pela sua avaliação!',
          subTitle: '',
          buttons: ['OK']
        });
        al.present();
      }
    } else if ( this.txtBtnAva == "Próximo" ){
      this.slides.slideNext();
      this.slide = this.slides.getActiveIndex();
      this.txtBtnAva = "Concluir";
    }
  }

  reAva(){
    this.txtBtnAva = "Enviar";
    this.avaliado = false;
    this.reava = true;
    this.avaOther = false;
    this.stars = 0;
    this.setStars(0);
    setTimeout(() => {
      this.txtArea = this.ionTxtArea._elementRef.nativeElement.children[0];
      this.txtArea.style.height = this.lineHeight + "px";
    },200);
  }

  swipeLeft(){
    setTimeout(() => {
      this.slide = this.slides.getActiveIndex();
      if ( !this.lock && ((this.slide == 1 && !this.avaOther) || (this.slide == 2 && this.avaOther)) ){
        this.txtBtnAva = "Concluir";
      } else if ( !this.lock && this.slide == 1 && this.avaOther ) {
        this.txtBtnAva = "Próximo";
      }
    },100);
  }

  swipeRight(){
    setTimeout(() => {
      this.slide = this.slides.getActiveIndex();
      if ( !this.lock && this.slide == 0 ){
        this.txtBtnAva = "Enviar";
      } else if ( !this.lock && this.slide == 1 && this.avaOther ) {
        this.txtBtnAva = "Próximo";
      }
    },100);
  }

  setStars(n){
    this.stars = n;
    for ( let i=1;i<=5;i++ ){
      if ( this.platform.is('ios') ){
        document.getElementById('star'+i).setAttribute('class','icon icon-md ion-ios-icon-star-void');
      } else {
        document.getElementById('star'+i).setAttribute('class','icon icon-md ion-md-icon-star-void');
      }
      document.getElementById('star'+i).setAttribute('name','icon-star-void');
      document.getElementById('star'+i).setAttribute('ng-reflect-name','icon-star-void');
      document.getElementById('star'+i).setAttribute('aria-label','icon-star-void');
    }
    for ( let i=1;i<=n;i++ ){
      if ( this.platform.is('ios') ){
        document.getElementById('star'+i).setAttribute('class','icon icon-md ion-ios-icon-star-full');
      } else {
        document.getElementById('star'+i).setAttribute('class','icon icon-md ion-md-icon-star-full');
      }
      document.getElementById('star'+i).setAttribute('name','icon-star-full');
      document.getElementById('star'+i).setAttribute('ng-reflect-name','icon-star-full');
      document.getElementById('star'+i).setAttribute('aria-label','icon-star-full');
    }
  }

  setStarsOther(t,n){
    this.starsOther[t] = n;
    for ( let i=1;i<=5;i++ ){
      if ( this.platform.is('ios') ){
        document.getElementById('star_'+t+'_'+i).setAttribute('class','icon icon-md ion-ios-icon-star-void');
      } else {
        document.getElementById('star_'+t+'_'+i).setAttribute('class','icon icon-md ion-md-icon-star-void');
      }
      document.getElementById('star_'+t+'_'+i).setAttribute('name','icon-star-void');
      document.getElementById('star_'+t+'_'+i).setAttribute('ng-reflect-name','icon-star-void');
      document.getElementById('star_'+t+'_'+i).setAttribute('aria-label','icon-star-void');
    }
    for ( let i=1;i<=n;i++ ){
      if ( this.platform.is('ios') ){
        document.getElementById('star_'+t+'_'+i).setAttribute('class','icon icon-md ion-ios-icon-star-full');
      } else {
        document.getElementById('star_'+t+'_'+i).setAttribute('class','icon icon-md ion-md-icon-star-full');
      }
      document.getElementById('star_'+t+'_'+i).setAttribute('name','icon-star-full');
      document.getElementById('star_'+t+'_'+i).setAttribute('ng-reflect-name','icon-star-full');
      document.getElementById('star_'+t+'_'+i).setAttribute('aria-label','icon-star-full');
    }
  }

  createChart(values){
    this.chart = new Chart(this.canvas.nativeElement, {
      type: 'bar',
      data: {
        labels: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
        datasets: [{
          label: 'Semana anterior',
          data: values,
          backgroundColor: [
            'rgba(101, 44, 144, 1)',
            'rgba(101, 44, 144, 1)',
            'rgba(101, 44, 144, 1)',
            'rgba(101, 44, 144, 1)',
            'rgba(101, 44, 144, 1)',
            'rgba(101, 44, 144, 1)',
            'rgba(101, 44, 144, 1)'
          ],
          borderColor: [
            'rgba(101, 44, 144, 1)',
            'rgba(101, 44, 144, 1)',
            'rgba(101, 44, 144, 1)',
            'rgba(101, 44, 144, 1)',
            'rgba(101, 44, 144, 1)',
            'rgba(101, 44, 144, 1)',
            'rgba(101, 44, 144, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        legend: {
            display: false
        },
        tooltips: {
          enabled: false
        },
        scales: {
          yAxes: [{
            gridLines: {
              display:false
            },
            ticks: {
              display: false
            }
          }],
          xAxes: [{
            gridLines: {
              display:false
            }
          }]
        }
      }
    });
  }

  createChartAvaliacoes(){
    let max = 0;
    for ( let i=0;i<5;i++ ){
      if ( max < this.avaliacoes[i] ){
        max = this.avaliacoes[i];
      }
    }
    this.chart = new Chart(this.canvasAva.nativeElement, {
      type: 'horizontalBar',
      data: {
        labels: ["5", "4", "3", "2", "1"],
        datasets: [{
          label: 'Avaliações',
          data: this.avaliacoes,
          backgroundColor: [
            'rgba(101, 44, 144, 1)',
            'rgba(101, 44, 144, 0.8)',
            'rgba(101, 44, 144, 0.6)',
            'rgba(101, 44, 144, 0.4)',
            'rgba(101, 44, 144, 0.2)'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        hover: {
          animationDuration: 0
        },
        animation: {
          duration: 1,
          onComplete: function() {
            var chartInstance = this.chart;
            var ctx = chartInstance.ctx;

            ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.textColor = '#652C90';

            this.data.datasets.forEach((dataset, i) => {
              var meta = chartInstance.controller.getDatasetMeta(i);
              meta.data.forEach((bar, index) => {
                var data = dataset.data[index];
                if ( data > 0 ){
                  ctx.fillText(data, bar._model.x + 15, bar._model.y + 7);
                }
              });
            });
          }
        },
        legend: {
          display: false
        },
        tooltips: {
          enabled: false
        },
        scales: {
          xAxes: [{
            display: false,
            gridLines: {
              display: false
            },
            ticks: {
              max: max + (max / 3),
              display: false,
              beginAtZero: true
            }
          }],
          yAxes: [{
            gridLines: {
              display: false
            },
            ticks: {
              beginAtZero: true,
              callback: (value, index, values) => {
                return value + "⭐";
              }
            }
          }]
        }
      }
    });
  }

  startExternalMap() {
    this.platform.ready().then(() => {
      if (this.platform.is('ios')) {
        window.open('maps://?q=' + this.details['nome'] + '&saddr=' + this.details['lat'] + ',' + this.details['lng'] + '&daddr=' + this.details['lat'] + ',' + this.details['lng'], '_system');
      }
      if (this.platform.is('android')) {
        window.open('geo://' + this.details['lat'] + ',' + this.details['lng'] + '?q=' + this.details['lat'] + ',' + this.details['lng'] + '(' + this.details['nome'] + ')', '_system');
      }
    });
  }

  clickDesc(){
    let h2 = document.getElementById('header_af').offsetHeight;

    this.content.scrollTo(0,h2,500);
  }

}
