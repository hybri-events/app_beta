import { Component } from '@angular/core';
import { Platform, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { SetLocationCasaPage } from '../set-location-casa/set-location-casa';
import { Mixpanel } from '@ionic-native/mixpanel';

@Component({
  selector: 'page-list-adm',
  templateUrl: 'list-adm.html',
})
export class ListAdmPage {
  callback;

  search: string = '';
  usuarios: FirebaseListObservable<any>;
  users = [];
  groupedContacts = [];
  adms = [];
  pular = true;
  carregando = true;
  interval;
  interval2;
  limit = 20;

  constructor(
    public platform: Platform,
    public navCtrl: NavController,
    public navParams: NavParams,
    public db: AngularFireDatabase,
    private mixpanel: Mixpanel
  ) {
    this.mixpanel.track("Adicionar administradores do estabelecimento");
    this.usuarios = db.list('/usuario/');
    this.updateSearch();
    this.adms = navParams.data.adms;
    this.callback = navParams.data.callback;
  }

  onInfiniteScroll($event){
    this.limit += 20;
    this.groupContacts(this.users);
    $event.state = "closed";
  }

  checkAdm(uid){
    for (let i=0; i<this.adms.length; i++){
      if ( this.adms[i].uid == uid ){
        return false;
      }
    }
    return true;
  }

  updateSearch(){
    this.users = [];
    this.groupedContacts = [];
    this.limit = 20;
    this.carregando = true;
    this.usuarios.forEach(usuario => {
      usuario.forEach(usu => {
        let user = this.db.list('/usuario/'+usu.$key)
        user.forEach(us => {
          if ( (""+us[0].nome).toLowerCase().indexOf(this.search.toLowerCase()) > -1 ){
            this.users.push([us[0].nome, us[0].ft_perfil, usu.$key])
          }
        });
      });
    });
    clearInterval(this.interval);
    this.interval = setInterval(() => {
      if ( this.users.length != 0 ){
        this.carregando = false;
        this.groupContacts(this.users);
        clearInterval(this.interval);
      }
    }, 500);
  }

  groupContacts(nomes){
    var j = 0;
    nomes.sort().some((value, index) => {
      j++;
      if ( j > (this.limit - 20) ){
        let i=0;
        var letter = value[0].charAt(0).toUpperCase();
        var accents = 'ÀÁÂÃÄÅÒÓÔÕÕÖØÈÉÊËÇÐÌÍÎÏÙÚÛÜÑŠŸŽ';
        var accentsOut = "AAAAAAOOOOOOOEEEECDIIIIUUUUNSYZ";
        if ( accents.indexOf(letter) > -1 ){
          letter = accentsOut[accents.indexOf(letter)];
        }
        for ( i;i<this.groupedContacts.length;i++ ){
          if ( letter == this.groupedContacts[i].letter && this.checkAdm(value[2]) ){
            this.groupedContacts[i].nomes.push(value)
            break;
          }
        }
        if ( i == this.groupedContacts.length && this.checkAdm(value[2]) ){
          let newGroup = {
              letter: letter,
              nomes: []
          };
          this.groupedContacts.push(newGroup);
          this.groupedContacts[i].nomes.push(value)
        }
        if ( j == this.limit ){
          return true;
        }
      }
    });
  }

  addAdm(adm){
    this.adms.push({nome: adm[0], perfil: adm[1], uid: adm[2], perm: 0});
    this.callback({adms: this.adms}).then(()=>{
      this.navCtrl.pop();
    });
  }

}
