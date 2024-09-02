import { Injectable } from '@angular/core';
import { WalletService } from './wallet.service';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from './notification.service';
import { NftService } from './nft.service';
import { Treasury } from './treasury';

export interface MetadataFundraiserNft {
  username: string;
  postId: string;
}

@Injectable({
  providedIn: 'root'
})
export class FundraiserNftService extends NftService {
  protected contractName = 'fundraiser-nft';
  protected nftName = 'fundraiser-nft';
  protected feeMint = Treasury.fee['FUNDRAISER-NFT-MINT'];

  constructor(
    walletService: WalletService,
    httpClient: HttpClient,
    notificationService: NotificationService
  ) {
    super(walletService, httpClient, notificationService);
  }

  protected parseMetadata(metadata: string): MetadataFundraiserNft {
    const [username, postId] = metadata.split(':');
    return { username, postId };
  }
}
