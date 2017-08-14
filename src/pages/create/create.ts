import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, Loading } from 'ionic-angular';
import { NewEstabPage } from '../new-estab/new-estab';
import { EditCasaPage } from '../edit-casa/edit-casa';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import firebase from 'firebase';
import { Storage } from '@ionic/storage';
import { SplashScreen } from '@ionic-native/splash-screen';

@Component({
  selector: 'page-create',
  templateUrl: 'create.html',
})
export class CreatePage {
  list: FirebaseListObservable<any>;
  allCasas = [];
  public loading:Loading;

  constructor(public navCtrl: NavController, public navParams: NavParams, public db: AngularFireDatabase, private storage: Storage, public splashScreen: SplashScreen, public alertCtrl: AlertController, public loadingCtrl: LoadingController) {
    this.list = db.list("/usuario/"+firebase.auth().currentUser.uid+"/estab/");
    this.list.forEach(estab => {
      this.allCasas = [];
      for ( let i=0;i<estab.length;i++ ){
        let casa = db.list('/casas/'+estab[i].id);
        casa.forEach(cas => {
          let c = [];
          let index = estab[i].id.indexOf('/');
          if ( estab[i].id.slice(0,index) == firebase.auth().currentUser.uid ){
            c['edit'] = true;
          } else {
            c['edit'] = false;
          }
          for ( let j=0;j<cas.length;j++ ){
            if ( cas[j].$key == 'adms' ){
              c['adms'] = [];
              for ( let k=0;k<cas[j].length;k++ ){
                c['adms'].push(cas[j][k]);
              }
            } else {
              c[cas[j].$key] = cas[j].$value;
            }
          }
          c['key'] = estab[i].$key;
          c['id'] = estab[i].id;
          this.allCasas.push(c);
        })
      }
    })
  }

  newEstab(){
    this.navCtrl.push(NewEstabPage,null);
  }

  changeProfile(key){
	this.loading = this.loadingCtrl.create({
      content: "Trocando de perfil, aguarde...",
      dismissOnPageChange: true,
    });
    this.loading.present();
    this.storage.set('casa', key);
	setTimeout(() => {
	  this.loading.dismiss();
      this.splashScreen.show();
      window.location.reload();
	},2000)
  }

  editEstab(key){
    this.navCtrl.push(EditCasaPage,{id: key});
  }

  removeEstab(key,id,adms){
    let alert = this.alertCtrl.create({
      title: 'Excluir estabelecimento',
      subTitle: 'Tem certeza que você deseja excluir este estabelecimento?',
      buttons: [{text: 'Não', handler: () => {}},{text: 'Sim', handler: () => {
        this.storage.get('casa').then((val) => {
          if ( val != null ){
            if ( val == key ){
              this.storage.remove('casa');
              this.splashScreen.show();
              window.location.reload();
            }
          }
        });
        this.list.remove(key);
        if ( adms != undefined ){
          for ( let i=0;i<adms.length;i++ ){
            let usu = this.db.list('/usuario/'+adms[i][0]+'/estab/');
            usu.forEach(us => {
              for ( let j=0;j<us.length;j++ ){
                if ( us[j].id == id ){
                  usu.remove(us[j].$key);
                }
              }
            })
          }
        }
        this.db.list('casas').remove(id);
        this.navCtrl.pop();
      }}]
    });
    alert.present();
  }

}
