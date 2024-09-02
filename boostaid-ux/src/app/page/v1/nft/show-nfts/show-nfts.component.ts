import { Component, effect, inject } from '@angular/core';
import { WalletService } from '../../../../shared/services/wallet.service';
import { MatButtonModule } from '@angular/material/button';
import { ConnectWalletComponent } from "../../../../component/connect-wallet/connect-wallet.component";
import { FundraiserNftService } from '../../../../shared/services/fundraiser-nft.service';
import { FundraiserNftComponent } from "../../../../component/nft/fundraiser-nft/fundraiser-nft.component";
import { PromoterNftService } from '../../../../shared/services/promoter-nft.service';
import { PromoterNftComponent } from "../../../../component/nft/promoter-nft/promoter-nft.component";

@Component({
  selector: 'app-show-nfts',
  standalone: true,
  imports: [
    MatButtonModule,
    ConnectWalletComponent,
    FundraiserNftComponent,
    PromoterNftComponent
  ],
  templateUrl: './show-nfts.component.html',
  styleUrl: './show-nfts.component.scss'
})
export class ShowNftsComponent {

  public isLoggedIn = false;
  private walletService = inject(WalletService);

  public fundraserTokens: Array<number> = [];
  public promoterTokens: Array<number> = [];

  constructor(
    private fundraiserNftService: FundraiserNftService,
    private promoterNftService: PromoterNftService
  ) {
    effect(() => {
      if (this.walletService.isLoggedIn()) {
        this.isLoggedIn = true;
        this.loadNfts();
      } else {
        this.isLoggedIn = false;
      }
    });
  }

  // connectWallet() {
  //   this.walletService.signIn();
  // }

  loadNfts() {
    this.fundraiserNftService.getTokensID().subscribe({
      next: tokens => {
        this.fundraserTokens = tokens;
      },
      error: error => {
        console.error("Error fetching tokens:", error);
      }
    });
    this.promoterNftService.getTokensID().subscribe({
      next: tokens => {
        this.promoterTokens = tokens;
      },
      error: error => {
        console.error("Error fetching tokens:", error);
      }
    });
  }

}


