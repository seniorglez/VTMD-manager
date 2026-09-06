import { Result, err } from 'neverthrow'
import { VtmdDocument } from '../models/VtmdDocument'
import { VtmdType } from '../models/VtmdType'
import { VtmdError } from '../models/VtmdError'
import { CampaignMap } from '../models/CampaignMap'
import { MapDocumentParserService } from '../services/MapDocumentParserService'

export class ParseCampaignMapUseCase {
  constructor(private readonly parser: MapDocumentParserService) {}

  execute(doc: VtmdDocument): Result<CampaignMap, VtmdError> {
    if (doc.type !== VtmdType.Map) return err(VtmdError.InvalidMapDocument)
    return this.parser.parse(doc.body)
  }
}
