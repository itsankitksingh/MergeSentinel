import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AgentApiService } from './services/agent-api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-layout">
      <!-- Navbar -->
      <header class="app-header glass-panel">
        <div class="header-inner">
          <div class="brand">
            <a routerLink="/" class="brand-link">
              <div class="brand-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <div class="brand-text">
                <span class="brand-name">MergeSentinel</span>
                <span class="brand-badge">Console</span>
              </div>
            </a>
          </div>

          <nav class="nav-links">
            <a routerLink="/overview" routerLinkActive="active" class="nav-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              Overview
            </a>
            <a routerLink="/policy-editor" routerLinkActive="active" class="nav-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              Policy Editor
            </a>
            <a routerLink="/health" routerLinkActive="active" class="nav-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>
              Health & Metrics
            </a>
            <a routerLink="/commands" routerLinkActive="active" class="nav-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="4 17 10 11 4 5"></polyline>
                <line x1="12" y1="19" x2="20" y2="19"></line>
              </svg>
              Commands
            </a>
          </nav>

          <div class="header-status">
            <div class="status-pill" [class.online]="api.isBackendConnected()" [class.standby]="!api.isBackendConnected()">
              <span class="status-glow-dot"></span>
              <span class="status-text">
                {{ api.isBackendConnected() ? 'NestJS Online' : 'Backend Standby' }}
              </span>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content Outlet -->
      <main class="app-main">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="app-footer">
        <div class="footer-inner">
          <p class="footer-copy">
            MergeSentinel • AI-Powered Code Review & Governance System
          </p>
          <div class="footer-badges">
            <span class="badge badge-indigo">Nx Monorepo</span>
            <span class="badge badge-purple">Angular 19</span>
            <span class="badge badge-emerald">NestJS 11</span>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .app-header {
      position: sticky;
      top: 16px;
      margin: 16px 24px;
      z-index: 100;
      padding: 12px 24px;
      border-radius: var(--radius-lg);
    }

    .header-inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .brand-link {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: var(--text-primary);
    }

    .brand-icon {
      width: 38px;
      height: 38px;
      border-radius: var(--radius-md);
      background: linear-gradient(135deg, var(--accent-indigo), var(--accent-purple));
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
    }

    .brand-text {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .brand-name {
      font-weight: 700;
      font-size: 1.15rem;
      letter-spacing: -0.02em;
    }

    .brand-badge {
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      padding: 2px 6px;
      border-radius: 4px;
      background: rgba(99, 102, 241, 0.2);
      color: #a5b4fc;
      border: 1px solid rgba(99, 102, 241, 0.3);
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      color: var(--text-secondary);
      font-size: 0.9rem;
      font-weight: 500;
      padding: 8px 14px;
      border-radius: var(--radius-md);
      transition: all 0.2s ease;
    }

    .nav-item:hover {
      color: var(--text-primary);
      background: rgba(255, 255, 255, 0.05);
    }

    .nav-item.active {
      color: #ffffff;
      background: rgba(99, 102, 241, 0.2);
      border: 1px solid rgba(99, 102, 241, 0.35);
      font-weight: 600;
    }

    .status-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      border-radius: 9999px;
      font-size: 0.8rem;
      font-weight: 600;
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid var(--border-subtle);
    }

    .status-pill.online {
      border-color: rgba(16, 185, 129, 0.4);
      color: #34d399;
    }

    .status-pill.online .status-glow-dot {
      background: #10b981;
      box-shadow: 0 0 10px #10b981;
    }

    .status-pill.standby {
      border-color: rgba(245, 158, 11, 0.4);
      color: #fbbf24;
    }

    .status-pill.standby .status-glow-dot {
      background: #f59e0b;
      box-shadow: 0 0 10px #f59e0b;
    }

    .status-glow-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .app-main {
      flex: 1;
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
      padding: 24px 24px 64px;
    }

    .app-footer {
      border-top: 1px solid var(--border-subtle);
      padding: 24px;
      margin-top: auto;
      background: rgba(10, 13, 20, 0.6);
    }

    .footer-inner {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
    }

    .footer-copy {
      color: var(--text-muted);
      font-size: 0.85rem;
    }

    .footer-badges {
      display: flex;
      gap: 8px;
    }

    @media (max-width: 768px) {
      .app-header {
        margin: 10px;
        padding: 10px 14px;
      }
      .nav-links {
        display: none;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  readonly api = inject(AgentApiService);

  ngOnInit(): void {
    void this.api.checkHealth();
  }
}
