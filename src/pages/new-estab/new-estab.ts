import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { SetLocationCasaPage } from '../set-location-casa/set-location-casa';

@Component({
  selector: 'page-new-estab',
  templateUrl: 'new-estab.html',
})
export class NewEstabPage {
  nome: string = "";
  email: string = "";
  fone: string = "";
  estilo = null;

  dias = {seg: false, ter: false, qua: false, qui: false, sex: false, sab: false, dom: false};
  hora = {seg: {ini: "00:00", fim: "00:00"},
          ter: {ini: "00:00", fim: "00:00"},
          qua: {ini: "00:00", fim: "00:00"},
          qui: {ini: "00:00", fim: "00:00"},
          sex: {ini: "00:00", fim: "00:00"},
          sab: {ini: "00:00", fim: "00:00"},
          dom: {ini: "00:00", fim: "00:00"}};

  bar = false;
  cozinha = false;
  fum = false;
  wifi = false;
  estac = false;
  acess = false;

  cartao = false;
  dinheiro = false;
  coins = false;


  constructor(public navCtrl: NavController, public navParams: NavParams, public alertCtrl: AlertController) {}

  validEmail(email): boolean{
    const re = /^\w+@[a-zA-Z_.]+?\.[a-zA-Z]{2,3}$/.test(email);

    if (re){
      return false;
    }

    return true;

  }

  trim(str){
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
  }

  continuar(){
    if ( this.trim(this.nome) == "" ){
      let alert = this.alertCtrl.create({
        title: 'Nome inválido!',
        subTitle: 'Digite o nome do estabelecimento.',
        buttons: ['OK']
      });
      alert.present();
    } else if ( this.trim(this.email) == "" ){
      let alert = this.alertCtrl.create({
        title: 'E-mail inválido!',
        subTitle: 'Digite o e-mail empresarial do estabelecimento.',
        buttons: ['OK']
      });
      alert.present();
    } else if ( this.validEmail(this.trim(this.email)) ){
      let alert = this.alertCtrl.create({
        title: 'E-mail inválido!',
        subTitle: 'Digite um e-mail válido.',
        buttons: ['OK']
      });
      alert.present();
    } else if ( this.trim(this.fone) == "" ){
      let alert = this.alertCtrl.create({
        title: 'Telefone inválido!',
        subTitle: 'Digite o telefone para entrarmos em contato e validar a criação do estabelecimento.',
        buttons: ['OK']
      });
      alert.present();
    } else if ( this.estilo == null ){
      let alert = this.alertCtrl.create({
        title: 'Categoria inválida!',
        subTitle: 'Selecione a categoria do seu estabelecimento.',
        buttons: ['OK']
      });
      alert.present();
    } else {
      this.nextPage();
    }
  }

  nextPage(){
    let params = {nome: this.nome,
                  email: this.email,
                  fone: this.fone,
                  estilo: this.estilo,
                  dias: this.dias,
                  hora: this.hora,
                  bar: this.bar,
                  cozinha: this.cozinha,
                  fum: this.fum,
                  wifi: this.wifi,
                  estac: this.estac,
                  acess: this.acess,
                  cartao: this.cartao,
                  dinheiro: this.dinheiro,
                  coins: this.coins,
                  valid: false};
    this.navCtrl.push(SetLocationCasaPage, params);
  }

}
