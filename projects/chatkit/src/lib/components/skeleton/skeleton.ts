import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'dw-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton.html',
  styleUrls: ['./skeleton.scss'],
})
export class Skeleton {
  @Input() width: string = '100%';
  @Input() height: string = '1rem';
  @Input() borderRadius: string = '6px';
  @Input() shape: 'rectangle' | 'circle' = 'rectangle';
}
