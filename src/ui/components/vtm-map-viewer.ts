import { LitElement, html, css, svg } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { unsafeSVG } from 'lit/directives/unsafe-svg.js'
import { ref, createRef, Ref } from 'lit/directives/ref.js'
import { styleMap } from 'lit/directives/style-map.js'
import { MapArea, LegendEntry } from '../../domain/campaign/CampaignBLC'
import { resolveRelativePath } from './resolvePath'

interface ViewBox {
  minX: number
  minY: number
  width: number
  height: number
}

const DEFAULT_VIEW_BOX: ViewBox = { minX: 0, minY: 0, width: 1000, height: 1000 }
const MIN_ZOOM = 0.2
const MAX_ZOOM = 8

function parseViewBox(attr: string | null): ViewBox {
  if (!attr) return DEFAULT_VIEW_BOX
  const parts = attr.trim().split(/\s+/).map(Number)
  if (parts.length !== 4 || parts.some(n => !Number.isFinite(n))) return DEFAULT_VIEW_BOX
  return { minX: parts[0]!, minY: parts[1]!, width: parts[2]!, height: parts[3]! }
}

@customElement('vtm-map-viewer')
export class VtmMapViewer extends LitElement {
  static styles = css`
    :host {
      position: relative;
      display: flex;
      overflow: hidden;
      background: #1a1a1a;
    }
    .viewer {
      flex: 1;
      overflow: hidden;
      cursor: grab;
      touch-action: none;
    }
    .viewer.dragging { cursor: grabbing; }
    svg { width: 100%; height: 100%; display: block; background: #ffffff; }
    .zone {
      stroke-width: 2;
      transition: fill-opacity 0.1s, stroke-opacity 0.1s;
      cursor: pointer;
      vector-effect: non-scaling-stroke;
    }
    .zone.linked { cursor: pointer; }
    .zone.unlinked { cursor: default; }
    .empty {
      margin: auto;
      color: #6b5e4e;
      font-family: Georgia, 'Times New Roman', serif;
      font-style: italic;
    }
    .choice-popover {
      position: absolute;
      background: #161616;
      border: 1px solid #2a2a2a;
      border-radius: 3px;
      padding: 6px;
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 0.8rem;
      color: #c8b8a2;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
      z-index: 10;
    }
    .choice-popover .choice-title {
      font-size: 0.7rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #6b5e4e;
      padding: 2px 6px 6px;
    }
    .choice-popover button {
      display: block;
      width: 100%;
      text-align: left;
      background: none;
      border: none;
      color: #c8963a;
      font-family: inherit;
      font-size: 0.82rem;
      padding: 5px 8px;
      cursor: pointer;
      border-radius: 2px;
    }
    .choice-popover button:hover { background: #222; }
    .legend-panel {
      position: absolute;
      left: 12px;
      bottom: 12px;
      background: rgba(22, 22, 22, 0.9);
      border: 1px solid #2a2a2a;
      border-radius: 3px;
      padding: 8px 10px;
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 0.78rem;
      color: #c8b8a2;
      pointer-events: none;
    }
    .legend-panel .legend-row {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 2px 0;
    }
    .legend-panel .legend-swatch {
      width: 11px;
      height: 11px;
      border-radius: 2px;
      flex-shrink: 0;
    }
  `

  @property({ attribute: false }) declare svgMarkup: string
  @property({ attribute: false }) declare areas: MapArea[]
  @property({ attribute: false }) declare legend: LegendEntry[]
  @property() declare basePath: string

  @state() private viewBox: ViewBox = DEFAULT_VIEW_BOX
  @state() private innerMarkup = ''
  @state() private panX = 0
  @state() private panY = 0
  @state() private zoom = 1
  @state() private dragging = false
  @state() private hoveredIndex: number | null = null
  @state() private choiceArea: MapArea | null = null
  @state() private choicePos = { x: 0, y: 0 }

  private _viewerRef: Ref<HTMLElement> = createRef()
  private _lastPointer = { x: 0, y: 0 }

  willUpdate(changed: Map<string, unknown>) {
    if (changed.has('svgMarkup')) {
      this._parseSvg(this.svgMarkup ?? '')
      this.panX = 0
      this.panY = 0
      this.zoom = 1
    }
  }

  private _parseSvg(markup: string) {
    if (!markup) {
      this.viewBox = DEFAULT_VIEW_BOX
      this.innerMarkup = ''
      return
    }
    try {
      const doc = new DOMParser().parseFromString(markup, 'image/svg+xml')
      const root = doc.documentElement
      if (root.nodeName === 'parsererror') throw new Error('SVG inválido')
      this.viewBox = parseViewBox(root.getAttribute('viewBox'))
      this.innerMarkup = Array.from(root.childNodes).map(n => (n as Element).outerHTML ?? '').join('')
    } catch {
      this.viewBox = DEFAULT_VIEW_BOX
      this.innerMarkup = ''
    }
  }

  private _outerPoint(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this._viewerRef.value?.getBoundingClientRect()
    if (!rect || rect.width === 0 || rect.height === 0) return { x: 0, y: 0 }
    const scale = Math.max(this.viewBox.width / rect.width, this.viewBox.height / rect.height)
    return {
      x: this.viewBox.minX + (clientX - rect.left) * scale,
      y: this.viewBox.minY + (clientY - rect.top) * scale,
    }
  }

