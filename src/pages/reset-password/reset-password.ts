import { Component } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthProvider } from '../../providers/auth/auth';
import { EmailValidator } from '../../validators/email';
import { Mixpanel } from '@ionic-native/mixpanel';

@Component({
  selector: 'page-reset-password',
  templateUrl: 'reset-password.html',
})
export class ResetPasswordPage {
  public resetPasswordForm:FormGroup;

  constructor(
    public navCtrl: NavController,
    public authData: AuthProvider,
    public formBuilder: FormBuilder,
    public alertCtrl: AlertController,
    private mixpanel: Mixpanel
  ) {
    this.mixpanel.track("Esqueceu a senha");
    this.resetPasswordForm = formBuilder.group({
      email: ['', Validators.compose([Validators.required, EmailValidator.isValid])],
    })
  }

  resetPassword(){
    if (!this.resetPasswordForm.valid){
      console.log(this.resetPasswordForm.value);
    } else {
      this.authData.resetPassword(this.resetPasswordForm.value.email).then((user) => {
        let alert = this.alertCtrl.create({
          message: "Foi enviado um link de redefinição de senha para seu e-mail.",
          buttons: [{
            text: "Ok",
            role: 'cancel',
            handler: () => {
              this.navCtrl.pop();
            }
          }]
        });
        alert.present();
      }, (error) => {
        var errorMessage: string = error.message;
        let errorAlert = this.alertCtrl.create({
          message: errorMessage,
          buttons: [{
            text: "Ok",
            role: 'cancel'
          }]
        });
        errorAlert.present();
      });
    }
  }

}
