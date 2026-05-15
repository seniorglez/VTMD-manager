import { describe, it, expect, vi, beforeEach } from 'vitest'
import { InstallUpdateUseCase } from './InstallUpdateUseCase'
import { UpdaterService } from '../services/UpdaterService'
import { UpdaterError } from '../models/UpdaterError'

const mockService = {
  check: vi.fn<() => Promise<null>>(),
  hasPendingUpdate: vi.fn<() => boolean>(),
  install: vi.fn<() => Promise<void>>(),
}

describe('InstallUpdateUseCase', () => {
  let useCase: InstallUpdateUseCase

  beforeEach(() => {
    vi.resetAllMocks()
    useCase = new InstallUpdateUseCase(mockService as unknown as UpdaterService)
  })

  it('returns err(NoUpdateAvailable) when no pending update', async () => {
    mockService.hasPendingUpdate.mockReturnValue(false)
    const result = await useCase.execute()
    expect(result.isErr()).toBe(true)
    expect(result._unsafeUnwrapErr()).toBe(UpdaterError.NoUpdateAvailable)
  })

  it('returns ok(void) when pending update installs successfully', async () => {
    mockService.hasPendingUpdate.mockReturnValue(true)
    mockService.install.mockResolvedValue(undefined)
    const result = await useCase.execute()
    expect(result.isOk()).toBe(true)
  })

  it('returns err(InstallFailed) when install throws', async () => {
    mockService.hasPendingUpdate.mockReturnValue(true)
    mockService.install.mockRejectedValue(new Error('install error'))
    const result = await useCase.execute()
    expect(result.isErr()).toBe(true)
    expect(result._unsafeUnwrapErr()).toBe(UpdaterError.InstallFailed)
  })
})
