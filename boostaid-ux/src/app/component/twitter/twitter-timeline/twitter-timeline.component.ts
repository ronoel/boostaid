import { Component, Input, OnInit } from '@angular/core';
import { TwitterService } from '../../../shared/services/twitter.service';

@Component({
  selector: 'app-twitter-timeline',
  standalone: true,
  imports: [],
  templateUrl: './twitter-timeline.component.html',
  styleUrl: './twitter-timeline.component.scss'
})
export class TwitterTimelineComponent implements OnInit {

  @Input()
  public username: any;


  public twitterTimeline: string = "";

  constructor(private twitterService: TwitterService) {}

  ngOnInit(): void {
    this.twitterTimeline = this.twitterService.generateLinkTimelineBlockquote(this.username);
    this.twitterService.loadTwitterWidget("twitter-timeline-load");
  }
}
