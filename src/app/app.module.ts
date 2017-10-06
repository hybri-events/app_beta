import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';

import { Geolocation } from '@ionic-native/geolocation';
import { Facebook } from '@ionic-native/facebook';
import { QRCodeModule } from 'angular2-qrcode';
import { Camera } from '@ionic-native/camera';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireDatabaseModule } from 'angularfire2/database';

import { MyApp } from './app.component';

import { CoinPage } from '../pages/coin/coin';
import { QrCodePage } from '../pages/qr-code/qr-code';

import { TutorialPage } from '../pages/tutorial/tutorial';

import { EventsPage } from '../pages/events/events';
import { IndicacaoPage } from '../pages/indicacao/indicacao';
import { EventDetailPage } from '../pages/event-detail/event-detail';
import { CriarEventoPage } from '../pages/criar-evento/criar-evento';
import { SetLocationEventPage } from '../pages/set-location-event/set-location-event';
import { AddOrganizadorPage } from '../pages/add-organizador/add-organizador';
import { AutocompletePage } from '../pages/autocomplete/autocomplete';
import { InvitePage } from '../pages/invite/invite';
import { EditLocationEventPage } from '../pages/edit-location-event/edit-location-event';
import { EditEventPage } from '../pages/edit-event/edit-event';

import { HomePage } from '../pages/home/home';

import { NotifyPage } from '../pages/notify/notify';

import { TabsPage } from '../pages/tabs/tabs';

import { PerfilEstabPage } from '../pages/perfil-estab/perfil-estab';
import { PerfilPage } from '../pages/perfil/perfil';
import { MyEventPage } from '../pages/my-event/my-event';
import { AgendaPage } from '../pages/agenda/agenda';
import { InvitesPage } from '../pages/invites/invites';
import { ReportBugPage } from '../pages/report-bug/report-bug';

import { PromocaoPage } from '../pages/promocao/promocao';
import { ListPromoPage } from '../pages/list-promo/list-promo';

import { InviteFriendsPage } from '../pages/invite-friends/invite-friends';
import { CreatePage } from '../pages/create/create';
import { SettingsPage } from '../pages/settings/settings';

import { NewEstabPage } from '../pages/new-estab/new-estab';
import { SetLocationCasaPage } from '../pages/set-location-casa/set-location-casa';
import { ListAdmPage } from '../pages/list-adm/list-adm';
import { EditListAdmPage } from '../pages/edit-list-adm/edit-list-adm';
import { EditCasaPage } from '../pages/edit-casa/edit-casa';
import { EditLocationCasaPage } from '../pages/edit-location-casa/edit-location-casa';
import { SwitchEventPage } from '../pages/switch-event/switch-event';

import { CadastroPage } from '../pages/cadastro/cadastro';
import { CodCadastroPage } from '../pages/cod-cadastro/cod-cadastro';
import { LoginPage } from '../pages/login/login';
import { ResetPasswordPage } from '../pages/reset-password/reset-password';

import { AuthProvider } from '../providers/auth/auth';
import { ErrorProvider } from '../providers/error/error';
import { ContaProvider } from '../providers/conta/conta';
import { EventoProvider } from '../providers/evento/evento';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { UserDataProvider } from '../providers/user-data/user-data';
import { PromoProvider } from '../providers/promo/promo';

import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { SocialSharing } from '@ionic-native/social-sharing';
import { OneSignal } from '@ionic-native/onesignal';
import { Geofence } from '@ionic-native/geofence';
import { Mixpanel, MixpanelPeople } from '@ionic-native/mixpanel';

const firebaseConfig = {
  apiKey: "AIzaSyDddpec8MwZts4DyXIRvR9t9kAtEU3Bgh0",
  authDomain: "api-4996752536673032512-480980.firebaseapp.com",
  databaseURL: "https://api-4996752536673032512-480980.firebaseio.com",
  projectId: "api-4996752536673032512-480980",
  storageBucket: "api-4996752536673032512-480980.appspot.com",
  messagingSenderId: "941134234980"
};

@NgModule({
  declarations: [
    MyApp,
    CoinPage,
    EventsPage,
    HomePage,
    NotifyPage,
    TabsPage,
    PerfilPage,
    CadastroPage,
    CodCadastroPage,
    LoginPage,
    ResetPasswordPage,
    MyEventPage,
    AgendaPage,
    CreatePage,
    InviteFriendsPage,
    SettingsPage,
    InvitesPage,
    QrCodePage,
    CriarEventoPage,
    SetLocationEventPage,
    AutocompletePage,
    AddOrganizadorPage,
    InvitePage,
    PromocaoPage,
    EventDetailPage,
    NewEstabPage,
    SetLocationCasaPage,
    EditCasaPage,
    EditEventPage,
    EditLocationCasaPage,
    EditLocationEventPage,
    ListPromoPage,
    TutorialPage,
    IndicacaoPage,
    ReportBugPage,
    ListAdmPage,
    EditListAdmPage,
    SwitchEventPage,
    PerfilEstabPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    QRCodeModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    CoinPage,
    EventsPage,
    HomePage,
    NotifyPage,
    TabsPage,
    PerfilPage,
    CadastroPage,
    CodCadastroPage,
    LoginPage,
    ResetPasswordPage,
    MyEventPage,
    AgendaPage,
    CreatePage,
    InviteFriendsPage,
    SettingsPage,
    InvitesPage,
    QrCodePage,
    CriarEventoPage,
    SetLocationEventPage,
    AutocompletePage,
    AddOrganizadorPage,
    InvitePage,
    PromocaoPage,
    EventDetailPage,
    NewEstabPage,
    SetLocationCasaPage,
    EditCasaPage,
    EditEventPage,
    EditLocationCasaPage,
    EditLocationEventPage,
    ListPromoPage,
    TutorialPage,
    IndicacaoPage,
    ReportBugPage,
    ListAdmPage,
    EditListAdmPage,
    SwitchEventPage,
    PerfilEstabPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Geolocation,
    Facebook,
    AuthProvider,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    UserDataProvider,
    ErrorProvider,
    ContaProvider,
    EventoProvider,
    Camera,
    BarcodeScanner,
    PromoProvider,
    BackgroundGeolocation,
    LocationAccuracy,
    SocialSharing,
    OneSignal,
    Geofence,
    Mixpanel,
    MixpanelPeople
  ]
})
export class AppModule {}
