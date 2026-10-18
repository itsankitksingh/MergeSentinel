import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface CommandInfo {
  name: string;
  syntax: string;
  category: 'Review' | 'Questions' | 'Generation' | 'Intelligence';
  description: string;
  sampleInput: string;
  sampleOutput: string;
}

@Component({
  selector: 'app-commands-playground',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="playground-container">
      <div class="header-section">
        <div>
          <h2 class="page-title">Interactive Command Playground</h2>
          <p class="page-desc">
            Test and simulate all 20+ slash commands supported by MergeSentinel in pull request comments.
          </p>
        </div>
        <div class="category-tabs">
          <button *ngFor="let cat of categories" 
                  (click)="selectedCategory.set(cat)" 
                  class="tab-btn" 
                  [class.active]="selectedCategory() === cat">
            {{ cat }}
          </button>
        </div>
      </div>

      <div class="playground-grid">
        <!-- Command List Column -->
        <div class="commands-list-panel glass-panel">
          <div class="list-search-box">
            <input type="text" [(ngModel)]="searchQuery" placeholder="Filter commands (/ask, /improve...)" class="search-input">
          </div>
          <div class="command-items-scroll">
            <div *ngFor="let cmd of filteredCommands()" 
                 (click)="selectCommand(cmd)" 
                 class="command-item" 
                 [class.selected]="selectedCmd().name === cmd.name">
              <div class="cmd-item-header">
                <span class="cmd-name">{{ cmd.name }}</span>
                <span class="badge" [ngClass]="getBadgeClass(cmd.category)">{{ cmd.category }}</span>
              </div>
              <p class="cmd-item-desc">{{ cmd.description }}</p>
            </div>
          </div>
        </div>

        <!-- Command Simulator Column -->
        <div class="simulator-panel glass-panel">
          <div class="sim-header">
            <div>
              <h3 class="sim-title">{{ selectedCmd().syntax }}</h3>
              <span class="sim-desc">{{ selectedCmd().description }}</span>
            </div>
            <button (click)="simulateRun()" class="btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
              Simulate Execution
            </button>
          </div>

          <!-- Comment Input Simulation -->
          <div class="sim-box">
            <label class="sim-label">Simulated PR Comment Input</label>
            <div class="github-comment-input">
              <span class="comment-author">&#64;developer:</span>
              <input type="text" [(ngModel)]="activeInput" class="comment-text-input">
            </div>
          </div>

          <!-- Bot Response Simulation -->
          <div class="sim-box">
            <div class="response-header">
              <label class="sim-label">MergeSentinel GitHub Bot Response</label>
              <span class="badge badge-indigo">MergeSentinel Bot • Verified</span>
            </div>
            <div class="github-comment-body">
              <div class="bot-header">
                <div class="bot-avatar">🤖</div>
                <div class="bot-meta">
                  <span class="bot-name">mergesentinel[bot]</span>
                  <span class="bot-time">just now</span>
                </div>
              </div>
              <pre class="response-pre"><code>{{ simulatedOutput() }}</code></pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .playground-container {
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

    .category-tabs {
      display: flex;
      gap: 6px;
      background: rgba(255, 255, 255, 0.03);
      padding: 4px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
    }

    .tab-btn {
      background: transparent;
      border: none;
      color: var(--text-secondary);
      padding: 6px 14px;
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .tab-btn.active {
      background: var(--accent-indigo);
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
    }

    .playground-grid {
      display: grid;
      grid-template-columns: 360px 1fr;
      gap: 24px;
      align-items: start;
    }

    @media (max-width: 900px) {
      .playground-grid {
        grid-template-columns: 1fr;
      }
    }

    .commands-list-panel, .simulator-panel {
      padding: 20px;
    }

    .search-input {
      width: 100%;
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      padding: 8px 12px;
      font-size: 0.9rem;
      outline: none;
      margin-bottom: 14px;
    }

    .search-input:focus {
      border-color: var(--accent-indigo);
    }

    .command-items-scroll {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 580px;
      overflow-y: auto;
      padding-right: 4px;
    }

    .command-item {
      padding: 12px 14px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .command-item:hover {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .command-item.selected {
      background: rgba(99, 102, 241, 0.12);
      border-color: var(--accent-indigo);
      box-shadow: 0 0 12px rgba(99, 102, 241, 0.2);
    }

    .cmd-item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }

    .cmd-name {
      font-family: var(--font-mono);
      font-weight: 600;
      color: #a5b4fc;
      font-size: 0.95rem;
    }

    .cmd-item-desc {
      font-size: 0.8rem;
      color: var(--text-secondary);
      line-height: 1.4;
    }

    .sim-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--border-subtle);
    }

    .sim-title {
      font-family: var(--font-mono);
      font-size: 1.3rem;
      font-weight: 600;
      color: #e0e7ff;
    }

    .sim-desc {
      font-size: 0.9rem;
      color: var(--text-secondary);
      display: block;
      margin-top: 4px;
    }

    .sim-box {
      margin-bottom: 20px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .sim-label {
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--text-muted);
    }

    .github-comment-input {
      display: flex;
      align-items: center;
      background: #0d1117;
      border: 1px solid #30363d;
      border-radius: var(--radius-md);
      padding: 10px 14px;
      gap: 8px;
    }

    .comment-author {
      color: #58a6ff;
      font-family: var(--font-mono);
      font-size: 0.9rem;
      font-weight: 600;
    }

    .comment-text-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: #f0f6fc;
      font-family: var(--font-mono);
      font-size: 0.95rem;
    }

    .response-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .github-comment-body {
      background: #0d1117;
      border: 1px solid #30363d;
      border-radius: var(--radius-md);
      padding: 16px;
    }

    .bot-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .bot-avatar {
      font-size: 1.3rem;
    }

    .bot-name {
      font-weight: 600;
      color: #f0f6fc;
      font-size: 0.9rem;
    }

    .bot-time {
      color: #8b949e;
      font-size: 0.8rem;
      margin-left: 8px;
    }

    .response-pre {
      font-family: var(--font-mono);
      font-size: 0.85rem;
      line-height: 1.6;
      color: #e6edf3;
      white-space: pre-wrap;
      word-break: break-word;
      max-height: 380px;
      overflow-y: auto;
    }
  `]
})
export class CommandsPlaygroundComponent {
  readonly categories = ['All', 'Review', 'Questions', 'Generation', 'Intelligence'];
  readonly selectedCategory = signal<string>('All');
  searchQuery = '';

  readonly commands: CommandInfo[] = [
    {
      name: '/ai-review',
      syntax: '/ai-review [report | comment]',
      category: 'Review',
      description: 'Triggers on-demand AI review in comment mode (suggested changes) or report mode.',
      sampleInput: '/ai-review report',
      sampleOutput: `### 🤖 MergeSentinel Review Summary\n\n**Risk Level**: 🟢 Low (0 critical bugs)\n\n#### Key Findings\n- Added input validation for webhook replay endpoint.\n- Suggestion: Consider handling rate limit reset headers in ` + '`fetchWithRetry`' + `.\n\n\`\`\`mermaid\ngraph LR\n  Controller --> Service --> AIReviewer\n\`\`\``
    },
    {
      name: '/ask',
      syntax: '/ask <question>',
      category: 'Questions',
      description: 'Multi-turn conversational Q&A against the pull request diff with session memory.',
      sampleInput: '/ask does this patch introduce any memory leaks in the cache?',
      sampleOutput: `Based on the diff in \`cache.ts\`, the \`ExpiringCacheEntry\` is regularly purged by \`pruneExpiredCache()\` using an FNV-hashed interval. No uncollected timer references or unbounded memory maps were detected.`
    },
    {
      name: '/checks',
      syntax: '/checks [question]',
      category: 'Questions',
      description: 'Diagnoses failed CI check runs and suggests concrete code patches to fix them.',
      sampleInput: '/checks why did the test:backend check fail?',
      sampleOutput: `The check \`test:backend\` failed at \`tests/runtime-state-persistence.test.ts:42\`:\n- Cause: SQLite lock timeout exceeded (expected 5000ms).\n- Recommendation: Increase \`RUNTIME_STATE_SQLITE_BUSY_TIMEOUT_MS=10000\` in test options.`
    },
    {
      name: '/improve',
      syntax: '/improve [focus]',
      category: 'Review',
      description: 'Forces improvement-focused review recommendations (readability, performance, security).',
      sampleInput: '/improve performance',
      sampleOutput: `### ⚡ Improvement Suggestions (Focus: Performance)\n\n1. In \`patch.ts\` (line 124):\nAvoid repetitive regex allocation inside loop.\n\`\`\`suggestion\nconst HUNK_REGEX = /^@@ -(\\d+),?(\\d*) \\+(\\d+),?(\\d*) @@/;\n\`\`\``
    },
    {
      name: '/describe',
      syntax: '/describe [--apply]',
      category: 'Generation',
      description: 'Generates or automatically updates PR title and markdown description based on diff.',
      sampleInput: '/describe --apply',
      sampleOutput: `Successfully applied updated PR description:\n\n## Summary of Changes\n- Migrated repository structure to Nx monorepo with Angular 19 console and NestJS backend.\n- Configured project.json and npm workspaces.`
    },
    {
      name: '/changelog',
      syntax: '/changelog [--apply]',
      category: 'Generation',
      description: 'Extracts user-facing changes and optionally commits directly into CHANGELOG.md.',
      sampleInput: '/changelog',
      sampleOutput: `### Proposed CHANGELOG Entry\n\n#### Added\n- Interactive Angular 19 dashboard console.\n- Real-time policy generator for \`.pr-agent.yml\`.\n\n#### Changed\n- Monorepo orchestration transitioned to Nx.`
    },
    {
      name: '/generate_tests',
      syntax: '/generate_tests [focus]',
      category: 'Generation',
      description: 'Generates unit test suites covering edge cases and negative branches.',
      sampleInput: '/generate_tests runtime-state',
      sampleOutput: `\`\`\`typescript\ndescribe('SqliteRuntimeStateStore', () => {\n  it('should handle concurrency locks cleanly', async () => {\n    const store = new SqliteRuntimeStateStore(':memory:');\n    // Generated test implementation\n  });\n});\n\`\`\``
    },
    {
      name: '/similar_issue',
      syntax: '/similar_issue [query]',
      category: 'Intelligence',
      description: 'Searches the repository issue tracker for duplicate or related issues.',
      sampleInput: '/similar_issue webhook signature verification',
      sampleOutput: `🔍 Found 2 similar issues:\n1. #42 "HMAC hex signature mismatch on chunked payload" (closed)\n2. #89 "Webhook replay endpoint token bypass" (closed)`
    },
    {
      name: '/compliance',
      syntax: '/compliance [focus]',
      category: 'Intelligence',
      description: 'Audits changes against security, privacy, and dependency licensing standards.',
      sampleInput: '/compliance',
      sampleOutput: `### 🛡️ Compliance & Security Audit\n- Secret scan: PASSED (0 leaks)\n- Dependency check: No vulnerable packages introduced\n- Process template: Pull request template sections validated`
    }
  ];

  readonly selectedCmd = signal<CommandInfo>(this.commands[0]!);
  activeInput = this.commands[0]!.sampleInput;
  readonly simulatedOutput = signal<string>(this.commands[0]!.sampleOutput);

  filteredCommands(): CommandInfo[] {
    const q = this.searchQuery.toLowerCase();
    const cat = this.selectedCategory();
    return this.commands.filter(c => {
      const matchCat = cat === 'All' || c.category === cat;
      const matchQuery = !q || c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }

  selectCommand(cmd: CommandInfo): void {
    this.selectedCmd.set(cmd);
    this.activeInput = cmd.sampleInput;
    this.simulatedOutput.set(cmd.sampleOutput);
  }

  simulateRun(): void {
    this.simulatedOutput.set(`Executing "${this.activeInput}" on current PR diff...\n\n` + this.selectedCmd().sampleOutput);
  }

  getBadgeClass(category: string): string {
    switch (category) {
      case 'Review': return 'badge-indigo';
      case 'Questions': return 'badge-emerald';
      case 'Generation': return 'badge-purple';
      case 'Intelligence': return 'badge-amber';
      default: return 'badge-indigo';
    }
  }
}
