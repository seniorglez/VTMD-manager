import { invoke } from '@tauri-apps/api/core'
import { readTextFile, readDir, writeTextFile } from '@tauri-apps/plugin-fs'
import { FolderNode } from '../../domain/campaign/models/FolderNode'
import { FileEntry } from '../../domain/campaign/models/FileEntry'
import { VtmdType } from '../../domain/campaign/models/VtmdType'

export class TauriClient {
  async pickFile(): Promise<string | null> {
    try {
      const result = await invoke<string | string[] | null>('plugin:dialog|open', {
        options: {
          multiple: false,
          filters: [{ name: 'VTMD', extensions: ['vtmd'] }],
        },
      })
      if (Array.isArray(result)) return result[0] ?? null
      return result
    } catch (cause) {
      const msg = `[TauriClient.pickFile] → ${cause}`
      console.error(msg, cause)
      throw new Error(msg, { cause })
    }
  }

  async readFile(path: string): Promise<string> {
    try {
      return await readTextFile(path)
    } catch (cause) {
      const msg = `[TauriClient.readFile] path="${path}" → ${cause}`
      console.error(msg, cause)
      throw new Error(msg, { cause })
    }
  }

  async pickFolder(): Promise<string | null> {
    try {
      return await invoke<string | null>('plugin:dialog|open', {
        options: {
          directory: true,
          multiple: false,
        },
      })
    } catch (cause) {
      const msg = `[TauriClient.pickFolder] → ${cause}`
      console.error(msg, cause)
      throw new Error(msg, { cause })
    }
  }

  async writeFile(path: string, content: string): Promise<void> {
    try {
      await writeTextFile(path, content)
    } catch (cause) {
      const msg = `[TauriClient.writeFile] path="${path}" → ${cause}`
      console.error(msg, cause)
      throw new Error(msg, { cause })
    }
  }

  async listVtmdFiles(folderPath: string): Promise<string[]> {
    try {
      const entries = await readDir(folderPath)
      return entries
        .filter(e => typeof e.name === 'string' && e.name.endsWith('.vtmd'))
        .map(e => `${folderPath}/${e.name}`)
    } catch (cause) {
      const msg = `[TauriClient.listVtmdFiles] folderPath="${folderPath}" → ${cause}`
      console.error(msg, cause)
      throw new Error(msg, { cause })
    }
  }

  async listFolderTree(folderPath: string): Promise<FolderNode> {
    try {
      const entries = await readDir(folderPath)
      const files: FileEntry[] = []
      const children: FolderNode[] = []
      for (const entry of entries) {
        if (typeof entry.name !== 'string') continue
        if (entry.isDirectory) {
          children.push(await this.listFolderTree(`${folderPath}/${entry.name}`))
        } else if (entry.name.endsWith('.vtmd')) {
          const path = `${folderPath}/${entry.name}`
          files.push({ path, type: await this._peekVtmdType(path) })
        }
      }
      const name = folderPath.split('/').pop() ?? folderPath
      return { name, path: folderPath, files, children }
    } catch (cause) {
      const msg = `[TauriClient.listFolderTree] folderPath="${folderPath}" → ${cause}`
      console.error(msg, cause)
      throw new Error(msg, { cause })
    }
  }

  private async _peekVtmdType(path: string): Promise<VtmdType | null> {
    try {
      const content = await readTextFile(path)
      const firstLine = content.split('\n')[0] ?? ''
      const match = firstLine.match(/^#\s*vtmd:(\w+)/)
      if (!match) return null
      const raw = match[1] as string
      return (Object.values(VtmdType) as string[]).includes(raw) ? (raw as VtmdType) : null
    } catch {
      return null
    }
  }
}
