import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { EventDetailPage } from '../event-detail/event-detail';
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

  constructor(public navCtrl: NavController, public db: AngularFireDatabase, public navParams: NavParams) {
    this.conf = db.list("/usuario/"+firebase.auth().currentUser.uid+"/confirmados/");
    this.eve = db.list("/evento/");
    this.conf.forEach(co => {
      this.events = [];
      co.forEach(c => {
        this.eve.forEach(ev => {
          ev.forEach(e => {
            if ( c.event == e.$key ){
              this.events.unshift(e);
            }
          });
        });
      })
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
            this.cri.unshift(e);
          }
        })
      })
    }
  }

}
