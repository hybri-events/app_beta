import { Injectable } from '@angular/core';

@Injectable()
export class ErrorProvider {

  constructor() {}

  messageError(cod): string{
    if ( cod == "auth/network-request-failed" ){
      return "Você não está conectado à internet. Conecte-se e tente novamente.";
    }

    if ( cod == "auth/user-not-found" ){
      return "Não foi encontrado um usuário com esse e-mail.";
    }

    if ( cod == "auth/wrong-password" ){
      return "Senha inválida.";
    }

    if ( cod == "auth/email-already-in-use" ){
      return "E-mail já cadastrado.";
    }

    if ( cod == "auth/account-exists-with-different-credential" ){
      return "Uma conta com o mesmo e-mail já está cadastrada.";
    }

    return "Erro: " + cod;
  }

}
