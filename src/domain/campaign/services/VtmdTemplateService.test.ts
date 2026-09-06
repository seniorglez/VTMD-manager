import { describe, it, expect, beforeEach } from 'vitest'
import { VtmdTemplateService } from './VtmdTemplateService'
import { VtmdType } from '../models/VtmdType'

describe('VtmdTemplateService', () => {
  let service: VtmdTemplateService

  beforeEach(() => {
    service = new VtmdTemplateService()
  })

  it('character template first line is # vtmd:character', () => {
    const template = service.getTemplate(VtmdType.Character)
    expect(template.split('\n')[0]).toBe('# vtmd:character')
  })

  it('character template contains required tags', () => {
    const template = service.getTemplate(VtmdType.Character)
    expect(template).toContain('::character-header')
    expect(template).toContain('::attributes')
    expect(template).toContain('::blood')
    expect(template).toContain('::health')
    expect(template).toContain('::experience')
  })

  it('npc template first line is # vtmd:npc', () => {
    expect(service.getTemplate(VtmdType.Npc).split('\n')[0]).toBe('# vtmd:npc')
  })

  it('chapter template first line is # vtmd:chapter', () => {
    expect(service.getTemplate(VtmdType.Chapter).split('\n')[0]).toBe('# vtmd:chapter')
  })

  it('module template first line is # vtmd:module', () => {
    expect(service.getTemplate(VtmdType.Module).split('\n')[0]).toBe('# vtmd:module')
  })

  it('campaign template first line is # vtmd:campaign', () => {
    expect(service.getTemplate(VtmdType.Campaign).split('\n')[0]).toBe('# vtmd:campaign')
  })

  it('map template first line is # vtmd:map and contains a ::map tag', () => {
    const template = service.getTemplate(VtmdType.Map)
    expect(template.split('\n')[0]).toBe('# vtmd:map')
    expect(template).toContain('::map[')
  })
})
