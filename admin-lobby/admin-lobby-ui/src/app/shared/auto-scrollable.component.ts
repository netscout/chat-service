/**
 * https://medium.com/helper-studio/how-to-make-autoscroll-of-chat-when-new-message-adds-in-angular-68dd4e1e8acd
 * 소스를 변형
 */

import { Component } from "@angular/core";

@Component({
  template: ''
})
export class AutoScrollableComponent {
  protected elementContainer: any;
  protected scrollContainer: any;
  protected isNearBottom = true;

  protected initAutoScroll(nativeElement: any, ): void {
    this.scrollContainer = nativeElement;
  }

  protected onElementChanged(): void {
    if(this.isNearBottom) {
      this.scrollToBottom();
    }
  }

  protected scrollToBottom(): void {
    this.scrollContainer.scroll({
      top: this.scrollContainer.scrollHeight,
      left: 0,
      behavior: 'smooth'
    });
  }

  protected isUserNearBottom(): boolean {
    const threshold = 150;
    const position = this.scrollContainer.scrollTop +
      this.scrollContainer.offsetHeight;
    const height = this.scrollContainer.scrollHeight;
    return position > height - threshold;
  }

  scrolled(event: any): void {
    this.isNearBottom = this.isUserNearBottom();
  }
}
