import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TcfApiService } from '../../core/services/tcf-api.service';
import { MonthEntry, MonthResult } from '../../core/models/tcf.models';
import { CombinationListComponent } from '../combination-list/combination-list.component';

@Component({
  selector: 'app-month-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, CombinationListComponent],
  templateUrl: './month-selector.component.html',
  styleUrls: ['./month-selector.component.scss']
})
export class MonthSelectorComponent implements OnInit {
  private readonly api = inject(TcfApiService);

  // State signals
  months = signal<MonthEntry[]>([]);
  selectedSlug = signal<string>('');
  result = signal<MonthResult | null>(null);
  loadingMonths = signal(true);
  loadingResult = signal(false);
  error = signal<string | null>(null);

  // Derived: group months by year
  monthsByYear = computed(() => {
    const groups = new Map<number, MonthEntry[]>();
    for (const m of this.months()) {
      const arr = groups.get(m.year) ?? [];
      arr.push(m);
      groups.set(m.year, arr);
    }
    // Return sorted descending by year
    return [...groups.entries()].sort((a, b) => b[0] - a[0]);
  });

  selectedMonth = computed(() =>
    this.months().find(m => m.slug === this.selectedSlug()) ?? null
  );

  ngOnInit(): void {
    this.api.getMonths().subscribe({
      next: months => {
        this.months.set(months);
        this.loadingMonths.set(false);
        // Auto-select the most recent month
        if (months.length > 0) {
          this.selectMonth(months[0].slug);
        }
      },
      error: err => {
        this.error.set(err.message);
        this.loadingMonths.set(false);
      }
    });
  }

  selectMonth(slug: string): void {
    if (slug === this.selectedSlug()) return;
    this.selectedSlug.set(slug);
    this.result.set(null);
    this.error.set(null);
    this.loadingResult.set(true);

    this.api.getMonthBySlug(slug).subscribe({
      next: result => {
        this.result.set(result);
        this.loadingResult.set(false);
      },
      error: err => {
        this.error.set(err.message);
        this.loadingResult.set(false);
      }
    });
  }
}
