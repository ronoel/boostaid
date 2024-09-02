import { Component, Input, OnInit } from '@angular/core';
import { TwitterService } from '../../../shared/services/twitter.service';


@Component({
  selector: 'app-twitter-post',
  standalone: true,
  imports: [],
  templateUrl: './twitter-post.component.html',
  styleUrl: './twitter-post.component.scss'
})
export class TwitterPostComponent implements OnInit {

  @Input()
  public username: any;

  @Input()
  public postId: any;

  public twitterPostLinkBlockquote: string = "";

  constructor(private twitterService: TwitterService) {}

  ngOnInit(): void {
    this.twitterPostLinkBlockquote = this.twitterService.generateLinkPostBlockquote(this.username, this.postId);
    this.twitterService.loadTwitterWidget("twitter-post-load");
  }

}
