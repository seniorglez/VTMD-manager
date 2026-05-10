import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import { CampaignBLC, VtmdError } from '../../domain/campaign/CampaignBLC'

@customElement('vtm-viewer')
export class VtmViewer extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: #1a1a1a;
      overflow: hidden;
      font-family: Georgia, 'Times New Roman', serif;
    }
    /* ── Toolbar ── */
    .toolbar {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
      padding: 8px 16px;
      background: #161616;
      border-bottom: 1px solid #2a2a2a;
      flex-shrink: 0;
      min-height: 40px;
    }
    .toolbar-btn {
      background: none;
      border: 1px solid #2a2a2a;
      color: #6b5e4e;
      font-family: inherit;
      font-size: 0.8rem;
      padding: 4px 10px;
      border-radius: 2px;
      cursor: pointer;
      transition: color 0.15s, border-color 0.15s;
    }
    .toolbar-btn:hover { color: #c8b8a2; border-color: #6b5e4e; }
    .toolbar-btn.primary {
      background: #8b0000;
      border-color: #8b0000;
      color: #c8b8a2;
    }
    .toolbar-btn.primary:hover:not(:disabled) { background: #c0392b; border-color: #c0392b; }
    .toolbar-btn:disabled { opacity: 0.4; cursor: default; }
    .unsaved-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #8b0000;
      flex-shrink: 0;
    }
    /* ── View area ── */
    .content-area {
      flex: 1;
      overflow-y: auto;
      padding: 32px 40px;
      color: #c8b8a2;
    }
    /* ── Edit area ── */
    .editor-area {
      flex: 1;
      display: flex;
      overflow: hidden;
    }
    .editor-pane {
      flex: 1;
      display: flex;
      flex-direction: column;
      border-right: 1px solid #2a2a2a;
      overflow: hidden;
    }
    .editor-pane-label {
      font-size: 0.7rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #6b5e4e;
      padding: 6px 12px;
      background: #161616;
      border-bottom: 1px solid #2a2a2a;
      flex-shrink: 0;
    }
    textarea {
      flex: 1;
      resize: none;
      background: #111;
      color: #c8b8a2;
      border: none;
      outline: none;
      font-family: monospace;
      font-size: 0.85rem;
      line-height: 1.6;
      padding: 16px;
      tab-size: 2;
    }
    .preview-pane {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .preview-scroll {
      flex: 1;
      overflow-y: auto;
      padding: 24px 32px;
      color: #c8b8a2;
    }
    /* ── State messages ── */
    p.error { color: #c0392b; margin-bottom: 8px; }
    p.loading { color: #6b5e4e; font-style: italic; }
    p.empty { color: #6b5e4e; font-style: italic; margin-top: 40px; text-align: center; }
    details { margin-top: 8px; }
    details summary { font-size: 0.8rem; color: #6b5e4e; cursor: pointer; }
    details pre {
      margin-top: 6px;
      font-size: 0.75rem;
      color: #c0392b;
      background: #1a0000;
      padding: 8px;
      border-radius: 2px;
      white-space: pre-wrap;
      word-break: break-all;
    }
    /* ── Standard markdown ── */
    article h1 {
      font-size: 1.7rem;
      color: #c8b8a2;
      border-bottom: 1px solid #2a2a2a;
      padding-bottom: 8px;
      margin-bottom: 20px;
    }
    article h2 { font-size: 1.3rem; color: #c8b8a2; margin: 24px 0 12px; }
    article h3 { font-size: 1.05rem; color: #a89880; margin: 20px 0 8px; }
    article p { line-height: 1.7; margin-bottom: 12px; }
    article blockquote {
      border-left: 3px solid #8b0000;
      margin: 12px 0;
      padding: 8px 16px;
      color: #a89880;
      font-style: italic;
      background: #161616;
    }
    article ul { padding-left: 20px; margin-bottom: 12px; }
    article li { line-height: 1.6; margin-bottom: 4px; }
    article strong { color: #d4c4ac; font-weight: bold; }
    article em { font-style: italic; color: #a89880; }
    article hr { border: none; border-top: 1px solid #2a2a2a; margin: 24px 0; }
    /* ── VTMD scene ── */
    article .vtmd-scene {
      border-left: 4px solid #8b0000;
      background: #161616;
      padding: 12px 16px;
      margin: 20px 0;
      border-radius: 0 2px 2px 0;
    }
    article .vtmd-scene .scene-label {
      font-size: 0.7rem;
      letter-spacing: 0.12em;
      color: #8b0000;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    article .vtmd-scene .scene-title {
      font-size: 1.1rem;
      font-weight: bold;
      color: #c8b8a2;
    }
    article .vtmd-scene .scene-location {
      font-size: 0.82rem;
      color: #6b5e4e;
      margin-top: 2px;
    }
    /* ── VTMD secret ── */
    article .vtmd-secret {
      filter: blur(5px);
      transition: filter 0.3s;
      cursor: pointer;
      user-select: none;
    }
    article .vtmd-secret:hover { filter: none; }
    /* ── VTMD roll ── */
    article .vtmd-roll {
      background: #222;
      border: 1px solid #2a2a2a;
      border-radius: 3px;
      padding: 10px 14px;
      margin: 12px 0;
      display: inline-block;
      min-width: 180px;
    }
    article .vtmd-roll .roll-label { font-weight: bold; color: #c8b8a2; }
    article .vtmd-roll .roll-meta { font-size: 0.78rem; color: #6b5e4e; margin-top: 3px; }
    article .vtmd-roll .roll-result { font-size: 0.82rem; color: #a89880; margin-top: 3px; }
    /* ── VTMD blood ── */
    article .vtmd-blood {
      font-size: 1.1rem;
      letter-spacing: 0.1em;
      color: #6b5e4e;
      margin: 8px 0;
    }
    article .vtmd-blood .pip-full { color: #8b0000; }
    /* ── VTMD discipline ── */
    article .vtmd-discipline {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 6px 0;
    }
    article .vtmd-discipline .disc-name { color: #c8b8a2; min-width: 120px; }
    article .vtmd-discipline .disc-dots { color: #8b0000; letter-spacing: 0.1em; }
    /* ── VTMD attributes ── */
    article .vtmd-attributes { margin: 12px 0; }
    article .vtmd-attributes table {
      border-collapse: collapse;
      font-size: 0.85rem;
    }
    article .vtmd-attributes td {
      padding: 3px 12px 3px 0;
      color: #c8b8a2;
      vertical-align: top;
    }
    article .vtmd-attributes td:first-child { color: #6b5e4e; }
    /* ── VTMD character/npc header ── */
    article .vtmd-character-header,
    article .vtmd-npc-header {
      border-bottom: 2px solid #8b0000;
      padding-bottom: 8px;
      margin-bottom: 16px;
    }
    article .vtmd-character-header .char-name,
    article .vtmd-npc-header .npc-name {
      font-size: 1.5rem;
      color: #c8b8a2;
      font-weight: bold;
    }
    article .vtmd-character-header .char-clan,
    article .vtmd-npc-header .npc-clan {
      font-size: 0.85rem;
      color: #6b5e4e;
      margin-top: 2px;
    }
    /* ── VTMD npc block ── */
    article .vtmd-npc {
      border-left: 3px solid #2a2a2a;
      padding-left: 12px;
      margin: 12px 0;
    }
    article .vtmd-npc .npc-block-name {
      font-weight: bold;
      color: #a89880;
    }
    article .vtmd-npc .npc-block-desc {
      font-size: 0.85rem;
      color: #6b5e4e;
    }
  `

  @property({ attribute: false }) declare blc: CampaignBLC

  @state() private renderedHtml = ''
  @state() private errorMsg = ''
  @state() private errorDetail = ''
  @state() private loading = false
  @state() private editMode = false
  @state() private draftContent = ''
  @state() private originalContent = ''
  @state() private currentPath = ''
  @state() private saving = false
  @state() private saveError = ''

  private _onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 's' && (e.ctrlKey || e.metaKey) && this.editMode) {
      e.preventDefault()
      this._save()
    }
  }

  connectedCallback() {
    super.connectedCallback()
    document.addEventListener('keydown', this._onKeyDown)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    document.removeEventListener('keydown', this._onKeyDown)
  }

  async load(path: string): Promise<void> {
    this.errorMsg = ''
    this.errorDetail = ''
    this.loading = true
    this.editMode = false
    this.saveError = ''
    try {
      const result = await this.blc.openFile(path)
      result.match(
        doc => {
          this.renderedHtml = this.blc.render(doc)
          this.draftContent = doc.rawContent
          this.originalContent = doc.rawContent
          this.currentPath = path
        },
        error => {
          this.errorMsg = error === VtmdError.UnknownType
            ? 'Tipo de fichero no reconocido'
            : 'Error al leer el fichero'
          this.errorDetail = `VtmdError: ${error}\npath: ${path}\ncausa: ${this.blc.lastError || '(desconocida)'}`
        },
      )
    } catch (e) {
      this.errorMsg = 'Error inesperado al cargar el fichero'
      this.errorDetail = String(e)
    } finally {
      this.loading = false
    }
  }

  private _enterEdit() {
    this.editMode = true
    this.saveError = ''
  }

  private _discard() {
    this.draftContent = this.originalContent
    this.editMode = false
    this.saveError = ''
  }

  private async _save() {
    if (this.saving || !this.currentPath) return
    this.saving = true
    this.saveError = ''
    try {
      const result = await this.blc.saveFile(this.currentPath, this.draftContent)
      result.match(
        () => {
          this.originalContent = this.draftContent
          this.renderedHtml = this.blc.renderRaw(this.draftContent)
          this.editMode = false
        },
        () => {
          this.saveError = `Error al guardar: ${this.blc.lastError || 'causa desconocida'}`
        },
      )
    } finally {
      this.saving = false
    }
  }

  private _onInput(e: Event) {
    this.draftContent = (e.target as HTMLTextAreaElement).value
  }

  private get _hasUnsavedChanges() {
    return this.draftContent !== this.originalContent
  }

  render() {
    const hasContent = !!this.renderedHtml || !!this.errorMsg

    return html`
      ${hasContent ? html`
        <div class="toolbar">
          ${this.editMode ? html`
            ${this._hasUnsavedChanges ? html`<span class="unsaved-dot" title="Cambios sin guardar"></span>` : ''}
            ${this.saveError ? html`<span style="font-size:0.75rem;color:#c0392b">${this.saveError}</span>` : ''}
            <button class="toolbar-btn" @click=${this._discard}>Descartar</button>
            <button class="toolbar-btn primary" ?disabled=${this.saving} @click=${this._save}>
              ${this.saving ? 'Guardando…' : 'Guardar'}
            </button>
          ` : html`
            <button class="toolbar-btn" title="Editar fichero" @click=${this._enterEdit}>✏ Editar</button>
          `}
        </div>
      ` : ''}

      ${this.editMode ? html`
        <div class="editor-area">
          <div class="editor-pane">
            <div class="editor-pane-label">Editor</div>
            <textarea
              .value=${this.draftContent}
              @input=${this._onInput}
              spellcheck="false"
            ></textarea>
          </div>
          <div class="preview-pane">
            <div class="editor-pane-label">Vista previa</div>
            <div class="preview-scroll">
              <article>${unsafeHTML(this.blc.renderRaw(this.draftContent))}</article>
            </div>
          </div>
        </div>
      ` : html`
        <div class="content-area">
          ${this.loading ? html`<p class="loading">Cargando…</p>` : ''}
          ${this.errorMsg ? html`
            <p class="error">${this.errorMsg}</p>
            ${this.errorDetail ? html`
              <details>
                <summary>Detalle técnico</summary>
                <pre>${this.errorDetail}</pre>
              </details>` : ''}
          ` : ''}
          ${this.renderedHtml
            ? html`<article>${unsafeHTML(this.renderedHtml)}</article>`
            : html`<p class="empty">Selecciona un fichero para visualizarlo.</p>`}
        </div>
      `}
    `
  }
}
