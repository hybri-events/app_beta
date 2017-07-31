import { Component } from '@angular/core';
import { NavController, LoadingController, Loading, AlertController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthProvider } from '../../providers/auth/auth';
import { UserDataProvider } from '../../providers/user-data/user-data';
import { ContaProvider } from '../../providers/conta/conta';
import { ErrorProvider } from '../../providers/error/error';
import { EmailValidator } from '../../validators/email';
import { NameValidator } from '../../validators/name';
import { Facebook } from '@ionic-native/facebook';
import firebase from 'firebase';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AngularFireDatabase } from 'angularfire2/database';

@Component({
  selector: 'page-cadastro',
  templateUrl: 'cadastro.html'
})
export class CadastroPage {
  public signupForm:FormGroup;
  public loading:Loading;
  cont = 0;

  constructor(public navCtrl: NavController, public err: ErrorProvider, public splashScreen: SplashScreen, public db: AngularFireDatabase, private facebook: Facebook, public authData: AuthProvider, public userData: UserDataProvider, public contaData: ContaProvider, public formBuilder: FormBuilder, public alertCtrl: AlertController, public loadingCtrl: LoadingController) {
    this.signupForm = formBuilder.group({
      nome: ['', Validators.compose([Validators.required, NameValidator.isValid])],
      email: ['', Validators.compose([Validators.required, EmailValidator.isValid])],
      password: ['', Validators.compose([Validators.minLength(6), Validators.required])]
    });
  }

  signupUser(){
    if (!this.signupForm.valid){
      console.log(this.signupForm.value);
    } else {
      let user = firebase.auth().currentUser;
      let me = this;
      user.delete().then(function() {
        me.authData.signupUser(me.signupForm.value.email, me.signupForm.value.password).then((success) => {
          me.userData.cadUser(me.signupForm.value.nome, null, me.signupForm.value.email, 'http://usevou.com/profile/ft_perfil/padrao.png').then(() => {
            me.splashScreen.show();
            window.location.reload();
          }, (error) => {
            me.loading.dismiss().then( () => {
              let alert = me.alertCtrl.create({
                title: "Ocorreu um erro!",
                message: me.err.messageError(error["code"]),
                buttons: [{
                  text: "Ok",
                  role: 'cancel'
                }]
              });
              alert.present();
            });
          });
        }, (error) => {
          me.loading.dismiss().then( () => {
            let alert = me.alertCtrl.create({
              title: "Ocorreu um erro!",
              message: me.err.messageError(error["code"]),
              buttons: [{
                text: "Ok",
                role: 'cancel'
              }]
            });
            alert.present();
          });
        });

        me.loading = me.loadingCtrl.create({
          content: "Por favor, espere...",
          dismissOnPageChange: true,
        });
        me.loading.present();
      }, function(error) {
        console.log(error)
        this.loading.dismiss().then( () => {
          let alert = this.alertCtrl.create({
            title: "Ocorreu um erro!",
            message: this.err.messageError(error["code"]),
            buttons: [{
              text: "Ok",
              role: 'cancel'
            }]
          });
          alert.present();
        });
      });
    }
  }

  facebookLogin(): void {
    let user = firebase.auth().currentUser;
    let me = this;
    user.delete().then(function() {
      me.facebook.login(['email','public_profile']).then( (response) => {
        const facebookCredential = firebase.auth.FacebookAuthProvider.credential(response.authResponse.accessToken);

        firebase.auth().signInWithCredential(facebookCredential).then((success) => {
          let uid = success.uid;
          let user = me.db.list('/usuario/');
          let create = true;
          user.forEach(us => {
            if ( me.cont == 0 ){
              for ( let i=0;i<us.length;i++ ){
                if (us[i].$key == uid){
                  create = false;
                }
              }
              if ( create ){
                me.userData.cadUser(success['displayName'], null, success['email'], success['photoURL']);
                me.cont++;
                me.splashScreen.show();
                window.location.reload();
              } else {
                me.cont++;
                me.splashScreen.show();
                window.location.reload();
              }
            }
          });
        }).catch((error) => {
          me.loading.dismiss().then( () => {
            let alert = me.alertCtrl.create({
              title: "Ocorreu um erro!",
              message: me.err.messageError(error["code"]),
              buttons: [{
                text: "Ok",
                role: 'cancel'
              }]
            });
            alert.present();
          });
        });
      }).catch((error) => { console.log(error) });

      me.loading = me.loadingCtrl.create({
        content: "Por favor, espere...",
        dismissOnPageChange: true,
      });
      me.loading.present();
    }, function(error) {
      console.log(error)
      this.loading.dismiss().then( () => {
        let alert = this.alertCtrl.create({
          title: "Ocorreu um erro!",
          message: this.err.messageError(error["code"]),
          buttons: [{
            text: "Ok",
            role: 'cancel'
          }]
        });
        alert.present();
      });
    });
  }

}
