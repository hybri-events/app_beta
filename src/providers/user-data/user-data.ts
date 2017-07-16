import { Injectable } from '@angular/core';
import firebase from 'firebase';
import { ContaProvider } from '../conta/conta';
import { AuthProvider } from '../auth/auth';
import { AngularFireDatabase } from 'angularfire2/database';

@Injectable()
export class UserDataProvider {

  constructor(public c: ContaProvider, public authData: AuthProvider, public db: AngularFireDatabase) {}

  cadUser(nome, dt_nasc, email, ft_perfil): firebase.Promise<any> {
    this.c.cadConta(0);
    this.authData.sendEmailVerification();
    let promo = this.db.list('/promocoes/convite/');
    let cod = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    promo.push({cod: cod, uid: firebase.auth().currentUser.uid});
    return firebase.database().ref(`usuario/${firebase.auth().currentUser.uid}`).push({
        nome, dt_nasc, email, ft_perfil, ft_capa: "http://usevou.com/profile/ft_capa/padrao.png", codcad: false
    });
  }

  getUser(): Promise<any> {
    return new Promise( (resolve, reject) => {
      firebase.database().ref(`usuario/${firebase.auth().currentUser.uid}`).on('value', snapshot => {
        let rawList = [];
        snapshot.forEach( snap => {
          rawList.push({
            id: snap.key,
            nome: snap.val().nome,
            dt_nasc: snap.val().dt_nasc,
            email: snap.val().email,
            ft_perfil: snap.val().ft_perfil,
            ft_capa: snap.val().ft_capa,
            codcad: snap.val().codcad
          });
        return false;
        });
        resolve(rawList);
      });
    });
  }

}
