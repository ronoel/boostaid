import { Component, effect, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { WalletService } from '../../../../shared/services/wallet.service';
import { ConnectWalletComponent } from "../../../../component/connect-wallet/connect-wallet.component";
import { RouterLink } from '@angular/router';
import { TwitterService } from '../../../../shared/services/twitter.service';
import { CampaignCreateParams, FundingCampaignService } from '../../../../shared/services/funding-campaign.service';
import { FundraiserNftService } from '../../../../shared/services/fundraiser-nft.service';

@Component({
  selector: 'app-campaign-create',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ConnectWalletComponent
  ],
  templateUrl: './campaign-create.component.html',
  styleUrls: ['./campaign-create.component.scss']
})
export class CampaignCreateComponent implements OnInit {

  isProcessing = true;

  campaignForm: FormGroup;
  isLoggedIn = false;
  private walletService = inject(WalletService);
  twitterPostLinkBlockquote: string = "";
  private twitterService = inject(TwitterService);

  fundraserToken!: number;

  constructor(
     private fundingCampaignService: FundingCampaignService,
     private fundraiserNftService: FundraiserNftService
  ) {
    this.campaignForm = new FormGroup({
      metadata: new FormControl('', [Validators.required, Validators.maxLength(100)]),
      goalMin: new FormControl('', [Validators.required, Validators.min(1)]),
      goalMain: new FormControl('', [Validators.required, Validators.min(1)]),
      endBlock: new FormControl('', [Validators.required, Validators.min(1)])
    });

    effect(() => {
      if (this.walletService.isLoggedIn()) {
        this.isLoggedIn = true;
        this.loadNfts();
      } else {
        this.isLoggedIn = false;
        this.isProcessing = false;
      }
    });
  }

  ngOnInit(): void {
    this.isLoggedIn = this.walletService.isLoggedIn();
    this.campaignForm.get('metadata')?.valueChanges.subscribe(value => {
      this.onMetadataChange(value);
    });
  }

  onMetadataChange(value: string): void {
    this.twitterPostLinkBlockquote = "";
    if (this.campaignForm.get('metadata')?.valid && value) {
      const urlDetails = this.twitterService.extractUsernameAndPostIdFromUrl(value);
      if (urlDetails) {
        const { username, postId } = urlDetails;
        this.twitterPostLinkBlockquote = this.twitterService.generateLinkPostBlockquote(username, postId);
        this.twitterService.loadTwitterWidget("twitter-post-load");
      }
    }
  }

  loadNfts() {
    this.fundraiserNftService.getTokensID().subscribe({
      next: tokens => {
        if(tokens.length > 0){
          this.fundraserToken = tokens[0];
        }
        this.isProcessing = false;
      },
      error: error => {
        console.error("Error fetching tokens:", error);
      }
    });
  }

  onSubmit(): void {
    if (this.campaignForm.valid && this.fundraserToken) {
      const metadata = this.campaignForm.get('metadata')?.value;
      const goalMin = this.campaignForm.get('goalMin')?.value;
      const goalMain = this.campaignForm.get('goalMain')?.value;
      const endBlock = this.campaignForm.get('endBlock')?.value;
      const ownerTokenId = this.fundraserToken;

      const urlDetails = this.twitterService.extractUsernameAndPostIdFromUrl(metadata);
      if (!urlDetails) {
        console.error("Invalid Twitter URL");
        return;
      }

      const { username, postId } = urlDetails;

      const campaignParams: CampaignCreateParams = {
        xPost: {
          username,
          postId
        },
        goalMin,
        goalMain,
        endBlock,
        ownerTokenId
      };

      this.fundingCampaignService.createCampaign(campaignParams).subscribe({
        next: (response) => {
          console.log("Campaign created successfully:", response);
        },
        error: (error) => {
          console.error("Error creating campaign:", error);
        }
      });
    }
  }
}