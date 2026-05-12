import { describe, it, expect, vi } from 'vitest'
import { ListFolderTreeUseCase } from './ListFolderTreeUseCase'
import { FolderNode } from '../models/FolderNode'
import { VtmdType } from '../models/VtmdType'

const leaf: FolderNode = {
  name: 'campaign',
  path: '/a',
  files: [{ path: '/a/scene.vtmd', type: VtmdType.Chapter }],
  children: [],
}

describe('ListFolderTreeUseCase', () => {
  it('returns the FolderNode produced by the repository', async () => {
    const repo = { listFolderTree: vi.fn().mockResolvedValue(leaf) }
    const useCase = new ListFolderTreeUseCase(repo)

    const result = await useCase.execute('/a')

    expect(result).toBe(leaf)
    expect(repo.listFolderTree).toHaveBeenCalledWith('/a')
  })

  it('propagates repository errors', async () => {
    const repo = { listFolderTree: vi.fn().mockRejectedValue(new Error('fs error')) }
    const useCase = new ListFolderTreeUseCase(repo)

    await expect(useCase.execute('/bad')).rejects.toThrow('fs error')
  })
})
