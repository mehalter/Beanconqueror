import { Component, OnInit, ViewChild} from '@angular/core';
import {UIHelper} from '../../../services/uiHelper';
import {UIBrewStorage} from '../../../services/uiBrewStorage';
import {IBrew} from '../../../interfaces/brew/iBrew';
import {ModalController, NavParams, Platform} from '@ionic/angular';
import {Brew} from '../../../classes/brew/brew';
import moment from 'moment';
import {UIToast} from '../../../services/uiToast';
import {UIBrewHelper} from '../../../services/uiBrewHelper';
import {BrewBrewingComponent} from '../../../components/brews/brew-brewing/brew-brewing.component';
import {BrewTrackingService} from '../../../services/brewTracking/brew-tracking.service';
import BREW_TRACKING from '../../../data/tracking/brewTracking';
import {UIAnalytics} from '../../../services/uiAnalytics';


@Component({
  selector: 'brew-edit',
  templateUrl: './brew-edit.component.html',
  styleUrls: ['./brew-edit.component.scss'],
})
export class BrewEditComponent implements OnInit {


  public static COMPONENT_ID: string = 'brew-edit';
  @ViewChild('brewBrewing', {read: BrewBrewingComponent, static: false}) public brewBrewing: BrewBrewingComponent;
  public data: Brew = new Brew();


  constructor (private readonly modalController: ModalController,
               private readonly navParams: NavParams,
               private readonly uiBrewStorage: UIBrewStorage,
               private readonly uiHelper: UIHelper,
               private readonly uiToast: UIToast,
               private readonly platform: Platform,
               private readonly uiBrewHelper: UIBrewHelper,
               private readonly brewTracking: BrewTrackingService,
               private readonly uiAnalytics: UIAnalytics) {

    // Moved from ionViewDidEnter, because of Ionic issues with ion-range
    const brew: IBrew = this.uiHelper.copyData(this.navParams.get('brew'));

    if (brew !== undefined) {
      this.data.initializeByObject(brew);
    }

  }


  public dismiss(): void {
    this.modalController.dismiss({
      dismissed: true
    },undefined,BrewEditComponent.COMPONENT_ID);
  }

  public async updateBrew() {
    const newUnix = moment(this.brewBrewing.customCreationDate).unix();
    if (newUnix !== this.data.config.unix_timestamp) {
      this.data.config.unix_timestamp = newUnix;
    }
    this.uiBrewHelper.cleanInvisibleBrewData(this.data);

    if (this.brewBrewing.flow_profile_raw.weight.length > 0) {
      const savedPath = this.brewBrewing.saveFlowProfile(this.data.config.uuid);
      this.data.flow_profile = savedPath;
    }
    await this.uiBrewStorage.update(this.data);



    this.brewTracking.trackBrew(this.data);

    this.uiToast.showInfoToast('TOAST_BREW_EDITED_SUCCESSFULLY');
    this.uiAnalytics.trackEvent(BREW_TRACKING.TITLE, BREW_TRACKING.ACTIONS.EDIT_FINISH);
    this.dismiss();
  }

  public ngOnInit() {
    this.uiAnalytics.trackEvent(BREW_TRACKING.TITLE, BREW_TRACKING.ACTIONS.EDIT);
  }


}
