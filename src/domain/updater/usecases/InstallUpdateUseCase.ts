import { Result, ok, err } from 'neverthrow'
import { UpdaterService } from '../services/UpdaterService'
import { UpdaterError } from '../models/UpdaterError'

export class InstallUpdateUseCase {
  constructor(private readonly service: UpdaterService) {}

  async execute(): Promise<Result<void, UpdaterError>> {
    if (!this.service.hasPendingUpdate()) {
      return err(UpdaterError.NoUpdateAvailable)
    }
    try {
      await this.service.install()
      return ok(undefined)
    } catch {
      return err(UpdaterError.InstallFailed)
    }
  }
}
