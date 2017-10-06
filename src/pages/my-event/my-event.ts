import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { EventDetailPage } from '../event-detail/event-detail';
import { Storage } from '@ionic/storage';
import firebase from 'firebase';
import { Mixpanel } from '@ionic-native/mixpanel';

@Component({
  selector: 'page-my-event',
  templateUrl: 'my-event.html',
})
export class MyEventPage {
  tabs: string = "pro";
  events = [];
  conf: FirebaseListObservable<any>;
  eveCasa : FirebaseListObservable<any>;

  isCasa = false;
  casa = [];
  idCasa;

  carregando = true;

  constructor(
    public navCtrl: NavController,
    public db: AngularFireDatabase,
    public navParams: NavParams,
    private storage: Storage,
    private mixpanel: Mixpanel
  ) {
    this.conf = db.list("/usuario/"+firebase.auth().currentUser.uid+"/confirmados/");
    this.storage.get('casa').then((val) => {
      if ( val != null ){
        this.isCasa = true;
        this.idCasa = val;
        db.list('/casas/'+val).subscribe(list => this.casa = list);
        this.conf = db.list('/casas/'+val+'/eventos');
      }
      this.changeTabs();
    });
  }

  ionViewDidLoad() {

  }

  openEvent(id){
    this.navCtrl.push(EventDetailPage, {id: id});
  }

  changeTabs(){
    this.carregando = true;
    this.events = [];
    if ( this.tabs == 'pro' ){
      this.mixpanel.track("Meus eventos",{"tab":"Próximos","perfil":"usuário"});
    } else {
      this.mixpanel.track("Meus eventos",{"tab":"Anteriores","perfil":"usuário"});
    }
    this.conf.forEach(con => {
      let t = [];
      for (let i=0;i<con.length;i++){
        let p = [];
        let id;
        if ( this.isCasa ){
          id = con[i].id;
        } else {
          id = con[i].event;
        }
        this.db.list("/eventos/"+id).subscribe(list => {
          for ( let i=0;i<list.length;i++ ) {
            if ( list[i].$key == 'criador' ){
              let casa = this.db.list('/casas/'+list[i].$value);
              casa.forEach(cas => {
                p['casa'] = [];
                cas.forEach(ca => {
                  p['casa'][ca.$key] = ca.$value;
                })
              });
            }
            p[list[i].$key] = list[i].$value;
          }
          let tzoffset = (new Date()).getTimezoneOffset() * 60000;
          if ( this.tabs == 'pro' ){
            if ( p['dti'] > new Date(Date.now() - tzoffset).toISOString().slice(0,-1) ){
              p['key'] = id;
              t.push(p);
            }
          } else {
            if ( p['dti'] <= new Date(Date.now() - tzoffset).toISOString().slice(0,-1) ){
              p['key'] = id;
              t.push(p);
            }
          }
        });
      }
      this.carregando = false;
      this.events = t;
    });
  }

}
