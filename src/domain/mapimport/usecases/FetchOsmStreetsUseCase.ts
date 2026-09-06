import { Result, ok, err } from 'neverthrow'
import { GeoBoundingBox } from '../models/GeoBoundingBox'
import { OsmWay } from '../models/OsmWay'
import { MapImportError } from '../models/MapImportError'
import { OverpassQueryBuilderService } from '../services/OverpassQueryBuilderService'
import { OsmResponseParserService, OverpassResponse } from '../services/OsmResponseParserService'

interface OverpassRepositoryPort {
  query(query: string): Promise<OverpassResponse>
}

export class FetchOsmStreetsUseCase {
  constructor(
    private readonly repo: OverpassRepositoryPort,
    private readonly queryBuilder: OverpassQueryBuilderService,
    private readonly responseParser: OsmResponseParserService,
  ) {}

  async execute(bbox: GeoBoundingBox): Promise<Result<OsmWay[], MapImportError>> {
    let response: OverpassResponse
    try {
      response = await this.repo.query(this.queryBuilder.build(bbox))
    } catch (cause) {
      console.error(`[FetchOsmStreetsUseCase] bbox=${JSON.stringify(bbox)} → ${cause}`)
      return err(MapImportError.NetworkFailed)
    }

    const ways = this.responseParser.parse(response)
    if (ways.length === 0) return err(MapImportError.EmptyArea)
    return ok(ways)
  }
}
