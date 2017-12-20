import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, Content, AlertController, LoadingController, Loading } from 'ionic-angular';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { Mixpanel } from '@ionic-native/mixpanel';
import { SetLocationCasaPage } from '../set-location-casa/set-location-casa';
import { ListAdmPage } from '../list-adm/list-adm';
import { EventoProvider } from '../../providers/evento/evento';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import firebase from 'firebase';

declare var google;

@Component({
  selector: 'page-edit-casa',
  templateUrl: 'edit-casa.html',
})
export class EditCasaPage {
  tab = "geral";
  @ViewChild('map') mapElement: ElementRef;
  map;
  marker;
  callbackLocation;
  callbackAdm;
  shownGroup = null;
  permissoes = [];
  vEditPerm = null;
  @ViewChild(Content) content:Content;
  public currentScroll = 0;
  interval;
  public loading:Loading;
  url;
  public e;

  //image
  img = {'capa':'', 'perfil': 'assets/estab_default.png'};
  public currentImg = {'capa':'', 'perfil': 'assets/estab_default.png'};
  id;
  casa: FirebaseListObservable<any>;

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
  valid = false;
  adms = [];
  public currentAdms = [];

  //descricao
  desc: string = "";
  public currentDesc = "";
  lineHeight: any = 48;
  txtArea: any;
  @ViewChild('ionTxtArea') ionTxtArea;

  //tags
  tags: any = [];
  public currentTags: any = [];
  cidtag: number = 0;
  tagname: string;

  //preco
  faixa = {lower: 0, upper: 0};
  public currentFaixa = {lower: 0, upper: 0};
  sel_faixa: any = 0;

