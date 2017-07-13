import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
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

  constructor(public navCtrl: NavController, public navParams: NavParams, public db: AngularFireDatabase, private storage: Storage, public splashScreen: SplashScreen, public alertCtrl: AlertController) {
    this.list = db.list("casas/"+firebase.auth().currentUser.uid+"/");
  }

  ionViewDidLoad() {

  }

  newEstab(){
    this.navCtrl.push(NewEstabPage,null);
  }

  changeProfile(key){
    this.storage.set('casa', key);
    this.splashScreen.show();
    window.location.reload();
  }

  editEstab(key){
    this.navCtrl.push(EditCasaPage,{id: key});
  }

  removeEstab(key){
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
      }}]
    });
    alert.present();
  }

}
