import { Result, ok, err } from 'neverthrow'
import { UpdaterService } from '../services/UpdaterService'
import { UpdateInfo } from '../models/UpdateInfo'
import { UpdaterError } from '../models/UpdaterError'

export class CheckUpdateUseCase {
  constructor(private readonly service: UpdaterService) {}

  async execute(): Promise<Result<UpdateInfo | null, UpdaterError>> {
    try {
      return ok(await this.service.check())
    } catch {
      return err(UpdaterError.CheckFailed)
    }
  }
}
