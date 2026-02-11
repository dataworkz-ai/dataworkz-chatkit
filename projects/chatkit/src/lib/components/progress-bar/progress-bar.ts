import { Component, input } from '@angular/core';

@Component({
  selector: 'dw-progress-bar',
  standalone: true,
  template: `
    <div class="dw-progress-bar-container" [class.vertical]="direction() === 'vertical'">
      <div
        class="dw-progress-bar-fill"
        [class.progress]="state() === 'progress'"
        [class.success]="state() === 'success'"
        [class.error]="state() === 'error'"
      ></div>
    </div>
  `,
  styleUrl: './progress-bar.scss',
})
export class ProgressBar {
  state = input<'progress' | 'success' | 'error'>('progress');
  direction = input<'horizontal' | 'vertical'>('horizontal');
}
