import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { ListAdmPage } from '../list-adm/list-adm';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Mixpanel } from '@ionic-native/mixpanel';

@Component({
  selector: 'page-new-estab',
  templateUrl: 'new-estab.html',
})
export class NewEstabPage {
  //image
  img = 'assets/estab_default.png';
  nome: string = "";
  email: string = "";
  fone: string = "";
  estilo = null;

  dias = {seg: false, ter: false, qua: false, qui: false, sex: false, sab: false, dom: false};
  hora = {seg: {ini: "00:00", fim: "00:00"},
          ter: {ini: "00:00", fim: "00:00"},
          qua: {ini: "00:00", fim: "00:00"},
          qui: {ini: "00:00", fim: "00:00"},
          sex: {ini: "00:00", fim: "00:00"},
          sab: {ini: "00:00", fim: "00:00"},
          dom: {ini: "00:00", fim: "00:00"}};

  bar = false;
  cozinha = false;
  fum = false;
  wifi = false;
  estac = false;
  acess = false;

  cartao = false;
  dinheiro = false;
  coins = false;

  //descricao
  desc: string = "";
  lineHeight: any = 34;
  txtArea: any;
  @ViewChild('ionTxtArea') ionTxtArea;

  //tags
  tags: any = [];
  cidtag: number = 0;
  tagname: string;

  //preco
  faixa = {lower: 330, upper: 660};
  sel_faixa: any = 0;


  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    private camera: Camera,
    private mixpanel: Mixpanel
  ) {
    this.mixpanel.track("Criar estabelecimento");
  }

  validEmail(email): boolean{
    const re = /[a-zA-Z0-9_.]+@[a-zA-Z_.]+?\.[a-zA-Z]{2,3}$/.test(email);

    if (re){
      return false;
    }

    return true;

  }

  ngAfterViewInit(){
    this.txtArea = this.ionTxtArea._elementRef.nativeElement.children[0];
    this.txtArea.style.height = this.lineHeight + "px";
  }

  onChange(newValue){
    this.txtArea.style.height = this.lineHeight + "px";
    this.txtArea.style.height =  this.txtArea.scrollHeight + "px";
  }

  trim(str){
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
  }

  continuar(){
    if ( this.trim(this.nome) == "" ){
      let alert = this.alertCtrl.create({
        title: 'Nome inválido!',
        subTitle: 'Digite o nome do estabelecimento.',
        buttons: ['OK']
      });
      alert.present();
    } else if ( this.trim(this.email) == "" ){
      let alert = this.alertCtrl.create({
        title: 'E-mail inválido!',
        subTitle: 'Digite o e-mail empresarial do estabelecimento.',
        buttons: ['OK']
      });
      alert.present();
    } else if ( this.validEmail(this.trim(this.email)) ){
      let alert = this.alertCtrl.create({
        title: 'E-mail inválido!',
        subTitle: 'Digite um e-mail válido.',
        buttons: ['OK']
      });
      alert.present();
    } else if ( this.trim(this.fone) == "" ){
      let alert = this.alertCtrl.create({
        title: 'Telefone inválido!',
        subTitle: 'Digite o telefone para entrarmos em contato e validar a criação do estabelecimento.',
        buttons: ['OK']
      });
      alert.present();
    } else if ( this.estilo == null ){
      let alert = this.alertCtrl.create({
        title: 'Categoria inválida!',
        subTitle: 'Selecione a categoria do seu estabelecimento.',
        buttons: ['OK']
      });
      alert.present();
    } else if ( parseInt(""+this.faixa.lower) == 330 && parseInt(""+this.faixa.upper) == 660 ){
      let alert = this.alertCtrl.create({
        title: 'Faixa de preço!',
        subTitle: 'Tem certeza que a faixa de preço é entre R$330,00 e R$660,00?',
        buttons: [{text: 'Não', handler: () => {}},{text: 'Sim', handler: () => {
          this.nextPage();
        }}]
      });
      alert.present();
    } else {
      this.nextPage();
    }
  }

  nextPage(){
    let params = {nome: this.nome,
                  email: this.email,
                  fone: this.fone,
                  estilo: this.estilo,
                  dias: this.dias,
                  hora: this.hora,
                  bar: this.bar,
                  cozinha: this.cozinha,
                  fum: this.fum,
                  wifi: this.wifi,
                  estac: this.estac,
                  acess: this.acess,
                  cartao: this.cartao,
                  dinheiro: this.dinheiro,
                  coins: this.coins,
                  valid: false,
                  desc: this.desc,
                  faixa: this.faixa,
                  tags: this.tags,
                  img: this.img};
    this.navCtrl.push(ListAdmPage, params);
  }

  addTag(){
    this.cidtag++;
    this.tags.push({id: this.cidtag, nome: this.tagname});
    this.tagname = "";
  }

  delTag(id){
    for(let i = 0; i < this.tags.length; i++) {
      if(this.tags[i].id === id) {
        this.tags.splice(i, 1);
      }
    }
  }

  openGallery(){
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }

    this.camera.getPicture(options).then((imageData) => {
      let base64Image = 'data:image/jpeg;base64,' + imageData;
      this.img = imageData;
      document.getElementById("foto_evento").style.backgroundImage = "url("+base64Image+")";
      document.getElementById("button").innerHTML = "Trocar imagem";
    }, (err) => {

    });
  }

}
