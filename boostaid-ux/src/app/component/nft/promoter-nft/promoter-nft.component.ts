import { Component, Input, OnInit } from '@angular/core';
import { PromoterNftService } from '../../../shared/services/promoter-nft.service';
import { TwitterService } from '../../../shared/services/twitter.service';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-promoter-nft',
  standalone: true,
  imports: [
    MatCardModule
  ],
  templateUrl: './promoter-nft.component.html',
  styleUrl: './promoter-nft.component.scss'
})
export class PromoterNftComponent implements OnInit {

  @Input()
  public nftId!: number;

  public username!: string;
  public postId!: string;

  constructor(
    private promoterNftService: PromoterNftService,
    private twitterService: TwitterService
  ) { }

  ngOnInit(): void {
    this.promoterNftService.getMetadataByTokenId(this.nftId).subscribe({
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