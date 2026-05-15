import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { UpdaterBLC, UpdateInfo } from '../../domain/updater/UpdaterBLC'

@customElement('vtm-update-notifier')
export class VtmUpdateNotifier extends LitElement {
  static styles = css`
    .banner {
      background: #2a1a0a;
      color: #c9a84c;
      padding: 0.35rem 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.78rem;
      font-family: Georgia, 'Times New Roman', serif;
      border-bottom: 1px solid #4a3010;
      flex-shrink: 0;
    }
    button {
      background: #7a1a1a;
      color: #e8d5b0;
      border: none;
      padding: 0.2rem 0.7rem;
      cursor: pointer;
      font-size: 0.78rem;
      font-family: inherit;
    }
    button:hover { background: #9a2a2a; }
    button:disabled { opacity: 0.6; cursor: default; }
  `

  @property({ attribute: false }) declare blc: UpdaterBLC
  @state() private declare availableUpdate: UpdateInfo | null
  @state() private installing = false

  override connectedCallback() {
    super.connectedCallback()
    this.availableUpdate = null
    this._check()
  }

  private async _check() {
    const result = await this.blc.checkForUpdates()
    result.match(
      (info) => { this.availableUpdate = info },
      () => {},
    )
  }

  private async _install() {
    this.installing = true
    await this.blc.installUpdate()
    this.installing = false
  }

  render() {
    if (!this.availableUpdate) return html``
    return html`
      <div class="banner">
        <span>Nueva versión disponible: v${this.availableUpdate.version}</span>
        <button @click=${this._install} ?disabled=${this.installing}>
          ${this.installing ? 'Instalando…' : 'Actualizar y reiniciar'}
        </button>
      </div>
    `
  }
}
