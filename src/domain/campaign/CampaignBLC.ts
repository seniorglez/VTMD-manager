import { Result, err } from 'neverthrow'
import { OpenVtmdFileUseCase } from './usecases/OpenVtmdFileUseCase'
import { OpenCampaignFolderUseCase } from './usecases/OpenCampaignFolderUseCase'
import { SaveVtmdFileUseCase } from './usecases/SaveVtmdFileUseCase'
import { ListFolderTreeUseCase } from './usecases/ListFolderTreeUseCase'
import { CreateVtmdFileUseCase } from './usecases/CreateVtmdFileUseCase'
import { CreateDirectoryUseCase } from './usecases/CreateDirectoryUseCase'
import { VtmdParserService } from './services/VtmdParserService'
import { VtmdDocument } from './models/VtmdDocument'
import { VtmdError } from './models/VtmdError'
import { VtmdType } from './models/VtmdType'
import { FolderNode } from './models/FolderNode'

export type { VtmdDocument } from './models/VtmdDocument'
export type { FolderNode } from './models/FolderNode'
export type { FileEntry } from './models/FileEntry'
export { VtmdType } from './models/VtmdType'
export { VtmdError } from './models/VtmdError'

interface CampaignRepositoryPort {
  pickFile(): Promise<string | null>
  readFile(path: string): Promise<string>
  writeFile(path: string, content: string): Promise<void>
  pickFolder(): Promise<string | null>
  listVtmdFiles(folderPath: string): Promise<string[]>
  listFolderTree(folderPath: string): Promise<FolderNode>
  createDirectory(path: string): Promise<void>
}

export class CampaignBLC {
  lastError = ''

  constructor(
    private readonly openVtmdFile: OpenVtmdFileUseCase,
    private readonly openCampaignFolder: OpenCampaignFolderUseCase,
    private readonly saveVtmdFile: SaveVtmdFileUseCase,
    private readonly parser: VtmdParserService,
    private readonly repo: CampaignRepositoryPort,
    private readonly listFolderTreeUseCase: ListFolderTreeUseCase,
    private readonly createVtmdFile: CreateVtmdFileUseCase,
    private readonly createDirectoryUseCase: CreateDirectoryUseCase,
  ) {}

  pickFile(): Promise<string | null> {
    return this.repo.pickFile()
  }

  async openFile(path: string): Promise<Result<VtmdDocument, VtmdError>> {
    this.lastError = ''
    try {
      const content = await this.repo.readFile(path)
      if (typeof content !== 'string') {
        this.lastError = `readFile returned ${typeof content} instead of string`
        console.error(`[CampaignBLC.openFile] path="${path}" →`, this.lastError, content)
        return err(VtmdError.ReadFailed)
      }
      return this.openVtmdFile.execute(content, path)
    } catch (cause) {
      this.lastError = String(cause)
      console.error(`[CampaignBLC.openFile] path="${path}" → ${cause}`)
      return err(VtmdError.ReadFailed)
    }
  }

  render(doc: VtmdDocument): string {
    return this.parser.render(doc.body)
  }

  renderRaw(rawContent: string): string {
    const body = rawContent.split('\n').slice(1).join('\n').trimStart()
    return this.parser.render(body)
  }

  async saveFile(path: string, rawContent: string): Promise<Result<void, VtmdError>> {
    this.lastError = ''
    const result = await this.saveVtmdFile.execute(path, rawContent)
    result.mapErr(e => {
      this.lastError = `VtmdError: ${e}`
    })
    return result
  }

  pickFolder(): Promise<string | null> {
    return this.repo.pickFolder()
  }

  async listFiles(folderPath: string): Promise<string[]> {
    try {
      return await this.openCampaignFolder.execute(folderPath)
    } catch (cause) {
      console.error(`[CampaignBLC.listFiles] folderPath="${folderPath}" → ${cause}`)
      throw cause
    }
  }

  listFolderTree(folderPath: string): Promise<FolderNode> {
    return this.listFolderTreeUseCase.execute(folderPath)
  }

  createFile(
    folderPath: string,
    filename: string,
    type: VtmdType,
  ): Promise<Result<string, VtmdError>> {
    return this.createVtmdFile.execute(folderPath, filename, type)
  }

  createDirectory(parentPath: string, name: string): Promise<Result<string, VtmdError>> {
    return this.createDirectoryUseCase.execute(parentPath, name)
  }
}
