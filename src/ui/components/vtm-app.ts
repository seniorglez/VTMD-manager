import { LitElement, html, css } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'
import { CampaignBLC } from '../../domain/campaign/CampaignBLC'
import { CombatBLC } from '../../domain/combat/CombatBLC'
import { VtmSidebar } from './vtm-sidebar'
import { VtmViewer } from './vtm-viewer'
import { VtmDiceTray } from './vtm-dice-tray'

@customElement('vtm-app')
export class VtmApp extends LitElement {
  static styles = css`
    :host {
      display: flex;
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
    vtm-viewer {
      flex: 1;
      min-height: 0;
    }
    vtm-dice-tray {
      flex-shrink: 0;
    }
  `

  @property({ attribute: false }) declare campaignBlc: CampaignBLC
  @property({ attribute: false }) declare combatBlc: CombatBLC

  @query('vtm-viewer') private viewer!: VtmViewer
  @query('vtm-dice-tray') private diceTray!: VtmDiceTray

  private handleFileSelected(e: Event) {
    const path = (e as CustomEvent<string>).detail
    this.viewer.load(path)
  }

  private handleAddDice(e: Event) {
    const { label, value } = (e as CustomEvent<{ label: string; value: number }>).detail
    this.diceTray.addDice(label, value)
  }

  render() {
    return html`
      <div class="layout">
        <vtm-sidebar
          .blc=${this.campaignBlc}
          @vtmd-file-selected=${this.handleFileSelected}
        ></vtm-sidebar>
        <div class="main-area" @vtm-add-dice=${this.handleAddDice}>
          <vtm-viewer .blc=${this.campaignBlc}></vtm-viewer>
          <vtm-dice-tray .blc=${this.combatBlc}></vtm-dice-tray>
        </div>
      </div>
    `
  }
}

// Suppress unused import warnings — these imports register the custom elements
export { VtmSidebar, VtmViewer, VtmDiceTray }
