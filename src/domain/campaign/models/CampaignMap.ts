import { MapArea } from './MapArea'
import { LegendEntry } from './LegendEntry'

export interface CampaignMap {
  svgPath: string
  name: string
  areas: MapArea[]
  legend: LegendEntry[]
}
