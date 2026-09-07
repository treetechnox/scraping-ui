import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Combination } from '../../core/models/tcf.models';
import { TaskPanelComponent } from '../task-card/task-panel.component';

@Component({
  selector: 'app-combination-list',
  standalone: true,
  imports: [CommonModule, TaskPanelComponent],
  templateUrl: './combination-list.component.html',
  styleUrls: ['./combination-list.component.scss']
})
export class CombinationListComponent {
  @Input() combinations: Combination[] = [];

  expandedIndex = signal<number | null>(0);

  toggle(index: number): void {
    this.expandedIndex.set(this.expandedIndex() === index ? null : index);
  }

  isExpanded(index: number): boolean {
    return this.expandedIndex() === index;
  }
}
