import { Result, ok, err } from 'neverthrow'
import { VtmdError } from '../models/VtmdError'

interface FileRepositoryPort {
  writeFile(path: string, content: string): Promise<void>
}

export class SaveVtmdFileUseCase {
  constructor(private readonly repo: FileRepositoryPort) {}

  async execute(path: string, rawContent: string): Promise<Result<void, VtmdError>> {
    try {
      await this.repo.writeFile(path, rawContent)
      return ok(undefined)
    } catch (cause) {
      console.error(`[SaveVtmdFileUseCase] path="${path}" → ${cause}`)
      return err(VtmdError.WriteFailed)
    }
  }
}
