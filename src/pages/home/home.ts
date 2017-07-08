import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  maps: string = "map";
  plat: any;

  constructor(platform: Platform, public navCtrl: NavController) {
    this.plat = platform;
  }

}
