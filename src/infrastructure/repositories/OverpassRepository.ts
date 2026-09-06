import { fetch } from '@tauri-apps/plugin-http'
import { OverpassResponse } from '../../domain/mapimport/services/OsmResponseParserService'

const OVERPASS_ENDPOINT = 'https://overpass-api.de/api/interpreter'

export class OverpassRepository {
  async query(query: string): Promise<OverpassResponse> {
    try {
      const response = await fetch(OVERPASS_ENDPOINT, {
        method: 'POST',
        body: `data=${encodeURIComponent(query)}`,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      if (!response.ok) {
        throw new Error(`Overpass API respondió ${response.status}`)
      }
      return await response.json() as OverpassResponse
    } catch (cause) {
      const msg = `[OverpassRepository.query] → ${cause}`
      console.error(msg, cause)
      throw new Error(msg, { cause })
    }
  }
}
