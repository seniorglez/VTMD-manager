import { describe, it, expect, vi } from 'vitest'
import { SaveVtmdFileUseCase } from './SaveVtmdFileUseCase'
import { VtmdError } from '../models/VtmdError'

describe('SaveVtmdFileUseCase', () => {
  it('calls writeFile and returns ok when successful', async () => {
    const repo = { writeFile: vi.fn().mockResolvedValue(undefined) }
    const useCase = new SaveVtmdFileUseCase(repo)

    const result = await useCase.execute('/path/file.vtmd', '# vtmd:chapter\n\nbody')

    expect(repo.writeFile).toHaveBeenCalledWith('/path/file.vtmd', '# vtmd:chapter\n\nbody')
    expect(result.isOk()).toBe(true)
  })

  it('returns err WriteFailed when writeFile throws', async () => {
    const repo = { writeFile: vi.fn().mockRejectedValue(new Error('disk full')) }
    const useCase = new SaveVtmdFileUseCase(repo)

    const result = await useCase.execute('/path/file.vtmd', 'content')

    expect(result.isErr()).toBe(true)
    result.mapErr(e => expect(e).toBe(VtmdError.WriteFailed))
  })
})
