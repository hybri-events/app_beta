import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import firebase from 'firebase';
import { Mixpanel } from '@ionic-native/mixpanel';

@Component({
  selector: 'page-report-bug',
  templateUrl: 'report-bug.html',
})
export class ReportBugPage {
  area = '';
  descricao: string = "";
  lineHeight: any = 34;
  txtArea: any;
  @ViewChild('ionTxtArea') ionTxtArea;

  report: FirebaseListObservable<any>;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public db: AngularFireDatabase,
    public alertCtrl: AlertController,
    private mixpanel: Mixpanel
  ) {
    this.mixpanel.track("Reportar bug");
    this.report = db.list('/reportBug/')
  }

  reportBug() {
    this.report.push({area: this.area, desc: this.descricao, data: new Date().toISOString().slice(0,-1), uid: firebase.auth().currentUser.uid})
    let alert = this.alertCtrl.create({
      title: "Obrigado pela reportação!",
      message: "Esse bug será analisado e corrigido o mais rápido possível.",
      buttons: [{
        text: "OK",
        handler: () => {
          this.navCtrl.pop();
        }
      }]
    });
    alert.present();
  }

  ngAfterViewInit(){
    this.txtArea = this.ionTxtArea._elementRef.nativeElement.children[0];
    this.txtArea.style.height = this.lineHeight + "px";
  }

  onChange(newValue){
    this.txtArea.style.height = this.lineHeight + "px";
    this.txtArea.style.height =  this.txtArea.scrollHeight + "px";
  }

}
