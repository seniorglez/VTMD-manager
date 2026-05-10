interface FolderRepositoryPort {
  listVtmdFiles(folderPath: string): Promise<string[]>
}

export class OpenCampaignFolderUseCase {
  constructor(private readonly repo: FolderRepositoryPort) {}

  execute(folderPath: string): Promise<string[]> {
    return this.repo.listVtmdFiles(folderPath)
  }
}
