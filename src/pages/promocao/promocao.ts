import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { CodCadastroPage } from '../cod-cadastro/cod-cadastro';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-promocao',
  templateUrl: 'promocao.html',
})
export class PromocaoPage {
  codcad = false;

  constructor(private storage: Storage, public navCtrl: NavController) {
    storage.get('codcad').then((val) => {
      this.codcad = val;
    });
  }

  openCodCadastro(){
    this.navCtrl.push(CodCadastroPage,null)
  }

}
