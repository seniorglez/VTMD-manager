import { GeoBoundingBox } from '../models/GeoBoundingBox'

export class OverpassQueryBuilderService {
  build(bbox: GeoBoundingBox): string {
    return `[out:json][timeout:25];\nway["highway"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});\nout body geom;`
  }
}
