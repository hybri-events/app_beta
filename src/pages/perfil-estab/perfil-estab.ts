import { Component, ViewChild, ElementRef } from '@angular/core';
import { Platform, NavController, NavParams, Navbar, Content } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { StatusBar } from '@ionic-native/status-bar';
import { Chart } from 'chart.js';
import { Slides } from 'ionic-angular';
import firebase from 'firebase';

declare var google;

@Component({
  selector: 'page-perfil-estab',
  templateUrl: 'perfil-estab.html',
})
export class PerfilEstabPage {
  keyCasa;
  casa: FirebaseListObservable<any>;
  details = [];
  tab = "eventos";

  @ViewChild(Navbar) navBar: Navbar;
  @ViewChild('map') mapElement: ElementRef;
  @ViewChild(Content) content:Content;
  @ViewChild('canvas') canvas;

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
  nivel = ['','Ruim','Regular','Bom','Muito bom','Ótimo'];
  avaliado = false;

  tzoffset;

  constructor(
    public navCtrl: NavController,
    public platform: Platform,
    public navParams: NavParams,
    public db: AngularFireDatabase,
    private statusBar: StatusBar,
    private storage: Storage
  ) {
    this.storage.get('casa').then((val) => {
      val = "GOKbBVIM5RdJjiKyY6CAygholUu1/-KszQ2CkxyWvAJ9I5P2f";
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
        d1.setMonth(d1.getMonth()-1);
        d1.setDate(0);
        d1.setHours(21);
        d1.setMinutes(0);
        let d2 = new Date(Date.now() - this.tzoffset);
        d2.setDate(0);
        d2.setHours(20);
        d2.setMinutes(59);
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
      let h = document.getElementById('tool').offsetHeight;
      if ( data.scrollTop < (document.getElementById('fundo').offsetHeight - h)  ){
        document.getElementById('fundo').style.opacity = ''+(1 - (data.scrollTop / (document.getElementById('fundo').offsetHeight - h)));
        document.getElementById('title').style.opacity = ''+(data.scrollTop / (document.getElementById('fundo').offsetHeight - h));
        document.getElementById('tool').style.background = 'transparent';
        document.getElementById('tabs').style.position = 'initial';
        document.getElementById('tabs').style.top = '0px';
        document.getElementById('list').style.marginTop = '10px';
      } else if ( data.scrollTop >= (document.getElementById('fundo').offsetHeight - h) ) {
        document.getElementById('tool').style.background = '#652C90';
        document.getElementById('fundo').style.opacity = '1';
        document.getElementById('title').style.opacity = '1';
        document.getElementById('tabs').style.position = 'fixed';
        document.getElementById('tabs').style.top = h+'px';
        document.getElementById('list').style.marginTop = (h + 10)+'px';
      }
    });
  }

  onChange(newValue){
    this.txtArea.style.height = this.lineHeight + "px";
    this.txtArea.style.height =  this.txtArea.scrollHeight + "px";
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

  changeTabs(){
    if ( this.tab == "sobre" ){
      setTimeout(() => {
        this.loadMap(this.details['lat'], this.details['lng']);
        this.createChart(this.checkins);
      },500);
    } else if ( this.tab == "comentarios" ){
      setTimeout(() => {
        this.setStars(this.stars);
        this.slides.lockSwipes(true);
        this.txtArea = this.ionTxtArea._elementRef.nativeElement.children[0];
        this.txtArea.style.height = this.lineHeight + "px";
      },500);
    }
  }

  sendAva(){
    if ( this.txtBtnAva == "Enviar" ){
      this.slides.lockSwipes(false);
      this.lock = false;
      this.slides.slideNext();
      this.txtBtnAva = "Concluir";
      document.getElementsByClassName('swiper-pagination')[0]['style'].display = "block";
    } else if ( this.txtBtnAva == "Concluir" ){
      this.avaliado = true;
      let comentarios = this.db.list('avaliacao/'+this.keyCasa);
      comentarios.push({nota: this.stars, comentario: this.desc, uid: firebase.auth().currentUser.uid, dt: new Date(Date.now() - this.tzoffset).toISOString().slice(0,-1)});
    }
  }

  swipeLeft(){
    if ( !this.lock ){
      this.txtBtnAva = "Concluir";
    }
  }

  swipeRight(){
    if ( !this.lock ){
      this.txtBtnAva = "Enviar";
    }
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

  createChart(values){
    this.chart = new Chart(this.canvas.nativeElement, {
      type: 'bar',
      data: {
        labels: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"],
        datasets: [{
          label: 'Semana anterior',
          data: values,
          backgroundColor: [
            'rgba(101, 44, 144, 0.2)',
            'rgba(101, 44, 144, 0.2)',
            'rgba(101, 44, 144, 0.2)',
            'rgba(101, 44, 144, 0.2)',
            'rgba(101, 44, 144, 0.2)',
            'rgba(101, 44, 144, 0.2)',
            'rgba(101, 44, 144, 0.2)'
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

}
