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
