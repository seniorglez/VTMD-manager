import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CheckUpdateUseCase } from './CheckUpdateUseCase'
import { UpdaterService } from '../services/UpdaterService'
import { UpdaterError } from '../models/UpdaterError'
import { UpdateInfo } from '../models/UpdateInfo'

const mockService = {
  check: vi.fn<() => Promise<UpdateInfo | null>>(),
  hasPendingUpdate: vi.fn<() => boolean>(),
  install: vi.fn<() => Promise<void>>(),
}

describe('CheckUpdateUseCase', () => {
  let useCase: CheckUpdateUseCase

  beforeEach(() => {
    vi.resetAllMocks()
    useCase = new CheckUpdateUseCase(mockService as unknown as UpdaterService)
  })

  it('returns ok(null) when no update is available', async () => {
    mockService.check.mockResolvedValue(null)
    const result = await useCase.execute()
    expect(result.isOk()).toBe(true)
    expect(result._unsafeUnwrap()).toBeNull()
  })

  it('returns ok(UpdateInfo) when an update is available', async () => {
    const info: UpdateInfo = { version: '0.2.0', currentVersion: '0.1.0', body: 'New features' }
    mockService.check.mockResolvedValue(info)
    const result = await useCase.execute()
    expect(result.isOk()).toBe(true)
    expect(result._unsafeUnwrap()).toEqual(info)
  })

  it('returns err(CheckFailed) when service throws', async () => {
    mockService.check.mockRejectedValue(new Error('network error'))
    const result = await useCase.execute()
    expect(result.isErr()).toBe(true)
    expect(result._unsafeUnwrapErr()).toBe(UpdaterError.CheckFailed)
  })
})
