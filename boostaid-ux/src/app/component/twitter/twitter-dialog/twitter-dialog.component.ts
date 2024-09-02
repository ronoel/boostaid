import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TwitterPostComponent } from "../twitter-post/twitter-post.component";
import { TwitterTimelineComponent } from "../twitter-timeline/twitter-timeline.component";

export interface TwitterData {
  type: "POST" | "TIMELINE";
  username: string;
  postId: string;
}

@Component({
  selector: 'app-twitter-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    TwitterPostComponent,
    TwitterTimelineComponent
],
  templateUrl: './twitter-dialog.component.html',
  styleUrl: './twitter-dialog.component.scss'
})
export class TwitterDialogComponent {

  constructor(@Inject(MAT_DIALOG_DATA) public twitterData: TwitterData) {
  }
}
