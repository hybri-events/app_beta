import { Component } from '@angular/core'
import { NavController, NavParams } from 'ionic-angular';
import { Mixpanel } from '@ionic-native/mixpanel';

@Component({
  selector: 'page-tutorial',
  templateUrl: 'tutorial.html',
})
export class TutorialPage {

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private mixpanel: Mixpanel
  ) {
    this.mixpanel.track("Tutorial");
  }

  close(){
    this.navCtrl.pop();
  }

}
