import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { TwitterService } from '../../../shared/services/twitter.service';
import { FundingCampaignService } from '../../../shared/services/funding-campaign.service';

export interface Campaign {
  id: number;
  title: string;
  description: string;
  twitterPostLink: string;
}

@Component({
  selector: 'app-campaign',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './campaign.component.html',
  styleUrl: './campaign.component.scss'
})
export class CampaignComponent implements OnInit {
  campaigns: Campaign[] = []

  private twitterService = inject(TwitterService);

  constructor(private fundingCampaignService: FundingCampaignService) {

    this.fundingCampaignService.getLastCampaignId().subscribe({
      next: (lastCampaignId) => {
        console.log('Last campaign id:', lastCampaignId);

        // Load campaigns

        if (lastCampaignId > 0) {

          this.fundingCampaignService.getCampaign(lastCampaignId).subscribe({
            next: (campaign) => {
              console.log('Last campaign:', campaign);
              this.campaigns.push(campaign);
            },
            error: (error) => {
              console.error('Error getting last campaign:', error);
            }
          });
        }
        //

      },
      error: (error) => {
        console.error('Error getting last campaign id:', error);
      }
    });
  }

  ngOnInit(): void {
    this.loadMockCampaigns();
    // setTimeout(() => {
    this.loadTwitterPosts();
    // }, 3000);
  }

  loadMockCampaigns(): void {
    this.campaigns = [
      {
        id: 1,
        title: 'Save the Rainforest',
        description: 'Help us protect the rainforest and its wildlife.',
        twitterPostLink: 'https://twitter.com/boostaid_btc/status/1804108713092960354'
      },
      {
        id: 2,
        title: 'Support Local Schools',
        description: 'Provide resources and support for local schools in need.',
        twitterPostLink: 'https://twitter.com/TheBTCTherapist/status/1822023023127404716'
      },
      {
        id: 3,
        title: 'Clean the Oceans',
        description: 'Join our efforts to remove plastic waste from the oceans.',
        twitterPostLink: 'https://twitter.com/BTC_Archive/status/1822004546828476446'
      },
      {
        id: 4,
        title: 'Plant Trees',
        description: 'Help us plant trees to combat climate change.',
        twitterPostLink: 'https://twitter.com/Vivek4real_/status/1821979103874183286'
      },
      {
        id: 5,
        title: 'Save the Bees',
        description: 'Support our efforts to protect bee populations.',
        twitterPostLink: 'https://twitter.com/saylor/status/1822320966946476053'
      },
      {
        id: 6,
        title: 'Clean Water Initiative',
        description: 'Provide clean water to communities in need.',
        twitterPostLink: 'https://twitter.com/JDVance/status/1822423841626271918'
      }
    ];
  }

  loadTwitterPosts(): void {
    this.twitterService.loadTwitterWidget("twitter-post-load");
  }
}