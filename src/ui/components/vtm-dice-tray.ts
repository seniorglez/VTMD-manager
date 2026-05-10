import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { CombatBLC, RollResult } from '../../domain/combat/CombatBLC'

@customElement('vtm-dice-tray')
export class VtmDiceTray extends LitElement {
  static styles = css`
    :host {
      display: block;
      background: #111;
      border-top: 1px solid #2a2a2a;
      font-family: Georgia, 'Times New Roman', serif;
      color: #c8b8a2;
      flex-shrink: 0;
    }

    /* ── Header row — always visible ── */
    .tray-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 6px 16px;
      background: #161616;
      border-bottom: 1px solid #2a2a2a;
      min-height: 36px;
    }
    .tray-title {
      font-size: 0.75rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #6b5e4e;
    }
    .tray-pool-count {
      font-size: 0.9rem;
      color: #c8b8a2;
      font-weight: bold;
      min-width: 24px;
    }
    .tray-contributions {
      flex: 1;
      font-size: 0.78rem;
      color: #6b5e4e;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .tray-toggle {
      background: none;
      border: 1px solid #2a2a2a;
      color: #6b5e4e;
      font-family: inherit;
      font-size: 0.75rem;
      padding: 3px 8px;
      border-radius: 2px;
      cursor: pointer;
      white-space: nowrap;
    }
    .tray-toggle:hover { color: #c8b8a2; border-color: #6b5e4e; }

    /* ── Body — visible when expanded ── */
    .tray-body {
      padding: 10px 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    /* ── Controls row ── */
    .controls {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .difficulty-label {
      font-size: 0.78rem;
      color: #6b5e4e;
    }
    input[type="number"] {
      width: 44px;
      background: #1a1a1a;
      border: 1px solid #2a2a2a;
      color: #c8b8a2;
      font-family: inherit;
      font-size: 0.85rem;
      padding: 3px 6px;
      border-radius: 2px;
      text-align: center;
    }
    input[type="number"]:focus { outline: none; border-color: #6b5e4e; }
    .specialty-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.78rem;
      color: #6b5e4e;
      cursor: pointer;
      user-select: none;
    }
    input[type="checkbox"] { accent-color: #8b0000; cursor: pointer; }
    .btn {
      background: none;
      border: 1px solid #2a2a2a;
      color: #6b5e4e;
      font-family: inherit;
      font-size: 0.8rem;
      padding: 4px 12px;
      border-radius: 2px;
      cursor: pointer;
      transition: color 0.15s, border-color 0.15s;
    }
    .btn:hover:not(:disabled) { color: #c8b8a2; border-color: #6b5e4e; }
    .btn:disabled { opacity: 0.35; cursor: default; }
    .btn.primary {
      background: #8b0000;
      border-color: #8b0000;
      color: #c8b8a2;
    }
    .btn.primary:hover:not(:disabled) { background: #c0392b; border-color: #c0392b; }

    /* ── Result ── */
    .result {
      border-top: 1px solid #2a2a2a;
      padding-top: 10px;
      display: flex;
      align-items: baseline;
      gap: 16px;
      flex-wrap: wrap;
    }
    .result-dice {
      font-size: 0.82rem;
      letter-spacing: 0.06em;
      color: #6b5e4e;
    }
    .result-dice .die-success { color: #c8b8a2; }
    .result-dice .die-one { color: #8b0000; }
    .result-dice .die-fail { color: #3a3a3a; }
    .result-summary { font-size: 0.85rem; color: #6b5e4e; }
    .result-outcome {
      font-size: 0.9rem;
      font-weight: bold;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }
    .outcome-success { color: #c8b8a2; }
    .outcome-failure { color: #6b5e4e; }
    .outcome-botch { color: #8b0000; }
  `

  @property({ attribute: false }) declare blc: CombatBLC

  @state() private contributions: { label: string; value: number }[] = []
  @state() private difficulty = 6
  @state() private specialty = false
  @state() private collapsed = false
  @state() private result: RollResult | null = null

  addDice(label: string, value: number) {
    this.contributions = [...this.contributions, { label, value }]
    this.result = null
  }

  private get _pool(): number {
    return this.contributions.reduce((sum, c) => sum + c.value, 0)
  }

  private _roll() {
    this.result = this.blc.roll(this._pool, this.difficulty, this.specialty)
  }

  private _reset() {
    this.contributions = []
    this.result = null
  }

  private _contributionSummary(): string {
    if (this.contributions.length === 0) return 'Sin dados'
    return this.contributions.map(c => `${c.label} ${c.value}`).join(' + ')
  }

  private _renderDice(result: RollResult) {
    return result.rolls.map(d => {
      const cls = d === 1 ? 'die-one' : d >= this.difficulty ? 'die-success' : 'die-fail'
      return html`<span class=${cls}>${d}</span> `
    })
  }

  private _renderResult(result: RollResult) {
    const outcomeClass = result.outcome === 'success'
      ? 'outcome-success'
      : result.outcome === 'botch'
        ? 'outcome-botch'
        : 'outcome-failure'

    const outcomeLabel = result.outcome === 'success'
      ? `${result.net} ${result.net === 1 ? 'éxito' : 'éxitos'}`
      : result.outcome === 'botch'
        ? 'Pifie'
        : 'Fallo'

    return html`
      <div class="result">
        <span class="result-dice">${this._renderDice(result)}</span>
        <span class="result-summary">${result.successes} suc − ${result.ones} uno${result.ones !== 1 ? 's' : ''} = ${result.net}</span>
        <span class="result-outcome ${outcomeClass}">${outcomeLabel}</span>
      </div>
    `
  }

  render() {
    const pool = this._pool

    return html`
      <div class="tray-header">
        <span class="tray-title">🎲</span>
        <span class="tray-pool-count">${pool}d</span>
        <span class="tray-contributions">${this._contributionSummary()}</span>
        <button class="tray-toggle" @click=${() => { this.collapsed = !this.collapsed }}>
          ${this.collapsed ? '▲ Mostrar' : '▼ Ocultar'}
        </button>
      </div>

      ${!this.collapsed ? html`
        <div class="tray-body">
          <div class="controls">
            <span class="difficulty-label">Dificultad</span>
            <input
              type="number" min="2" max="10"
              .value=${String(this.difficulty)}
              @change=${(e: Event) => {
                const v = parseInt((e.target as HTMLInputElement).value, 10)
                this.difficulty = Math.min(10, Math.max(2, v))
              }}
            />
            <label class="specialty-label">
              <input
                type="checkbox"
                .checked=${this.specialty}
                @change=${(e: Event) => { this.specialty = (e.target as HTMLInputElement).checked }}
              />
              Especialidad
            </label>
            <button
              class="btn primary"
              ?disabled=${pool === 0}
              @click=${this._roll}
            >Tirar</button>
            <button class="btn" @click=${this._reset}>Resetear</button>
          </div>

          ${this.result ? this._renderResult(this.result) : ''}
        </div>
      ` : ''}
    `
  }
}
