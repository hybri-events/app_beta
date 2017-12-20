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
      me.facebook.login(['email','public_profile','user_friends']).then( (response) => {
        console.log("response",response);
        let token = response.authResponse.accessToken;
        const facebookCredential = firebase.auth.FacebookAuthProvider.credential(response.authResponse.accessToken);
        let params = new Array<string>();

        me.facebook.api("/me?fields=gender,birthday", params).then(function(profile) {
           console.log("profile",profile);
           firebase.auth().signInWithCredential(facebookCredential).then((success) => {
             console.log("success",success);
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
                   if ( profile.birthday != undefined ){
                     if ( profile.gender != undefined ){
                       me.userData.cadUserFace(success['displayName'], null, success['email'], success['photoURL'], profile.birthday, profile.gender, token);
                     } else {
                       me.userData.cadUserFace(success['displayName'], null, success['email'], success['photoURL'], profile.birthday, null, token);
                     }
                   } else {
                     if ( profile.gender != undefined ){
                       me.userData.cadUserFace(success['displayName'], null, success['email'], success['photoURL'], null, profile.gender, token);
                     } else {
                       me.userData.cadUserFace(success['displayName'], null, success['email'], success['photoURL'], null, null, token);
                     }
                   }

                   me.cont++;
                   me.splashScreen.show();
                   window.location.reload();
                 } else {
                   let usuario = me.db.list("usuario/"+uid);
                   usuario.forEach(u => {
                     if ( profile.birthday != undefined ){
                       if ( profile.gender != undefined ){
                         me.userData.updateLogin(u[0].$key,"https://graph.facebook.com/"+success["providerData"][0]["uid"]+"/picture?type=large&access_token="+token, profile.birthday, profile.gender, token);
                       } else {
                         me.userData.updateLogin(u[0].$key,"https://graph.facebook.com/"+success["providerData"][0]["uid"]+"/picture?type=large&access_token="+token, profile.birthday, null, token);
                       }
                     } else {
                       if ( profile.gender != undefined ){
                         me.userData.updateLogin(u[0].$key,"https://graph.facebook.com/"+success["providerData"][0]["uid"]+"/picture?type=large&access_token="+token, null, profile.gender, token);
                       } else {
                         me.userData.updateLogin(u[0].$key,"https://graph.facebook.com/"+success["providerData"][0]["uid"]+"/picture?type=large&access_token="+token, null, null, token);
                       }
                     }

                     me.cont++;
                     me.splashScreen.show();
                     window.location.reload();
                   })
                 }
               }
             });
           }).catch((error) => {
             me.loading.dismiss().then( () => {
               let alert = me.alertCtrl.create({
                 title: "Ocorreu um erro singin!",
                 message: me.err.messageError(error["code"]),
                 buttons: [{
                   text: "Ok",
                   role: 'cancel'
                 }]
               });
               alert.present();
             });
           });
        })
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

}
