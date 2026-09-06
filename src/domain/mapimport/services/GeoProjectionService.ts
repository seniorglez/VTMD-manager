import { LatLng } from '../models/LatLng'
import { GeoBoundingBox } from '../models/GeoBoundingBox'
import { CanvasSize } from '../models/CanvasSize'
import { Point } from '../../campaign/models/Point'

/**
 * Equirectangular projection with a cosine-latitude correction on the
 * x-axis. Accurate enough at city scale; not a general-purpose map
 * projection (see plan's "Out of scope").
 */
export class GeoProjectionService {
  project(point: LatLng, bbox: GeoBoundingBox, canvasSize: CanvasSize): Point {
    const midLatRad = ((bbox.north + bbox.south) / 2) * (Math.PI / 180)
    const cosLat = Math.cos(midLatRad)
    const lonSpan = (bbox.east - bbox.west) * cosLat
    const scale = canvasSize.width / lonSpan

    const x = (point.lon - bbox.west) * cosLat * scale
    const y = (bbox.north - point.lat) * scale

    return { x, y }
  }
}
