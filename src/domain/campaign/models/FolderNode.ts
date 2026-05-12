import { FileEntry } from './FileEntry'

export interface FolderNode {
  name: string
  path: string
  files: FileEntry[]
  children: FolderNode[]
}
