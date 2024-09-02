import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogAppComponent } from '../../component/dialog-app/dialog-app.component';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(public dialog: MatDialog) { }

  showTransactionDialog(txId: string, title: string = 'Transaction submitted') {
    this.dialog.open(DialogAppComponent, {
      data: {
        title: title,
        txId: txId
      }
    });
  }
}
