import { Point } from './Point'

export interface MapArea {
  name: string
  points: Point[]
  linkedEntityIds: string[]
}
