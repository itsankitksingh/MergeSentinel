import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-policy-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="policy-container">
      <div class="header-section">
        <div>
          <h2 class="page-title">Repository Policy Editor</h2>
          <p class="page-desc">
            Configure <code>.pr-agent.yml</code> to enforce branch protections, template standards, and AI review preferences.
          </p>
        </div>
        <div class="header-actions">
          <button (click)="copyYaml()" class="btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            {{ copied() ? 'Copied to Clipboard!' : 'Copy .pr-agent.yml' }}
          </button>
        </div>
      </div>

      <div class="editor-grid">
        <!-- Configuration Form -->
        <div class="form-panel glass-panel">
          <h3 class="panel-heading">Policy Parameters</h3>

          <!-- Mode Selection -->
          <div class="form-group">
            <label class="form-label">Enforcement Mode</label>
            <div class="radio-group">
              <label class="radio-card" [class.active]="mode() === 'remind'">
                <input type="radio" name="mode" value="remind" [checked]="mode() === 'remind'" (change)="mode.set('remind')">
                <div>
                  <div class="radio-title">Remind</div>
                  <div class="radio-desc">Leaves polite reminder comments on issues/PRs without blocking merges.</div>
                </div>
              </label>
              <label class="radio-card" [class.active]="mode() === 'enforce'">
                <input type="radio" name="mode" value="enforce" [checked]="mode() === 'enforce'" (change)="mode.set('enforce')">
                <div>
                  <div class="radio-title">Enforce</div>
                  <div class="radio-desc">Fails the <code>MergeSentinel Policy</code> GitHub Check run to block merges until resolved.</div>
                </div>
              </label>
            </div>
          </div>

          <!-- Pull Request Section -->
          <div class="form-group">
            <label class="form-label">Pull Request Standards</label>
            <div class="checkbox-row">
              <label class="checkbox-label">
                <input type="checkbox" [checked]="requireLinkedIssue()" (change)="toggleLinkedIssue()">
                <span>Require Linked Issue (Fixes #123)</span>
              </label>
            </div>
            <div class="input-row">
              <label>Min PR Description Characters:</label>
              <input type="number" [value]="prMinLength()" (input)="updatePrMinLength($event)" class="form-input-number">
            </div>
          </div>

          <!-- Review Controls -->
          <div class="form-group">
            <label class="form-label">Review Configuration</label>
            <div class="input-row">
              <label>Default Output Mode:</label>
              <select [value]="reviewMode()" (change)="updateReviewMode($event)" class="form-select">
                <option value="comment">Line Comment Mode (Suggested Changes)</option>
                <option value="report">Summary Report Mode (Risk & Mermaid)</option>
              </select>
            </div>
            <div class="checkbox-stack">
              <label class="checkbox-label">
                <input type="checkbox" [checked]="secretScan()" (change)="secretScan.set(!secretScan())">
                <span>Enable Secret & Credential Scanning</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" [checked]="autoLabel()" (change)="autoLabel.set(!autoLabel())">
                <span>Auto-Apply PR Labels (bugfix, feature, refactor, security)</span>
              </label>
              <label class="checkbox-label">
                <input type="checkbox" [checked]="ciChecks()" (change)="ciChecks.set(!ciChecks())">
                <span>Analyze Failed CI Checks in Review</span>
              </label>
            </div>
          </div>

          <!-- Custom Team Rules -->
          <div class="form-group">
            <label class="form-label">Team Custom Review Rules</label>
            <div class="rules-input-row">
              <input type="text" [(ngModel)]="newRuleText" placeholder="e.g. Ensure all new API endpoints have rate-limiting" class="form-input">
              <button (click)="addRule()" class="btn-secondary">Add Rule</button>
            </div>
            <ul class="rules-list">
              <li *ngFor="let rule of customRules(); let i = index" class="rule-item">
                <span>{{ rule }}</span>
                <button (click)="removeRule(i)" class="btn-remove">×</button>
              </li>
            </ul>
          </div>
        </div>

        <!-- Live YAML Output -->
        <div class="yaml-panel glass-panel">
          <div class="yaml-header">
            <div class="file-pill">
              <span class="file-icon">📄</span>
              .pr-agent.yml
            </div>
            <span class="badge badge-indigo">Auto-Generated</span>
          </div>
          <pre class="yaml-code"><code>{{ generatedYaml() }}</code></pre>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .policy-container {
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

    .editor-grid {
      display: grid;
      grid-template-columns: 1.1fr 1fr;
      gap: 24px;
      align-items: start;
    }

    @media (max-width: 960px) {
      .editor-grid {
        grid-template-columns: 1fr;
      }
    }

    .form-panel, .yaml-panel {
      padding: 24px;
    }

    .panel-heading {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border-subtle);
    }

    .form-group {
      margin-bottom: 22px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .form-label {
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--text-muted);
    }

    .radio-group {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .radio-card {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 14px;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-md);
      background: rgba(255, 255, 255, 0.02);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .radio-card.active {
      border-color: var(--accent-indigo);
      background: rgba(99, 102, 241, 0.1);
      box-shadow: 0 0 14px rgba(99, 102, 241, 0.2);
    }

    .radio-title {
      font-weight: 600;
      color: var(--text-primary);
      font-size: 0.95rem;
    }

    .radio-desc {
      font-size: 0.8rem;
      color: var(--text-secondary);
      margin-top: 2px;
    }

    .input-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      font-size: 0.9rem;
      color: var(--text-secondary);
    }

    .form-input-number, .form-select, .form-input {
      background: rgba(0, 0, 0, 0.35);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      padding: 8px 12px;
      font-size: 0.9rem;
      outline: none;
      transition: border-color 0.2s ease;
    }

    .form-input-number {
      width: 90px;
      text-align: right;
    }

    .form-input-number:focus, .form-select:focus, .form-input:focus {
      border-color: var(--accent-indigo);
    }

    .checkbox-stack {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 8px;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.9rem;
      color: var(--text-secondary);
      cursor: pointer;
    }

    .checkbox-label input[type="checkbox"] {
      accent-color: var(--accent-indigo);
      width: 16px;
      height: 16px;
    }

    .rules-input-row {
      display: flex;
      gap: 8px;
    }

    .rules-input-row .form-input {
      flex: 1;
    }

    .rules-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 8px;
    }

    .rule-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
      color: var(--text-primary);
    }

    .btn-remove {
      background: transparent;
      border: none;
      color: var(--accent-rose);
      font-size: 1.2rem;
      cursor: pointer;
      line-height: 1;
      padding: 0 4px;
    }

    .yaml-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border-subtle);
    }

    .file-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: var(--font-mono);
      font-weight: 600;
      color: #a5b4fc;
      font-size: 0.95rem;
    }

    .yaml-code {
      background: #06090e;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: var(--radius-md);
      padding: 16px;
      font-family: var(--font-mono);
      font-size: 0.85rem;
      line-height: 1.6;
      color: #e2e8f0;
      overflow-x: auto;
      max-height: 520px;
    }
  `]
})
export class PolicyEditorComponent {
  readonly mode = signal<'remind' | 'enforce'>('enforce');
  readonly requireLinkedIssue = signal<boolean>(true);
  readonly prMinLength = signal<number>(20);
  readonly reviewMode = signal<'comment' | 'report'>('comment');
  readonly secretScan = signal<boolean>(true);
  readonly autoLabel = signal<boolean>(true);
  readonly ciChecks = signal<boolean>(true);

  newRuleText = '';
  readonly customRules = signal<string[]>([
    'Ensure all newly created API endpoints have validation schemas and rate limiting.',
    'Do not hardcode secrets or private keys in source code.'
  ]);

  readonly copied = signal<boolean>(false);

  toggleLinkedIssue(): void {
    this.requireLinkedIssue.set(!this.requireLinkedIssue());
  }

  updatePrMinLength(event: Event): void {
    const val = Number((event.target as HTMLInputElement).value) || 0;
    this.prMinLength.set(val);
  }

  updateReviewMode(event: Event): void {
    const val = (event.target as HTMLSelectElement).value as 'comment' | 'report';
    this.reviewMode.set(val);
  }

  addRule(): void {
    const text = this.newRuleText.trim();
    if (text) {
      this.customRules.update((rules) => [...rules, text]);
      this.newRuleText = '';
    }
  }

  removeRule(index: number): void {
    this.customRules.update((rules) => rules.filter((_, i) => i !== index));
  }

  readonly generatedYaml = computed(() => {
    const rulesYaml = this.customRules().length > 0
      ? `  customRules:\n${this.customRules().map(r => `    - "${r}"`).join('\n')}`
      : '  customRules: []';

    return `# =========================================
# MergeSentinel Repository Policy (.pr-agent.yml)
# =========================================

# Policy enforcement mode:
# - remind: leaves friendly comment if template is missing
# - enforce: fails the GitHub Check "MergeSentinel Policy" to protect branch
mode: ${this.mode()}

# Pull Request standards
pullRequest:
  enabled: true
  minBodyLength: ${this.prMinLength()}
  requireLinkedIssue: ${this.requireLinkedIssue()}
  requiredSections:
    - "Summary"
    - "Testing"
    - "Checklist"

# Issue standards
issue:
  enabled: true
  minBodyLength: 10
  requiredSections:
    - "Description"

# AI Review engine configuration
review:
  enabled: true
  mode: ${this.reviewMode()}
  onOpened: true
  onEdited: true
  onSynchronize: true
  secretScanEnabled: ${this.secretScan()}
  autoLabelEnabled: ${this.autoLabel()}
  includeCiChecks: ${this.ciChecks()}
${rulesYaml}
`;
  });

  copyYaml(): void {
    void navigator.clipboard.writeText(this.generatedYaml());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2500);
  }
}
