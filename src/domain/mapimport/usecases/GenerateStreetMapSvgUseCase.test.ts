import { describe, it, expect } from 'vitest'
import { GenerateStreetMapSvgUseCase } from './GenerateStreetMapSvgUseCase'
import { GeoProjectionService } from '../services/GeoProjectionService'
import { SvgStreetMapRendererService } from '../services/SvgStreetMapRendererService'

const bbox = { north: 42.0, south: 41.9, east: -87.5, west: -87.6 }
const canvas = { width: 800, height: 600 }

describe('GenerateStreetMapSvgUseCase', () => {
  it('projects every way point and renders one <path> per way', () => {
    const useCase = new GenerateStreetMapSvgUseCase(new GeoProjectionService(), new SvgStreetMapRendererService())
    const ways = [
      { points: [{ lat: 41.95, lon: -87.55 }, { lat: 41.96, lon: -87.56 }] },
      { points: [{ lat: 41.91, lon: -87.51 }, { lat: 41.92, lon: -87.52 }] },
    ]
    const svg = useCase.execute(ways, bbox, canvas)
    expect(svg).toContain('<svg')
    expect((svg.match(/<path /g) ?? []).length).toBe(2)
  })
})
