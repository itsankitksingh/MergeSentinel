import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgentApiService, HealthResponse } from '../services/agent-api.service';

@Component({
  selector: 'app-health-metrics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="metrics-container">
      <div class="header-section">
        <div>
          <h2 class="page-title">Service Health & Observability</h2>
          <p class="page-desc">
            Directly probe NestJS operational endpoints (<code>/health</code>, <code>/metrics</code>, and AI provider connectivity).
          </p>
        </div>
        <div class="url-bar">
          <input type="text" [(ngModel)]="backendUrl" (change)="onUrlChange()" class="url-input" placeholder="http://localhost:3000">
          <button (click)="runDeepHealthCheck()" [disabled]="checking()" class="btn-primary">
            {{ checking() ? 'Probing...' : 'Run Deep Health Probe' }}
          </button>
        </div>
      </div>

      <!-- Health Cards -->
      <div class="health-cards-grid">
        <div class="metric-card glass-panel">
          <div class="metric-header">
            <span class="metric-name">Service Status</span>
            <span class="badge" [ngClass]="isOnline() ? 'badge-emerald' : 'badge-amber'">
              {{ isOnline() ? 'Healthy' : 'Degraded / Standby' }}
            </span>
          </div>
          <div class="metric-big-value">
            {{ health()?.mode || 'NestJS' }}
          </div>
          <div class="metric-footer">
            Endpoint: <code>GET /health</code>
          </div>
        </div>

        <div class="metric-card glass-panel">
          <div class="metric-header">
            <span class="metric-name">AI Provider</span>
            <span class="badge badge-indigo">
              {{ health()?.ai?.status === 'ok' ? 'Connected' : 'Configured' }}
            </span>
          </div>
          <div class="metric-big-value text-indigo">
            {{ health()?.ai?.provider || 'OpenAI' }}
          </div>
          <div class="metric-footer">
            Model: <code>{{ health()?.ai?.model || 'gpt-4.1-mini' }}</code>
          </div>
        </div>

        <div class="metric-card glass-panel">
          <div class="metric-header">
            <span class="metric-name">Runtime Persistence</span>
            <span class="badge badge-purple">
              {{ health()?.stateStore?.ready ? 'Ready' : 'In-Memory' }}
            </span>
          </div>
          <div class="metric-big-value text-purple">
            {{ health()?.stateStore?.backend || 'SQLite' }}
          </div>
          <div class="metric-footer">
            Dedupe TTL & Incremental Reviews
          </div>
        </div>
      </div>

      <!-- Live Prometheus Metrics Viewer -->
      <div class="metrics-panel glass-panel">
        <div class="metrics-panel-header">
          <div class="panel-title-group">
            <h3>Prometheus Metrics Stream</h3>
            <span class="badge badge-emerald">Live Text Format</span>
          </div>
          <button (click)="loadMetrics()" class="btn-secondary">
            Refresh Metrics
          </button>
        </div>
        <pre class="metrics-raw"><code>{{ metricsOutput() }}</code></pre>
      </div>
    </div>
  `,
  styles: [`
    .metrics-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .page-title {
      font-size: 1.8rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .page-desc {
      color: var(--text-secondary);
      font-size: 0.95rem;
      margin-top: 4px;
    }

    .page-desc code {
      color: #a5b4fc;
      background: rgba(99, 102, 241, 0.15);
      padding: 2px 6px;
      border-radius: 4px;
    }

    .url-bar {
      display: flex;
      gap: 10px;
    }

    .url-input {
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      padding: 8px 14px;
      font-family: var(--font-mono);
      font-size: 0.9rem;
      width: 230px;
      outline: none;
    }

    .url-input:focus {
      border-color: var(--accent-indigo);
    }

    .health-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
    }

    .metric-card {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .metric-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .metric-name {
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      font-weight: 600;
    }

    .metric-big-value {
      font-size: 1.7rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .text-indigo { color: #a5b4fc; }
    .text-purple { color: #c084fc; }

    .metric-footer {
      font-size: 0.8rem;
      color: var(--text-secondary);
      margin-top: auto;
    }

    .metric-footer code {
      font-family: var(--font-mono);
      background: rgba(0, 0, 0, 0.3);
      padding: 2px 6px;
      border-radius: 4px;
      color: #94a3b8;
    }

    .metrics-panel {
      padding: 24px;
    }

    .metrics-panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--border-subtle);
    }

    .panel-title-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .panel-title-group h3 {
      font-size: 1.15rem;
      font-weight: 600;
    }

    .metrics-raw {
      background: #06090e;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: var(--radius-md);
      padding: 16px;
      font-family: var(--font-mono);
      font-size: 0.85rem;
      line-height: 1.6;
      color: #38bdf8;
      overflow-x: auto;
      max-height: 420px;
    }
  `]
})
export class HealthMetricsComponent implements OnInit {
  private readonly api = inject(AgentApiService);

  backendUrl = 'http://localhost:3000';
  readonly health = this.api.healthData;
  readonly isOnline = this.api.isBackendConnected;
  readonly checking = this.api.checkingHealth;
  readonly metricsOutput = signal<string>('Loading Prometheus metrics...');

  ngOnInit(): void {
    void this.api.checkHealth();
    void this.loadMetrics();
  }

  onUrlChange(): void {
    this.api.setBackendUrl(this.backendUrl);
    void this.api.checkHealth();
    void this.loadMetrics();
  }

  async runDeepHealthCheck(): Promise<void> {
    await this.api.checkHealth(true);
    await this.loadMetrics();
  }

  async loadMetrics(): Promise<void> {
    const raw = await this.api.fetchMetrics();
    this.metricsOutput.set(raw);
  }
}
