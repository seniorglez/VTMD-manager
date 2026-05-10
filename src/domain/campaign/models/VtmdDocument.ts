import { VtmdType } from './VtmdType'

export interface VtmdDocument {
  type: VtmdType
  body: string
  filePath: string
  rawContent: string
}
