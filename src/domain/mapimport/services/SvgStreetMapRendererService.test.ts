import { describe, it, expect } from 'vitest'
import { SvgStreetMapRendererService } from './SvgStreetMapRendererService'

const service = new SvgStreetMapRendererService()
const canvas = { width: 800, height: 600 }

describe('SvgStreetMapRendererService', () => {
  it('renders a root <svg> with a viewBox matching the canvas size', () => {
    const svg = service.render([], canvas)
    expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">')
  })

  it('renders one <path> per way', () => {
    const svg = service.render(
      [
        { points: [{ x: 0, y: 0 }, { x: 10, y: 10 }] },
        { points: [{ x: 5, y: 5 }, { x: 15, y: 15 }] },
      ],
      canvas,
    )
    expect((svg.match(/<path /g) ?? []).length).toBe(2)
  })

  it('includes the OpenStreetMap attribution text when there are ways', () => {
    const svg = service.render([{ points: [{ x: 0, y: 0 }, { x: 1, y: 1 }] }], canvas)
    expect(svg).toContain('OpenStreetMap')
  })

  it('renders a valid blank svg with no attribution when there are no ways', () => {
    const svg = service.render([], canvas)
    expect(svg).toContain('<rect')
    expect(svg).not.toContain('OpenStreetMap')
    expect(svg).not.toContain('<path')
  })
})
