import { CanvasSize } from '../models/CanvasSize'
import { Point } from '../../campaign/models/Point'

export interface ProjectedWay {
  points: Point[]
}

export class SvgStreetMapRendererService {
  render(ways: ProjectedWay[], canvasSize: CanvasSize): string {
    const { width, height } = canvasSize

    const paths = ways
      .filter(w => w.points.length > 0)
      .map(w => {
        const d = w.points
          .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
          .join(' ')
        return `<path d="${d}" stroke="#000000" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
      })
      .join('\n  ')

    const attribution = ways.length > 0
      ? `<text x="${width - 8}" y="${height - 8}" text-anchor="end" font-size="10" fill="#888888" font-family="sans-serif">Datos del mapa © colaboradores de OpenStreetMap (ODbL)</text>`
      : ''

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff"/>
  ${paths}
  ${attribution}
</svg>`
  }
}
