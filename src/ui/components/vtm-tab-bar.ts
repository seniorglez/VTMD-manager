import { LitElement, html, css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

export interface TabEntry {
  path: string
  label: string
}

@customElement('vtm-tab-bar')
export class VtmTabBar extends LitElement {
  static styles = css`
    :host {
      display: flex;
      align-items: flex-end;
      background: #111;
      border-bottom: 1px solid #2a2a2a;
      overflow-x: auto;
      overflow-y: hidden;
      flex-shrink: 0;
      scrollbar-width: none;
    }
    :host::-webkit-scrollbar { display: none; }
    .tab {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 7px 12px 6px;
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 0.78rem;
      color: #6b5e4e;
      background: #111;
      border-right: 1px solid #1e1e1e;
      border-top: 2px solid transparent;
      cursor: pointer;
      white-space: nowrap;
      max-width: 180px;
      transition: color 0.12s, background 0.12s;
      flex-shrink: 0;
      user-select: none;
    }
    .tab:hover { color: #c8b8a2; background: #161616; }
    .tab.active {
      color: #c8b8a2;
      background: #1a1a1a;
      border-top-color: #8b0000;
    }
    .tab-label {
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .dirty-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #8b0000;
      flex-shrink: 0;
    }
    .close-btn {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      font-size: 0.75rem;
      padding: 0;
      line-height: 1;
      opacity: 0.5;
      flex-shrink: 0;
      transition: opacity 0.1s;
    }
    .close-btn:hover { opacity: 1; }
  `

  @property({ attribute: false }) declare tabs: TabEntry[]
  @property() declare activeTab: string
  @property({ attribute: false }) declare dirtyTabs: Set<string>

  private _activate(path: string) {
    this.dispatchEvent(new CustomEvent<string>('tab-activate', { detail: path, bubbles: true, composed: true }))
  }

  private _close(e: Event, path: string) {
    e.stopPropagation()
    this.dispatchEvent(new CustomEvent<string>('tab-close', { detail: path, bubbles: true, composed: true }))
  }

  render() {
    return html`
      ${(this.tabs ?? []).map(tab => html`
        <div
          class="tab ${this.activeTab === tab.path ? 'active' : ''}"
          @click=${() => this._activate(tab.path)}
        >
          ${this.dirtyTabs?.has(tab.path) ? html`<span class="dirty-dot"></span>` : ''}
          <span class="tab-label">${tab.label}</span>
          <button class="close-btn" @click=${(e: Event) => this._close(e, tab.path)}>×</button>
        </div>
      `)}
    `
  }
}
