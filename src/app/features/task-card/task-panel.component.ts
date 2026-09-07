import {
  Component, Input, OnDestroy, signal, computed, effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from '../../core/models/tcf.models';

const TOTAL_SECONDS = 60 * 60; // 60 minutes

type TimerState = 'idle' | 'running' | 'paused' | 'done';

@Component({
  selector: 'app-task-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-panel.component.html',
  styleUrls: ['./task-panel.component.scss']
})
export class TaskPanelComponent implements OnDestroy {
  @Input() tasks: Task[] = [];
  @Input() comboNumber: number = 0;

  // ── Tab state ──────────────────────────────────────────────────────────
  activeTab = signal(0);

  activeTask = computed(() => this.tasks[this.activeTab()] ?? null);

  selectTab(i: number): void {
    this.activeTab.set(i);
  }

  // ── Per-task text answers (preserved when switching tabs) ───────────────
  answers: Record<number, string> = {};

  getAnswer(taskIndex: number): string {
    return this.answers[taskIndex] ?? '';
  }

  setAnswer(taskIndex: number, value: string): void {
    this.answers[taskIndex] = value;
    // Start timer on first keystroke
    if (this.timerState() === 'idle') this.startTimer();
  }

  wordCount(taskIndex: number): number {
    const text = this.answers[taskIndex] ?? '';
    return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  }

  // ── Tâche 3 document split ─────────────────────────────────────────────
  contentParts(task: Task): { label: string; text: string }[] {
    if (task.number !== 3) return [{ label: '', text: task.content }];
    const content = task.content;
    const d1 = content.match(/Document\s*1\s*[:：]?\s*/i);
    const d2 = content.match(/Document\s*2\s*[:：]?\s*/i);
    if (!d1 || !d2) return [{ label: '', text: content }];
    const d1s = content.indexOf(d1[0]);
    const d2s = content.indexOf(d2[0]);
    const parts: { label: string; text: string }[] = [];
    const intro = content.slice(0, d1s).trim();
    if (intro) parts.push({ label: 'Sujet', text: intro });
    parts.push({ label: 'Document 1', text: content.slice(d1s + d1[0].length, d2s).trim() });
    parts.push({ label: 'Document 2', text: content.slice(d2s + d2[0].length).trim() });
    return parts;
  }

  // ── Timer ──────────────────────────────────────────────────────────────
  timerState = signal<TimerState>('idle');
  remaining = signal(TOTAL_SECONDS);
  private intervalId: ReturnType<typeof setInterval> | null = null;

  readonly TOTAL = TOTAL_SECONDS;

  // SVG ring constants
  readonly RADIUS = 20;
  readonly CIRCUMFERENCE = 2 * Math.PI * this.RADIUS;

  ringOffset = computed(() => {
    const pct = this.remaining() / TOTAL_SECONDS;
    return this.CIRCUMFERENCE * (1 - pct);
  });

  timeDisplay = computed(() => {
    const s = this.remaining();
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  });

  isWarning = computed(() => this.remaining() <= 600 && this.timerState() !== 'idle');
  isDone = computed(() => this.timerState() === 'done');

  startTimer(): void {
    if (this.timerState() === 'running') return;
    this.timerState.set('running');
    this.intervalId = setInterval(() => {
      const r = this.remaining() - 1;
      if (r <= 0) {
        this.remaining.set(0);
        this.timerState.set('done');
        this.clearInterval();
      } else {
        this.remaining.set(r);
      }
    }, 1000);
  }

  pauseTimer(): void {
    if (this.timerState() !== 'running') return;
    this.timerState.set('paused');
    this.clearInterval();
  }

  resumeTimer(): void {
    if (this.timerState() !== 'paused') return;
    this.startTimer();
  }

  resetTimer(): void {
    this.clearInterval();
    this.timerState.set('idle');
    this.remaining.set(TOTAL_SECONDS);
    this.answers = {};
  }

  private clearInterval(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  ngOnDestroy(): void {
    this.clearInterval();
  }

  // ── Copy ───────────────────────────────────────────────────────────────
  copied = signal(false);

  copyTask(): void {
    const task = this.activeTask();
    if (!task) return;
    const text = `Tâche ${task.number}\n\n${task.content}${task.wordLimit ? '\n\n(' + task.wordLimit + ')' : ''}`;
    navigator.clipboard.writeText(text).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────
  taskIcon(n: number): string {
    return n === 1 ? '✉' : n === 2 ? '✍' : '⚖';
  }

  taskType(n: number): string {
    return n === 1 ? 'Message / Courriel'
         : n === 2 ? 'Article · Blog · Forum'
         : 'Argumentation — 2 documents';
  }
}
