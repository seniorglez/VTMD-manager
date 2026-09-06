import { describe, it, expect } from 'vitest'
import { MapDocumentParserService } from './MapDocumentParserService'
import { VtmdError } from '../models/VtmdError'

const service = new MapDocumentParserService()

describe('MapDocumentParserService', () => {
  it('parses a map tag with two valid map-area tags', () => {
    const body = `
::map[svg="chicago.svg" name="Chicago"]

::map-area[name="Elysium" points="120,80 340,80 340,220 120,220" linkedEntityIds="marcus-valerius.vtmd"]
::map-area[name="Territorio Sabbat" points="400,300 600,300 600,500"]
`
    const result = service.parse(body)
    expect(result.isOk()).toBe(true)
    const map = result._unsafeUnwrap()
    expect(map.svgPath).toBe('chicago.svg')
    expect(map.name).toBe('Chicago')
    expect(map.areas).toHaveLength(2)
    expect(map.areas[0]!.name).toBe('Elysium')
    expect(map.areas[0]!.points).toEqual([
      { x: 120, y: 80 },
      { x: 340, y: 80 },
      { x: 340, y: 220 },
      { x: 120, y: 220 },
    ])
  })

  it('parses a comma-separated linkedEntityIds list, trimming whitespace', () => {
    const body = `::map[svg="x.svg"]\n::map-area[name="Zona" points="0,0 1,1 1,0" linkedEntityIds="a.vtmd, b.vtmd"]`
    const result = service.parse(body)
    expect(result._unsafeUnwrap().areas[0]!.linkedEntityIds).toEqual(['a.vtmd', 'b.vtmd'])
  })

  it('defaults linkedEntityIds to an empty array when missing', () => {
    const body = `::map[svg="x.svg"]\n::map-area[name="Zona" points="0,0 1,1 1,0"]`
    const result = service.parse(body)
    expect(result._unsafeUnwrap().areas[0]!.linkedEntityIds).toEqual([])
  })

  it('returns InvalidMapDocument when the ::map tag is missing', () => {
    const body = `::map-area[name="Zona" points="0,0 1,1 1,0"]`
    const result = service.parse(body)
    expect(result._unsafeUnwrapErr()).toBe(VtmdError.InvalidMapDocument)
  })

  it('skips a map-area with an odd number of point coordinates, keeping valid areas', () => {
    const body = `
::map[svg="x.svg"]
::map-area[name="Malformada" points="120,80 340"]
::map-area[name="Valida" points="0,0 1,1 1,0"]
`
    const result = service.parse(body)
    const areas = result._unsafeUnwrap().areas
    expect(areas).toHaveLength(1)
    expect(areas[0]!.name).toBe('Valida')
  })

  it('skips a map-area with a non-numeric coordinate', () => {
    const body = `::map[svg="x.svg"]\n::map-area[name="Mala" points="120,80 xx,40 10,10"]`
    const result = service.parse(body)
    expect(result._unsafeUnwrap().areas).toHaveLength(0)
  })

  it('parses ::legend tags into CampaignMap.legend', () => {
    const body = `
::map[svg="x.svg"]
::legend[id="safehouse" label="Casa franca" color="#2ecc71"]
::legend[id="sabbat" label="Territorio Sabbat" color="#8b0000"]
`
    const result = service.parse(body)
    expect(result._unsafeUnwrap().legend).toEqual([
      { id: 'safehouse', label: 'Casa franca', color: '#2ecc71' },
      { id: 'sabbat', label: 'Territorio Sabbat', color: '#8b0000' },
    ])
  })

  it('sets category on a map-area that references a legend id', () => {
    const body = `::map[svg="x.svg"]\n::map-area[name="Zona" points="0,0 1,1 1,0" category="safehouse"]`
    const result = service.parse(body)
    expect(result._unsafeUnwrap().areas[0]!.category).toBe('safehouse')
  })

  it('leaves category undefined when not specified', () => {
    const body = `::map[svg="x.svg"]\n::map-area[name="Zona" points="0,0 1,1 1,0"]`
    const result = service.parse(body)
    expect(result._unsafeUnwrap().areas[0]!.category).toBeUndefined()
  })

  it('skips a ::legend tag missing label or color, keeping other valid entries', () => {
    const body = `
::map[svg="x.svg"]
::legend[id="bad" label="Sin color"]
::legend[id="ok" label="Válida" color="#2ecc71"]
`
    const result = service.parse(body)
    expect(result._unsafeUnwrap().legend).toEqual([{ id: 'ok', label: 'Válida', color: '#2ecc71' }])
  })

  it('keeps the first declaration when a legend id is duplicated', () => {
    const body = `
::map[svg="x.svg"]
::legend[id="safehouse" label="Primera" color="#2ecc71"]
::legend[id="safehouse" label="Segunda" color="#c0392b"]
`
    const result = service.parse(body)
    expect(result._unsafeUnwrap().legend).toEqual([{ id: 'safehouse', label: 'Primera', color: '#2ecc71' }])
  })
})
