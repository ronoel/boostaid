import { Component, Signal, computed, effect, inject, signal } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { WalletService } from '../../shared/services/wallet.service';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule
  ],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss'
})
export class ToolbarComponent {

  public identityAddress: string | undefined;
  // readonly identity = signal('count');
  public isLoggedIn = false;
  private walletService = inject(WalletService);

  constructor() {
    effect(() => {
      if(this.walletService.isLoggedIn()){
        this.identityAddress = this.walletService.getSTXAddress();
        this.isLoggedIn = true;
      } else {
        this.identityAddress = undefined;
        this.isLoggedIn = false;
      } 
    });
  }

  // checkAuth() {
  //   this.walletService.checkAuth();
  // }

  signIn() {
    this.walletService.signIn();
  }

  signOut() {
    this.walletService.signOut();
  }

}
