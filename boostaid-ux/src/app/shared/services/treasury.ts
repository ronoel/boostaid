import { Injectable } from '@angular/core';
import { NotificationService } from './notification.service';
import { WalletService } from './wallet.service';
import { Observable, catchError, from, map, tap, throwError } from 'rxjs';
import {
    AnchorMode, PostConditionMode, Cl, ClarityType, 
    UIntCV,
    callReadOnlyFunction,
    // makeContractCall,
    ReadOnlyFunctionOptions,
} from '@stacks/transactions';
import { openContractCall, ContractCallOptions } from '@stacks/connect';
import { environment } from './../../../environments/environment';

export const Treasury = {
    comission: {  // percentage
        'CLAIM-BIDS-FROM-CONSIGNOR': 5,    // Claim bids from consignor
        'CLAIM-COMISSION-PROMOTER-NFT': 0,    // Claim comission Promoter NFT
    },
    fee: {
        'FUNDRAISER-NFT-MINT': 1000000,    // Mint Fundraiser NFT
        'FUNDRAISER-NFT-TRANSFER': 2000000,    // Transfer Fundraiser NFT
        'FUNDRAISER-NFT-UPDATE-DATA': 5000000,    // Update data for Fundraiser NFT
        'PROMOTER-NFT-MINT': 1500000,    // Mint Promoter NFT
        'PROMOTER-NFT-TRANSFER': 4000000,    // Transfer Promoter NFT
        'PROMOTER-NFT-UPDATE-DATA': 6000000,    // Update data for Promoter NFT
    }
}

@Injectable({
    providedIn: 'root'
})
export class TreasuryService {

    private readonly contractName = 'treasury';

    constructor(
        private walletService: WalletService,
        private notificationService: NotificationService
    ) { }

    collectTax(amount: number) {
        return from(new Promise<any>((resolve, reject) => {
            const options = this.createCollectTaxOptions(amount, resolve, reject);
            openContractCall(options);
        })).pipe(
            tap((data) =>
                this.notificationService.showTransactionDialog(data, 'The tax has been requested successfully'))
        );
    }

    getTreasuryBalance(): Observable<number> {
        const options = this.createGetTreasuryBalanceOptions();
        return from(callReadOnlyFunction(options)).pipe(
            map(result => {
                if (result.type === ClarityType.UInt) {
                    const numberResult = result as UIntCV;
                    return Number(numberResult.value.toString());
                } else {
                    throw new Error('Token not found');
                }
            }),
            catchError(this.handleError)
        );
    }

    private createCollectTaxOptions(amount: number, resolve: Function, reject: Function): ContractCallOptions {
        return {
            anchorMode: AnchorMode.Any, // which type of block the tx should be mined in
            network: this.walletService.getNetwork(),
            contractAddress: environment.appContractAddress,
            contractName: this.contractName,
            functionName: 'collect-treasure',
            functionArgs: [
                Cl.uint(amount),
                Cl.address(this.walletService.getSTXAddress()),
            ],
            postConditionMode: PostConditionMode.Allow,
            postConditions: [],
            onFinish: (response) => resolve(response.txId),
            onCancel: () => reject(new Error('User cancelled the transaction')),
        };
    }

    private createGetTreasuryBalanceOptions(): ReadOnlyFunctionOptions {
        return {
            network: this.walletService.getNetwork(),
            contractAddress: environment.appContractAddress,
            contractName: this.contractName,
            functionName: 'get-treasury-balance',
            functionArgs: [],
            senderAddress: this.walletService.getSTXAddress()
        };
    }

    private handleError(error: any): Observable<never> {
        console.error('Error:', error);
        return throwError(() => new Error(`An error occurred: ${error.message}`));
    }
}