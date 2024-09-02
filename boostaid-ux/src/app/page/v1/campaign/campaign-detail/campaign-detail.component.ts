import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TwitterService } from '../../../../shared/services/twitter.service';

export interface Campaign {
  id: number;
  title: string;
  description: string;
  twitterPostLink: string;
  goal: number;
  raised: number;
  endBlockHeight: number;
  donors: number;
}

@Component({
  selector: 'app-campaign-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './campaign-detail.component.html',
  styleUrls: ['./campaign-detail.component.scss']
})
export class CampaignDetailComponent implements OnInit {
  campaign: Campaign | undefined;
  currentBlockHeight: number = 0;
  daysLeft: number = 0;
  donationAmount: number = 0;

  private twitterService = inject(TwitterService);

  private mockCampaigns: Campaign[] = [
    {
      id: 1,
      title: 'Save the Rainforest',
      description: 'Help us protect the rainforest and its wildlife.',
      twitterPostLink: 'https://twitter.com/boostaid_btc/status/1804108713092960354',
      goal: 10000,
      raised: 5000,
      endBlockHeight: 1500000,
      donors: 150
    },
    // Add more mock campaigns as needed
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    console.log('Path parameter id:', id);
    if (id) {
      this.campaign = this.mockCampaigns.find(c => c.id === +id);
    }

    this.twitterService.loadTwitterWidget("twitter-post-load");

    // Mock current block height and days left for demonstration purposes
    this.currentBlockHeight = 1450000;
    this.daysLeft = this.calculateDaysLeft(this.currentBlockHeight, this.campaign?.endBlockHeight);
  }

  private calculateDaysLeft(currentBlockHeight: number, endBlockHeight?: number): number {
    if (!endBlockHeight) return 0;
    const blocksPerDay = 144; // Assuming 10-minute block times
    return Math.max(0, Math.floor((endBlockHeight - currentBlockHeight) / blocksPerDay));
  }

  donate(): void {
    console.log(`Donating ${this.donationAmount} STX to campaign ${this.campaign?.title}`);
    // Implement the donation logic here
  }
}