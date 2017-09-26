import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Mixpanel } from '@ionic-native/mixpanel';

@Component({
  selector: 'page-agenda',
  templateUrl: 'agenda.html',
})
export class AgendaPage {

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private mixpanel: Mixpanel
  ) {
    this.mixpanel.track("Agenda");
  }

  ionViewDidLoad() {

  }

}
