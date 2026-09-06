import { Result, ok, err } from 'neverthrow'
import { CampaignMap } from '../models/CampaignMap'
import { MapArea } from '../models/MapArea'
import { Point } from '../models/Point'
import { LegendEntry } from '../models/LegendEntry'
import { VtmdError } from '../models/VtmdError'
import { parseVtmdAttrs } from './parseVtmdAttrs'

const NUMBER_RE = /^-?\d+(\.\d+)?$/

function parsePoints(raw: string): Point[] | null {
  const pairs = raw.trim().split(/\s+/).filter(Boolean)
  if (pairs.length === 0) return null
  const points: Point[] = []
  for (const pair of pairs) {
    const parts = pair.split(',')
    if (parts.length !== 2 || !NUMBER_RE.test(parts[0]!) || !NUMBER_RE.test(parts[1]!)) {
      return null
    }
    points.push({ x: Number(parts[0]), y: Number(parts[1]) })
  }
  return points
}

function parseLinkedEntityIds(raw: string | undefined): string[] {
  if (!raw) return []
  return raw.split(',').map(s => s.trim()).filter(Boolean)
}

function parseLegend(body: string): LegendEntry[] {
  const legend: LegendEntry[] = []
  const seenIds = new Set<string>()
  const legendRe = /::legend\[([^\]]*)\]/g
  let m: RegExpExecArray | null
  while ((m = legendRe.exec(body)) !== null) {
    const attrs = parseVtmdAttrs(m[1]!)
    const id = attrs['id']
    const label = attrs['label']
    const color = attrs['color']
    if (!id || !label || !color) continue
    if (seenIds.has(id)) continue
    seenIds.add(id)
    legend.push({ id, label, color })
  }
  return legend
}

export class MapDocumentParserService {
  parse(body: string): Result<CampaignMap, VtmdError> {
    const mapMatch = body.match(/::map\[([^\]]*)\]/)
    if (!mapMatch) return err(VtmdError.InvalidMapDocument)

    const mapAttrs = parseVtmdAttrs(mapMatch[1]!)
    const svgPath = mapAttrs['svg']
    if (!svgPath) return err(VtmdError.InvalidMapDocument)

    const areas: MapArea[] = []
    const areaRe = /::map-area\[([^\]]*)\]/g
    let m: RegExpExecArray | null
    while ((m = areaRe.exec(body)) !== null) {
      const attrs = parseVtmdAttrs(m[1]!)
      const points = parsePoints(attrs['points'] ?? '')
      if (!points) continue
      const category = attrs['category']
      areas.push({
        name: attrs['name'] ?? '',
        points,
        linkedEntityIds: parseLinkedEntityIds(attrs['linkedEntityIds']),
        ...(category ? { category } : {}),
      })
    }

    return ok({ svgPath, name: mapAttrs['name'] ?? '', areas, legend: parseLegend(body) })
  }
}
