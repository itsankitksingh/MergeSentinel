import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AgentApiService } from '../services/agent-api.service';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="overview-container">
      <!-- Welcome Hero Banner -->
      <section class="hero-banner glass-panel">
        <div class="hero-content">
          <div class="hero-badge badge badge-indigo">
            <span class="status-dot"></span>
            MergeSentinel v0.1.0 • Nx Workspace
          </div>
          <h1 class="hero-title">AI Code Review & Repository Governance</h1>
          <p class="hero-subtitle">
            Autonomous pull request reviews, team policy guardrails, and GitHub App automation powered by NestJS and multi-provider LLMs.
          </p>

          <div class="hero-actions">
            <a routerLink="/policy-editor" class="btn-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              Configure Policy (.pr-agent.yml)
            </a>
            <a routerLink="/commands" class="btn-secondary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="4 17 10 11 4 5"></polyline>
                <line x1="12" y1="19" x2="20" y2="19"></line>
              </svg>
              Explore 20+ Commands
            </a>
            <button (click)="refreshHealth()" class="btn-secondary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 4v6h-6"></path>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
              </svg>
              {{ api.checkingHealth() ? 'Pinging...' : 'Ping Backend' }}
            </button>
          </div>
        </div>

        <div class="hero-stats">
          <div class="stat-card">
            <div class="stat-label">AI Engine</div>
            <div class="stat-value text-indigo">
              {{ api.healthData()?.ai?.provider || 'OpenAI / Gemini' }}
            </div>
            <div class="stat-desc">Multi-Provider Concurrency Limiter</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Backend Status</div>
            <div class="stat-value" [ngClass]="api.isBackendConnected() ? 'text-emerald' : 'text-amber'">
              {{ api.isBackendConnected() ? 'Online (NestJS)' : 'Standby / Local' }}
            </div>
            <div class="stat-desc">Port 3000 • Probot Webhook Router</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Persistence</div>
            <div class="stat-value text-purple">
              {{ api.healthData()?.stateStore?.backend || 'SQLite' }}
            </div>
            <div class="stat-desc">Deduplication & Incremental Shas</div>
          </div>
        </div>
      </section>

      <!-- Feature Grid -->
      <section class="section-block">
        <h2 class="section-heading">Core Capabilities</h2>
        <div class="features-grid">
          <div class="feature-card glass-panel">
            <div class="feature-icon icon-indigo">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 6v6l4 2"></path>
              </svg>
            </div>
            <h3 class="feature-title">Automated PR Reviews</h3>
            <p class="feature-desc">
              Triggers on PR open, update, and merge. Delivers line-by-line GitHub Suggested Changes or comprehensive risk reports with Mermaid visual diagrams.
            </p>
          </div>

          <div class="feature-card glass-panel">
            <div class="feature-icon icon-emerald">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <h3 class="feature-title">Process & Security Guardrails</h3>
            <p class="feature-desc">
              Lightweight regex secret scanning prevents accidental credential leaks. Enforces Issue and PR templates via custom <code>.pr-agent.yml</code> policies.
            </p>
          </div>

          <div class="feature-card glass-panel">
            <div class="feature-icon icon-purple">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h3 class="feature-title">Multi-Turn Q&A (<code>/ask</code>)</h3>
            <p class="feature-desc">
              Ask questions directly on any PR diff using <code>/ask</code>. The AI maintains conversation memory for up to 6 turns per session with FNV session hashing.
            </p>
          </div>

          <div class="feature-card glass-panel">
            <div class="feature-icon icon-cyan">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </svg>
            </div>
            <h3 class="feature-title">Incremental Diff Reviews</h3>
            <p class="feature-desc">
              Tracks the last reviewed commit SHA. When new commits are pushed, only fresh diff hunks are reviewed, saving tokens and avoiding duplicate feedback.
            </p>
          </div>
        </div>
      </section>

      <!-- Architecture Topology Section -->
      <section class="section-block">
        <h2 class="section-heading">Monorepo Architecture (Nx)</h2>
        <div class="topology-panel glass-panel">
          <div class="topology-grid">
            <div class="topology-box box-frontend">
              <div class="box-tag badge badge-indigo">Angular 19</div>
              <h4>apps/frontend</h4>
              <p>Management dashboard, policy editor, metrics inspector, and command playground.</p>
              <code>Port 4200 (ng serve)</code>
            </div>
            <div class="topology-arrow">⇄</div>
            <div class="topology-box box-backend">
              <div class="box-tag badge badge-emerald">NestJS 11</div>
              <h4>apps/backend</h4>
              <p>Probot webhooks, AI review engine, dedupe cache, patch parser, and SQLite state.</p>
              <code>Port 3000 (main.ts)</code>
            </div>
            <div class="topology-arrow">→</div>
            <div class="topology-box box-ai">
              <div class="box-tag badge badge-purple">LLM Engine</div>
              <h4>AI Providers</h4>
              <p>Groq (LPU inference), OpenAI, Google Gemini, Anthropic Claude, or OpenAI-compatible endpoints.</p>
              <code>Zod Schema Validation</code>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .overview-container {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .hero-banner {
      display: grid;
      grid-template-columns: 1.4fr 1fr;
      gap: 32px;
      padding: 36px;
      border-radius: var(--radius-xl);
      background: linear-gradient(135deg, rgba(17, 23, 38, 0.9), rgba(15, 23, 42, 0.8));
    }

    @media (max-width: 900px) {
      .hero-banner {
        grid-template-columns: 1fr;
      }
    }

    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--accent-indigo);
      box-shadow: 0 0 8px var(--accent-indigo);
    }

    .hero-title {
      font-size: 2.3rem;
      font-weight: 800;
      letter-spacing: -0.03em;
      margin: 16px 0 12px;
      background: linear-gradient(135deg, #ffffff 40%, #a5b4fc);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      line-height: 1.2;
    }

    .hero-subtitle {
      color: var(--text-secondary);
      font-size: 1.05rem;
      line-height: 1.6;
      margin-bottom: 24px;
    }

    .hero-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    .hero-stats {
      display: flex;
      flex-direction: column;
      gap: 16px;
      justify-content: center;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 16px 20px;
    }

    .stat-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      font-weight: 600;
    }

    .stat-value {
      font-size: 1.35rem;
      font-weight: 700;
      margin: 4px 0;
    }

    .stat-desc {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }

    .text-indigo { color: #a5b4fc; }
    .text-emerald { color: #34d399; }
    .text-purple { color: #c084fc; }
    .text-amber { color: #fcd34d; }

    .section-block {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .section-heading {
      font-size: 1.4rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--text-primary);
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 20px;
    }

    .feature-card {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .feature-icon {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon-indigo { background: rgba(99, 102, 241, 0.15); color: #818cf8; }
    .icon-emerald { background: rgba(16, 185, 129, 0.15); color: #34d399; }
    .icon-purple { background: rgba(139, 92, 246, 0.15); color: #a78bfa; }
    .icon-cyan { background: rgba(6, 182, 212, 0.15); color: #22d3ee; }

    .feature-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .feature-desc {
      font-size: 0.9rem;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .topology-panel {
      padding: 28px;
    }

    .topology-grid {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }

    .topology-box {
      flex: 1;
      min-width: 200px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .topology-box h4 {
      font-size: 1.1rem;
      font-weight: 600;
    }

    .topology-box p {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }

    .topology-box code {
      font-size: 0.8rem;
      color: #a5b4fc;
      background: rgba(0, 0, 0, 0.3);
      padding: 4px 8px;
      border-radius: var(--radius-sm);
      margin-top: 4px;
      display: inline-block;
    }

    .topology-arrow {
      font-size: 1.5rem;
      color: var(--text-muted);
      font-weight: 300;
    }
  `]
})
export class OverviewComponent implements OnInit {
  readonly api = inject(AgentApiService);

  ngOnInit(): void {
    void this.api.checkHealth();
  }

  refreshHealth(): void {
    void this.api.checkHealth(true);
  }
}
