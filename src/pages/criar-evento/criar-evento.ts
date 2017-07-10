import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { SetLocationEventPage } from '../set-location-event/set-location-event';
import { Camera, CameraOptions } from '@ionic-native/camera';

@Component({
  selector: 'page-criar-evento',
  templateUrl: 'criar-evento.html',
})
export class CriarEventoPage {
  //image
   img = 'assets/event_default.png';

  //name
  nome: string = "";

  //dates
  tzoffset = (new Date()).getTimezoneOffset() * 60000;
  data = new Date(Date.now() - this.tzoffset);
  dt_ini = this.data.toISOString().slice(0,-1);
  dt_fim = "";
  termino: any = false;

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

  //priacidade
  priv: string = "0";
  info_priv = ["Esse evento poderá ser visto e acessado por qualquer pessoa próxima à localidade do mesmo.",
              "Esse evento apenas será visível para as pessoas que forem convidadas pelos organizadores do mesmo."];

  //publicacoes
  pub: any = true;

  //gatilho
  gatilho = 0;
  tsem = ["todo","toda","toda","toda","toda","toda","todo"];
  sem = ["domingo","segunda-feira","terça-feira","quarta-feira","quinta-feira","sexta-feira","sábado"];
  cf = [["primeiro","segundo","terceiro","quarto","último"],
        ["primeira","segunda","terceira","quarta","última"],
        ["primeira","segunda","terceira","quarta","última"],
        ["primeira","segunda","terceira","quarta","última"],
        ["primeira","segunda","terceira","quarta","última"],
        ["primeira","segunda","terceira","quarta","última"],
        ["primeiro","segundo","terceiro","quarto","última"]];
  meses = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
  dia = this.data.getDate();
  mes = this.meses[this.data.getMonth()];
  semana = this.tsem[this.data.getDay()] +" "+ this.sem[this.data.getDay()];
  csem;

  constructor(public navCtrl: NavController, public navParams: NavParams, private camera: Camera, public alertCtrl: AlertController) {
    let mod = this.dia % 7;
    let div = parseInt((this.dia / 7)+"");
    if ( mod > 0 ){
      div++;
    }
    this.csem = this.tsem[this.data.getDay()] +" "+ this.cf[this.data.getDay()][div-1] +" "+ this.sem[this.data.getDay()];
  }

  updateDt(){
    let date = new Date(this.dt_ini);
    console.log(date);
    this.dia = date.getDate();
    this.mes = this.meses[date.getMonth()];
    this.semana = this.tsem[date.getDay()] +" "+ this.sem[date.getDay()];
    let mod = this.dia % 7;
    let div = parseInt((this.dia / 7)+"");
    if ( mod > 0 ){
      div++;
    }
    this.csem = this.tsem[date.getDay()] +" "+ this.cf[date.getDay()][div-1] +" "+ this.sem[date.getDay()];
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
    let erro = 0;
    if ( this.trim(this.nome) == "" ){
      erro++;
      let alert = this.alertCtrl.create({
        title: 'Nome inválido!',
        subTitle: 'Determine um nome para seu evento.',
        buttons: ['OK']
      });
      alert.present();
    } else if (new Date(this.dt_ini) <= new Date(Date.now() - this.tzoffset)){
      erro++;
      let alert = this.alertCtrl.create({
        title: 'Data e hora inválida!',
        subTitle: 'Determine a data e hora de ínicio futura.',
        buttons: ['OK']
      });
      alert.present();
    } else if ( this.termino == true && this.dt_fim == "" ){
      erro++;
      let alert = this.alertCtrl.create({
        title: 'Data e hora de término inválidas!',
        subTitle: 'Determine a data e hora do fim do evento ou desmarque essa opção.',
        buttons: ['OK']
      });
      alert.present();
    } else if ( this.termino == true && new Date(this.dt_fim) <= new Date(this.dt_ini)){
      erro++;
      let alert = this.alertCtrl.create({
        title: 'Datas inválidas!',
        subTitle: 'A data e hora de término é menor ou igual à data de início.',
        buttons: ['OK']
      });
      alert.present();
    } else if (this.priv == "0" && this.tags.length == 0){
      erro++;
      let alert = this.alertCtrl.create({
        title: 'Adicione tags!',
        subTitle: 'Deseja adicionar algumas tags ao seu evento para facilitar a localização do mesmo?',
        buttons: [{text: 'Não', handler: () => {
          erro--;
          if (this.faixa.lower == 330 && this.faixa.upper == 660){
            erro++;
            let alert = this.alertCtrl.create({
              title: 'Faixa de preço',
              subTitle: 'Tem certeza que a faixa de preço dos ingressos é de R$330,00 à R$660,00?',
              buttons: [{text: 'Não', handler: () => {}},{text: 'Sim', handler: () => {
                erro--;
                if (this.faixa.lower > this.faixa.upper){
                  erro++;
                  let alert = this.alertCtrl.create({
                    title: 'Faixa de preço',
                    subTitle: 'O início da faixa de preço é maior que o fim.',
                    buttons: ['Ok']
                  });
                  alert.present();
                } else {
                  this.nextPage();
                }
              }}]
            });
            alert.present();
          } else if (this.faixa.lower > this.faixa.upper){
            erro++;
            let alert = this.alertCtrl.create({
              title: 'Faixa de preço',
              subTitle: 'O início da faixa de preço é maior que o fim.',
              buttons: ['Ok']
            });
            alert.present();
          } else {
            this.nextPage();
          }
        }},{text: 'Sim', handler: () => {}}]
      });
      alert.present();
    } else if (this.priv == "0" && this.faixa.lower == 330 && this.faixa.upper == 660){
      erro++;
      let alert = this.alertCtrl.create({
        title: 'Faixa de preço',
        subTitle: 'Tem certeza que a faixa de preço dos ingressos é de R$330,00 à R$660,00?',
        buttons: [{text: 'Não', handler: () => {}},{text: 'Sim', handler: () => {
          erro--;
          if (this.faixa.lower > this.faixa.upper){
            erro++;
            let alert = this.alertCtrl.create({
              title: 'Faixa de preço',
              subTitle: 'O início da faixa de preço é maior que o fim.',
              buttons: ['Ok']
            });
            alert.present();
          } else {
            this.nextPage();
          }
        }}]
      });
      alert.present();
    } else if (this.priv == "0" && this.faixa.lower > this.faixa.upper){
      erro++;
      let alert = this.alertCtrl.create({
        title: 'Faixa de preço',
        subTitle: 'O início da faixa de preço é maior que o fim.',
        buttons: ['Ok']
      });
      alert.present();
    } else {
      this.nextPage();
    }
  }

  nextPage(){
    let params = [{nome: this.nome,
                    dt_ini: this.dt_ini,
                    termino: this.termino,
                    dt_fim: this.dt_fim,
                    desc: this.desc,
                    tags: this.tags,
                    faixa: this.faixa,
                    priv: this.priv,
                    pub: this.pub,
                    gat: this.gatilho,
                    coin: false,
                    img: this.img}];
    this.navCtrl.push(SetLocationEventPage, params);
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
