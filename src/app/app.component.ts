import { Component } from '@angular/core';
import { MonthSelectorComponent } from './features/month-selector/month-selector.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MonthSelectorComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {}
