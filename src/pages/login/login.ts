import { Component } from '@angular/core';
import { NavController, LoadingController, Loading, AlertController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthProvider } from '../../providers/auth/auth';
import { UserDataProvider } from '../../providers/user-data/user-data';
import { ErrorProvider } from '../../providers/error/error';
import { EmailValidator } from '../../validators/email';
import { CodCadastroPage } from '../cod-cadastro/cod-cadastro';
import { ResetPasswordPage } from '../reset-password/reset-password';
import { Facebook } from '@ionic-native/facebook';
import firebase from 'firebase';
import { SplashScreen } from '@ionic-native/splash-screen';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
  loginForm:FormGroup;
  loading:Loading;

  constructor(public navCtrl: NavController, public err: ErrorProvider, public splashScreen: SplashScreen, private facebook: Facebook, public authData: AuthProvider, public userData: UserDataProvider, public formBuilder: FormBuilder, public alertCtrl: AlertController, public loadingCtrl: LoadingController) {
    this.loginForm = formBuilder.group({
      email: ['', Validators.compose([Validators.required, EmailValidator.isValid])],
      password: ['', Validators.compose([Validators.required])]
    });
  }

  loginUser(){
    if (!this.loginForm.valid){
      console.log(this.loginForm.value);
    } else {
      let user = firebase.auth().currentUser;
      let me = this;
      user.delete().then(function() {
        me.authData.loginUser(me.loginForm.value.email, me.loginForm.value.password).then( authData => {
          me.splashScreen.show();
          window.location.reload();
        }, error => {
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
          me.splashScreen.show();
          window.location.reload();
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
      }).catch((error) => {
        alert(JSON.stringify(error));
        me.loading.dismiss().then( () => {
          let alert = this.alertCtrl.create({
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

  goToResetPassword(){
    this.navCtrl.push(ResetPasswordPage);
  }

  createAccount(){
    this.navCtrl.pop();
    this.navCtrl.push(CodCadastroPage);
  }

}
