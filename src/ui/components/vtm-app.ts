import { LitElement, html, css } from 'lit'
import { customElement, property, state, query, queryAll } from 'lit/decorators.js'
import { CampaignBLC } from '../../domain/campaign/CampaignBLC'
import { CombatBLC } from '../../domain/combat/CombatBLC'
import { UpdaterBLC } from '../../domain/updater/UpdaterBLC'
import { MapImportBLC } from '../../domain/mapimport/MapImportBLC'
import { VtmSidebar } from './vtm-sidebar'
import { VtmViewer } from './vtm-viewer'
import { VtmDiceTray } from './vtm-dice-tray'
import { VtmTabBar, TabEntry } from './vtm-tab-bar'
import { VtmUpdateNotifier } from './vtm-update-notifier'
import { VtmMapImport } from './vtm-map-import'

@customElement('vtm-app')
export class VtmApp extends LitElement {
  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
      background: #0f0f0f;
    }
    .layout {
      display: flex;
      width: 100%;
      height: 100%;
    }
    vtm-sidebar {
      width: 260px;
      flex-shrink: 0;
    }
    .main-area {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .viewers {
      flex: 1;
      min-height: 0;
      position: relative;
    }
    vtm-viewer {
      position: absolute;
      inset: 0;
    }
    vtm-dice-tray {
      flex-shrink: 0;
    }
    .empty-state {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #3a3a3a;
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 0.9rem;
      font-style: italic;
    }
  `

  @property({ attribute: false }) declare campaignBlc: CampaignBLC
  @property({ attribute: false }) declare combatBlc: CombatBLC
  @property({ attribute: false }) declare updaterBlc: UpdaterBLC
  @property({ attribute: false }) declare mapImportBlc: MapImportBLC

  @state() private tabs: TabEntry[] = []
  @state() private activeTab = ''
  @state() private dirtyTabs = new Set<string>()
  @state() private mapImportFolder: string | null = null

  @query('vtm-dice-tray') private diceTray!: VtmDiceTray
  @queryAll('vtm-viewer') private viewers!: NodeListOf<VtmViewer>

  private _viewerFor(path: string): VtmViewer | undefined {
    return Array.from(this.viewers).find(v => v.dataset['path'] === path)
  }

  private async _openFileAsTab(path: string) {
    const exists = this.tabs.some(t => t.path === path)
    if (!exists) {
      const label = path.split('/').pop()?.replace(/\.vtmd$/, '') ?? path
      this.tabs = [...this.tabs, { path, label }]
    }
    this.activeTab = path
    await this.updateComplete
    if (!exists) {
      this._viewerFor(path)?.load(path)
    }
  }

  private handleFileSelected(e: Event) {
    return this._openFileAsTab((e as CustomEvent<string>).detail)
  }

  private handleOpenMapImport(e: Event) {
    this.mapImportFolder = (e as CustomEvent<string>).detail
  }

  private handleMapImportClose() {
    this.mapImportFolder = null
  }

  private handleMapSaved(e: Event) {
    this.mapImportFolder = null
    return this._openFileAsTab((e as CustomEvent<string>).detail)
  }

  private handleTabActivate(e: Event) {
    this.activeTab = (e as CustomEvent<string>).detail
  }

  private handleTabClose(e: Event) {
    const path = (e as CustomEvent<string>).detail
    const idx = this.tabs.findIndex(t => t.path === path)
    const next = this.tabs.filter(t => t.path !== path)
    const dirty = new Set(this.dirtyTabs)
    dirty.delete(path)
    this.dirtyTabs = dirty
    this.tabs = next
    if (this.activeTab === path) {
      this.activeTab = next[idx]?.path ?? next[idx - 1]?.path ?? ''
    }
  }

  private handleDirtyChanged(e: Event) {
    const { path, dirty } = (e as CustomEvent<{ path: string; dirty: boolean }>).detail
    const next = new Set(this.dirtyTabs)
    if (dirty) next.add(path)
    else next.delete(path)
    this.dirtyTabs = next
  }

  private handleAddDice(e: Event) {
    const { label, value } = (e as CustomEvent<{ label: string; value: number }>).detail
    this.diceTray.addDice(label, value)
  }

  render() {
    return html`
      <vtm-update-notifier .blc=${this.updaterBlc}></vtm-update-notifier>
      <div
        class="layout"
        @vtmd-file-selected=${this.handleFileSelected}
        @open-map-import=${this.handleOpenMapImport}
      >
        <vtm-sidebar
          .blc=${this.campaignBlc}
        ></vtm-sidebar>

        <div
          class="main-area"
          @vtm-add-dice=${this.handleAddDice}
          @vtm-dirty-changed=${this.handleDirtyChanged}
        >
          ${this.tabs.length > 0 ? html`
            <vtm-tab-bar
              .tabs=${this.tabs}
              .activeTab=${this.activeTab}
              .dirtyTabs=${this.dirtyTabs}
              @tab-activate=${this.handleTabActivate}
              @tab-close=${this.handleTabClose}
            ></vtm-tab-bar>
          ` : ''}

          <div class="viewers">
            ${this.tabs.length === 0 ? html`
              <div class="empty-state">Selecciona un fichero para comenzar</div>
            ` : this.tabs.map(tab => html`
              <vtm-viewer
                .blc=${this.campaignBlc}
                data-path=${tab.path}
                style="display:${this.activeTab === tab.path ? 'flex' : 'none'}; flex-direction:column"
              ></vtm-viewer>
            `)}
          </div>

          <vtm-dice-tray .blc=${this.combatBlc}></vtm-dice-tray>
        </div>
      </div>

      ${this.mapImportFolder ? html`
        <vtm-map-import
          .campaignBlc=${this.campaignBlc}
          .mapImportBlc=${this.mapImportBlc}
          .folderPath=${this.mapImportFolder}
          @map-import-close=${this.handleMapImportClose}
          @map-saved=${this.handleMapSaved}
        ></vtm-map-import>
      ` : ''}
    `
  }
}

// Suppress unused import warnings — these imports register the custom elements
export { VtmSidebar, VtmViewer, VtmDiceTray, VtmTabBar, VtmUpdateNotifier, VtmMapImport }
