import { Injectable } from '@angular/core';
import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TwitterData, TwitterDialogComponent } from '../../component/twitter/twitter-dialog/twitter-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class TwitterService {


  private window: any = window;

  constructor(public dialog: MatDialog) { }

  /**
   * Extracts the username and post ID from a Twitter URL.
   * @param url - The Twitter URL.
   * @returns An object containing the username and post ID, or null if the URL is invalid.
   */
  public extractUsernameAndPostIdFromUrl(url: string): { username: string, postId: string } | null {
    const match = url.match(/^(https:\/\/)(twitter\.com|x\.com)\/([a-zA-Z0-9_]+)\/status\/([0-9]+)/);
    if (match) {
      return { username: match[3], postId: match[4] };
    }
    return null;
  }

  /**
   * Generates a link to a Twitter post given the username and post ID.
   * @param username - The username of the Twitter user.
   * @param postId - The ID of the Twitter post.
   * @returns The generated link to the Twitter post.
   */
  public generateLinkPostBlockquote(username: string, postId: string): string {
    return `https://twitter.com/${username}/status/${postId}`;
  }

  /**
   * Generates a link to a Twitter timeline given the username.
   * @param username - The username of the Twitter user.
   * @returns The generated link to the Twitter timeline.
   */
  generateLinkTimelineBlockquote(username: string): string {
    return `https://twitter.com/${username}`;
  }

  /**
   * Loads the Twitter widget for the specified element ID.
   * @param elementId - The ID of the HTML element where the Twitter widget should be loaded.
   */
  public loadTwitterWidget(elementId: string): void {
    if (!this.window.twttr) {
      console.error("Twitter widgets API not found.");
      return;
    }
    setTimeout(() => {
      this.window.twttr.widgets.load(
        document.getElementById(elementId)
      );
    }, 500);
  }

  openDialog(username: string, postId: string) {
    const dialogData: TwitterData = {
      type: "POST",
      username: username,
      postId: postId
    };
    this.dialog.open(TwitterDialogComponent, {
      data: dialogData,
      width: '400px',
    });
  }
}

export class TwitterValidator {

  /**
   * Validates if the control value is a valid Twitter post link.
   * 
   * @returns A validator function that checks if the control value matches the Twitter post link pattern.
   * @param control - The control to validate.
   * @returns An object with the `invalidUrl` property set to `true` if the control value is not a valid Twitter post link, otherwise `null`.
   */
  static twitterPostLink(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const urlPattern = /^(https:\/\/)(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/[0-9]+(\?.*)?$/;
      return urlPattern.test(control.value) ? null : { invalidUrl: true };
    };
  }
}