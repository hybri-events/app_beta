import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, ModalController, LoadingController, Loading, AlertController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { AutocompletePage } from '../autocomplete/autocomplete';
import { EventoProvider } from '../../providers/evento/evento';
import { ErrorProvider } from '../../providers/error/error';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import firebase from 'firebase';
import { AngularFireDatabase } from 'angularfire2/database';
import { Mixpanel } from '@ionic-native/mixpanel';

declare var google;

@Component({
  selector: 'page-set-location-casa',
  templateUrl: 'set-location-casa.html',
})
export class SetLocationCasaPage {
  callback;

  @ViewChild('map') mapElement: ElementRef;
  map: any;
  lat: any;
  lng: any;
  address;
  marker: any;

  public loading:Loading;

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
    this.mixpanel.track("Definir localização do estabelecimento");
    this.address = {
      place: ''
    };
    this.lat = navParams.data.lat;
    this.lng = navParams.data.lng;
  }

  ionViewWillEnter() {
    this.callback = this.navParams.get("callback")
  }

  continuar(){
    this.callback({lat: this.lat, lng: this.lng}).then(()=>{
      this.navCtrl.pop();
    });
  }

  /*continuar(){
    this.loading = this.loadingCtrl.create({
      content: "Cadastrando o estabelecimento, aguarde...",
      dismissOnPageChange: true,
    });
    this.loading.present();
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
      this.event.cadEstab(this.param).then((e) => {
        this.db.list('/usuario/'+firebase.auth().currentUser.uid+'/estab/').push({id: firebase.auth().currentUser.uid+'/'+e.key});
        if ( this.param['img'] != 'assets/estab_default.png' ){
          this.event.saveImgEstab(e.key,this.param['img']);
        }
        for ( let i=0;i<this.param['adms'].length;i++ ){
          this.db.list('/usuario/'+this.param['adms'][i][0]+'/estab/').push({id: firebase.auth().currentUser.uid+'/'+e.key});
        }
        this.loading.dismiss();
        this.mixpanel.track("Finalização do cadastro do estabelecimento");
        this.navCtrl.pop();
        this.navCtrl.pop();
        this.navCtrl.pop();
      }, (error) => {
        this.loading.dismiss().then( () => {
          let alert = this.alertCtrl.create({
            title: "Ocorreu um erro!",
            message: this.err.messageError(error["code"]),
            buttons: [{
              text: "Ok",
              role: 'cancel'
            }]
          });
          alert.present();
        });
      });
    });
  }*/

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
    /*this.geolocation.getCurrentPosition().then((position) => {

      this.lat = position.coords.latitude;
      this.lng = position.coords.longitude;



    }, (err) => {
      console.log(err);
    });*/
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

  /*saveImg(key,img){
    firebase.storage().ref('/ft_estab/').child(key+'.png').putString(img, 'base64', {contentType: 'image/png'}).then((savedPicture) => {
      firebase.database().ref(`evento`).child(key).child('img').set(savedPicture.downloadURL);
    });
  }*/

}
