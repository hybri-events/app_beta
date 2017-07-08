import { Component, ViewChild, ElementRef } from '@angular/core';
import { Platform, NavController, NavParams, Content } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import firebase from 'firebase';

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

  constructor(public platform: Platform, public navCtrl: NavController, public navParams: NavParams, public db: AngularFireDatabase) {
    this.id = navParams.data.id;
    let tzoffset = (new Date()).getTimezoneOffset() * 60000;
    this.data = new Date(Date.now() - tzoffset).toISOString().slice(0,-1);
    this.event = db.list('/evento/'+this.id+'/');
    this.event.forEach( evento => {
      evento.forEach( eve => {
        if ( eve.$key == "tags" ){
          this.e[eve.$key] = [];
          eve.forEach(ev => {
            this.e[eve.$key].push(ev);
          });
        } else {
          this.e[eve.$key] = eve.$value;
        }
      });
    });
    console.log(this.e);
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

}
