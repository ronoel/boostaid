import { Component, Input, OnInit } from '@angular/core';
import { FundraiserNftService } from '../../../shared/services/fundraiser-nft.service';
import { MatCardModule } from '@angular/material/card';
import { TwitterService } from '../../../shared/services/twitter.service';

@Component({
  selector: 'app-fundraiser-nft',
  standalone: true,
  imports: [
    MatCardModule
  ],
  templateUrl: './fundraiser-nft.component.html',
  styleUrl: './fundraiser-nft.component.scss'
})
export class FundraiserNftComponent implements OnInit {

  @Input()
  public nftId!: number;

  public username!: string;
  public postId!: string;

  constructor(
    private fundraiserNftService: FundraiserNftService,
    private twitterService: TwitterService
  ) {}

  ngOnInit(): void {
    this.fundraiserNftService.getMetadataByTokenId(this.nftId).subscribe({
      next: metadata => {
        this.username = metadata.username;
        this.postId = metadata.postId;
      },
      error: error => {
        console.error("Error fetching metadata:", error);
      }
    });
  }

  onOpenDetail() {
    this.twitterService.openDialog(this.username, this.postId);
  }

}
