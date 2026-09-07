import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MonthEntry, MonthResult } from '../models/tcf.models';

@Injectable({ providedIn: 'root' })
export class TcfApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/tcf';

  private readonly jsonHeaders = new HttpHeaders({
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  });

  /** Fetch the full list of available months */
  getMonths(): Observable<MonthEntry[]> {
    return this.http.get<MonthEntry[]>(`${this.base}/months`, {
      headers: this.jsonHeaders
    }).pipe(catchError(this.handleError));
  }

  /** Scrape a specific month by its slug */
  getMonthBySlug(slug: string): Observable<MonthResult> {
    return this.http.get<MonthResult>(`${this.base}/months/${slug}`, {
      headers: this.jsonHeaders
    }).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message: string;
    if (error.status === 0) {
      message = 'Impossible de joindre le serveur. Vérifiez que Spring Boot tourne sur le port 8080.';
    } else if (error.error instanceof SyntaxError) {
      message = `Réponse invalide du serveur (status ${error.status}). Vérifiez que /api/tcf/months retourne du JSON.`;
    } else {
      message = error.error?.message ?? error.message ?? `Erreur serveur ${error.status}`;
    }
    return throwError(() => new Error(message));
  }
}
