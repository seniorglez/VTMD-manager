import { Result } from 'neverthrow'
import { FetchOsmStreetsUseCase } from './usecases/FetchOsmStreetsUseCase'
import { GenerateStreetMapSvgUseCase } from './usecases/GenerateStreetMapSvgUseCase'
import { GeoBoundingBox } from './models/GeoBoundingBox'
import { CanvasSize } from './models/CanvasSize'
import { MapImportError } from './models/MapImportError'

export type { GeoBoundingBox } from './models/GeoBoundingBox'
export type { CanvasSize } from './models/CanvasSize'
export { MapImportError } from './models/MapImportError'

export class MapImportBLC {
  constructor(
    private readonly fetchOsmStreets: FetchOsmStreetsUseCase,
    private readonly generateStreetMapSvg: GenerateStreetMapSvgUseCase,
  ) {}

  async generateSvg(bbox: GeoBoundingBox, canvasSize: CanvasSize): Promise<Result<string, MapImportError>> {
    const waysResult = await this.fetchOsmStreets.execute(bbox)
    return waysResult.map(ways => this.generateStreetMapSvg.execute(ways, bbox, canvasSize))
  }
}
