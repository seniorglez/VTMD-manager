import { TauriClient } from './infrastructure/tauri/TauriClient'
import { CampaignRepository } from './infrastructure/repositories/CampaignRepository'
import { UpdaterRepository } from './infrastructure/repositories/UpdaterRepository'
import { VtmdParserService } from './domain/campaign/services/VtmdParserService'
import { VtmdTemplateService } from './domain/campaign/services/VtmdTemplateService'
import { OpenVtmdFileUseCase } from './domain/campaign/usecases/OpenVtmdFileUseCase'
import { OpenCampaignFolderUseCase } from './domain/campaign/usecases/OpenCampaignFolderUseCase'
import { SaveVtmdFileUseCase } from './domain/campaign/usecases/SaveVtmdFileUseCase'
import { ListFolderTreeUseCase } from './domain/campaign/usecases/ListFolderTreeUseCase'
import { CreateVtmdFileUseCase } from './domain/campaign/usecases/CreateVtmdFileUseCase'
import { CreateDirectoryUseCase } from './domain/campaign/usecases/CreateDirectoryUseCase'
import { ParseCampaignMapUseCase } from './domain/campaign/usecases/ParseCampaignMapUseCase'
import { MapDocumentParserService } from './domain/campaign/services/MapDocumentParserService'
import { CampaignBLC } from './domain/campaign/CampaignBLC'
import { DiceRollerService } from './domain/combat/services/DiceRollerService'
import { RollDiceUseCase } from './domain/combat/usecases/RollDiceUseCase'
import { CombatBLC } from './domain/combat/CombatBLC'
import { UpdaterService } from './domain/updater/services/UpdaterService'
import { CheckUpdateUseCase } from './domain/updater/usecases/CheckUpdateUseCase'
import { InstallUpdateUseCase } from './domain/updater/usecases/InstallUpdateUseCase'
import { UpdaterBLC } from './domain/updater/UpdaterBLC'
import { OverpassRepository } from './infrastructure/repositories/OverpassRepository'
import { OverpassQueryBuilderService } from './domain/mapimport/services/OverpassQueryBuilderService'
import { OsmResponseParserService } from './domain/mapimport/services/OsmResponseParserService'
import { GeoProjectionService } from './domain/mapimport/services/GeoProjectionService'
import { SvgStreetMapRendererService } from './domain/mapimport/services/SvgStreetMapRendererService'
import { FetchOsmStreetsUseCase } from './domain/mapimport/usecases/FetchOsmStreetsUseCase'
import { GenerateStreetMapSvgUseCase } from './domain/mapimport/usecases/GenerateStreetMapSvgUseCase'
import { MapImportBLC } from './domain/mapimport/MapImportBLC'
import { VtmApp } from './ui/components/vtm-app'

const tauriClient = new TauriClient()
const campaignRepository = new CampaignRepository(tauriClient)
const parserService = new VtmdParserService()
const templateService = new VtmdTemplateService()
const openVtmdFile = new OpenVtmdFileUseCase()
const openCampaignFolder = new OpenCampaignFolderUseCase(campaignRepository)
const saveVtmdFile = new SaveVtmdFileUseCase(campaignRepository)
const listFolderTree = new ListFolderTreeUseCase(campaignRepository)
const createVtmdFile = new CreateVtmdFileUseCase(campaignRepository, templateService)
const createDirectory = new CreateDirectoryUseCase(campaignRepository)
const mapDocumentParserService = new MapDocumentParserService()
const parseCampaignMap = new ParseCampaignMapUseCase(mapDocumentParserService)
const campaignBLC = new CampaignBLC(
  openVtmdFile,
  openCampaignFolder,
  saveVtmdFile,
  parserService,
  campaignRepository,
  listFolderTree,
  createVtmdFile,
  createDirectory,
  parseCampaignMap,
)

const diceRollerService = new DiceRollerService()
const rollDice = new RollDiceUseCase(diceRollerService)
const combatBLC = new CombatBLC(rollDice)

const updaterRepository = new UpdaterRepository()
const updaterService = new UpdaterService(updaterRepository)
const checkUpdate = new CheckUpdateUseCase(updaterService)
const installUpdate = new InstallUpdateUseCase(updaterService)
const updaterBLC = new UpdaterBLC(checkUpdate, installUpdate)

const overpassRepository = new OverpassRepository()
const overpassQueryBuilder = new OverpassQueryBuilderService()
const osmResponseParser = new OsmResponseParserService()
const geoProjection = new GeoProjectionService()
const svgStreetMapRenderer = new SvgStreetMapRendererService()
const fetchOsmStreets = new FetchOsmStreetsUseCase(overpassRepository, overpassQueryBuilder, osmResponseParser)
const generateStreetMapSvg = new GenerateStreetMapSvgUseCase(geoProjection, svgStreetMapRenderer)
const mapImportBLC = new MapImportBLC(fetchOsmStreets, generateStreetMapSvg)

const app = new VtmApp()
app.campaignBlc = campaignBLC
app.combatBlc = combatBLC
app.updaterBlc = updaterBLC
app.mapImportBlc = mapImportBLC
document.querySelector('#app')!.append(app)
