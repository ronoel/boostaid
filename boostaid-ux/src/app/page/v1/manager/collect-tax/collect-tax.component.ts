import { Component, effect, inject } from '@angular/core';
import { WalletService } from '../../../../shared/services/wallet.service';
import { ConnectWalletComponent } from "../../../../component/connect-wallet/connect-wallet.component";
import { TreasuryService } from '../../../../shared/services/treasury';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-collect-tax',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    ConnectWalletComponent
  ],
  templateUrl: './collect-tax.component.html',
  styleUrl: './collect-tax.component.scss'
})
export class CollectTaxComponent {

  public balance: number = 0;

  public isLoggedIn = false;
  private walletService = inject(WalletService);

  constructor(
    private treasuryService: TreasuryService
  ) {
    effect(() => {
      if (this.walletService.isLoggedIn()) {
        this.isLoggedIn = true;
      } else {
        this.isLoggedIn = false;
      }
    });

    console.log('Collect Tax Component Initialized');
    
    this.treasuryService.getTreasuryBalance().subscribe({
      next: balance => {
        console.log('Balance:', balance);
        this.balance = balance;
      },
      error: error => {
        console.error("Error getting tax:", error);
      }
    });
  }

  onCollectTax() {
    this.treasuryService.collectTax(this.balance).subscribe({
      next: data => {
        console.log('Collect Tax:', data);
      },
      error: error => {
        console.error("Error collecting tax:", error);
      }
    });
  }
}
