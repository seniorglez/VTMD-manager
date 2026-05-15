export type { UpdateInfo } from './models/UpdateInfo'
export { UpdaterError } from './models/UpdaterError'

import { Result } from 'neverthrow'
import { UpdateInfo } from './models/UpdateInfo'
import { UpdaterError } from './models/UpdaterError'
import { CheckUpdateUseCase } from './usecases/CheckUpdateUseCase'
import { InstallUpdateUseCase } from './usecases/InstallUpdateUseCase'

export class UpdaterBLC {
  constructor(
    private readonly checkUpdateUseCase: CheckUpdateUseCase,
    private readonly installUpdateUseCase: InstallUpdateUseCase,
  ) {}

  checkForUpdates(): Promise<Result<UpdateInfo | null, UpdaterError>> {
    return this.checkUpdateUseCase.execute()
  }

  installUpdate(): Promise<Result<void, UpdaterError>> {
    return this.installUpdateUseCase.execute()
  }
}
