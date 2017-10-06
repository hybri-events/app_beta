import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, ModalController, LoadingController, Loading, AlertController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { AutocompletePage } from '../autocomplete/autocomplete';
import { SwitchEventPage } from '../switch-event/switch-event';
import { EventoProvider } from '../../providers/evento/evento';
import { ErrorProvider } from '../../providers/error/error';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import firebase from 'firebase';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { Mixpanel } from '@ionic-native/mixpanel';

declare var google;

@Component({
  selector: 'page-edit-location-casa',
  templateUrl: 'edit-location-casa.html',
})
export class EditLocationCasaPage {
  @ViewChild('map') mapElement: ElementRef;
  map: any;
  lat: any;
  lng: any;
  address;
  marker: any;

  param: any;
  public loading:Loading;

  casa: FirebaseListObservable<any>;

  url;

  constructor(
    public navCtrl: NavController,
    public db: AngularFireDatabase,
    public navParams: NavParams,
    public geolocation: Geolocation,
    private modalCtrl: ModalController,
    public http: Http,
    public event: EventoProvider,
    public err: ErrorProvider,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    private mixpanel: Mixpanel
  ) {
    this.mixpanel.track("Editar localização do estabelecimento");
    this.address = {
      place: ''
    };
    this.param = navParams.data;
    this.lat = this.param['lat'];
    this.lng = this.param['lng'];
    this.casa = this.db.list('/casas/'+firebase.auth().currentUser.uid+'/');
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
      this.param['lat'] = this.lat;
      this.param['lng'] = this.lng;
      this.param['cidade'] = cidade;

      let index = this.param['id'].indexOf('/');
      this.casa.update(this.param['id'].slice(index+1,this.param['id'].length),this.param);
      for ( let i=0;i<this.param.tags.length;i++ ){
        this.event.cadTags(this.param.tags[i].nome);
      }
      if ( this.param.img != 'assets/estab_default.png' && this.param.img[0] != 'h' ){
        this.event.saveImgEstab(this.param['id'].slice(index+1,this.param['id'].length),this.param.img).then((savedPicture) => {
          this.url = savedPicture.downloadURL;
          firebase.database().ref('/casas/'+firebase.auth().currentUser.uid+'/').child(this.param['id'].slice(index+1,this.param['id'].length)).child('img').set(savedPicture.downloadURL);
        });
      }
      let al = this.alertCtrl.create({
        title: 'Alterar eventos',
        subTitle: 'Deseja aplicar essas alterações em seus eventos?',
        buttons: [{text: 'Todos os eventos', handler: () => {
          let casa = this.db.list('/casas/'+this.param['id']+'/eventos/');
          casa.forEach(cas => {
            for ( let i=0;i<cas.length;i++ ){
              let eventos = this.db.list('/eventos/');
              eventos.update(cas[i].id,{
                cidade: this.param['cidade'],
                desc: this.param['desc'],
                faixa_fim: this.param['faixa']['upper'],
                faixa_ini: this.param['faixa']['lower'],
                lat: this.param['lat'],
                lng: this.param['lng'],
                nomeCriador: this.param['nome'],
                tags: this.param['tags']
              });
              if ( this.param.img != 'assets/estab_default.png' && this.param.img[0] != 'h' ){
                eventos.update(cas[i].evento,{img: this.url});
              }
            }
            this.navCtrl.pop();
            this.navCtrl.pop();
            this.navCtrl.pop();
            this.navCtrl.pop();
          });
        }},{text: 'Escolher eventos', handler: () => {
          this.showEventsModal();
        }},{text: 'Não alterar', handler: () => {
          this.navCtrl.pop();
          this.navCtrl.pop();
          this.navCtrl.pop();
          this.navCtrl.pop();
        }}]
      });
      al.present();
    });
  }

  showEventsModal(){
    let modal = this.modalCtrl.create(SwitchEventPage, {id: this.param['id']});
    modal.onDidDismiss(data => {
      console.log(data);
      for ( let i=0;i<data.sel.length;i++ ){
        let eventos = this.db.list('/eventos/');
        eventos.update(data.sel[i],{
          cidade: this.param['cidade'],
          desc: this.param['desc'],
          faixa_fim: this.param['faixa']['upper'],
          faixa_ini: this.param['faixa']['lower'],
          lat: this.param['lat'],
          lng: this.param['lng'],
          nomeCriador: this.param['nome'],
          tags: this.param['tags']
        });
        if ( this.param.img != 'assets/estab_default.png' && this.param.img[0] != 'h' ){
          eventos.update(data.sel[i],{img: this.url});
        }
      }
      this.navCtrl.pop();
      this.navCtrl.pop();
      this.navCtrl.pop();
      this.navCtrl.pop();
    });
    modal.present();
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
    this.loadMap();
  }

  loadMap(){

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
