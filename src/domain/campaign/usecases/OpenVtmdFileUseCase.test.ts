import { describe, it, expect } from 'vitest'
import { OpenVtmdFileUseCase } from './OpenVtmdFileUseCase'
import { VtmdType } from '../models/VtmdType'
import { VtmdError } from '../models/VtmdError'

const useCase = new OpenVtmdFileUseCase()

describe('OpenVtmdFileUseCase', () => {
  it('valid vtmd:chapter returns ok with Chapter type', () => {
    const content = '# vtmd:chapter\n\n# The Prince\'s Summons\n\nSome narrative text.'
    const result = useCase.execute(content, '/path/to/file.vtmd')
    expect(result.isOk()).toBe(true)
    result.map(doc => {
      expect(doc.type).toBe(VtmdType.Chapter)
      expect(doc.filePath).toBe('/path/to/file.vtmd')
      expect(doc.body).toContain('The Prince')
      expect(doc.rawContent).toBe(content)
    })
  })

  it('valid vtmd:campaign returns ok with Campaign type', () => {
    const content = '# vtmd:campaign\n\nname: "Shadows of Chicago"'
    const result = useCase.execute(content, '/campaign.vtmd')
    expect(result.isOk()).toBe(true)
    result.map(doc => expect(doc.type).toBe(VtmdType.Campaign))
  })

  it('valid vtmd:character returns ok with Character type', () => {
    const result = useCase.execute('# vtmd:character\n\n::character-header[name="Viktor"]', '/v.vtmd')
    expect(result.isOk()).toBe(true)
    result.map(doc => expect(doc.type).toBe(VtmdType.Character))
  })

  it('valid vtmd:npc returns ok with Npc type', () => {
    const result = useCase.execute('# vtmd:npc\n\n::npc-header[name="Marcus"]', '/npc.vtmd')
    expect(result.isOk()).toBe(true)
    result.map(doc => expect(doc.type).toBe(VtmdType.Npc))
  })

  it('valid vtmd:module returns ok with Module type', () => {
    const result = useCase.execute('# vtmd:module\n\nname: "The Shape"', '/mod.vtmd')
    expect(result.isOk()).toBe(true)
    result.map(doc => expect(doc.type).toBe(VtmdType.Module))
  })

  it('valid vtmd:map returns ok with Map type', () => {
    const result = useCase.execute('# vtmd:map\n\n::map[svg="chicago.svg"]', '/map.vtmd')
    expect(result.isOk()).toBe(true)
    result.map(doc => expect(doc.type).toBe(VtmdType.Map))
  })

  it('empty file returns err UnknownType', () => {
    const result = useCase.execute('', '/empty.vtmd')
    expect(result.isErr()).toBe(true)
    result.mapErr(e => expect(e).toBe(VtmdError.UnknownType))
  })

  it('unrecognised type returns err UnknownType', () => {
    const result = useCase.execute('# vtmd:foobar\n\nsome content', '/bad.vtmd')
    expect(result.isErr()).toBe(true)
    result.mapErr(e => expect(e).toBe(VtmdError.UnknownType))
  })

  it('missing vtmd prefix returns err UnknownType', () => {
    const result = useCase.execute('# Just a normal heading\n\ncontent', '/file.vtmd')
    expect(result.isErr()).toBe(true)
    result.mapErr(e => expect(e).toBe(VtmdError.UnknownType))
  })

  it('body strips the type declaration line', () => {
    const result = useCase.execute('# vtmd:chapter\n\nActual body', '/f.vtmd')
    result.map(doc => {
      expect(doc.body).not.toContain('vtmd:chapter')
      expect(doc.body).toContain('Actual body')
    })
  })
})
