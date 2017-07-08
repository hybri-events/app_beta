import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

@Component({
  selector: 'page-add-organizador',
  templateUrl: 'add-organizador.html',
})
export class AddOrganizadorPage {
  param: any;

  constructor(public navCtrl: NavController, public navParams: NavParams) {
    this.param = navParams.data;
    console.log(this.param);
  }

}
