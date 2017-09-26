import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Mixpanel } from '@ionic-native/mixpanel';

@Component({
  selector: 'page-add-organizador',
  templateUrl: 'add-organizador.html',
})
export class AddOrganizadorPage {
  param: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private mixpanel: Mixpanel
  ) {
    this.mixpanel.track("Adicionar organizador do evento");
    this.param = navParams.data;
    console.log(this.param);
  }

}
