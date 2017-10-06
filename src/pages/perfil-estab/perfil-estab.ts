import { Component, ViewChild, ElementRef } from '@angular/core';
import { Platform, NavController, NavParams, Navbar, Content } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { StatusBar } from '@ionic-native/status-bar';
import { Chart } from 'chart.js';

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
        let tzoffset = (new Date()).getTimezoneOffset() * 60000;
        let now = new Date(Date.now() - tzoffset);
        let day = now.getDay();
        now.setDate(now.getDate() - (day+1));
        now.setHours(20);
        now.setMinutes(59);
        let d1 = new Date(now.getTime());
        d1.setDate(d1.getDate() - 7);
        d1.setHours(21);
        d1.setMinutes(0);
        let eventos = this.db.list("casas/"+val+"/eventos/",{
          query: {
            orderByChild: 'dt',
            startAt: d1.toISOString(),
            endAt: now.toISOString()
          }
        });
        eventos.forEach(evento => {
          this.checkins = [0,0,0,0,0,0,0];
          for( let j=0;j<evento.length;j++ ){
            let dt = new Date(evento[j].dt);
            let ev = this.db.list("eventos/"+evento[j].id);
            ev.forEach(e => {
              for ( let k=0;k<e.length;k++ ){
                this.eAnteriores.push(e[k]);
              }
            });
            let eve = this.db.list("eventos/"+evento[j].id+"/confirmados");
            eve.forEach(e => {
              console.log(e.length);
              this.checkins[dt.getDay()] = e.length;
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
        document.getElementById('list').style.paddingTop = '8px';
      } else if ( data.scrollTop >= (document.getElementById('fundo').offsetHeight - h) ) {
        document.getElementById('tool').style.background = '#652C90';
        document.getElementById('fundo').style.opacity = '1';
        document.getElementById('title').style.opacity = '1';
        document.getElementById('tabs').style.position = 'fixed';
        document.getElementById('tabs').style.top = h+'px';
        document.getElementById('list').style.paddingTop = (h + 8)+'px';
      }
    });
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
      },1000);
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
        },
        {
          label: 'Média mensal',
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
        tooltips: {
          callbacks: {
            label: function(tooltipItem) {
              return tooltipItem.yLabel;
            }
          }
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero:true
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
