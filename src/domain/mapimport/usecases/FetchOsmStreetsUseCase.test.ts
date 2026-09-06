import { describe, it, expect, vi } from 'vitest'
import { FetchOsmStreetsUseCase } from './FetchOsmStreetsUseCase'
import { OverpassQueryBuilderService } from '../services/OverpassQueryBuilderService'
import { OsmResponseParserService } from '../services/OsmResponseParserService'
import { MapImportError } from '../models/MapImportError'

const bbox = { north: 42, south: 41.9, east: -87.5, west: -87.6 }
const queryBuilder = new OverpassQueryBuilderService()
const responseParser = new OsmResponseParserService()

describe('FetchOsmStreetsUseCase', () => {
  it('returns ok(OsmWay[]) when the repository resolves with a valid response', async () => {
    const repo = { query: vi.fn().mockResolvedValue({
      elements: [{ type: 'way', tags: { highway: 'residential' }, geometry: [{ lat: 41.95, lon: -87.55 }] }],
    }) }
    const useCase = new FetchOsmStreetsUseCase(repo, queryBuilder, responseParser)
    const result = await useCase.execute(bbox)
    expect(result.isOk()).toBe(true)
    expect(result._unsafeUnwrap()).toHaveLength(1)
  })

  it('returns err(NetworkFailed) when the repository rejects', async () => {
    const repo = { query: vi.fn().mockRejectedValue(new Error('offline')) }
    const useCase = new FetchOsmStreetsUseCase(repo, queryBuilder, responseParser)
    const result = await useCase.execute(bbox)
    expect(result._unsafeUnwrapErr()).toBe(MapImportError.NetworkFailed)
  })

  it('returns err(EmptyArea) when the response parses to zero ways', async () => {
    const repo = { query: vi.fn().mockResolvedValue({ elements: [] }) }
    const useCase = new FetchOsmStreetsUseCase(repo, queryBuilder, responseParser)
    const result = await useCase.execute(bbox)
    expect(result._unsafeUnwrapErr()).toBe(MapImportError.EmptyArea)
  })
})