  private _onPointerDown(e: PointerEvent) {
    if (e.button !== 0) return
    this.dragging = true
    this._lastPointer = { x: e.clientX, y: e.clientY }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  private _onPointerMove(e: PointerEvent) {
    if (!this.dragging) return
    const rect = this._viewerRef.value?.getBoundingClientRect()
    if (!rect || rect.width === 0) return
    const scale = Math.max(this.viewBox.width / rect.width, this.viewBox.height / rect.height)
    this.panX += (e.clientX - this._lastPointer.x) * scale
    this.panY += (e.clientY - this._lastPointer.y) * scale
    this._lastPointer = { x: e.clientX, y: e.clientY }
  }

  private _onPointerUp() {
    this.dragging = false
  }

  private _onWheel(e: WheelEvent) {
    e.preventDefault()
    const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15
    const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, this.zoom * factor))
    if (newZoom === this.zoom) return
    const cursor = this._outerPoint(e.clientX, e.clientY)
    this.panX = cursor.x - (cursor.x - this.panX) * (newZoom / this.zoom)
    this.panY = cursor.y - (cursor.y - this.panY) * (newZoom / this.zoom)
    this.zoom = newZoom
  }

  private _pointsAttr(area: MapArea): string {
    return area.points.map(p => `${p.x},${p.y}`).join(' ')
  }

  private _colorFor(area: MapArea): string {
    const categoryColor = area.category
      ? (this.legend ?? []).find(l => l.id === area.category)?.color
      : undefined
    return categoryColor ?? '#8b0000'
  }

  private _opacityFor(area: MapArea, isHovered: boolean): { fill: string; stroke: string } {
    if (isHovered) return { fill: '0.45', stroke: '1' }
    if (area.category) return { fill: '0.28', stroke: '0.85' }
    return { fill: '0', stroke: '0' }
  }

  private _onAreaClick(area: MapArea, e: MouseEvent) {
    if (area.linkedEntityIds.length === 0) return
    if (area.linkedEntityIds.length === 1) {
      this._openEntity(area.linkedEntityIds[0]!)
      return
    }
    const rect = this._viewerRef.value?.getBoundingClientRect()
    this.choicePos = { x: e.clientX - (rect?.left ?? 0), y: e.clientY - (rect?.top ?? 0) }
    this.choiceArea = area
  }

  private _openEntity(relPath: string) {
    const resolved = resolveRelativePath(this.basePath, relPath)
    this.dispatchEvent(new CustomEvent('vtmd-file-selected', {
      detail: resolved,
      bubbles: true,
      composed: true,
    }))
    this.choiceArea = null
  }

  private _entityLabel(relPath: string): string {
    return relPath.split('/').pop()?.replace(/\.vtmd$/, '') ?? relPath
  }

  render() {
    if (!this.svgMarkup) {
      return html`<p class="empty">Este mapa aún no tiene una imagen asociada.</p>`
    }

    const vb = this.viewBox
    return html`
      <div
        class="viewer ${this.dragging ? 'dragging' : ''}"
        ${ref(this._viewerRef)}
        @pointerdown=${this._onPointerDown}
        @pointermove=${this._onPointerMove}
        @pointerup=${this._onPointerUp}
        @pointercancel=${this._onPointerUp}
        @wheel=${this._onWheel}
        @click=${() => { this.choiceArea = null }}
      >
        ${svg`
        <svg viewBox="${vb.minX} ${vb.minY} ${vb.width} ${vb.height}" preserveAspectRatio="xMidYMid meet">
          <g transform="translate(${this.panX} ${this.panY}) scale(${this.zoom})">
            <g class="basemap">${unsafeSVG(this.innerMarkup)}</g>
            ${(this.areas ?? []).map((area, i) => {
              const isHovered = this.hoveredIndex === i
              const opacity = this._opacityFor(area, isHovered)
              return svg`
              <polygon
                class="zone ${area.linkedEntityIds.length > 0 ? 'linked' : 'unlinked'}"
                points=${this._pointsAttr(area)}
                fill=${this._colorFor(area)}
                fill-opacity=${opacity.fill}
                stroke=${this._colorFor(area)}
                stroke-opacity=${opacity.stroke}
                @pointerenter=${() => { this.hoveredIndex = i }}
                @pointerleave=${() => { this.hoveredIndex = null }}
                @click=${(e: MouseEvent) => { e.stopPropagation(); this._onAreaClick(area, e) }}
              ><title>${area.name}</title></polygon>
            `
            })}
          </g>
        </svg>
        `}
      </div>
      ${(this.legend ?? []).length > 0 ? html`
        <div class="legend-panel">
          ${this.legend.map(entry => html`
            <div class="legend-row">
              <span class="legend-swatch" style=${styleMap({ background: entry.color })}></span>
              <span>${entry.label}</span>
            </div>
          `)}
        </div>
      ` : ''}
      ${this.choiceArea ? html`
        <div class="choice-popover" style="left:${this.choicePos.x}px; top:${this.choicePos.y}px">
          <div class="choice-title">${this.choiceArea.name}</div>
          ${this.choiceArea.linkedEntityIds.map(id => html`
            <button @click=${() => this._openEntity(id)}>${this._entityLabel(id)}</button>
          `)}
        </div>
      ` : ''}
    `
  }
}
