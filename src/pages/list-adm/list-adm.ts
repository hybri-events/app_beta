import { Component } from '@angular/core';
import { Platform, NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { SetLocationCasaPage } from '../set-location-casa/set-location-casa';

@Component({
  selector: 'page-list-adm',
  templateUrl: 'list-adm.html',
})
export class ListAdmPage {
  search: string = '';
  usuarios: FirebaseListObservable<any>;
  users = [];
  groupedContacts = [];
  adms = [];
  param;
  pular = true;

  constructor(public platform: Platform, public navCtrl: NavController, public navParams: NavParams, public db: AngularFireDatabase) {
    this.usuarios = db.list('/usuario/');
    this.updateSearch();
    setTimeout(() => {
      this.updateSearch();
    },1000);
    this.param = navParams.data;
  }

  continuar(){
    this.param['adms'] = this.adms;
    this.navCtrl.push(SetLocationCasaPage, this.param);
  }

  updateSearch(){
    this.users = [];
    this.groupedContacts = [];
    this.usuarios.forEach(usuario => {
      usuario.forEach(usu => {
        let user = this.db.list('/usuario/'+usu.$key)
        user.forEach(us => {
          if ( us[0].nome.toLowerCase().indexOf(this.search.toLowerCase()) > -1 ){
            this.users.push([us[0].nome,us[0].ft_perfil,usu.$key])
          }
        });
      });
    });
    this.groupContacts(this.users);
  }

  groupContacts(nomes){
    let userSort = nomes.sort();
    let currentLetter = false;
    let currentContacts = [];

    userSort.forEach((value, index) => {
      if(value[0].charAt(0) != currentLetter){
        currentLetter = value[0].charAt(0);
        let newGroup = {
            letter: currentLetter,
            nomes: []
        };
        currentContacts = newGroup.nomes;
        this.groupedContacts.push(newGroup);
      }
      currentContacts.push(value);
    });
  }

  addAdm(uid,ft_perfil){
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
      this.adms.push([uid,ft_perfil]);
    } else {
      this.removeAdm(uid);
    }
    if ( this.adms.length > 0 ){
      document.getElementsByClassName('scroll-content')[5].setAttribute('style','margin-top: 56px;margin-bottom:64px;');
      this.pular = false;
    } else {
      document.getElementsByClassName('scroll-content')[5].setAttribute('style','margin-top: 56px;');
      this.pular = true;
    }
  }

  removeAdm(uid){
    if ( this.platform.is('android') ){
      document.getElementById('icon-'+uid).setAttribute('class','icon icon-md ion-md-icon-select-off item-icon');
    } else {
      document.getElementById('icon-'+uid).setAttribute('class','icon icon-ios ion-ios-icon-select-off item-icon');
    }
    document.getElementById('icon-'+uid).setAttribute('name','icon-select-off');
    document.getElementById('icon-'+uid).setAttribute('aria-label','icon select-off');
    document.getElementById('icon-'+uid).setAttribute('ng-reflect-name','icon-select-off');
    document.getElementById('icon-'+uid).style.color = '#AFAFAF';
    for (let i=0; i<this.adms.length; i++){
      if ( this.adms[i][0] == uid ){
        this.adms.splice(i,1);
        break;
      }
    }
    if ( this.adms.length > 0 ){
      document.getElementsByClassName('scroll-content')[5].setAttribute('style','margin-top: 56px;margin-bottom:64px;');
      this.pular = false;
    } else {
      document.getElementsByClassName('scroll-content')[5].setAttribute('style','margin-top: 56px;');
      this.pular = true;
    }
  }

}
