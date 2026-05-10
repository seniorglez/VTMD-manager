import { LitElement, html, css } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'
import { CampaignBLC } from '../../domain/campaign/CampaignBLC'
import { VtmSidebar } from './vtm-sidebar'
import { VtmViewer } from './vtm-viewer'

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
    vtm-viewer {
      flex: 1;
      min-width: 0;
    }
  `
  @property({ attribute: false }) declare blc: CampaignBLC

  @query('vtm-viewer') private viewer!: VtmViewer

  private handleFileSelected(e: Event) {
    const path = (e as CustomEvent<string>).detail
    this.viewer.load(path)
  }

  render() {
    return html`
      <div class="layout">
        <vtm-sidebar
          .blc=${this.blc}
          @vtmd-file-selected=${this.handleFileSelected}
        ></vtm-sidebar>
        <vtm-viewer .blc=${this.blc}></vtm-viewer>
      </div>
    `
  }
}

// Suppress unused import warnings — these imports register the custom elements
export { VtmSidebar, VtmViewer }
