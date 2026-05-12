import { TauriClient } from '../tauri/TauriClient'
import { FolderNode } from '../../domain/campaign/models/FolderNode'

export class CampaignRepository {
  constructor(private readonly client: TauriClient) {}

  pickFile(): Promise<string | null> {
    return this.client.pickFile()
  }

  readFile(path: string): Promise<string> {
    return this.client.readFile(path)
  }

  writeFile(path: string, content: string): Promise<void> {
    return this.client.writeFile(path, content)
  }

  pickFolder(): Promise<string | null> {
    return this.client.pickFolder()
  }

  listVtmdFiles(folderPath: string): Promise<string[]> {
    return this.client.listVtmdFiles(folderPath)
  }

  listFolderTree(folderPath: string): Promise<FolderNode> {
    return this.client.listFolderTree(folderPath)
  }

  createDirectory(path: string): Promise<void> {
    return this.client.createDirectory(path)
  }
}
