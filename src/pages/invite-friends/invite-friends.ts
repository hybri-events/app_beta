import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavController, NavParams, Navbar } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import firebase from 'firebase/app';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'page-invite-friends',
  templateUrl: 'invite-friends.html',
})
export class InviteFriendsPage {
  codigo: FirebaseListObservable<any>;
  cod;

  @ViewChild('canvas') canvasEl : ElementRef;
  private _CANVAS  : any;
  private _CONTEXT : any;

  @ViewChild(Navbar) navBar: Navbar;

  width;
  base64Image;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private db: AngularFireDatabase,
    private socialSharing: SocialSharing,
    private storage: Storage
  ) {}

  ionViewDidLoad(){
    this.width = (document.body.clientWidth - 32) * 2;
    console.log(this.canvasEl);
    console.log(this.canvasEl.nativeElement);
    this._CANVAS = this.canvasEl.nativeElement;
    this._CANVAS.width = this.width;
    this._CANVAS.height = 600;

    this.codigo = this.db.list('promocoes/convite/');
    this.codigo.forEach(co => {
      co.forEach(c => {
        if ( c.uid == firebase.auth().currentUser.uid ){
          this.cod = c.cod;
          this.initialiseCanvas();
        }
      })
    });

    this.navBar.backButtonClick = (e:UIEvent)=>{
     this.clearCanvas();
     this.navCtrl.pop();
    }
  }

  initialiseCanvas(){
    console.log(this._CANVAS)
    if(this._CANVAS.getContext){
      this.setupCanvas();
    }
  }

  setupCanvas(){
    this._CONTEXT = this._CANVAS.getContext('2d');
    let grd = this._CONTEXT.createLinearGradient(0,600,this.width,0);
    grd.addColorStop(0, "#1B97C6");
    grd.addColorStop(1, "#652C90");
    this._CONTEXT.fillStyle = grd;
    this._CONTEXT.fillRect(0, 0, this.width, 600);
    this._CONTEXT.fillStyle = "white";
    this._CONTEXT.textAlign = "center";
    this._CONTEXT.font = "40px Lato-Medium";
    this._CONTEXT.fillText("Use meu código promocional", this._CANVAS.width/2, 96);
    this._CONTEXT.fillText("para ganhar V$25 😉", this._CANVAS.width/2, 148);
    this._CONTEXT.font = "100px Lato-Light";
    this._CONTEXT.fillText(this.cod, this._CANVAS.width/2, (this._CANVAS.height+100)/2);
    this._CONTEXT.strokeStyle = '#FFFFFF';
    this.roundRect(this._CONTEXT,this._CANVAS.width/2-225,(this._CANVAS.height-105)/2,450,132,20,false,true)

    let base_image = new Image();
    base_image.src = 'assets/logo_convite.png';
    base_image.onload = () => {
      this._CONTEXT.drawImage(base_image, (this._CANVAS.width/2)-67, 464);
    }
  }

  roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke == 'undefined') {
      stroke = true;
    }
    if (typeof radius === 'undefined') {
      radius = 5;
    }
    if (typeof radius === 'number') {
      radius = {tl: radius, tr: radius, br: radius, bl: radius};
    } else {
      var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
      for (var side in defaultRadius) {
        radius[side] = radius[side] || defaultRadius[side];
      }
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) {
      ctx.fill();
    }
    if (stroke) {
      ctx.stroke();
    }

  }

  clearCanvas(){
     this._CONTEXT.clearRect(0, 0, this._CANVAS.width, this._CANVAS.height);
     this.setupCanvas();
  }

  saveSharableImage(){
    let dataURL= this._CANVAS.toDataURL();
    this.base64Image = dataURL;
    this.shared();
  }

  shared(){
    this.storage.get('nomeUsu').then((val) => {
      let index = val.indexOf(' ');
      val = val.slice(0,index);
      console.log(val);
      this.socialSharing.share(
        val+' está lhe dando o convite promocional "'+this.cod+'" para descobrir as melhores festas e eventos ao seu redor e'+
          ' ainda ganhar descontos, com o Vou - Eventos e Descontos. Para utilizar esse código, faça seu cadastro no aplicativo'+
          ' e abra a aba códigos promocionais. Para baixar, acesse: ',
        'Você foi convidado para a Vou',
        this.base64Image,
        'http://www.usevou.com/download'
      );
    });
  }

}
