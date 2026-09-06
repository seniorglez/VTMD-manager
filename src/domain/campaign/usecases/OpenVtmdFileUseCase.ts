import { Result, ok, err } from 'neverthrow'
import { VtmdDocument } from '../models/VtmdDocument'
import { VtmdType } from '../models/VtmdType'
import { VtmdError } from '../models/VtmdError'

const TYPE_MAP: Record<string, VtmdType> = {
  character: VtmdType.Character,
  npc: VtmdType.Npc,
  chapter: VtmdType.Chapter,
  module: VtmdType.Module,
  campaign: VtmdType.Campaign,
  map: VtmdType.Map,
}

export class OpenVtmdFileUseCase {
  execute(content: string, filePath: string): Result<VtmdDocument, VtmdError> {
    const lines = content.split('\n')
    const firstLine = lines[0]?.trim() ?? ''
    const match = firstLine.match(/^#\s+vtmd:(\w+)\s*$/)

    if (!match) return err(VtmdError.UnknownType)

    const typeKey = match[1]!
    const type = TYPE_MAP[typeKey]
    if (!type) return err(VtmdError.UnknownType)

    const body = lines.slice(1).join('\n').trimStart()
    return ok({ type, body, filePath, rawContent: content })
  }
}
