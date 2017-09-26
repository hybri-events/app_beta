import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ReportBugPage } from '../report-bug/report-bug';
import { Mixpanel } from '@ionic-native/mixpanel';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html',
})
export class SettingsPage {

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private mixpanel: Mixpanel
  ) {
    this.mixpanel.track("Configurações");
  }

  ionViewDidLoad() {

  }

  openBug(){
    this.navCtrl.push(ReportBugPage);
  }

}
