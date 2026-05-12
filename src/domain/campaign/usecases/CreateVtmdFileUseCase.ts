import { Result, ok, err } from 'neverthrow'
import { VtmdType } from '../models/VtmdType'
import { VtmdError } from '../models/VtmdError'
import { VtmdTemplateService } from '../services/VtmdTemplateService'

interface CreateFileRepositoryPort {
  writeFile(path: string, content: string): Promise<void>
}

export class CreateVtmdFileUseCase {
  constructor(
    private readonly repo: CreateFileRepositoryPort,
    private readonly templateService: VtmdTemplateService,
  ) {}

  async execute(
    folderPath: string,
    filename: string,
    type: VtmdType,
  ): Promise<Result<string, VtmdError>> {
    const normalized = filename.endsWith('.vtmd') ? filename : `${filename}.vtmd`
    const path = `${folderPath}/${normalized}`
    const content = this.templateService.getTemplate(type)
    try {
      await this.repo.writeFile(path, content)
      return ok(path)
    } catch {
      return err(VtmdError.WriteFailed)
    }
  }
}
