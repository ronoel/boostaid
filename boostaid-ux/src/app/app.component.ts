import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToolbarComponent } from './component/toolbar/toolbar.component';


import { openContractCall } from '@stacks/connect';
import { StacksTestnet } from '@stacks/network';
import { AnchorMode, PostConditionMode, Cl } from '@stacks/transactions';
import { FooterComponent } from "./component/footer/footer.component";
import { environment } from '../environments/environment';

// const appConfig = new AppConfig(['store_write', 'publish_data']);
// export const userSession = new UserSession({ appConfig }); // we will use this export from other files

// const myAppName = 'My Stacks Web-App'; // shown in wallet pop-up
// const myAppIcon = 'https://storage.googleapis.com/file.pulseb.com.br/assets/logo/v2/pulseb-2.png'; // shown in wallet pop-up


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    ToolbarComponent,
    FooterComponent
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  public readonly isProduction = environment.production;

  /**
   * Create Auction
   */
  onCreateAuction() {
    console.log('Creating auction');
    openContractCall({
      network: new StacksTestnet(),
      anchorMode: AnchorMode.Any, // which type of block the tx should be mined in

      contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
      contractName: 'auction',
      functionName: 'create-auction',
      functionArgs: [
        Cl.uint(1000),  // amount
        Cl.uint(1600),  // end-block
        Cl.uint(2),  // min-blocks-no-bid
        Cl.uint(100),  // lowest-bid-allowed
      ],

      postConditionMode: PostConditionMode.Deny, // whether the tx should fail when unexpected assets are transferred
      postConditions: [], // for an example using post-conditions, see next example

      onFinish: response => {
        // WHEN user confirms pop-up
        console.log('Response: ', response);
        console.log('Transaction Id: ', response.txId); // txId


      },
      onCancel: () => {
        // WHEN user cancels/closes pop-up
        console.log('User cancelled');
      }
    });
  }
}
