import { Injectable } from '@angular/core';
import firebase from 'firebase';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class EventoProvider {
  offset = (new Date()).getTimezoneOffset() * 60000;

  constructor(public http: Http) {}

  cadEvento(params): firebase.Promise<any> {
    for ( let i=0;i<params[0].tags.length;i++ ){
      this.cadTags(params[0].tags[i].nome);
    }
    let dti = new Date(params[0].dt_ini);
    let datai = new Date(dti.getTime() + this.offset);
    let dtf = new Date(params[0].dt_fim);
    let dataf = new Date(dtf.getTime() - this.offset);
    let meses = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
    let mes = meses[datai.getMonth()];
    return firebase.database().ref(`evento/`).push({
      nome: params[0].nome,
      criador: firebase.auth().currentUser.uid,
      nomeCriador: params[2].nomeCriador,
      dt_ini: ('0'+datai.getDate()).slice(-2)+'/'+('0'+(datai.getMonth()+1)).slice(-2)+'/'+datai.getFullYear(),
      hr_ini: ('0'+datai.getHours()).slice(-2)+':'+('0'+datai.getMinutes()).slice(-2),
      dt_fim: (params[0].termino?('0'+dataf.getDate()).slice(-2)+'/'+('0'+(dataf.getMonth()+1)).slice(-2)+'/'+dataf.getFullYear():'null'),
      hr_fim: (params[0].termino?('0'+dataf.getHours()).slice(-2)+':'+('0'+dataf.getMinutes()).slice(-2):'null'),
      mes: mes,
      dia: datai.getDate(),
      dti: params[0].dt_ini,
      desc: params[0].desc,
      faixa_ini: params[0].faixa.lower,
      faixa_fim: params[0].faixa.upper,
      priv: params[0].priv,
      pub: params[0].pub,
      gat: params[0].gat,
      tags: params[0].tags,
      lat: params[1].lat,
      lng: params[1].lng,
      cidade: params[1].cidade,
      coin: params[0].coin,
      img: 'assets/event_default.png'
    });
  }

  saveImg(key,img){
    firebase.storage().ref('/ft_evento/').child(key+'.png').putString(img, 'base64', {contentType: 'image/png'}).then((savedPicture) => {
      firebase.database().ref(`evento`).child(key).child('img').set(savedPicture.downloadURL);
    });
  }

  cadTags(nome){
    return firebase.database().ref(`tags/`).push({nome});
  }

  getEventos(): firebase.Promise<any> {
    return new Promise( (resolve, reject) => {
      firebase.database().ref(`evento/`).orderByChild('priv').equalTo('0').on('value', snapshot => {
        let rawList = [];
        snapshot.forEach( snap => {
          console.log(Date.now());
          console.log(new Date(snap.val().dt_ini));
          rawList.push({
            id: snap.key,
            nome: snap.val().nome,
            criador: snap.val().criador,
            dt_ini: new Date(new Date(snap.val().dt_ini).getTime() + this.offset),
            dt_fim: (snap.val().dt_fim != 'null'? new Date(new Date(snap.val().dt_fim).getTime() + this.offset):'null'),
            faixa_ini: snap.val().faixa_ini,
            faixa_fim: snap.val().faixa_fim,
            lat: snap.val().lat,
            lng: snap.val().lng,
            cidade: snap.val().cidade,
            coin: snap.val().coin
          });
        return false;
        });
        resolve(rawList);
      });
    });
  }

  getNomeCriador(uid): firebase.Promise<any>{
    return new Promise( (resolve, reject) => {
      firebase.database().ref(`usuario/`+uid).on('value', snapshot => {
        let rawList = [];
        snapshot.forEach( snap => {
          rawList.push({
            nome: snap.val().nome
          });
        return false;
        });
        resolve(rawList);
      });
    });
  }

}
