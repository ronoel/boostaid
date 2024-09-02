import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface TransactionData {
  title: string;
  txId: string;
}

@Component({
  selector: 'app-dialog-app',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './dialog-app.component.html',
  styleUrl: './dialog-app.component.scss'
})
export class DialogAppComponent {

  public title: string = "";
  public txId: string = "";

  constructor(@Inject(MAT_DIALOG_DATA) public data: TransactionData) {
    this.title = data.title;
    this.txId = data.txId;
  }

}
