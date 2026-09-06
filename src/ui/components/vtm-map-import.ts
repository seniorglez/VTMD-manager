import { LitElement, html, css, unsafeCSS } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { unsafeSVG } from 'lit/directives/unsafe-svg.js'
import { ref, createRef, Ref } from 'lit/directives/ref.js'
import * as L from 'leaflet'
import leafletStyles from 'leaflet/dist/leaflet.css?inline'
import { CampaignBLC, VtmdType } from '../../domain/campaign/CampaignBLC'
import { MapImportBLC, GeoBoundingBox, CanvasSize, MapImportError } from '../../domain/mapimport/MapImportBLC'

type Phase = 'draw' | 'preview'

function slugify(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'mapa'
}

function canvasSizeFor(bbox: GeoBoundingBox): CanvasSize {
  const width = 1000
  const midLatRad = ((bbox.north + bbox.south) / 2) * (Math.PI / 180)
  const cosLat = Math.cos(midLatRad)
  const lonSpan = (bbox.east - bbox.west) * cosLat
  const latSpan = bbox.north - bbox.south
  const height = Math.round(width * (latSpan / Math.max(lonSpan, 1e-9)))
  return { width, height: Math.max(200, Math.min(4000, height)) }
}

@customElement('vtm-map-import')
export class VtmMapImport extends LitElement {
  static styles = [
    unsafeCSS(leafletStyles),
    css`
    :host {
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.6);
      z-index: 100;
      font-family: Georgia, 'Times New Roman', serif;
    }
    .dialog {
      width: min(760px, 92vw);
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      background: #161616;
      border: 1px solid #2a2a2a;
      border-radius: 4px;
      overflow: hidden;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid #2a2a2a;
    }
    .header h2 { font-size: 1rem; color: #c8b8a2; margin: 0; }
    .close-btn {
      background: none;
      border: none;
      color: #6b5e4e;
      font-size: 1.1rem;
      cursor: pointer;
    }
    .close-btn:hover { color: #c8b8a2; }
    .body {
      padding: 14px 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .hint {
      font-size: 0.8rem;
      color: #6b5e4e;
      font-style: italic;
    }
    .map-container {
      height: 380px;
      border: 1px solid #2a2a2a;
      border-radius: 2px;
    }
    .toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .toolbar-btn {
      background: none;
      border: 1px solid #2a2a2a;
      color: #6b5e4e;
      font-family: inherit;
      font-size: 0.8rem;
      padding: 5px 12px;
      border-radius: 2px;
      cursor: pointer;
    }
    .toolbar-btn:hover:not(:disabled) { color: #c8b8a2; border-color: #6b5e4e; }
    .toolbar-btn:disabled { opacity: 0.4; cursor: default; }
    .toolbar-btn.active { color: #c8b8a2; border-color: #8b0000; background: rgba(139, 0, 0, 0.15); }
    .toolbar-btn.primary { background: #8b0000; border-color: #8b0000; color: #c8b8a2; }
    .toolbar-btn.primary:hover:not(:disabled) { background: #c0392b; border-color: #c0392b; }
    .preview-box {
      border: 1px solid #2a2a2a;
      border-radius: 2px;
      background: #fff;
      max-height: 380px;
      overflow: auto;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .preview-box svg { max-width: 100%; height: auto; display: block; }
    input[type='text'] {
      background: #0f0f0f;
      border: 1px solid #3a2a2a;
      color: #c8b8a2;
      font-family: inherit;
      font-size: 0.85rem;
      padding: 6px 8px;
      border-radius: 2px;
      outline: none;
    }
    input[type='text']:focus { border-color: #8b0000; }
    .error {
      color: #c0392b;
      font-size: 0.82rem;
    }
  `]

  @property({ attribute: false }) declare campaignBlc: CampaignBLC
  @property({ attribute: false }) declare mapImportBlc: MapImportBLC
  @property() declare folderPath: string

  @state() private phase: Phase = 'draw'
  @state() private drawMode = false
  @state() private hasBbox = false
  @state() private generatedSvg = ''
  @state() private mapName = ''
  @state() private busy = false
  @state() private errorMsg = ''

  private _mapContainerRef: Ref<HTMLDivElement> = createRef()
  private _leafletMap: L.Map | null = null
  private _drawnRect: L.Rectangle | null = null
  private _drawStart: L.LatLng | null = null
  private _bbox: L.LatLngBounds | null = null

  firstUpdated() {
    const container = this._mapContainerRef.value
    if (!container) return

    this._leafletMap = L.map(container).setView([20, 0], 2)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(this._leafletMap)

    this._leafletMap.on('mousedown', this._onMapMouseDown)
    this._leafletMap.on('mousemove', this._onMapMouseMove)
    this._leafletMap.on('mouseup', this._onMapMouseUp)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this._leafletMap?.remove()
    this._leafletMap = null
  }

  private _toggleDrawMode() {
    if (!this._leafletMap) return
    this.drawMode = !this.drawMode
    if (this.drawMode) {
      this._leafletMap.dragging.disable()
      this._drawnRect?.remove()
      this._drawnRect = null
      this._bbox = null
      this.hasBbox = false
    } else {
      this._leafletMap.dragging.enable()
    }
  }

