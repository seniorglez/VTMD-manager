import { OsmWay } from '../models/OsmWay'

interface OverpassElement {
  type?: string
  tags?: Record<string, string>
  geometry?: { lat: number; lon: number }[]
}

export interface OverpassResponse {
  elements?: OverpassElement[]
}

export class OsmResponseParserService {
  parse(response: OverpassResponse): OsmWay[] {
    const elements = response.elements ?? []
    const ways: OsmWay[] = []
    for (const el of elements) {
      if (!el.tags?.['highway']) continue
      if (!el.geometry || el.geometry.length === 0) continue
      ways.push({ points: el.geometry.map(g => ({ lat: g.lat, lon: g.lon })) })
    }
    return ways
  }
}
