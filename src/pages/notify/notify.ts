import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';

@Component({
  selector: 'page-notify',
  templateUrl: 'notify.html'
})
export class NotifyPage {
  plat: any;

  constructor(platform: Platform, public navCtrl: NavController) {
    this.plat = platform;
  }

}
