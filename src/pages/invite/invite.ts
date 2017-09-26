import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Mixpanel } from '@ionic-native/mixpanel';

@Component({
  selector: 'page-invite',
  templateUrl: 'invite.html',
})
export class InvitePage {

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private mixpanel: Mixpanel
  ) {
    this.mixpanel.track("Convites de eventos");
  }

}
