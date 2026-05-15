import { UpdateInfo } from '../models/UpdateInfo'

interface UpdaterRepositoryPort {
  check(): Promise<UpdateInfo | null>
  install(): Promise<void>
}

export class UpdaterService {
  private pending = false

  constructor(private readonly repository: UpdaterRepositoryPort) {}

  async check(): Promise<UpdateInfo | null> {
    const info = await this.repository.check()
    this.pending = info !== null
    return info
  }

  hasPendingUpdate(): boolean {
    return this.pending
  }

  install(): Promise<void> {
    return this.repository.install()
  }
}
