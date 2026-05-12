import { TauriClient } from './infrastructure/tauri/TauriClient'
import { CampaignRepository } from './infrastructure/repositories/CampaignRepository'
import { VtmdParserService } from './domain/campaign/services/VtmdParserService'
import { VtmdTemplateService } from './domain/campaign/services/VtmdTemplateService'
import { OpenVtmdFileUseCase } from './domain/campaign/usecases/OpenVtmdFileUseCase'
import { OpenCampaignFolderUseCase } from './domain/campaign/usecases/OpenCampaignFolderUseCase'
import { SaveVtmdFileUseCase } from './domain/campaign/usecases/SaveVtmdFileUseCase'
import { ListFolderTreeUseCase } from './domain/campaign/usecases/ListFolderTreeUseCase'
import { CreateVtmdFileUseCase } from './domain/campaign/usecases/CreateVtmdFileUseCase'
import { CampaignBLC } from './domain/campaign/CampaignBLC'
import { DiceRollerService } from './domain/combat/services/DiceRollerService'
import { RollDiceUseCase } from './domain/combat/usecases/RollDiceUseCase'
import { CombatBLC } from './domain/combat/CombatBLC'
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
const campaignBLC = new CampaignBLC(
  openVtmdFile,
  openCampaignFolder,
  saveVtmdFile,
  parserService,
  campaignRepository,
  listFolderTree,
  createVtmdFile,
)

const diceRollerService = new DiceRollerService()
const rollDice = new RollDiceUseCase(diceRollerService)
const combatBLC = new CombatBLC(rollDice)

const app = new VtmApp()
app.campaignBlc = campaignBLC
app.combatBlc = combatBLC
document.querySelector('#app')!.append(app)
