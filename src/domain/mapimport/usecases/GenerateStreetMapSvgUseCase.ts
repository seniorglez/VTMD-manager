import { OsmWay } from '../models/OsmWay'
import { GeoBoundingBox } from '../models/GeoBoundingBox'
import { CanvasSize } from '../models/CanvasSize'
import { GeoProjectionService } from '../services/GeoProjectionService'
import { SvgStreetMapRendererService } from '../services/SvgStreetMapRendererService'

export class GenerateStreetMapSvgUseCase {
  constructor(
    private readonly projection: GeoProjectionService,
    private readonly renderer: SvgStreetMapRendererService,
  ) {}

  execute(ways: OsmWay[], bbox: GeoBoundingBox, canvasSize: CanvasSize): string {
    const projectedWays = ways.map(way => ({
      points: way.points.map(p => this.projection.project(p, bbox, canvasSize)),
    }))
    return this.renderer.render(projectedWays, canvasSize)
  }
}
