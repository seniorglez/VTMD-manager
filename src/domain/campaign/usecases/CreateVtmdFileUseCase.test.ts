import { describe, it, expect, vi } from 'vitest'
import { CreateVtmdFileUseCase } from './CreateVtmdFileUseCase'
import { VtmdTemplateService } from '../services/VtmdTemplateService'
import { VtmdType } from '../models/VtmdType'
import { VtmdError } from '../models/VtmdError'

function makeUseCase(writeFile = vi.fn().mockResolvedValue(undefined)) {
  const repo = { writeFile }
  const templateService = new VtmdTemplateService()
  return { useCase: new CreateVtmdFileUseCase(repo, templateService), writeFile }
}

describe('CreateVtmdFileUseCase', () => {
  it('appends .vtmd extension when filename has none', async () => {
    const { useCase, writeFile } = makeUseCase()
    await useCase.execute('/campaign', 'viktor', VtmdType.Character)
    expect(writeFile).toHaveBeenCalledWith('/campaign/viktor.vtmd', expect.any(String))
  })

  it('does not double the .vtmd extension when already present', async () => {
    const { useCase, writeFile } = makeUseCase()
    await useCase.execute('/campaign', 'viktor.vtmd', VtmdType.Character)
    const [path] = writeFile.mock.calls[0]
    expect(path).toBe('/campaign/viktor.vtmd')
  })

  it('content for character type starts with # vtmd:character', async () => {
    const { useCase, writeFile } = makeUseCase()
    await useCase.execute('/campaign', 'viktor', VtmdType.Character)
    const [, content] = writeFile.mock.calls[0]
    expect(content.split('\n')[0]).toBe('# vtmd:character')
  })

  it('returns ok with the file path on success', async () => {
    const { useCase } = makeUseCase()
    const result = await useCase.execute('/campaign', 'viktor', VtmdType.Character)
    expect(result.isOk()).toBe(true)
    result.map(path => expect(path).toBe('/campaign/viktor.vtmd'))
  })

  it('returns err(WriteFailed) when repository throws', async () => {
    const { useCase } = makeUseCase(vi.fn().mockRejectedValue(new Error('disk full')))
    const result = await useCase.execute('/campaign', 'viktor', VtmdType.Character)
    expect(result.isErr()).toBe(true)
    result.mapErr(e => expect(e).toBe(VtmdError.WriteFailed))
  })
})
