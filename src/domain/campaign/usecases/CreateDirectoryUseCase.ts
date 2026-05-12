import { Result, ok, err } from 'neverthrow'
import { VtmdError } from '../models/VtmdError'

interface CreateDirRepositoryPort {
  createDirectory(path: string): Promise<void>
}

export class CreateDirectoryUseCase {
  constructor(private readonly repo: CreateDirRepositoryPort) {}

  async execute(parentPath: string, name: string): Promise<Result<string, VtmdError>> {
    const sanitized = name.trim()
    if (!sanitized) return err(VtmdError.WriteFailed)
    const path = `${parentPath}/${sanitized}`
    try {
      await this.repo.createDirectory(path)
      return ok(path)
    } catch {
      return err(VtmdError.WriteFailed)
    }
  }
}
