import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { NewEstabPage } from '../new-estab/new-estab'

@Component({
  selector: 'page-create',
  templateUrl: 'create.html',
})
export class CreatePage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {

  }

  newEstab(){
    this.navCtrl.push(NewEstabPage,null);
  }

}
