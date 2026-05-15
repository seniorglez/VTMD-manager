import { check, Update } from '@tauri-apps/plugin-updater'
import { UpdateInfo } from '../../domain/updater/models/UpdateInfo'

export class UpdaterRepository {
  private pendingUpdate: Update | null = null

  async check(): Promise<UpdateInfo | null> {
    const update = await check()
    this.pendingUpdate = update ?? null
    if (!update) return null
    return {
      version: update.version,
      currentVersion: update.currentVersion,
      body: update.body ?? null,
    }
  }

  async install(): Promise<void> {
    if (!this.pendingUpdate) throw new Error('No pending update')
    await this.pendingUpdate.downloadAndInstall()
    // The update is applied on next launch — caller is responsible for prompting restart
  }
}
