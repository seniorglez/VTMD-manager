import { describe, it, expect } from 'vitest'
import { ParseCampaignMapUseCase } from './ParseCampaignMapUseCase'
import { MapDocumentParserService } from '../services/MapDocumentParserService'
import { VtmdType } from '../models/VtmdType'
import { VtmdError } from '../models/VtmdError'
import { VtmdDocument } from '../models/VtmdDocument'

const useCase = new ParseCampaignMapUseCase(new MapDocumentParserService())

function doc(overrides: Partial<VtmdDocument>): VtmdDocument {
  return {
    type: VtmdType.Map,
    body: '::map[svg="x.svg"]',
    filePath: '/campaign/map.vtmd',
    rawContent: '',
    ...overrides,
  }
}

describe('ParseCampaignMapUseCase', () => {
  it('returns InvalidMapDocument when the document type is not Map', () => {
    const result = useCase.execute(doc({ type: VtmdType.Chapter }))
    expect(result._unsafeUnwrapErr()).toBe(VtmdError.InvalidMapDocument)
  })

  it('delegates to the parser and returns the parsed CampaignMap', () => {
    const result = useCase.execute(doc({ body: '::map[svg="chicago.svg" name="Chicago"]' }))
    expect(result._unsafeUnwrap().svgPath).toBe('chicago.svg')
  })
})
