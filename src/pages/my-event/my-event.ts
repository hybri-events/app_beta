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
  tabs: string = "con";
  events = [];
  cri = [];
  eve: FirebaseListObservable<any>;
  conf: FirebaseListObservable<any>;

  isCasa = false;
  casa = [];

  constructor(public navCtrl: NavController, public db: AngularFireDatabase, public navParams: NavParams, private storage: Storage) {
    this.eve = db.list("/evento/Jaraguá do Sul");
    this.conf = db.list("/usuario/"+firebase.auth().currentUser.uid+"/confirmados/");
    db.list('/casas/').subscribe(list => this.casa = list );
    this.storage.get('casa').then((val) => {
      if ( val != null ){
        this.eve.forEach(ev => {
          this.cri = [];
          ev.forEach(e => {
            if ( e.criador == val ){
              this.casa.forEach(ca => {
                if( ca[e.criador] != null ){
                  e['casa'] = ca[e.criador];
                  this.cri.unshift(e);
                }
              });
            }
          })
        })
        this.isCasa = true;
        this.tabs = "cri";
      } else {
        this.conf.forEach(co => {
          this.events = [];
          co.forEach(c => {
            this.eve.forEach(ev => {
              ev.forEach(e => {
                if ( c.event == e.$key ){
                  if ( e.criador[0] == "-" ){
                    this.casa.forEach(ca => {
                      if( ca[e.criador] != null ){
                        e['casa'] = ca[e.criador];
                      }
                    });
                  } else {
                    e['casa'] = {estac: false, bar: false, cozinha: false, acess: false, wifi: false, fum: false};
                  }
                  this.events.unshift(e);
                }
              });
            });
          })
        });
        console.log(this.events);
      }
    });
  }

  ionViewDidLoad() {

  }

  openEvent(id){
    this.navCtrl.push(EventDetailPage, {id: id});
  }

  changeTabs(){
    if ( this.tabs == "con" ){
      this.conf.forEach(co => {
        this.events = [];
        co.forEach(c => {
          this.eve.forEach(ev => {
            ev.forEach(e => {
              if ( c.event == e.$key ){
                if ( e.criador[0] == "-" ){
                  this.casa.forEach(ca => {
                    if( ca[e.criador] != null ){
                      e['casa'] = ca[e.criador];
                    }
                  });
                } else {
                  e['casa'] = {estac: false, bar: false, cozinha: false, acess: false, wifi: false, fum: false};
                }
                this.events.unshift(e);
              }
            });
          });
        })
      });
    } else if ( this.tabs == "cri" ){
      this.eve.forEach(ev => {
        this.cri = [];
        ev.forEach(e => {
          if ( e.criador == firebase.auth().currentUser.uid ){
            e['casa'] = {estac: false, bar: false, cozinha: false, acess: false, wifi: false, fum: false};
            this.cri.unshift(e);
          }
        })
      })
    }
  }

}
