import { Injectable } from '@angular/core';
import { Observable, catchError, from, map, tap, throwError } from 'rxjs';
import {
  Pc,
  AnchorMode, PostConditionMode, Cl, ClarityType, ClarityValue,
  TupleCV, StringAsciiCV,
  callReadOnlyFunction,
  // makeContractCall,
  ReadOnlyFunctionOptions,
} from '@stacks/transactions';
import { openContractCall, ContractCallOptions } from '@stacks/connect';
import { WalletService } from './wallet.service';
import { HttpClient } from '@angular/common/http';
import { environment } from './../../../environments/environment';
import { ClarityUtil } from './../utils/clarity.util';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export abstract class NftService {
  protected abstract contractName: string;
  protected abstract nftName: string;
  protected abstract feeMint: number;

  constructor(
    protected walletService: WalletService,
    protected httpClient: HttpClient,
    protected notificationService: NotificationService
  ) { }

  getTokensID(): Observable<Array<number>> {
    const url = `${this.walletService.getApiUrl()}/extended/v1/tokens/nft/holdings?principal=${this.walletService.getSTXAddress()}&asset_identifiers=${this.getAssetIdentifier()}`;
    return this.httpClient.get(url)
      .pipe(
        map((response: any) => response.results),
        map((results: any[]) => results.map(item => item.value.repr)),
        map((results: any[]) => results.map(item => ClarityUtil.convertUIntToNumber(item)))
      );
  }

  getMetadataByTokenId(tokenId: number): Observable<any> {
    const options = this.createGetMetadataOptions(tokenId);
    return from(callReadOnlyFunction(options)).pipe(
      map(ClarityUtil.extractResponse),
      map(result => {
        if (result.type === ClarityType.OptionalSome) {
          const tupleCV = result.value as TupleCV;
          const metadata = tupleCV.data["metadata"] as StringAsciiCV;
          return this.parseMetadata(metadata.data);
        } else {
          throw new Error('Token not found');
        }
      }),
      catchError(this.handleError)
    );
  }

  mintNft(username: string, postId: string): Observable<string> {
    return from(new Promise<any>((resolve, reject) => {
      const options = this.createMintOptions(username, postId, resolve, reject);
      openContractCall(options);
    })).pipe(
      tap((data) =>
        this.notificationService.showTransactionDialog(data, 'Your NFT is being minted'))
    );
  }

  protected getAssetIdentifier(): string {
    return `${environment.appContractAddress}.${this.contractName}::${this.nftName}`;
  }

  protected createMintOptions(username: string, postId: string, resolve: Function, reject: Function): ContractCallOptions {
    const postCondition = Pc.principal(this.walletService.getSTXAddress())
      .willSendEq(this.feeMint)
      .ustx();

    return {
      anchorMode: AnchorMode.Any, // which type of block the tx should be mined in
      network: this.walletService.getNetwork(),
      contractAddress: environment.appContractAddress,
      contractName: this.contractName,
      functionName: 'mint',
      functionArgs: [
        Cl.address(this.walletService.getSTXAddress()),
        Cl.uint(1), // twitter post id
        Cl.stringAscii(username + ":" + postId)
      ],
      postConditionMode: PostConditionMode.Deny, // whether the tx should fail when unexpected assets are transferred
      postConditions: [postCondition],
      onFinish: (response) => resolve(response.txId),
      onCancel: () => reject(new Error('User cancelled the transaction')),
    };
  }

  protected createGetMetadataOptions(tokenId: number): ReadOnlyFunctionOptions {
    return {
      network: this.walletService.getNetwork(),
      contractAddress: environment.appContractAddress,
      contractName: this.contractName,
      functionName: 'get-metadata',
      functionArgs: [
        Cl.uint(tokenId),
      ],
      senderAddress: this.walletService.getSTXAddress()
    };
  }

  protected handleError(error: any): Observable<never> {
    console.error('Error:', error);
    return throwError(() => new Error(`An error occurred: ${error.message}`));
  }

  protected abstract parseMetadata(metadata: string): any;
}
