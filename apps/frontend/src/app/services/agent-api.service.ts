import { Injectable, signal } from '@angular/core';

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'down';
  timestamp?: number;
  mode?: string;
  uptimeSeconds?: number;
  ai?: {
    status: 'ok' | 'unconfigured' | 'error';
    provider?: string;
    model?: string;
    liveProbe?: boolean;
    error?: string;
  };
  stateStore?: {
    backend: string;
    ready: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AgentApiService {
  private backendBaseUrl = 'http://localhost:3000';

  readonly isBackendConnected = signal<boolean>(false);
  readonly healthData = signal<HealthResponse | null>(null);
  readonly checkingHealth = signal<boolean>(false);
  readonly lastCheckedTime = signal<Date | null>(null);

  setBackendUrl(url: string): void {
    this.backendBaseUrl = url.replace(/\/$/, '');
  }

  getBackendUrl(): string {
    return this.backendBaseUrl;
  }

  async checkHealth(deep = false): Promise<HealthResponse> {
    this.checkingHealth.set(true);
    const url = `${this.backendBaseUrl}/health${deep ? '?deep=true' : ''}`;
    try {
      const response = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(4000) });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data: HealthResponse = await response.json();
      this.healthData.set(data);
      this.isBackendConnected.set(true);
      this.lastCheckedTime.set(new Date());
      this.checkingHealth.set(false);
      return data;
    } catch {
      // Fallback state when backend is local or not yet started
      const fallback: HealthResponse = {
        status: 'degraded',
        timestamp: Date.now(),
        mode: 'nest (offline preview)',
        uptimeSeconds: 0,
        ai: {
          status: 'ok',
          provider: 'openai (configured)',
          model: 'gpt-4.1-mini',
          liveProbe: false
        },
        stateStore: {
          backend: 'sqlite',
          ready: true
        }
      };
      this.healthData.set(fallback);
      this.isBackendConnected.set(false);
      this.lastCheckedTime.set(new Date());
      this.checkingHealth.set(false);
      return fallback;
    }
  }

  async fetchMetrics(): Promise<string> {
    try {
      const response = await fetch(`${this.backendBaseUrl}/metrics`, {
        signal: AbortSignal.timeout(4000)
      });
      if (response.ok) {
        return await response.text();
      }
      return '# Error retrieving live metrics from ' + this.backendBaseUrl;
    } catch {
      return [
        '# MergeSentinel Prometheus Metrics (Simulated Preview)',
        'pr_agent_webhook_requests_total{event="pull_request",action="opened"} 42',
        'pr_agent_webhook_requests_total{event="issue_comment",action="created"} 18',
        'pr_agent_ai_requests_total{provider="openai",status="success"} 39',
        'pr_agent_ai_requests_total{provider="openai",status="error"} 0',
        'pr_agent_ai_duration_seconds_sum 84.32',
        'pr_agent_ai_duration_seconds_count 39',
        'pr_agent_dedup_hits_total 5',
        'pr_agent_rate_limit_hits_total 0'
      ].join('\n');
    }
  }
}
