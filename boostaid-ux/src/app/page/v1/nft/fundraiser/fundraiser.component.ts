import { Component, effect, inject } from '@angular/core';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { WalletService } from '../../../../shared/services/wallet.service';
import { FundraiserNftService } from '../../../../shared/services/fundraiser-nft.service';
import { TwitterService, TwitterValidator } from '../../../../shared/services/twitter.service';
import { MatDialog } from '@angular/material/dialog';
import { ConnectWalletComponent } from "../../../../component/connect-wallet/connect-wallet.component";
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-fundraiser',
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
  templateUrl: './fundraiser.component.html',
  styleUrl: './fundraiser.component.scss'
})
export class FundraiserComponent {

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
    private fundraiserNftService: FundraiserNftService,
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
    this.fundraiserNftService.mintNft(this.username, this.postId).subscribe({
      next: txId => {
        console.log('Transaction Id: ', txId);
        this.isNftMinted = true;
      },
      error: error => {
        console.error("Error minting NFT:", error);
      }
    });
  }

  // showNFT(nftId: number) {
  //   this.username = "";
  //   this.postId = "";
  //   this.twitterPostLinkBlockquote = "";

  //   this.fundraiserNftService.getMetadataByTokenId(nftId).subscribe({
  //     next: metadata => {
  //       setTimeout(() => {
  //         this.username = metadata.username;
  //         this.postId = metadata.postId;
  //         this.twitterPostLinkBlockquote = this.twitterService.generateLinkPostBlockquote(this.username, this.postId);
  //         this.twitterService.loadTwitterWidget("twitter-post-load");
  //       }, 200);
  //     },
  //     error: error => {
  //       console.error("Error fetching metadata:", error);
  //     }
  //   });
  // }

  // onGetMetadata1() {
  //   console.log('Getting Metadata');

  //   this.showNFT(1);
  // }

  // // Get Metadata
  // onGetMetadata2() {
  //   console.log('Getting Metadata');

  //   this.showNFT(2);
  // }

}
