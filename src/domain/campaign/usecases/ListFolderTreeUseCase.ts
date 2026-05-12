import { FolderNode } from '../models/FolderNode'

interface FolderTreeRepositoryPort {
  listFolderTree(folderPath: string): Promise<FolderNode>
}

export class ListFolderTreeUseCase {
  constructor(private readonly repo: FolderTreeRepositoryPort) {}

  execute(folderPath: string): Promise<FolderNode> {
    return this.repo.listFolderTree(folderPath)
  }
}
