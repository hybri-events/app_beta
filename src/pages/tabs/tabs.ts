import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';

import { EventsPage } from '../events/events';
import { HomePage } from '../home/home';
import { CoinPage } from '../coin/coin';
import { NotifyPage } from '../notify/notify';

@Component({
  selector: 'page-tabs',
  templateUrl: 'tabs.html'
})
export class TabsPage {
  tab1Root = EventsPage;
  tab2Root = HomePage;
  tab3Root = CoinPage;
  tab4Root = NotifyPage;

  constructor(platform: Platform, public nav: NavController) {

  }
}