  private _onMapMouseDown = (e: L.LeafletMouseEvent) => {
    if (!this.drawMode || !this._leafletMap) return
    this._drawStart = e.latlng
    this._drawnRect?.remove()
    this._drawnRect = L.rectangle(L.latLngBounds(e.latlng, e.latlng), { color: '#8b0000', weight: 2 }).addTo(this._leafletMap)
  }

  private _onMapMouseMove = (e: L.LeafletMouseEvent) => {
    if (!this.drawMode || !this._drawStart || !this._drawnRect) return
    this._drawnRect.setBounds(L.latLngBounds(this._drawStart, e.latlng))
  }

  private _onMapMouseUp = () => {
    if (!this.drawMode || !this._drawStart || !this._drawnRect || !this._leafletMap) return
    this._bbox = this._drawnRect.getBounds()
    this.hasBbox = true
    this._drawStart = null
    this.drawMode = false
    this._leafletMap.dragging.enable()
  }

  private async _generate() {
    if (!this._bbox) return
    this.busy = true
    this.errorMsg = ''
    const bbox: GeoBoundingBox = {
      north: this._bbox.getNorth(),
      south: this._bbox.getSouth(),
      east: this._bbox.getEast(),
      west: this._bbox.getWest(),
    }
    const result = await this.mapImportBlc.generateSvg(bbox, canvasSizeFor(bbox))
    result.match(
      svg => {
        this.generatedSvg = svg
        this.phase = 'preview'
      },
      error => {
        this.errorMsg = error === MapImportError.EmptyArea
          ? 'No se han encontrado calles en esa zona. Prueba a dibujar un área distinta.'
          : 'No se pudo conectar con OpenStreetMap. Comprueba tu conexión a internet.'
      },
    )
    this.busy = false
  }

  private _backToDraw() {
    this.phase = 'draw'
    this.generatedSvg = ''
    this.errorMsg = ''
  }

  private async _save() {
    if (!this.mapName.trim()) return
    this.busy = true
    this.errorMsg = ''

    const slug = slugify(this.mapName)
    const svgPath = `${this.folderPath}/${slug}.svg`

    const svgResult = await this.campaignBlc.saveAsset(svgPath, this.generatedSvg)
    if (svgResult.isErr()) {
      this.errorMsg = 'No se pudo guardar la imagen del mapa.'
      this.busy = false
      return
    }

    const createResult = await this.campaignBlc.createFile(this.folderPath, slug, VtmdType.Map)
    if (createResult.isErr()) {
      this.errorMsg = 'No se pudo crear el fichero de mapa.'
      this.busy = false
      return
    }

    const vtmdPath = createResult.value
    const content = `# vtmd:map\n\n::map[svg="${slug}.svg" name="${this.mapName.trim()}"]\n`
    const saveResult = await this.campaignBlc.saveFile(vtmdPath, content)
    this.busy = false
    if (saveResult.isErr()) {
      this.errorMsg = 'No se pudo guardar el fichero de mapa.'
      return
    }

    this.dispatchEvent(new CustomEvent('map-saved', { detail: vtmdPath, bubbles: true, composed: true }))
  }

  private _close() {
    this.dispatchEvent(new CustomEvent('map-import-close', { bubbles: true, composed: true }))
  }

  render() {
    return html`
      <div class="dialog">
        <div class="header">
          <h2>Importar mapa desde OpenStreetMap</h2>
          <button class="close-btn" @click=${this._close}>×</button>
        </div>
        <div class="body">
          ${this.phase === 'draw' ? html`
            <p class="hint">
              Navega hasta la zona que te interese y pulsa "Dibujar área" para marcar el
              rectángulo que quieres importar como calles.
            </p>
            <div class="toolbar">
              <button
                class="toolbar-btn ${this.drawMode ? 'active' : ''}"
                @click=${this._toggleDrawMode}
              >${this.drawMode ? 'Dibujando… (arrastra sobre el mapa)' : '✏ Dibujar área'}</button>
              <button
                class="toolbar-btn primary"
                ?disabled=${!this.hasBbox || this.busy}
                @click=${this._generate}
              >${this.busy ? 'Generando…' : 'Generar mapa'}</button>
            </div>
            <div class="map-container" ${ref(this._mapContainerRef)}></div>
          ` : html`
            <p class="hint">Revisa el resultado y ponle un nombre antes de guardarlo en la campaña.</p>
            <div class="preview-box">${unsafeSVG(this.generatedSvg)}</div>
            <input
              type="text"
              placeholder="Nombre del mapa (p. ej. Chicago — Distrito Financiero)"
              .value=${this.mapName}
              @input=${(e: Event) => { this.mapName = (e.target as HTMLInputElement).value }}
            />
            <div class="toolbar">
              <button class="toolbar-btn" ?disabled=${this.busy} @click=${this._backToDraw}>← Volver a dibujar</button>
              <button
                class="toolbar-btn primary"
                ?disabled=${this.busy || !this.mapName.trim()}
                @click=${this._save}
              >${this.busy ? 'Guardando…' : 'Guardar en la campaña'}</button>
            </div>
          `}
          ${this.errorMsg ? html`<p class="error">${this.errorMsg}</p>` : ''}
        </div>
      </div>
    `
  }
}
