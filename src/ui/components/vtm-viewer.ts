import { LitElement, html, css } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import { CampaignBLC, VtmdError, VtmdType, CampaignMap } from '../../domain/campaign/CampaignBLC'
import { openUrl } from '@tauri-apps/plugin-opener'
import { resolveRelativePath } from './resolvePath'
import { VtmMapViewer } from './vtm-map-viewer'

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
    vtm-map-viewer {
      flex: 1;
      min-height: 0;
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
    .map-draft-error {
      flex-shrink: 0;
      margin: 0;
      padding: 6px 12px;
      font-size: 0.75rem;
      color: #c0392b;
      background: #1a0000;
      border-bottom: 1px solid #2a2a2a;
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
    /* ── Links ── */
    article a {
      color: #7a9fbf;
      text-decoration: none;
    }
    article a:hover { text-decoration: underline; }
    article a[href$=".vtmd"] {
      color: #c8963a;
      cursor: pointer;
    }
    article a[href$=".vtmd"]:hover { text-decoration: underline; }
    /* ── Dice-pool clickable elements ── */
    article [data-vtmd-dice] {
      cursor: pointer;
      transition: opacity 0.15s;
    }
    article [data-vtmd-dice]:hover { opacity: 0.65; }
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
  @state() private mapData: CampaignMap | null = null
  @state() private mapSvg = ''
  @state() private draftMapData: CampaignMap | null = null
  @state() private mapDraftError = ''
  private _loadedSvgPath = ''

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

  private async _loadMapAsset(mapDocPath: string, map: CampaignMap): Promise<void> {
    if (!map.svgPath) return
    const resolved = resolveRelativePath(mapDocPath, map.svgPath)
    try {
      this.mapSvg = await this.blc.readAsset(resolved)
      this._loadedSvgPath = resolved
    } catch (e) {
      this.errorMsg = 'No se pudo cargar la imagen del mapa'
      this.errorDetail = String(e)
    }
  }

  private _reparseMapDraft(): void {
    if (!this.mapData || !this.currentPath) return
    const body = this.draftContent.split('\n').slice(1).join('\n').trimStart()
    const result = this.blc.parseMap({
      type: VtmdType.Map,
      body,
      filePath: this.currentPath,
      rawContent: this.draftContent,
    })
    result.match(
      map => {
        this.mapDraftError = ''
        this.draftMapData = map
        const resolvedSvgPath = map.svgPath ? resolveRelativePath(this.currentPath, map.svgPath) : ''
        if (resolvedSvgPath && resolvedSvgPath !== this._loadedSvgPath) {
          this._loadMapAsset(this.currentPath, map)
        }
      },
      error => {
        this.mapDraftError = `Sintaxis de mapa inválida (${error}) — se muestra la última versión válida.`
      },
    )
  }

  async load(path: string): Promise<void> {
    this.errorMsg = ''
    this.errorDetail = ''
    this.loading = true
    this.editMode = false
    this.saveError = ''
    this.mapData = null
    this.mapSvg = ''
    this.draftMapData = null
    this.mapDraftError = ''
    this._loadedSvgPath = ''
    try {
      const result = await this.blc.openFile(path)
      if (result.isErr()) {
        const error = result.error
        this.errorMsg = error === VtmdError.UnknownType
          ? 'Tipo de fichero no reconocido'
          : 'Error al leer el fichero'
        this.errorDetail = `VtmdError: ${error}\npath: ${path}\ncausa: ${this.blc.lastError || '(desconocida)'}`
        return
      }

      const doc = result.value
      this.draftContent = doc.rawContent
      this.originalContent = doc.rawContent
      this.currentPath = path

      if (doc.type === VtmdType.Map) {
        const mapResult = this.blc.parseMap(doc)
        if (mapResult.isErr()) {
          this.errorMsg = 'El fichero de mapa no es válido'
          this.errorDetail = `VtmdError: ${mapResult.error}\npath: ${path}`
          return
        }
        this.mapData = mapResult.value
        this.renderedHtml = ''
        await this._loadMapAsset(path, this.mapData)
      } else {
        this.renderedHtml = this.blc.render(doc)
      }
    } catch (e) {
      this.errorMsg = 'Error inesperado al cargar el fichero'
      this.errorDetail = String(e)
    } finally {
      this.loading = false
    }
  }

  private _emitDirty(dirty: boolean) {
    this.dispatchEvent(new CustomEvent('vtm-dirty-changed', {
      detail: { path: this.currentPath, dirty },
      bubbles: true,
      composed: true,
    }))
  }

  private _enterEdit() {
    this.editMode = true
    this.saveError = ''
    this.draftMapData = this.mapData
    this.mapDraftError = ''
  }

  private _discard() {
    this.draftContent = this.originalContent
    this.editMode = false
    this.saveError = ''
    this.draftMapData = this.mapData
    this.mapDraftError = ''
    this._emitDirty(false)
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
          this.editMode = false
          this._emitDirty(false)
          if (this.mapData) {
            const body = this.draftContent.split('\n').slice(1).join('\n').trimStart()
            const mapResult = this.blc.parseMap({
              type: VtmdType.Map,
              body,
              filePath: this.currentPath,
              rawContent: this.draftContent,
            })
            mapResult.match(
              map => {
                this.mapData = map
                this.draftMapData = map
                this.mapDraftError = ''
                this._loadMapAsset(this.currentPath, map)
              },
              error => {
                this.errorMsg = 'El fichero de mapa no es válido'
                this.errorDetail = `VtmdError: ${error}`
              },
            )
          } else {
            this.renderedHtml = this.blc.renderRaw(this.draftContent)
          }
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
    this._emitDirty(this._hasUnsavedChanges)
    if (this.mapData) this._reparseMapDraft()
  }

  private _neutraliseExternalLinks(html: string): string {
    return html.replace(
      /href="(https?:\/\/[^"]+)"/g,
      'data-external-href="$1" href="javascript:void(0)"',
    )
  }

  private _onArticleClick(e: MouseEvent) {
    const path = e.composedPath() as Element[]

    const anchor = path.find(
      el => el instanceof HTMLAnchorElement && el.getAttribute('href')?.endsWith('.vtmd')
    ) as HTMLAnchorElement | undefined
    if (anchor) {
      e.preventDefault()
      const resolved = resolveRelativePath(this.currentPath, anchor.getAttribute('href')!)
      this.dispatchEvent(new CustomEvent('vtmd-file-selected', {
        detail: resolved,
        bubbles: true,
        composed: true,
      }))
      return
    }

    const externalEl = path.find(
      el => el instanceof HTMLElement && el.dataset['externalHref']
    ) as HTMLElement | undefined
    if (externalEl) {
      e.preventDefault()
      openUrl(externalEl.dataset['externalHref']!).catch(err =>
        console.error('[vtm-viewer] openUrl failed:', err)
      )
      return
    }

    const diceEl = path.find(
      el => el instanceof HTMLElement && el.dataset['vtmdDice'] !== undefined
    ) as HTMLElement | undefined
    if (!diceEl) return
    const value = parseInt(diceEl.dataset['vtmdDice']!, 10)
    const label = diceEl.dataset['vtmdLabel'] ?? ''
    this.dispatchEvent(new CustomEvent('vtm-add-dice', {
      detail: { label, value },
      bubbles: true,
      composed: true,
    }))
  }

  private get _hasUnsavedChanges() {
    return this.draftContent !== this.originalContent
  }

  render() {
    const showToolbar = !!this.currentPath || !!this.errorMsg

    return html`
      ${showToolbar ? html`
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
            ${this.mapData ? html`
              ${this.mapDraftError ? html`<p class="map-draft-error">${this.mapDraftError}</p>` : ''}
              <vtm-map-viewer
                .svgMarkup=${this.mapSvg}
                .areas=${this.draftMapData?.areas ?? []}
                .legend=${this.draftMapData?.legend ?? []}
                .basePath=${this.currentPath}
              ></vtm-map-viewer>
            ` : html`
              <div class="preview-scroll">
                <article>${unsafeHTML(this.blc.renderRaw(this.draftContent))}</article>
              </div>
            `}
          </div>
        </div>
      ` : this.mapData && !this.errorMsg && !this.loading ? html`
        <vtm-map-viewer
          .svgMarkup=${this.mapSvg}
          .areas=${this.mapData.areas}
          .legend=${this.mapData.legend}
          .basePath=${this.currentPath}
        ></vtm-map-viewer>
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
            ? html`<article @click=${this._onArticleClick}>${unsafeHTML(this._neutraliseExternalLinks(this.renderedHtml))}</article>`
            : this.currentPath
              ? html`<p class="empty">El fichero no tiene contenido aún. Pulsa ✏ Editar para empezar a escribir.</p>`
              : html`<p class="empty">Selecciona un fichero para visualizarlo.</p>`}
        </div>
      `}
    `
  }
}

// Suppress unused import warnings — this import registers the custom element
export { VtmMapViewer }
