import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, ModalController, LoadingController, Loading, AlertController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { AutocompletePage } from '../autocomplete/autocomplete';
import { EventoProvider } from '../../providers/evento/evento';
import { ErrorProvider } from '../../providers/error/error';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { Storage } from '@ionic/storage';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { Mixpanel } from '@ionic-native/mixpanel';

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

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public geolocation: Geolocation,
    private modalCtrl: ModalController,
    public http: Http,
    public event: EventoProvider,
    public err: ErrorProvider,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    private storage: Storage,
    public db: AngularFireDatabase,
    private mixpanel: Mixpanel
  ) {
    this.mixpanel.track("Editar localização do evento");
    this.address = {
      place: ''
    };
    this.param = navParams.data;
  }

  continuar(){
    var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + this.lat + "," + this.lng;
    this.http.get(url).map(res => res.json()).subscribe(data => {
      let cidade;
      for ( let j=0;j<data.results[0].address_components.length;j++ ){
        for ( let k=0;k<data.results[0].address_components[j].types.length;k++ ){
          if ( data.results[0].address_components[j].types[k] == 'locality' ){
            cidade = data.results[0].address_components[j].long_name;
          }
        }
      }
      this.evento = this.db.list('/eventos/');
      this.param['lat'] = this.lat;
      this.param['lng'] = this.lng;
      this.param['cidade'] = cidade;
      this.evento.remove(this.param.id);
      let d = new Date(this.param['dti']);
      let index = 0;
      let pos = 0
      while (pos >= 0){
        index = pos;
        pos = this.param.id.indexOf("/",index+1);
      }
      let id = cidade+'/'+d.getFullYear()+'/'+("0"+(d.getMonth()+1)).slice(-2)+"/"+("0"+d.getDate()).slice(-2)+'/'+this.param.id.slice(index+1,this.param.id.length);
      this.evento.update(id,this.param);

      let casa = this.db.list('/casas/'+this.param.criador+'/eventos');
      casa.subscribe(c => {
        for ( let i=0;i<c.length;i++ ){
          if ( c[i].id == this.param.id ){
            casa.update(c[i].$key,{id:id,dt:this.param['dti']});
          }
        }
      })

      for ( let i=0;i<this.param.tags.length;i++ ){
        this.event.cadTags(this.param.tags[i].nome);
      }

      if ( this.param.img != 'assets/event_default.png' && this.param.img[0] != 'h' ){
        this.event.saveImg(this.param.id,this.param.img);
      }
      this.navCtrl.pop();
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