  lat;
  lng;


  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    public db: AngularFireDatabase,
    private camera: Camera,
    private mixpanel: Mixpanel,
    public event: EventoProvider,
    public http: Http,
    public loadingCtrl: LoadingController
  ) {
    this.mixpanel.track("Editar estabelecimento");
    this.id = navParams.data.id;

    this.callbackLocation = (_params) => {
     return new Promise((resolve, reject) => {
       this.lat = _params.lat;
       this.lng = _params.lng;
       let latLng = new google.maps.LatLng(this.lat, this.lng);
       this.map.setCenter(latLng)
       this.marker.setPosition(latLng);
       resolve();
     });
    }

    this.callbackAdm = (_params) => {
     return new Promise((resolve, reject) => {
       this.adms = _params.adms;
       this.toggleGroup(this.adms.length-1);
       resolve();
     });
    }
  }

  validEmail(email): boolean{
    const re = /[a-zA-Z0-9_.]+@[a-zA-Z_.]+?\.[a-zA-Z]{2,3}$/.test(email);

    if (re){
      return false;
    }

    return true;

  }

  ionViewDidLoad(){
    this.changeTabs();
    this.casa = this.db.list('/casas/'+this.id);
    let sub = this.casa.subscribe(ca => {
      for ( let i=0;i<ca.length;i++ ){
        if ( ca[i].$key == 'acess' ){
          this.acess = ca[i].$value;
        } else if ( ca[i].$key == 'adms' ){
          for ( let j=0;j<ca[i].length;j++ ){
            this.adms[j] = ca[i][j];
            this.currentAdms[j] = ca[i][j];
          }
        } else if ( ca[i].$key == 'bar' ){
          this.bar = ca[i].$value;
        } else if ( ca[i].$key == 'capa' ){
          this.img['capa'] = ca[i].$value;
          this.currentImg['capa'] = ca[i].$value;
          if ( this.img['capa'][0] == 'h' ){
            document.getElementById("foto_capa_evento").style.backgroundImage = "url("+this.img['capa']+")";
          }
        } else if ( ca[i].$key == 'cartao' ){
          this.cartao = ca[i].$value;
        } else if ( ca[i].$key == 'coins' ){
          this.coins = ca[i].$value;
        } else if ( ca[i].$key == 'cozinha' ){
          this.cozinha = ca[i].$value;
        } else if ( ca[i].$key == 'desc' ){
          this.desc = ca[i].$value;
          this.currentDesc = ca[i].$value;
        } else if ( ca[i].$key == 'dias' ){
          this.dias = ca[i];
        } else if ( ca[i].$key == 'dinheiro' ){
          this.dinheiro = ca[i].$value;
        } else if ( ca[i].$key == 'email' ){
          this.email = ca[i].$value;
        } else if ( ca[i].$key == 'estac' ){
          this.estac = ca[i].$value;
        } else if ( ca[i].$key == 'estilo' ){
          this.estilo = ca[i].$value;
        } else if ( ca[i].$key == 'faixa' ){
          this.faixa = {lower: ca[i].lower, upper: ca[i].upper};
          this.currentFaixa = {lower: ca[i].lower, upper: ca[i].upper};
        } else if ( ca[i].$key == 'fone' ){
          this.fone = ca[i].$value;
        } else if ( ca[i].$key == 'fum' ){
          this.fum = ca[i].$value;
        } else if ( ca[i].$key == 'hora' ){
          this.hora = ca[i];
        } else if ( ca[i].$key == 'img' ){
          this.img['perfil'] = ca[i].$value;
          this.currentImg['perfil'] = ca[i].$value;
          if ( this.img['perfil'][0] == 'h' ){
            document.getElementById("foto_perfil_evento").style.backgroundImage = "url("+this.img['perfil']+")";
          }
        } else if ( ca[i].$key == 'lat' ){
          this.lat = ca[i].$value;
        } else if ( ca[i].$key == 'lng' ){
          this.lng = ca[i].$value;
        } else if ( ca[i].$key == 'nome' ){
          this.nome = ca[i].$value;
        } else if ( ca[i].$key == 'permissoes' ){
          this.permissoes = ca[i];
        } else if ( ca[i].$key == 'valid' ){
          this.valid = ca[i].$value;
        } else if ( ca[i].$key == 'wifi' ){
          this.wifi = ca[i].$value;
        } else if ( ca[i].$key == 'tags' ){
          this.tags = ca[i];
          this.currentTags = ca[i];
        }
      }
    })
    sub.unsubscribe();
  }

  ngAfterViewInit() {
    this.content.ionScroll.subscribe((data) => {
      this.currentScroll = data.scrollTop;
      let h = document.getElementById('tool_edit_casa').offsetHeight;
      if ( data.scrollTop < document.getElementById('button_capa').offsetHeight ){
        let op = data.scrollTop / document.getElementById('button_capa').offsetHeight;
        document.getElementById('button_capa').style.backgroundImage = 'linear-gradient(rgba(101,44,144,'+(0.2 + (op * 0.8))+'),rgba(101,44,144,'+(0.8 + (op * 0.2))+'))';
        document.getElementById('tabs_edit_casa').style.backgroundColor = 'rgba(101,44,144,'+(0.8 + (op * 0.2))+')';
        document.getElementById('tabs_edit_casa').style.position = 'initial';
        document.getElementById('tabs_edit_casa').style.top = '0px';
        document.getElementById('list').style.marginTop = '32px';
        document.getElementById('tool_edit_casa').classList.remove("sem_sombra");
      } else if ( data.scrollTop >= document.getElementById('button_capa').offsetHeight ) {
        document.getElementById('tabs_edit_casa').style.backgroundColor = 'rgba(101,44,144,1)';
        document.getElementById('tabs_edit_casa').style.position = 'fixed';
        document.getElementById('tabs_edit_casa').style.top = h+'px';
        document.getElementById('list').style.marginTop = (h + 48)+'px';
        document.getElementById('tool_edit_casa').classList.add("sem_sombra");
      }
    });
  }

  changeTabs(){
    if ( this.tab == 'geral' ){
      setTimeout(() => {
        this.loadMap(this.lat,this.lng);
      },500);
    } else if ( this.tab == 'sobre' ){
      setTimeout(() => {
        this.txtArea = this.ionTxtArea._elementRef.nativeElement.children[0];
        this.txtArea.style.height = this.lineHeight + "px";
      },500);
    }
  }

  setLocation(){
    this.navCtrl.push(SetLocationCasaPage, {lat: this.lat, lng: this.lng, callback: this.callbackLocation });
  }

  loadMap(lat, lng){
    let latLng = new google.maps.LatLng(lat, lng);

    let mapOptions = {
      center: latLng,
      zoom: 15,
      disableDefaultUI: true,
      mapTypeControl: false,
      scaleControl: false,
      zoomControl: false,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      draggable: false
    }

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    let iconS = {
      url: 'assets/ic_pin_n.png',
      size: new google.maps.Size(36, 36)
    };
    this. marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: new google.maps.LatLng(lat, lng),
      icon: iconS
    });
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
    } else {
      this.saveEstab();
    }
  }

  saveEstab(){
    this.loading = this.loadingCtrl.create({
      content: "Salvando alterações, aguarde...",
      dismissOnPageChange: true,
    });
    this.loading.present();
    var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + this.lat + "," + this.lng;
    this.http.get(url).map(res => res.json()).subscribe(data => {
      let cidade;

      for ( let j=0;j<data.results[0].address_components.length;j++ ){
        for ( let k=0;k<data.results[0].address_components[j].types.length;k++ ){
          if ( data.results[0].address_components[j].types[k] == 'locality' ){
            cidade = data.results[0].address_components[j].long_name;
          }
        }
      }

      let index = this.id.indexOf("/")
      let uid = this.id.slice(0,index)
      let key = this.id.slice((index+1),this.id.length);
      let casa = this.db.list("casas/"+uid);
      let param = {
        acess: this.acess,
        adms: this.adms,
        bar: this.bar,
        capa: this.img['capa'],
        cartao: this.cartao,
        cidade: cidade,
        coins: this.coins,
        cozinha: this.cozinha,
        desc: this.desc,
        dias: this.dias,
        dinheiro: this.dinheiro,
        email: this.email,
        estac: this.estac,
        estilo: this.estilo,
        faixa: this.faixa,
        fone: this.fone,
        fum: this.fum,
        hora: this.hora,
        img: this.img['perfil'],
        lat: this.lat,
        lng: this.lng,
        nome: this.nome,
        permissoes: this.permissoes,
        tags: this.tags,
        valid: this.valid,
        wifi: this.wifi
      };
      casa.update(key,param);

      this.url = this.img['perfil'];
      if ( this.img['perfil'] != 'assets/estab_default.png' && this.img['perfil'][0] != 'h' ){
        this.event.saveImgEstab(key,this.img['perfil']).then((savedPicture) => {
          this.url = savedPicture.downloadURL;
          firebase.database().ref('/casas/'+uid+'/').child(key).child('img').set(savedPicture.downloadURL);
        });
      }
      if ( this.img['capa'] != 'assets/estab_default.png' && this.img['capa'][0] != 'h' ){
        this.event.saveCapaEstab(key,this.img['capa']).then((savedPicture) => {
          firebase.database().ref('/casas/'+uid+'/').child(key).child('capa').set(savedPicture.downloadURL);
        });
      }

      for (let i=0;i<this.adms.length;i++){
        let k = 0;
        for ( k;k<this.currentAdms.length;k++ ){
          if ( this.currentAdms[k].uid == this.adms[i].uid ){
            break;
          }
        }
        if ( k == this.currentAdms.length ){
          let usu = this.db.list("usuario/"+this.adms[i].uid+"/estab");
          usu.push({id: this.id});
        }
      }

      for (let m=0;m<this.currentAdms.length;m++){
        let k = 0;
        for ( k;k<this.adms.length;k++ ){
          if ( this.currentAdms[m].uid == this.adms[k].uid ){
            break;
          }
        }
        if ( k == this.adms.length ){
          let usu = this.db.list("usuario/"+this.currentAdms[m].uid+"/estab");
          usu.subscribe(u => {
            for ( let j=0;j<u.length;j++ ){
              if ( u[j].id == this.id && usu != null ){
                console.log("remove")
                usu.remove(u[j].$key);
                usu = null;
                break;
              }
            }
          })
        }
      }

      let eventos = this.db.list("casas/"+this.id+"/eventos",{
        query: {
          orderByChild: 'dt',
          startAt: new Date().toISOString()
        }
      })
      let s = eventos.subscribe(evento => {
        this.e = evento;
        var date = new Date(evento[0].dt);
        date.setDate(date.getDate() - date.getDay());
        var date2 = new Date(evento[evento.length-1].dt);
        var timeDiff = Math.abs(date2.getTime() - date.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

        for ( let i=0;i<(diffDays+1);i++ ){
          let tzoffset = date.getTimezoneOffset() * 60000;
          date = new Date(new Date(evento[0].dt).getTime());
          date.setDate(date.getDate() - date.getDay());
          date.setDate(date.getDate()+i);
          let sem = ["dom","seg","ter","qua","qui","sex","sab"];
          let semana = ["Domingo","Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado"];
          let mes = ["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];
          let d = date.getDay();

          if (this.dias[sem[d]]){
            let j = 0;
            let even = evento[0].dt;
            for ( j;j<this.e.length;j++ ){
              let dt = new Date(this.e[j].dt).toISOString();
              if ( dt.slice(0,-13) == date.toISOString().slice(0,-13) ){
                let index = this.e[j].id.lastIndexOf("/")
                let path = this.e[j].id.slice(0,index);
                let keyEvent = this.e[j].id.slice((index+1),this.e[j].id.length);
                let eve = this.db.list("eventos/"+path);

                let sub = eve.subscribe(ev => {
                  for ( let m=0;m<ev.length;m++ ){
                    if ( ev[m].$key == keyEvent ){
                      var date = new Date(even);
                      date.setDate(date.getDate() - date.getDay());
                      date.setDate(date.getDate()+i);

                      let dti = new Date(date.getTime() - tzoffset);
                      dti.setHours(this.hora[sem[d]].ini.slice(0,2))
                      dti.setMinutes(this.hora[sem[d]].ini.slice(3,5))
                      dti.setTime(dti.getTime() - tzoffset)
                      let di = new Date(dti.getTime() + tzoffset);

                      let dtf = new Date(date.getTime() - tzoffset);
                      dtf.setHours(this.hora[sem[d]].fim.slice(0,2))
                      dtf.setMinutes(this.hora[sem[d]].fim.slice(3,5))
                      dtf.setTime(dtf.getTime() - tzoffset)

                      if ( dti.toISOString() > dtf.toISOString() ){
                        dtf.setDate(dtf.getDate()+1);
                      }
                      let df = new Date(dtf.getTime() + tzoffset);

                      if ( this.url == 'assets/estab_default.png' ){
                        this.url = 'assets/event_default.png';
                      }
                      let evento = {
                        cidade: cidade,
                        coin: this.coins,
                        criador: uid+"/"+key,
                        dia: date.getDate(),
                        dt_fim: ("0"+df.getDate()).slice(-2)+"/"+("0"+(df.getMonth()+1)).slice(-2)+"/"+df.getFullYear(),
                        dt_ini: ("0"+di.getDate()).slice(-2)+"/"+("0"+(di.getMonth()+1)).slice(-2)+"/"+di.getFullYear(),
                        dtf: dtf.toISOString(),
                        dti: dti.toISOString(),
                        gat: "1",
                        hr_fim: this.hora[sem[d]].fim,
                        hr_ini: this.hora[sem[d]].ini,
                        lat: this.lat,
                        lng: this.lng,
                        mes: mes[date.getMonth()],
                        nome: semana[d]+" em "+this.nome,
                        nomeCriador: this.nome,
                        priv: "0",
                        pub: true
                      }

                      if ( this.desc != this.currentDesc && ev[m].desc == this.currentDesc ){
                        evento['desc'] = this.desc;
                      }
                      let f = {lower: ev[m].faixa_ini, upper: ev[m].faixa_fim};
                      if ( (this.faixa.lower != this.currentFaixa.lower || this.faixa.upper != this.currentFaixa.upper) &&
                            (f.lower == this.currentFaixa.lower || f.upper == this.currentFaixa.upper) ){
                        evento['faixa_fim'] = this.faixa.upper;
                        evento['faixa_ini'] = this.faixa.lower;
                      }
                      console.log(this.img['perfil'])
                      console.log(this.currentImg['perfil'])
                      if ( this.img['perfil'] != this.currentImg['perfil'] && ev[m].img == this.currentImg['perfil'] ){
                        evento['img'] = this.url;
                      }
                      console.log(this.tags)
                      console.log(this.currentTags)
                      if ( this.tags != this.currentTags && ev[m].tags == this.currentTags ){
                        evento['tags'] = this.tags;
                      }

                      eve.update(keyEvent,evento)
                      let estab = {
                        id: path+"/"+keyEvent,
                        dt: dti.toISOString()
                      }
                      eventos.update(this.e[j].$key,estab);
                    }
                  }
                  sub.unsubscribe();
                })
                break;
              }
            }
            if ( j == this.e.length ){
              var date = new Date(even);
              date.setDate(date.getDate() - date.getDay());
              date.setDate(date.getDate()+i);

              let dti = new Date(date.getTime() - tzoffset);
              dti.setHours(this.hora[sem[d]].ini.slice(0,2))
              dti.setMinutes(this.hora[sem[d]].ini.slice(3,5))
              dti.setTime(dti.getTime() - tzoffset)
              let di = new Date(dti.getTime() + tzoffset);

              let dtf = new Date(date.getTime() - tzoffset);
              dtf.setHours(this.hora[sem[d]].fim.slice(0,2))
              dtf.setMinutes(this.hora[sem[d]].fim.slice(3,5))
              dtf.setTime(dtf.getTime() - tzoffset)

              if ( dti.toISOString() > dtf.toISOString() ){
                dtf.setDate(dtf.getDate()+1);
              }
              let df = new Date(dtf.getTime() + tzoffset);

              if ( this.url == 'assets/estab_default.png' ){
                this.url = 'assets/event_default.png';
              }
              let evento = {
                cidade: cidade,
                coin: this.coins,
                criador: uid+"/"+key,
                desc: this.desc,
                dia: date.getDate(),
                dt_fim: ("0"+df.getDate()).slice(-2)+"/"+("0"+(df.getMonth()+1)).slice(-2)+"/"+df.getFullYear(),
                dt_ini: ("0"+di.getDate()).slice(-2)+"/"+("0"+(di.getMonth()+1)).slice(-2)+"/"+di.getFullYear(),
                dtf: dtf.toISOString(),
                dti: dti.toISOString(),
                faixa_fim: this.faixa.upper,
                faixa_ini: this.faixa.lower,
                gat: "1",
                hr_fim: this.hora[sem[d]].fim,
                hr_ini: this.hora[sem[d]].ini,
                img: this.url,
                lat: this.lat,
                lng: this.lng,
                mes: mes[date.getMonth()],
                nome: semana[d]+" em "+this.nome,
                nomeCriador: this.nome,
                priv: "0",
                pub: true,
                tags: this.tags
              }

              let path = cidade+"/"+di.getFullYear()+"/"+("0"+(di.getMonth()+1)).slice(-2)+"/"+("0"+di.getDate()).slice(-2);
              let eve = this.db.list("eventos/"+path)
              let keyEvent = eve.push(evento).key
              let estab = {
                id: path+"/"+keyEvent,
                dt: dti.toISOString()
              }
              let casa = this.db.list("casas/"+uid+"/"+key+"/eventos")
              casa.push(estab);
            }
          } else {
            for ( let j=0;j<this.e.length;j++ ){
              var date = new Date(evento[0].dt);
              date.setDate(date.getDate() - date.getDay());
              date.setDate(date.getDate()+i);
              let dt = new Date(this.e[j].dt).toISOString();
              if ( dt.slice(0,-13) == date.toISOString().slice(0,-13) ){
                let index = this.e[j].id.lastIndexOf("/")
                let path = this.e[j].id.slice(0,index);
                let keyEvent = this.e[j].id.slice((index+1),this.e[j].id.length);
                let eve = this.db.list("eventos/"+path);
                eve.remove(keyEvent);
                eventos.remove(this.e[j].$key)
                break;
              }
              if ( dt > date.toISOString() ){
                break;
              }
            }
          }
        }
        s.unsubscribe();
      })
      this.loading.dismiss();
      this.navCtrl.pop();
    });
  }

  selectAll(event){
    event.srcElement.select();
  }

  verifyTag(){
    if ( this.tagname.indexOf(" ") > -1 ){
      this.addTag();
    }
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

  openGallery(local){
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }

    this.camera.getPicture(options).then((imageData) => {
      let base64Image = 'data:image/jpeg;base64,' + imageData;
      this.img[local] = imageData;
      document.getElementById("foto_"+local+"_evento").style.backgroundImage = "url("+base64Image+")";
    }, (err) => {

    });
  }

  replicarData(ini,fim){
    this.hora.dom.ini = ini;
    this.hora.dom.fim = fim;
    this.hora.seg.ini = ini;
    this.hora.seg.fim = fim;
    this.hora.ter.ini = ini;
    this.hora.ter.fim = fim;
    this.hora.qua.ini = ini;
    this.hora.qua.fim = fim;
    this.hora.qui.ini = ini;
    this.hora.qui.fim = fim;
    this.hora.sex.ini = ini;
    this.hora.sex.fim = fim;
    this.hora.sab.ini = ini;
    this.hora.sab.fim = fim;
  }

  toggleGroup(group) {
    if (this.isGroupShown(group)) {
        this.shownGroup = null;
    } else {
        this.shownGroup = group;
    }
  }

  isGroupShown(group) {
    return this.shownGroup === group;
  }

  addPerm() {
    this.permissoes.push({nome: "Nova categoria", conta: false, evento: false, perfil: false, del: true})
    this.openEditPerm(this.permissoes.length-1)
  }

  delPerm(i){
    let confirm = this.alertCtrl.create({
      title: 'Excluir categoria',
      message: 'Tem certeza que deseja excluir essa categoria?',
      buttons: [
        {text: 'Não', handler: () => {}},
        {text: 'Sim', handler: () => {
          this.permissoes.splice(i,1);
        }}
      ]
    });
    confirm.present();
  }

  isEditPerm(i){
    return this.vEditPerm == i;
  }

  openEditPerm(i){
    this.vEditPerm = i;
  }

  editPerm(){
    this.vEditPerm = null;
  }

  addAdm(){
    this.navCtrl.push(ListAdmPage,{adms: this.adms, callback: this.callbackAdm})
  }

  delAdm(i){
    let confirm = this.alertCtrl.create({
      title: 'Excluir administrador',
      message: 'Tem certeza que deseja excluir esse administrador?',
      buttons: [
        {text: 'Não', handler: () => {}},
        {text: 'Sim', handler: () => {
          this.adms.splice(i,1)
        }}
      ]
    });
    confirm.present();
  }

}
