import { describe, it, expect, vi } from 'vitest'
import { CreateDirectoryUseCase } from './CreateDirectoryUseCase'
import { VtmdError } from '../models/VtmdError'

function makeUseCase(createDirectory = vi.fn().mockResolvedValue(undefined)) {
  return { useCase: new CreateDirectoryUseCase({ createDirectory }), createDirectory }
}

describe('CreateDirectoryUseCase', () => {
  it('returns err(WriteFailed) and does not call repo when name is empty', async () => {
    const { useCase, createDirectory } = makeUseCase()
    const result = await useCase.execute('/campaign', '')
    expect(result.isErr()).toBe(true)
    result.mapErr(e => expect(e).toBe(VtmdError.WriteFailed))
    expect(createDirectory).not.toHaveBeenCalled()
  })

  it('returns err(WriteFailed) and does not call repo when name is only whitespace', async () => {
    const { useCase, createDirectory } = makeUseCase()
    const result = await useCase.execute('/campaign', '   ')
    expect(result.isErr()).toBe(true)
    expect(createDirectory).not.toHaveBeenCalled()
  })

  it('calls repo.createDirectory with parentPath/name', async () => {
    const { useCase, createDirectory } = makeUseCase()
    await useCase.execute('/campaign', 'personajes')
    expect(createDirectory).toHaveBeenCalledWith('/campaign/personajes')
  })

  it('returns ok with the new directory path on success', async () => {
    const { useCase } = makeUseCase()
    const result = await useCase.execute('/campaign', 'personajes')
    expect(result.isOk()).toBe(true)
    result.map(path => expect(path).toBe('/campaign/personajes'))
  })

  it('returns err(WriteFailed) when repo throws', async () => {
    const { useCase } = makeUseCase(vi.fn().mockRejectedValue(new Error('permission denied')))
    const result = await useCase.execute('/campaign', 'personajes')
    expect(result.isErr()).toBe(true)
    result.mapErr(e => expect(e).toBe(VtmdError.WriteFailed))
  })
})
