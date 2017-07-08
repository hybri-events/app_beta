import { Injectable } from '@angular/core';
import firebase from 'firebase';

@Injectable()
export class UserDataProvider {

  constructor() {}

  cadUser(nome, dt_nasc, email, ft_perfil): firebase.Promise<any> {
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
