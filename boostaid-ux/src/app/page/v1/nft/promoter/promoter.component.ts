import { Component, effect, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { ConnectWalletComponent } from '../../../../component/connect-wallet/connect-wallet.component';
import { MatDialog } from '@angular/material/dialog';
import { PromoterNftService } from '../../../../shared/services/promoter-nft.service';
import { TwitterValidator, TwitterService } from '../../../../shared/services/twitter.service';
import { WalletService } from '../../../../shared/services/wallet.service';

@Component({
  selector: 'app-promoter',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    ConnectWalletComponent
  ],
  templateUrl: './promoter.component.html',
  styleUrl: './promoter.component.scss'
})
export class PromoterComponent {

  public twitterPostLinkFormControl = new FormControl('', [
    Validators.required,
    TwitterValidator.twitterPostLink()
  ]);

  public username: string = "";
  public postId: string = "";
  public twitterPostLinkBlockquote: string = "";

  public isLoggedIn = false;
  private walletService = inject(WalletService);

  public isNftMinted = false;

  constructor(
    private promoterNftService: PromoterNftService,
    private twitterService: TwitterService,
    public dialog: MatDialog
  ) {

    effect(() => {
      if (this.walletService.isLoggedIn()) {
        this.isLoggedIn = true;
      } else {
        this.isLoggedIn = false;
      }
    });
  }

  public onSubmit() {
    this.username = "";
    this.postId = "";
    this.twitterPostLinkBlockquote = "";

    setTimeout(() => {
      if (this.twitterPostLinkFormControl.valid && this.twitterPostLinkFormControl.value) {
        const urlDetails = this.twitterService.extractUsernameAndPostIdFromUrl(this.twitterPostLinkFormControl.value);
        if (urlDetails) {
          this.username = urlDetails.username;
          this.postId = urlDetails.postId;
          this.twitterPostLinkBlockquote = this.twitterService.generateLinkPostBlockquote(this.username, this.postId);
          this.twitterService.loadTwitterWidget("twitter-post-load");
        }
      }
    }, 200);
  }

  /// MINT NFT

  onMint() {
    this.promoterNftService.mintNft(this.username, this.postId).subscribe({
      next: txId => {
        console.log('Transaction Id: ', txId);
        this.isNftMinted = true;
      },
      error: error => {
        console.error("Error minting NFT:", error);
      }
    });
  }
}
