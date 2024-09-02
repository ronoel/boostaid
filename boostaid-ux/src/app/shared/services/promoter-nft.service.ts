import { Injectable } from '@angular/core';
import { WalletService } from './wallet.service';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from './notification.service';
import { NftService } from './nft.service';
import { Treasury } from './treasury';

export interface MetadataPromoterNft {
  username: string;
  postId: string;
}

@Injectable({
  providedIn: 'root'
})
export class PromoterNftService extends NftService {
  protected contractName = 'promoter-nft';
  protected nftName = 'promoter-nft';
  protected feeMint = Treasury.fee['PROMOTER-NFT-MINT'];

  constructor(
    walletService: WalletService,
    httpClient: HttpClient,
    notificationService: NotificationService
  ) {
    super(walletService, httpClient, notificationService);
  }

  protected parseMetadata(metadata: string): MetadataPromoterNft {
    const [username, postId] = metadata.split(':');
    return { username, postId };
  }
}
