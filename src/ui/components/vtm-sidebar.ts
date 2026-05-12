import { LitElement, html, css, TemplateResult } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { CampaignBLC, FolderNode, FileEntry } from '../../domain/campaign/CampaignBLC'
import { VtmdType } from '../../domain/campaign/CampaignBLC'

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
    .open-btn {
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
    .open-btn:hover:not(:disabled) { background: #c0392b; }
    .open-btn:disabled { opacity: 0.5; cursor: default; }
    .folder-name {
      margin-top: 10px;
      font-size: 0.75rem;
      color: #6b5e4e;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .tree {
      list-style: none;
      margin-top: 12px;
      overflow-y: auto;
      flex: 1;
      padding: 0;
    }
    .dir-row {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px 6px;
      color: #9b8a76;
      font-size: 0.8rem;
      cursor: pointer;
      border-radius: 2px;
      user-select: none;
    }
    .dir-row:hover { background: #1e1e1e; }
    .dir-arrow {
      width: 12px;
      flex-shrink: 0;
      font-size: 0.65rem;
      color: #6b5e4e;
    }
    .dir-name {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .dir-actions {
      display: flex;
      gap: 2px;
      flex-shrink: 0;
    }
    .add-btn {
      background: none;
      border: none;
      color: #5a4a3a;
      cursor: pointer;
      font-size: 0.82rem;
      padding: 1px 3px;
      line-height: 1;
      border-radius: 2px;
      flex-shrink: 0;
      transition: color 0.1s;
    }
    .add-btn:hover { color: #8b0000; }
    .file-item {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 5px 8px;
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
    .file-item:hover {
      background: #222;
      border-left-color: #555;
    }
    .file-item .type-dot {
      width: 7px;
      height: 7px;
      border-radius: 1px;
      flex-shrink: 0;
    }
    .file-item .file-name {
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .type-character { background: #1a6b3a; }
    .type-npc       { background: #4a6b1a; }
    .type-chapter   { background: #1a3a6b; }
    .type-module    { background: #6b3a1a; }
    .type-campaign  { background: #6b1a1a; }
    .type-unknown   { background: #3a3a3a; }
    .create-form {
      display: flex;
      flex-direction: column;
      gap: 5px;
      margin: 4px 0;
      padding: 6px 8px;
      background: #1a1a1a;
      border-left: 2px solid #8b0000;
      border-radius: 2px;
    }
    .create-form select {
      -webkit-appearance: none;
      appearance: none;
      background-color: #0f0f0f;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%236b5e4e'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 7px center;
      border: 1px solid #3a2a2a;
      color: #c8b8a2;
      font-family: inherit;
      font-size: 0.78rem;
      padding: 4px 24px 4px 6px;
      border-radius: 2px;
      outline: none;
      cursor: pointer;
    }
    .create-form select:focus { border-color: #8b0000; }
    .create-form select option {
      background-color: #0f0f0f;
      color: #c8b8a2;
    }
    .create-form input {
      background: #0f0f0f;
      border: 1px solid #3a2a2a;
      color: #c8b8a2;
      font-family: inherit;
      font-size: 0.78rem;
      padding: 4px 6px;
      border-radius: 2px;
      outline: none;
    }
    .create-form input:focus { border-color: #8b0000; }
    .form-actions {
      display: flex;
      gap: 5px;
    }
    .confirm-btn, .cancel-btn {
      flex: 1;
      padding: 4px;
      border: none;
      font-family: inherit;
      font-size: 0.75rem;
      cursor: pointer;
      border-radius: 2px;
    }
    .confirm-btn {
      background: #8b0000;
      color: #c8b8a2;
    }
    .confirm-btn:hover { background: #c0392b; }
    .confirm-btn:disabled { opacity: 0.5; cursor: default; }
    .cancel-btn {
      background: #2a2a2a;
      color: #9b8a76;
    }
    .cancel-btn:hover { background: #333; }
    .empty {
      margin-top: 12px;
      font-size: 0.78rem;
      color: #6b5e4e;
      font-style: italic;
    }
    details { margin-top: 10px; }
    summary { font-size: 0.78rem; color: #c0392b; cursor: pointer; }
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

  @state() private tree: FolderNode | null = null
  @state() private rootPath = ''
  @state() private openDirs = new Set<string>()
  @state() private creating: string | null = null
  @state() private newFileName = ''
  @state() private newFileType: VtmdType = VtmdType.Chapter
  @state() private creatingDir: string | null = null
  @state() private newDirName = ''
  @state() private errorMsg = ''
  @state() private loading = false
  @state() private creatingBusy = false

  private async handleSelectFolder() {
    this.errorMsg = ''
    this.loading = true
    try {
      const folder = await this.blc.pickFolder()
      if (!folder) return
      this.rootPath = folder
      this.tree = await this.blc.listFolderTree(folder)
      this.openDirs = new Set([folder])
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

  private toggleDir(path: string) {
    const next = new Set(this.openDirs)
    if (next.has(path)) next.delete(path)
    else next.add(path)
    this.openDirs = next
  }

  private openCreateForm(folderPath: string) {
    this.creating = folderPath
    this.creatingDir = null
    this.newFileName = ''
    this.newFileType = VtmdType.Chapter
    if (!this.openDirs.has(folderPath)) this.toggleDir(folderPath)
  }

  private openCreateDirForm(folderPath: string) {
    this.creatingDir = folderPath
    this.creating = null
    this.newDirName = ''
    if (!this.openDirs.has(folderPath)) this.toggleDir(folderPath)
  }

  private cancelCreate() {
    this.creating = null
    this.creatingDir = null
  }

  private async confirmCreate() {
    if (!this.creating || !this.newFileName.trim()) return
    this.creatingBusy = true
    try {
      const result = await this.blc.createFile(this.creating, this.newFileName.trim(), this.newFileType)
      if (result.isOk()) {
        const newPath = result.value
        this.creating = null
        this.tree = await this.blc.listFolderTree(this.rootPath)
        this.handleFileClick(newPath)
      } else {
        this.errorMsg = `Error al crear fichero: ${result.error}`
      }
    } catch (e) {
      this.errorMsg = String(e)
    } finally {
      this.creatingBusy = false
    }
  }

  private async confirmCreateDir() {
    if (!this.creatingDir || !this.newDirName.trim()) return
    this.creatingBusy = true
    try {
      const result = await this.blc.createDirectory(this.creatingDir, this.newDirName.trim())
      if (result.isOk()) {
        const newPath = result.value
        this.creatingDir = null
        this.tree = await this.blc.listFolderTree(this.rootPath)
        const next = new Set(this.openDirs)
        next.add(newPath)
        this.openDirs = next
      } else {
        this.errorMsg = `Error al crear carpeta: ${result.error}`
      }
    } catch (e) {
      this.errorMsg = String(e)
    } finally {
      this.creatingBusy = false
    }
  }

  private _typeClass(type: VtmdType | null): string {
    if (!type) return 'type-unknown'
    return `type-${type}`
  }

  private _renderFileEntry(entry: FileEntry, parentIndent: number): TemplateResult {
    const name = entry.path.split('/').pop()?.replace(/\.vtmd$/, '') ?? entry.path
    return html`
      <li
        class="file-item"
        style="padding-left: ${parentIndent + 26}px"
        @click=${() => this.handleFileClick(entry.path)}
      >
        <span class="type-dot ${this._typeClass(entry.type)}"></span>
        <span class="file-name">${name}</span>
      </li>
    `
  }

  private _renderNode(node: FolderNode, depth: number): TemplateResult {
    const indent = depth * 14
    const isOpen = this.openDirs.has(node.path)

    return html`
      <li>
        <div class="dir-row" style="padding-left: ${indent + 6}px" @click=${() => this.toggleDir(node.path)}>
          <span class="dir-arrow">${isOpen ? '▼' : '▶'}</span>
          <span class="dir-name">${node.name}</span>
          <div class="dir-actions">
            <button
              class="add-btn"
              title="Nuevo fichero"
              @click=${(e: Event) => { e.stopPropagation(); this.openCreateForm(node.path) }}
            >+</button>
            <button
              class="add-btn"
              title="Nueva carpeta"
              @click=${(e: Event) => { e.stopPropagation(); this.openCreateDirForm(node.path) }}
            >📁</button>
          </div>
        </div>

        ${this.creating === node.path ? html`
          <div class="create-form" style="margin-left: ${indent + 14}px">
            <select
              .value=${this.newFileType}
              @change=${(e: Event) => { this.newFileType = (e.target as HTMLSelectElement).value as VtmdType }}
            >
              <option value=${VtmdType.Chapter}>Capítulo</option>
              <option value=${VtmdType.Character}>PC</option>
              <option value=${VtmdType.Npc}>NPC</option>
              <option value=${VtmdType.Module}>Módulo</option>
              <option value=${VtmdType.Campaign}>Campaña</option>
            </select>
            <input
              type="text"
              placeholder="nombre-del-fichero"
              .value=${this.newFileName}
              @input=${(e: Event) => { this.newFileName = (e.target as HTMLInputElement).value }}
              @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter') this.confirmCreate(); if (e.key === 'Escape') this.cancelCreate() }}
            />
            <div class="form-actions">
              <button class="confirm-btn" ?disabled=${this.creatingBusy || !this.newFileName.trim()} @click=${this.confirmCreate}>
                ${this.creatingBusy ? '…' : 'Crear'}
              </button>
              <button class="cancel-btn" @click=${this.cancelCreate}>Cancelar</button>
            </div>
          </div>` : ''}

        ${this.creatingDir === node.path ? html`
          <div class="create-form" style="margin-left: ${indent + 14}px">
            <input
              type="text"
              placeholder="nombre-de-carpeta"
              .value=${this.newDirName}
              @input=${(e: Event) => { this.newDirName = (e.target as HTMLInputElement).value }}
              @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter') this.confirmCreateDir(); if (e.key === 'Escape') this.cancelCreate() }}
            />
            <div class="form-actions">
              <button class="confirm-btn" ?disabled=${this.creatingBusy || !this.newDirName.trim()} @click=${this.confirmCreateDir}>
                ${this.creatingBusy ? '…' : 'Crear carpeta'}
              </button>
              <button class="cancel-btn" @click=${this.cancelCreate}>Cancelar</button>
            </div>
          </div>` : ''}

        ${isOpen ? html`
          <ul style="list-style:none;padding:0;margin:0">
            ${node.files.map(entry => this._renderFileEntry(entry, indent))}
            ${node.children.map(child => this._renderNode(child, depth + 1))}
          </ul>` : ''}
      </li>
    `
  }

  render() {
    return html`
      <div class="sidebar-inner">
        <button class="open-btn" @click=${this.handleSelectFolder} ?disabled=${this.loading}>
          ${this.loading ? 'Cargando…' : 'Seleccionar carpeta'}
        </button>
        ${this.rootPath ? html`<p class="folder-name">${this.rootPath.split('/').pop()}</p>` : ''}
        ${this.errorMsg ? html`
          <details open>
            <summary>Error</summary>
            <pre>${this.errorMsg}</pre>
          </details>` : ''}
        ${this.tree
          ? html`<ul class="tree">${this._renderNode(this.tree, 0)}</ul>`
          : this.rootPath && !this.errorMsg
            ? html`<p class="empty">No se encontraron ficheros .vtmd</p>`
            : ''}
      </div>
    `
  }
}
