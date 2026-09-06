import { describe, it, expect } from 'vitest'
import { OverpassQueryBuilderService } from './OverpassQueryBuilderService'

describe('OverpassQueryBuilderService', () => {
  it('builds a highway query with coordinates in south,west,north,east order', () => {
    const service = new OverpassQueryBuilderService()
    const query = service.build({ north: 41.9, south: 41.8, east: -87.6, west: -87.7 })
    expect(query).toContain('way["highway"](41.8,-87.7,41.9,-87.6);')
    expect(query).toContain('[out:json]')
    expect(query).toContain('out body geom;')
  })
})
