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
        this.mixpanel.track("Meus eventos",{"tab":"Próximos","perfil":"estabelecimento"});
        this.eveCasa.forEach(con => {
          for (let i=0;i<con.length;i++){
            h++;
            let p = [];
            this.db.list("/evento/"+con[i].evento).subscribe(list => {
              list.forEach(e => {
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
            });
            setTimeout(() => {
              this.carregando = false;
              let tzoffset = (new Date()).getTimezoneOffset() * 60000;
              if ( p['dti'] > new Date(Date.now() - tzoffset).toISOString().slice(0,-1) ){
                p['key'] = con[i].evento;
                this.events.push(p);
              }
            },1000);
          }
        });
        if ( h == 0 ){
          this.carregando = false;
        }
      } else if ( this.tabs == 'ant' ){
        this.mixpanel.track("Meus eventos",{"tab":"Anteriores","perfil":"estabelecimento"});
        this.eveCasa.forEach(con => {
          for (let i=0;i<con.length;i++){
            h++;
            let p = [];
            this.db.list("/evento/"+con[i].evento).subscribe(list => {
              list.forEach(e => {
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
            });
            setTimeout(() => {
              this.carregando = false;
              let tzoffset = (new Date()).getTimezoneOffset() * 60000;
              if ( p['dti'] <= new Date(Date.now() - tzoffset).toISOString().slice(0,-1) ){
                p['key'] = con[i].evento;
                this.events.push(p);
              }
            },1000);
          }
        });
        if ( h == 0 ){
          this.carregando = false;
        }
      }
    } else {
      if ( this.tabs == 'pro' ){
        this.mixpanel.track("Meus eventos",{"tab":"Próximos","perfil":"usuário"});
        this.conf.forEach(con => {
          for (let i=0;i<con.length;i++){
            h++;
            let p = [];
            this.db.list("/evento/"+con[i].event).subscribe(list => {
              list.forEach(e => {
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
            });
            setTimeout(() => {
              this.carregando = false;
              let tzoffset = (new Date()).getTimezoneOffset() * 60000;
              if ( p['dti'] > new Date(Date.now() - tzoffset).toISOString().slice(0,-1) ){
                p['key'] = con[i].event;
                this.events.push(p);
              }
            },1000);
          }
        });
        if ( h == 0 ){
          this.carregando = false;
        }
      } else if ( this.tabs == 'ant' ){
        this.mixpanel.track("Meus eventos",{"tab":"Anteriores","perfil":"usuário"});
        this.conf.forEach(con => {
          for (let i=0;i<con.length;i++){
            h++;
            let p = [];
            this.db.list("/evento/"+con[i].event).subscribe(list => {
              list.forEach(e => {
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
            });
            setTimeout(() => {
              this.carregando = false;
              let tzoffset = (new Date()).getTimezoneOffset() * 60000;
              if ( p['dti'] <= new Date(Date.now() - tzoffset).toISOString().slice(0,-1) ){
                p['key'] = con[i].event;
                this.events.push(p);
              }
            },1000);
          }
        });
        if ( h == 0 ){
          this.carregando = false;
        }
      }
    }
  }

}
