import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { EventDetailPage } from '../event-detail/event-detail';
import { Storage } from '@ionic/storage';
import firebase from 'firebase';

@Component({
  selector: 'page-my-event',
  templateUrl: 'my-event.html',
})
export class MyEventPage {
  tabs: string = "pro";
  events = [];
  eve = [];
  conf: FirebaseListObservable<any>;
  eveCasa : FirebaseListObservable<any>;

  isCasa = false;
  casa = [];
  idCasa;

  carregando = true;

  constructor(public navCtrl: NavController, public db: AngularFireDatabase, public navParams: NavParams, private storage: Storage) {
    this.conf = db.list("/usuario/"+firebase.auth().currentUser.uid+"/confirmados/");
    this.storage.get('casa').then((val) => {
      if ( val != null ){
        this.isCasa = true;
        this.idCasa = val;
        db.list('/casas/'+val).subscribe(list => this.casa = list);
        this.eveCasa = db.list('/casas/'+val+'/eventos');
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
    let h = 0;
    if ( this.isCasa ){
      if ( this.tabs == 'pro' ){
        this.eveCasa.forEach(con => {
          for (let i=0;i<con.length;i++){
            h++;
            this.db.list("/evento/"+con[i].evento).subscribe(list => this.eve = list);
            let p = [];
            this.eve.forEach(e => {
              if ( e.$key == 'criador' ){
                let casa = this.db.list('/casas/'+e.$value);
                casa.forEach(cas => {
                  p['casa'] = [];
                  cas.forEach(ca => {
                    p['casa'][ca.$key] = ca.$value;
                  })
                });
              }
              p[e.$key] = e.$value;
            });
            this.carregando = false;
            let tzoffset = (new Date()).getTimezoneOffset() * 60000;
            if ( p['dti'] > new Date(Date.now() - tzoffset).toISOString().slice(0,-1) ){
              p['key'] = con[i].evento;
              this.events.push(p);
            }
          }
        });
        if ( h == 0 ){
          this.carregando = false;
        }
      } else if ( this.tabs == 'ant' ){
        this.eveCasa.forEach(con => {
          for (let i=0;i<con.length;i++){
            h++;
            this.db.list("/evento/"+con[i].evento).subscribe(list => this.eve = list);
            let p = [];
            this.eve.forEach(e => {
              if ( e.$key == 'criador' ){
                let casa = this.db.list('/casas/'+e.$value);
                casa.forEach(cas => {
                  p['casa'] = [];
                  cas.forEach(ca => {
                    p['casa'][ca.$key] = ca.$value;
                  })
                });
              }
              p[e.$key] = e.$value;
            });
            this.carregando = false;
            let tzoffset = (new Date()).getTimezoneOffset() * 60000;
            if ( p['dti'] <= new Date(Date.now() - tzoffset).toISOString().slice(0,-1) ){
              p['key'] = con[i].evento;
              this.events.push(p);
            }
          }
        });
        if ( h == 0 ){
          this.carregando = false;
        }
      }
    } else {
      if ( this.tabs == 'pro' ){
        this.conf.forEach(con => {
          for (let i=0;i<con.length;i++){
            h++;
            this.db.list("/evento/"+con[i].event).subscribe(list => this.eve = list);
            let p = [];
            this.eve.forEach(e => {
              if ( e.$key == 'criador' ){
                let casa = this.db.list('/casas/'+e.$value);
                casa.forEach(cas => {
                  p['casa'] = [];
                  cas.forEach(ca => {
                    p['casa'][ca.$key] = ca.$value;
                  })
                });
              }
              p[e.$key] = e.$value;
            });
            this.carregando = false;
            let tzoffset = (new Date()).getTimezoneOffset() * 60000;
            if ( p['dti'] > new Date(Date.now() - tzoffset).toISOString().slice(0,-1) ){
              p['key'] = con[i].event;
              this.events.push(p);
            }
          }
        });
        if ( h == 0 ){
          this.carregando = false;
        }
      } else if ( this.tabs == 'ant' ){
        this.conf.forEach(con => {
          for (let i=0;i<con.length;i++){
            h++;
            this.db.list("/evento/"+con[i].event).subscribe(list => this.eve = list);
            let p = [];
            this.eve.forEach(e => {
              if ( e.$key == 'criador' ){
                let casa = this.db.list('/casas/'+e.$value);
                casa.forEach(cas => {
                  p['casa'] = [];
                  cas.forEach(ca => {
                    p['casa'][ca.$key] = ca.$value;
                  })
                });
              }
              p[e.$key] = e.$value;
            });
            this.carregando = false;
            let tzoffset = (new Date()).getTimezoneOffset() * 60000;
            if ( p['dti'] <= new Date(Date.now() - tzoffset).toISOString().slice(0,-1) ){
              p['key'] = con[i].event;
              this.events.push(p);
            }
          }
        });
        if ( h == 0 ){
          this.carregando = false;
        }
      }
    }
  }

}
