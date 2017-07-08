import { Injectable } from '@angular/core';
import firebase from 'firebase';

@Injectable()
export class ContaProvider {

  constructor() {}

  cadConta(saldo): firebase.Promise<any> {
    return firebase.database().ref(`conta/${firebase.auth().currentUser.uid}`).push({saldo});
  }

  altSaldo(type, key, saldo_atual, add, uid): firebase.Promise<any> {
    if ( type == 0 ){
      let saldo = saldo_atual - add;
      return firebase.database().ref(`conta/${uid}/${key}`).update({saldo: saldo});
    } else {
      let saldo = saldo_atual + add;
      return firebase.database().ref(`conta/${uid}/${key}`).update({saldo: saldo});
    }
  }

  cadTransacao(uid, descricao, valor, tipo, dt_hr, classe, operador): firebase.Promise<any> {
    return firebase.database().ref('conta/'+uid+'/transacao').push({
      descricao, valor, tipo, dt_hr, classe, operador
    });
  }

  getSaldo(uid): Promise<any> {
    return new Promise( (resolve, reject) => {
      firebase.database().ref(`conta/${uid}`).on('value', snapshot => {
        let rawList = [];
        snapshot.forEach( snap => {
          rawList.push({
            id: snap.key,
            saldo: snap.val().saldo
          });
        return false;
        });
        resolve(rawList);
      });
    });
  }

}
