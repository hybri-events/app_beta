import { Component } from '@angular/core';
import { NavController, Platform, NavParams, ViewController } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

@Component({
  selector: 'page-switch-event',
  templateUrl: 'switch-event.html',
})
export class SwitchEventPage {
  param = [];
  eventos: FirebaseListObservable<any>;
  ev = [];

  selects = [];

  constructor(public viewCtrl: ViewController, public platform: Platform, public navCtrl: NavController, public navParams: NavParams, public db: AngularFireDatabase) {
    this.param = navParams.data;
    this.eventos = this.db.list('/casas/'+this.param['id']+'/eventos/');
    this.eventos.forEach(evento => {
      this.ev = []
      for ( let i=0;i<evento.length;i++ ){
        let e = [];
        let even = this.db.list('/evento/'+evento[i].evento);
        even.forEach(eve => {
          for ( let j=0;j<eve.length;j++ ){
            e[eve[j].$key] = eve[j].$value;
          }
          e['id'] = evento[i].evento;
          this.ev.push(e);
        })
      }
    });
  }

  itemSelected(uid){
    if ( document.getElementById('icon-'+uid).getAttribute('name') == 'icon-select-off' ){
      if ( this.platform.is('android') ){
        document.getElementById('icon-'+uid).setAttribute('class','icon icon-md ion-md-icon-select-on item-icon');
      } else {
        document.getElementById('icon-'+uid).setAttribute('class','icon icon-ios ion-ios-icon-select-on item-icon');
      }
      document.getElementById('icon-'+uid).setAttribute('name','icon-select-on');
      document.getElementById('icon-'+uid).setAttribute('aria-label','icon select-on');
      document.getElementById('icon-'+uid).setAttribute('ng-reflect-name','icon-select-on');
      document.getElementById('icon-'+uid).style.color = '#25AA25';
      this.selects.push(uid);
    } else {
      this.removeItem(uid);
    }
  }

  removeItem(uid){
    if ( this.platform.is('android') ){
      document.getElementById('icon-'+uid).setAttribute('class','icon icon-md ion-md-icon-select-off item-icon');
    } else {
      document.getElementById('icon-'+uid).setAttribute('class','icon icon-ios ion-ios-icon-select-off item-icon');
    }
    document.getElementById('icon-'+uid).setAttribute('name','icon-select-off');
    document.getElementById('icon-'+uid).setAttribute('aria-label','icon select-off');
    document.getElementById('icon-'+uid).setAttribute('ng-reflect-name','icon-select-off');
    document.getElementById('icon-'+uid).style.color = '#AFAFAF';
    for (let i=0; i<this.selects.length; i++){
      if ( this.selects[i] == uid ){
        this.selects.splice(i,1);
        break;
      }
    }
  }

  dismiss() {
    this.viewCtrl.dismiss({sel: this.selects});
  }

}
