import { describe, it, expect } from 'vitest'
import { OsmResponseParserService } from './OsmResponseParserService'

const service = new OsmResponseParserService()

describe('OsmResponseParserService', () => {
  it('parses tagged highway ways with geometry into OsmWay[]', () => {
    const ways = service.parse({
      elements: [
        {
          type: 'way',
          tags: { highway: 'residential' },
          geometry: [{ lat: 41.9, lon: -87.6 }, { lat: 41.91, lon: -87.61 }],
        },
        {
          type: 'way',
          tags: { highway: 'primary' },
          geometry: [{ lat: 41.8, lon: -87.5 }, { lat: 41.81, lon: -87.51 }],
        },
      ],
    })
    expect(ways).toHaveLength(2)
    expect(ways[0]!.points).toEqual([{ lat: 41.9, lon: -87.6 }, { lat: 41.91, lon: -87.61 }])
  })

  it('ignores elements without a highway tag', () => {
    const ways = service.parse({
      elements: [{ type: 'way', tags: { building: 'yes' }, geometry: [{ lat: 1, lon: 1 }] }],
    })
    expect(ways).toHaveLength(0)
  })

  it('ignores elements without a geometry array', () => {
    const ways = service.parse({
      elements: [{ type: 'way', tags: { highway: 'residential' } }],
    })
    expect(ways).toHaveLength(0)
  })

  it('returns an empty array for an empty elements list', () => {
    expect(service.parse({ elements: [] })).toEqual([])
    expect(service.parse({})).toEqual([])
  })
})
