import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { CampaignBLC } from '../../domain/campaign/CampaignBLC'

@customElement('vtm-sidebar')
export class VtmSidebar extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      background: #161616;
      border-right: 1px solid #2a2a2a;
      height: 100%;
      overflow: hidden;
      font-family: Georgia, 'Times New Roman', serif;
    }
    .sidebar-inner {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 12px 10px;
      overflow: hidden;
    }
    button {
      width: 100%;
      padding: 8px 12px;
      background: #8b0000;
      color: #c8b8a2;
      border: none;
      font-family: inherit;
      font-size: 0.85rem;
      letter-spacing: 0.04em;
      cursor: pointer;
      border-radius: 2px;
      transition: background 0.15s;
    }
    button:hover:not(:disabled) { background: #c0392b; }
    button:disabled { opacity: 0.5; cursor: default; }
    .folder-name {
      margin-top: 10px;
      font-size: 0.75rem;
      color: #6b5e4e;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    ul {
      list-style: none;
      margin-top: 12px;
      overflow-y: auto;
      flex: 1;
    }
    li {
      padding: 6px 8px;
      font-size: 0.82rem;
      color: #c8b8a2;
      cursor: pointer;
      border-radius: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      border-left: 2px solid transparent;
      transition: background 0.1s, border-color 0.1s;
    }
    li:hover {
      background: #222;
      border-left-color: #8b0000;
    }
    .empty {
      margin-top: 12px;
      font-size: 0.78rem;
      color: #6b5e4e;
      font-style: italic;
    }
    details {
      margin-top: 10px;
    }
    summary {
      font-size: 0.78rem;
      color: #c0392b;
      cursor: pointer;
    }
    pre {
      margin-top: 6px;
      font-size: 0.7rem;
      color: #c0392b;
      white-space: pre-wrap;
      word-break: break-all;
      background: #1a0000;
      padding: 6px;
      border-radius: 2px;
    }
  `
  @property({ attribute: false }) declare blc: CampaignBLC

  @state() private files: string[] = []
  @state() private folderName = ''
  @state() private errorMsg = ''
  @state() private loading = false

  private async handleSelectFolder() {
    this.errorMsg = ''
    this.loading = true
    try {
      const folder = await this.blc.pickFolder()
      if (!folder) return
      this.folderName = folder.split('/').pop() ?? folder
      this.files = await this.blc.listFiles(folder)
    } catch (e) {
      this.errorMsg = String(e)
    } finally {
      this.loading = false
    }
  }

  private handleFileClick(path: string) {
    this.dispatchEvent(
      new CustomEvent<string>('vtmd-file-selected', { detail: path, bubbles: true, composed: true }),
    )
  }

  render() {
    return html`
      <div class="sidebar-inner">
        <button @click=${this.handleSelectFolder} ?disabled=${this.loading}>
          ${this.loading ? 'Cargando…' : 'Seleccionar carpeta'}
        </button>
        ${this.folderName ? html`<p class="folder-name">${this.folderName}</p>` : ''}
        ${this.errorMsg ? html`
          <details open>
            <summary>Error al leer carpeta</summary>
            <pre>${this.errorMsg}</pre>
          </details>` : ''}
        ${this.files.length > 0
          ? html`
              <ul>
                ${this.files.map(path => {
                  const name = path.split('/').pop()?.replace(/\.vtmd$/, '') ?? path
                  return html`<li @click=${() => this.handleFileClick(path)}>${name}</li>`
                })}
              </ul>`
          : this.folderName && !this.errorMsg
            ? html`<p class="empty">No se encontraron ficheros .vtmd</p>`
            : ''}
      </div>
    `
  }
}
