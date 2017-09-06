import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { EditLocationEventPage } from '../edit-location-event/edit-location-event';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Storage } from '@ionic/storage';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';

@Component({
  selector: 'page-edit-event',
  templateUrl: 'edit-event.html',
})
export class EditEventPage {
  //image
   img = "";

  //name
  nome: string = "";

  //dates
  tzoffset = (new Date()).getTimezoneOffset() * 60000;
  data = new Date(Date.now() - this.tzoffset);
  dt_ini = "";
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

  coin = false;

  casa: FirebaseListObservable<any>;
  coinsCasa = false;

  id;
  evento: FirebaseListObservable<any>;
  lat;
  lng;

  constructor(public navCtrl: NavController, public navParams: NavParams, private camera: Camera, public alertCtrl: AlertController, private storage: Storage, public db: AngularFireDatabase) {
    let mod = this.dia % 7;
    let div = parseInt((this.dia / 7)+"");
    if ( mod > 0 ){
      div++;
    }
    this.csem = this.tsem[this.data.getDay()] +" "+ this.cf[this.data.getDay()][div-1] +" "+ this.sem[this.data.getDay()];

    this.id = navParams.data.id;
    this.evento = db.list('/evento/'+this.id);

    this.storage.get('casa').then((val) => {
      if ( val != null ){

        this.casa = this.db.list("casas/"+val+"/");
        this.casa.forEach(ca => {
          ca.forEach(c => {
            if ( c.$key == 'coins' ){
              this.coinsCasa = c.$value;
            }
          });
        });
      }
    });
  }

  ionViewDidLoad(){
    this.evento.forEach(ev => {
      ev.forEach(e => {
        if ( e.$key == 'nome' ){
          this.nome = e.$value;
        }
        if ( e.$key == 'dti' ){
          this.dt_ini = e.$value;
        }
        if ( e.$key == 'dtf' ){
          if ( e.$value != '' ){
            this.termino = true;
            this.dt_fim = e.$value;
          }
        }
        if ( e.$key == 'desc' ){
          this.desc = e.$value;
        }
        if ( e.$key == 'tags' ){
          this.tags = e;
        }
        if ( e.$key == 'faixa_ini' ){
          this.faixa.lower = e.$value;
        }
        if ( e.$key == 'faixa_fim' ){
          this.faixa.upper = e.$value;
        }
        if ( e.$key == 'img' ){
          this.img = e.$value;
          if ( this.img[0] == 'h' ){
            document.getElementById("foto_evento").style.backgroundImage = "url("+this.img+")";
            document.getElementById("button").innerHTML = "Trocar imagem";
          }
        }
        if ( e.$key == 'gat' ){
          this.gatilho = e.$value;
        }
        if ( e.$key == 'lat' ){
          this.lat = e.$value;
        }
        if ( e.$key == 'lng' ){
          this.lng = e.$value;
        }
        if ( e.$key == 'coin' ){
          this.coin = e.$value;
        }
      });
    });
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
                    title: 'Faixa de preço inválida!',
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
    let dti = new Date(this.dt_ini);
    let datai = new Date(dti.getTime() + this.tzoffset);
    let dtf = new Date(this.dt_fim);
    let dataf = new Date(dtf.getTime() + this.tzoffset);
    let meses = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
    let mes = meses[datai.getMonth()];
    let params = {nome: this.nome,
                    dti: this.dt_ini,
                    termino: this.termino,
                    dt_ini: ('0'+datai.getDate()).slice(-2)+'/'+('0'+(datai.getMonth()+1)).slice(-2)+'/'+datai.getFullYear(),
                    hr_ini: ('0'+datai.getHours()).slice(-2)+':'+('0'+datai.getMinutes()).slice(-2),
                    dt_fim: (this.termino?('0'+dataf.getDate()).slice(-2)+'/'+('0'+(dataf.getMonth()+1)).slice(-2)+'/'+dataf.getFullYear():'null'),
                    hr_fim: (this.termino?('0'+dataf.getHours()).slice(-2)+':'+('0'+dataf.getMinutes()).slice(-2):'null'),
                    mes: mes,
                    dia: datai.getDate(),
                    dtf: this.dt_fim,
                    desc: this.desc,
                    tags: this.tags,
                    faixa_ini: this.faixa.lower,
                    faixa_fim: this.faixa.upper,
                    priv: this.priv,
                    pub: this.pub,
                    gat: this.gatilho,
                    coin: this.coin,
                    img: this.img,
                    lat: this.lat,
                    lng: this.lng,
                    id: this.id};
    this.navCtrl.push(EditLocationEventPage, params);
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
