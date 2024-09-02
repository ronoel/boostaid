import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ShowNftsComponent } from "./show-nfts/show-nfts.component";

@Component({
  selector: 'app-nft',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    ShowNftsComponent
],
  templateUrl: './nft.component.html',
  styleUrl: './nft.component.scss'
})
export class NftComponent {

}
