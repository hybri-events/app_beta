import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, ModalController, LoadingController, Loading, AlertController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { AutocompletePage } from '../autocomplete/autocomplete';
import { InvitePage } from '../invite/invite';
import { EventoProvider } from '../../providers/evento/evento';
import { ErrorProvider } from '../../providers/error/error';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import firebase from 'firebase';
import { Storage } from '@ionic/storage';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

declare var google;

@Component({
  selector: 'page-edit-location-event',
  templateUrl: 'edit-location-event.html',
})
export class EditLocationEventPage {
  @ViewChild('map') mapElement: ElementRef;
  map: any;
  lat: any;
  lng: any;
  address;
  marker: any;

  param: any;
  public loading:Loading;

  evento: FirebaseListObservable<any>;

  constructor(public navCtrl: NavController, public navParams: NavParams, public geolocation: Geolocation, private modalCtrl: ModalController, public http: Http, public event: EventoProvider, public err: ErrorProvider, public alertCtrl: AlertController, public loadingCtrl: LoadingController, private storage: Storage, public db: AngularFireDatabase) {
    this.address = {
      place: ''
    };
    this.param = navParams.data;
    this.evento = db.list('/evento/');
  }

  continuar(){
    var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + this.lat + "," + this.lng;
    this.http.get(url).map(res => res.json()).subscribe(data => {
      let cidade = data.results[0].address_components[3].short_name;
      this.param['lat'] = this.lat;
      this.param['lng'] = this.lng;
      this.param['cidade'] = cidade;
      this.evento.update(this.param.id,this.param);

      if ( this.param.img != 'assets/event_default.png' && this.param.img[0] != 'h' ){
        this.event.saveImg(this.param.id,this.param.img);
      }
      this.navCtrl.pop();
      this.navCtrl.pop();
    });
  }

  showAddressModal () {
    let modal = this.modalCtrl.create(AutocompletePage);
    modal.onDidDismiss(data => {
      this.address.place = data.desc;
      var url = "https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyCDS1iQAUYcxOPKpEFEvQG3vb0L2IcnQSI&place_id=" + data.id;
      this.http.get(url).map(res => res.json()).subscribe(data => {
        this.lat = data.results[0].geometry.location.lat;
        this.lng = data.results[0].geometry.location.lng;
        this.marker.setPosition(new google.maps.LatLng(this.lat, this.lng))
        this.map.set('center',new google.maps.LatLng(this.lat, this.lng))
      });
    });
    modal.present();
  }

  ionViewDidLoad(){
    this.lat = this.navParams.data.lat;
    this.lng = this.navParams.data.lng;
    this.loadMap();
  }

  loadMap(){

    console.log(this.lat)
    console.log(this.lng)

    let latLng = new google.maps.LatLng(this.lat, this.lng);

    let mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    this.marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: latLng
    });

    google.maps.event.addListener(this.map, 'click', (event) => {
      this.lat = event.latLng.lat();
      this.lng = event.latLng.lng();
      this.marker.setPosition(new google.maps.LatLng(this.lat, this.lng));
    });

  }

}
