import { Routes } from '@angular/router';
import { OverviewComponent } from './components/overview.component';
import { PolicyEditorComponent } from './components/policy-editor.component';
import { HealthMetricsComponent } from './components/health-metrics.component';
import { CommandsPlaygroundComponent } from './components/commands-playground.component';

export const routes: Routes = [
  { path: '', redirectTo: 'overview', pathMatch: 'full' },
  { path: 'overview', component: OverviewComponent },
  { path: 'policy-editor', component: PolicyEditorComponent },
  { path: 'health', component: HealthMetricsComponent },
  { path: 'commands', component: CommandsPlaygroundComponent },
  { path: '**', redirectTo: 'overview' }
];
