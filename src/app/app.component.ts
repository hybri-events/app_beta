import { Component } from '@angular/core';
import { Platform, NavController, AlertController, LoadingController, Loading } from 'ionic-angular';
import { ViewChild } from '@angular/core';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AngularFireAuth } from 'angularfire2/auth';
import { AuthProvider } from '../providers/auth/auth';
import { ErrorProvider } from '../providers/error/error';
import { UserDataProvider } from '../providers/user-data/user-data';
import { Storage } from '@ionic/storage';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import firebase from 'firebase/app';
import { Events } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';

import { TabsPage } from '../pages/tabs/tabs';
import { TutorialPage } from '../pages/tutorial/tutorial';

import { CadastroPage } from '../pages/cadastro/cadastro';
import { LoginPage } from '../pages/login/login';

import { PerfilPage } from '../pages/perfil/perfil';
import { MyEventPage } from '../pages/my-event/my-event';
import { AgendaPage } from '../pages/agenda/agenda';
import { InvitesPage } from '../pages/invites/invites';
import { PromocaoPage } from '../pages/promocao/promocao';
import { InviteFriendsPage } from '../pages/invite-friends/invite-friends';
import { CreatePage } from '../pages/create/create';
import { ReportBugPage } from '../pages/report-bug/report-bug';
import { SettingsPage } from '../pages/settings/settings';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { LocationAccuracy } from '@ionic-native/location-accuracy';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = TabsPage;
  @ViewChild('mycontent') nav: NavController;
  authentic: any = false;

  date: string;
  tag: string;
  tags: FirebaseListObservable<any>;
  teste: FirebaseListObservable<any>;

  cidades: FirebaseListObservable<any>;
  city;
  showCity = false;
  geoCity;

  nomeUser;
  perfilUser;
  capaUser;
  perfilPrin;

  isCasa = false;
  casa: FirebaseListObservable<any>;

  faixa = {lower: 0, upper: 200}
  public loading:Loading;

  constructor(
    platform: Platform,
    public events: Events,
    statusBar: StatusBar,
    private storage: Storage,
    public db: AngularFireDatabase,
    public afDatabase: AngularFireDatabase,
    public splashScreen: SplashScreen,
    afAuth: AngularFireAuth,
    public authData: AuthProvider,
    public userData: UserDataProvider,
    public alertCtrl: AlertController,
    public err: ErrorProvider,
    public geolocation: Geolocation,
    public http: Http,
	  public loadingCtrl: LoadingController,
    private locationAccuracy: LocationAccuracy
  ) {
    let tzoffset = (new Date()).getTimezoneOffset() * 60000;
    let fdata = new Date(Date.now() - tzoffset);
    fdata.setHours(-3);
    fdata.setMinutes(0);
    this.date = fdata.toISOString().slice(0,-1);
    console.log(this.date);

    this.storage.set('dt_filtro', this.date);
    this.storage.set('faixa', this.faixa);

    this.cidades = db.list('/cidades');

    this.tags = db.list('/tags');

    const authObserver = afAuth.authState.subscribe( user => {
      if (user) {
        if ( !user.isAnonymous ){
          this.storage.get('first').then((val) => {
            if ( val == null ){
              this.nav.push(TutorialPage,null);
              this.storage.set('first',true);
            }
          });
          this.authentic = true;
          this.userData.getUser().then( eventListSnap => {
            this.nomeUser = eventListSnap[0].nome;
            this.perfilUser = eventListSnap[0].ft_perfil;
            this.perfilPrin = this.perfilUser;
            this.capaUser = eventListSnap[0].ft_capa;

            this.storage.set('nomeUsu', this.nomeUser);
            this.storage.set('codcad', eventListSnap[0].codcad);
            this.storage.get('casa').then((val) => {
              if ( val != null ){
                this.casa = this.db.list("casas/"+val+"/");
                this.casa.forEach(ca => {
                  ca.forEach(c => {
                    if ( c.$key == 'nome' ){
                      this.nomeUser = c.$value;
                    } else if ( c.$key == 'img' ) {
                      this.perfilPrin = c.$value;
                    }
                  });
                });
                this.isCasa = true;
                this.perfilPrin = 'assets/estab_default.png';
              }
            });
          }).catch((error) => {
            console.log('Ok');
            console.log(error);
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
          authObserver.unsubscribe();
        }
      } else {
        firebase.auth().signInAnonymously();
        this.authentic = false;
        authObserver.unsubscribe();
      }
    });
    platform.ready().then(() => {
      if ( platform.is('android') ){
        statusBar.backgroundColorByHexString('#461969');
      } else {
        statusBar.backgroundColorByHexString('#FFFFFF');
  	    statusBar.styleDefault();
      }
      splashScreen.hide();

      this.locationAccuracy.canRequest().then((canRequest: boolean) => {
        if(canRequest) {
          this.locationAccuracy.request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(null,null);
        }
      });

      this.geolocation.getCurrentPosition().then((position) => {

        let lat = position.coords.latitude;
        let lng = position.coords.longitude;
        var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + lng;
        this.http.get(url).map(res => res.json()).subscribe(data => {
          for ( let j=0;j<data.results[0].address_components.length;j++ ){
            for ( let k=0;k<data.results[0].address_components[j].types.length;k++ ){
              if ( data.results[0].address_components[j].types[k] == 'locality' ){
                this.city = data.results[0].address_components[j].long_name;
                this.geoCity = data.results[0].address_components[j].long_name;
                this.storage.set('cidade', this.city);
                this.cidades.forEach(cid => {
                  let j = 0;
                  cid.forEach(ci => {
                    if ( ci.nome != this.city ){
                      j++;
                    }
                  });
                  if ( cid.length == j ){
                    this.showCity = true;
                  }
                });
                break;
              }
            }
            if ( this.city != null ){
              break;
            }
          }
        });

      }, (err) => {
        console.log(err);
      });
    });
  }

  returnProfile() {
	this.loading = this.loadingCtrl.create({
      content: "Trocando de perfil, aguarde...",
      dismissOnPageChange: true,
    });
    this.loading.present();
    this.storage.remove('casa');
	setTimeout(() => {
	  this.loading.dismiss();
      this.splashScreen.show();
      window.location.reload();
	},2000)
  }

  openMenuPage(i) {
    if ( i == 0 ){
      this.nav.push(PerfilPage, null);
    } else if ( i == 1 ){
      this.nav.push(MyEventPage, null);
    } else if ( i == 2 ){
      this.nav.push(AgendaPage, null);
    } else if ( i == 3 ){
      this.nav.push(InvitesPage, null);
    } else if ( i == 4 ){
      this.nav.push(InviteFriendsPage, null);
    } else if ( i == 5 ){
      this.nav.push(CreatePage, null);
    } else if ( i == 6 ){
      this.nav.push(SettingsPage, null);
    } else if ( i == 7 ){
      this.nav.push(PromocaoPage, null);
    } else if ( i == 8 ){
      this.nav.push(ReportBugPage, null);
    }
  }

  openButtonPage(i) {
    if ( i == 0 ){
      this.nav.push(CadastroPage, null);
    } else if ( i == 1 ){
      this.nav.push(LoginPage, null);
    }
  }

  exit(): void {
    this.authData.logoutUser().then(() => {
      this.authentic = false;
      this.splashScreen.show();
      window.location.reload();
    }).catch((error) => {
      alert(JSON.stringify(error));
    });
  }

  aplicarFiltro(){
    this.storage.set('dt_filtro', this.date.slice(0,-1)).then(() => {
      this.storage.set('tag', this.tag).then(() => {
        this.storage.set('faixa', this.faixa).then(() => {
          this.storage.set('cidade', this.city).then(() => {
            this.showCity = false;
            this.cidades.forEach(cid => {
              let j = 0;
              cid.forEach(ci => {
                if ( ci.nome != this.city ){
                  j++;
                }
              });
              if ( cid.length == j ){
                this.showCity = true;
              }
            });
            this.events.publish('filtro:change', null);
          });
        });
      });
    });
  }

  resetarFiltro(){
    let tzoffset = (new Date()).getTimezoneOffset() * 60000;
    let fdata = new Date(Date.now() - tzoffset);
    fdata.setHours(-3);
    fdata.setMinutes(0);
    this.date = fdata.toISOString().slice(0,-1);

    this.tag = null;
    this.faixa = {lower: 0, upper: 1000};

    this.storage.set('dt_filtro', this.date).then(() => {
      this.storage.set('tag', this.tag).then(() => {
        this.storage.set('faixa', this.faixa).then(() => {
          this.storage.set('cidade', this.geoCity).then(() => {
            this.showCity = false;
            this.cidades.forEach(cid => {
              let j = 0;
              cid.forEach(ci => {
                if ( ci.nome != this.geoCity ){
                  j++;
                }
              });
              if ( cid.length == j ){
                this.showCity = true;
              }
            });
            this.events.publish('filtro:change', null);
          });
        });
      });
    });

    this.tags.forEach((tag) => {
      tag.forEach((t) => {
        document.getElementById(t.$key).style.background = "#652C90";
        document.getElementById(t.$key).style.color = "white";
      });
    });
  }

  evidentTag(id, nome){
    if (this.tag == nome){
      this.tag = null;
      document.getElementById(id).style.background = "#652C90";
      document.getElementById(id).style.color = "white";
    } else {
      this.tag = nome;
      this.tags.forEach((tag) => {
        tag.forEach((t) => {
          document.getElementById(t.$key).style.background = "#652C90";
          document.getElementById(t.$key).style.color = "white";
        });
      });
      document.getElementById(id).style.background = "white";
      document.getElementById(id).style.color = "#652C90";
    }
  }
}
