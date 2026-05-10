import { describe, it, expect, vi } from 'vitest'
import { OpenCampaignFolderUseCase } from './OpenCampaignFolderUseCase'

describe('OpenCampaignFolderUseCase', () => {
  it('returns list of vtmd file paths from repository', async () => {
    const repo = { listVtmdFiles: vi.fn().mockResolvedValue(['/a/file.vtmd', '/a/other.vtmd']) }
    const useCase = new OpenCampaignFolderUseCase(repo)

    const result = await useCase.execute('/a')

    expect(result).toEqual(['/a/file.vtmd', '/a/other.vtmd'])
    expect(repo.listVtmdFiles).toHaveBeenCalledWith('/a')
  })

  it('returns empty array when no vtmd files found', async () => {
    const repo = { listVtmdFiles: vi.fn().mockResolvedValue([]) }
    const useCase = new OpenCampaignFolderUseCase(repo)

    const result = await useCase.execute('/empty')

    expect(result).toEqual([])
  })

  it('propagates repository errors', async () => {
    const repo = { listVtmdFiles: vi.fn().mockRejectedValue(new Error('read error')) }
    const useCase = new OpenCampaignFolderUseCase(repo)

    await expect(useCase.execute('/bad')).rejects.toThrow('read error')
  })
})
