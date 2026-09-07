export interface MonthEntry {
  label: string;   // e.g. "Mars 2026"
  slug: string;    // e.g. "mars-2026-expression-ecrite"
  year: number;
  url: string;
}

export interface Task {
  number: number;     // 1, 2, or 3
  content: string;    // full task prompt text
  wordLimit: string;  // e.g. "60 mots minimum/120 mots maximum"
}

export interface Combination {
  number: number;   // 1, 2, 3 ...
  tasks: Task[];
}

export interface MonthResult {
  label: string;
  slug: string;
  year: number;
  url: string;
  combinations: Combination[];
}
