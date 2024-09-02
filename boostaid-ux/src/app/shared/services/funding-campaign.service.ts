import { Injectable } from '@angular/core';
import { NotificationService } from './notification.service';
import { WalletService } from './wallet.service';
import { Observable, catchError, from, map, tap, throwError } from 'rxjs';
import {
    AnchorMode, PostConditionMode, Cl, ClarityType,
    UIntCV,
    callReadOnlyFunction,
    ReadOnlyFunctionOptions,
} from '@stacks/transactions';
import { openContractCall, ContractCallOptions } from '@stacks/connect';
import { environment } from './../../../environments/environment';
import { ClarityUtil } from '../utils/clarity.util';

export interface CampaignCreateParams {
    xPost: {
        username: string;
        postId: string;
    };
    goalMin: number;
    goalMain: number;
    endBlock: number;
    ownerTokenId: number;
}

@Injectable({
    providedIn: 'root'
})
export class FundingCampaignService {

    private readonly contractName = 'funding-campaign';

    constructor(
        private walletService: WalletService,
        private notificationService: NotificationService
    ) { }


    getLastCampaignId(): Observable<number> {
        const options = this.createGetLastCampaignIdOptions();
        return from(callReadOnlyFunction(options)).pipe(
            map(result => {
                if (result.type === ClarityType.UInt) {
                    const numberResult = result as UIntCV;
                    return Number(numberResult.value.toString());
                } else {
                    throw new Error('Error getting last campaign id');
                }
            }),
            catchError(this.handleError)
        );
    }

    private createGetLastCampaignIdOptions(): ReadOnlyFunctionOptions {
        return {
            network: this.walletService.getNetwork(),
            contractAddress: environment.appContractAddress,
            contractName: this.contractName,
            functionName: 'get-last-campaign-id',
            functionArgs: [],
            senderAddress: this.walletService.getSTXAddress()
        };
    }

    getCampaign(id: number): Observable<any> {
        const options = this.createGetCampaignOptions(id);
        return from(callReadOnlyFunction(options)).pipe(
          map(ClarityUtil.extractResponse),
        //   map(result => {
        //     // if (result.type === ClarityType.OptionalSome) {
        //     //   const tupleCV = result.value as TupleCV;
        //     //   const metadata = tupleCV.data["metadata"] as StringAsciiCV;
        //     //   return this.parseMetadata(metadata.data);
        //     // } else {
        //     //   throw new Error('Token not found');
        //     // }
        //     Cl.prettyPrint(result);
        //     return "OK";
        //   }),
          catchError(this.handleError)
        );
      }

      protected createGetCampaignOptions(id: number): ReadOnlyFunctionOptions {
        return {
          network: this.walletService.getNetwork(),
          contractAddress: environment.appContractAddress,
          contractName: this.contractName,
          functionName: 'get-campaign',
          functionArgs: [
            Cl.uint(id),
          ],
          senderAddress: this.walletService.getSTXAddress()
        };
      }

    createCampaign(params: CampaignCreateParams): Observable<any> {
        return from(new Promise<any>((resolve, reject) => {
            const options = this.createCreateCampaignOptions(params, resolve, reject);
            openContractCall(options);
        })).pipe(
            tap((data) =>
                this.notificationService.showTransactionDialog(data, 'The campaign has been created successfully'))
        );
    }

    private createCreateCampaignOptions(params: CampaignCreateParams, resolve: Function, reject: Function): ContractCallOptions {
        return {
            anchorMode: AnchorMode.Any,
            network: this.walletService.getNetwork(),
            contractAddress: environment.appContractAddress,
            contractName: this.contractName,
            functionName: 'create-campaign',
            functionArgs: [
                Cl.uint(1), // twitter post id
                Cl.stringAscii(params.xPost.username + ":" + params.xPost.postId),
                Cl.uint(params.goalMin),
                Cl.uint(params.goalMain),
                Cl.uint(params.endBlock),
                Cl.uint(params.ownerTokenId)
            ],
            postConditionMode: PostConditionMode.Allow,
            postConditions: [],
            onFinish: (response) => resolve(response.txId),
            onCancel: () => reject(new Error('User cancelled the transaction')),
        };
    }

    private handleError(error: any): Observable<never> {
        console.error('Error:', error);
        return throwError(() => new Error(`An error occurred: ${error.message}`));
    }
}