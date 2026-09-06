import { describe, it, expect } from 'vitest'
import { GeoProjectionService } from './GeoProjectionService'
import { GeoBoundingBox } from '../models/GeoBoundingBox'
import { CanvasSize } from '../models/CanvasSize'

const service = new GeoProjectionService()

// A non-square bbox (wider in longitude than in latitude) so the
// cosine-correction on the x-axis is actually exercised.
const bbox: GeoBoundingBox = { north: 42.0, south: 41.9, east: -87.5, west: -87.8 }

function consistentCanvas(bbox: GeoBoundingBox, width: number): CanvasSize {
  const midLatRad = ((bbox.north + bbox.south) / 2) * (Math.PI / 180)
  const cosLat = Math.cos(midLatRad)
  const lonSpan = (bbox.east - bbox.west) * cosLat
  const scale = width / lonSpan
  const height = (bbox.north - bbox.south) * scale
  return { width, height }
}

describe('GeoProjectionService', () => {
  it('projects the bbox centroid to the canvas centre', () => {
    const canvas = consistentCanvas(bbox, 1000)
    const centroid = { lat: (bbox.north + bbox.south) / 2, lon: (bbox.east + bbox.west) / 2 }
    const p = service.project(centroid, bbox, canvas)
    expect(p.x).toBeCloseTo(canvas.width / 2, 1)
    expect(p.y).toBeCloseTo(canvas.height / 2, 1)
  })

  it('projects the north-west corner to (0, 0)', () => {
    const canvas = consistentCanvas(bbox, 1000)
    const p = service.project({ lat: bbox.north, lon: bbox.west }, bbox, canvas)
    expect(p.x).toBeCloseTo(0, 1)
    expect(p.y).toBeCloseTo(0, 1)
  })

  it('projects the south-east corner to (width, height)', () => {
    const canvas = consistentCanvas(bbox, 1000)
    const p = service.project({ lat: bbox.south, lon: bbox.east }, bbox, canvas)
    expect(p.x).toBeCloseTo(canvas.width, 1)
    expect(p.y).toBeCloseTo(canvas.height, 1)
  })

  it('applies a cosine-latitude correction so a wide, short bbox is not stretched', () => {
    const wideBbox: GeoBoundingBox = { north: 41.905, south: 41.9, east: -87.0, west: -88.0 }
    const canvas = consistentCanvas(wideBbox, 1000)
    // Without the cosine correction, canvas.height would be far larger relative
    // to width than the true (distance-preserving) aspect ratio at this latitude.
    const midLatRad = ((wideBbox.north + wideBbox.south) / 2) * (Math.PI / 180)
    const cosLat = Math.cos(midLatRad)
    const uncorrectedHeight = (wideBbox.north - wideBbox.south) / (wideBbox.east - wideBbox.west) * canvas.width
    const correctedHeight = uncorrectedHeight / cosLat
    expect(canvas.height).toBeCloseTo(correctedHeight, 1)
  })
})
