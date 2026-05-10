import { Marked } from 'marked'

type Attrs = Record<string, string>
type RenderFn = (attrs: Attrs, raw: string) => string

function parseAttrs(raw: string): Attrs {
  const attrs: Attrs = {}
  const re = /([\w-]+)=(?:"([^"]*)"|([\w.]+))/g
  let m: RegExpExecArray | null
  while ((m = re.exec(raw)) !== null) {
    attrs[m[1]!] = m[2] !== undefined ? m[2] : (m[3] ?? '')
  }
  return attrs
}

function dots(level: number): string {
  const clamped = Math.max(0, Math.min(5, level))
  return '●'.repeat(clamped) + '○'.repeat(5 - clamped)
}

function dotsLarge(current: number, max: number): string {
  const m = Math.max(0, max)
  const c = Math.max(0, Math.min(m, current))
  if (m <= 5) return dots(c)
  const groups: string[] = []
  let filled = c
  let total = m
  while (total > 0) {
    const size = Math.min(5, total)
    const f = Math.min(size, filled)
    groups.push('●'.repeat(f) + '○'.repeat(size - f))
    filled -= f
    total -= size
  }
  return groups.join(' ')
}

function toTitleCase(key: string): string {
  return key.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function abilityRows(keys: string[], attrs: Attrs): string {
  return keys
    .map(k => {
      const val = parseInt(attrs[k] ?? '0', 10)
      return `<tr><td>${toTitleCase(k)}</td><td>${dots(val)}</td></tr>`
    })
    .join('')
}

const TALENTS = ['alertness', 'athletics', 'brawl', 'dodge', 'empathy', 'expression', 'intimidation', 'leadership', 'streetwise', 'subterfuge']
const SKILLS = ['animal-ken', 'crafts', 'drive', 'etiquette', 'firearms', 'melee', 'performance', 'stealth', 'survival', 'technology']
const KNOWLEDGES = ['academics', 'computer', 'finance', 'investigation', 'law', 'linguistics', 'medicine', 'occult', 'politics', 'science']

// ── Render functions ──────────────────────────────────────────────────────────

function renderScene(attrs: Attrs, _raw: string): string {
  return `<div class="vtmd-scene"><span class="vtmd-scene-name">${attrs['name'] ?? ''}</span> · <span class="vtmd-scene-type">${attrs['type'] ?? ''}</span> · <span class="vtmd-scene-mood">${attrs['mood'] ?? ''}</span></div>`
}

function renderSecret(_attrs: Attrs, raw: string): string {
  return `<div class="vtmd-secret">${raw}</div>`
}

function renderNpc(attrs: Attrs, _raw: string): string {
  return `<div class="vtmd-npc"><strong>${attrs['name'] ?? ''}</strong> (${attrs['clan'] ?? ''}) — ${attrs['attitude'] ?? ''}<p>${attrs['description'] ?? ''}</p></div>`
}

function renderRoll(attrs: Attrs, _raw: string): string {
  return `<div class="vtmd-roll"><span class="vtmd-roll-label">${attrs['attribute'] ?? ''}</span> <span class="vtmd-roll-meta">Pool ${attrs['pool'] ?? '?'} / Difficulty ${attrs['difficulty'] ?? '?'}</span></div>`
}

function renderBlood(attrs: Attrs, _raw: string): string {
  const current = parseInt(attrs['current'] ?? '0', 10)
  const max = parseInt(attrs['max'] ?? '10', 10)
  return `<div class="vtmd-blood">${dotsLarge(current, max)} (${current}/${max})</div>`
}

function renderDiscipline(attrs: Attrs, _raw: string): string {
  const level = parseInt(attrs['level'] ?? '0', 10)
  return `<div class="vtmd-discipline"><span class="vtmd-discipline-name">${attrs['name'] ?? ''}</span> <span class="vtmd-discipline-dots">${dots(level)}</span></div>`
}

function renderAttributes(attrs: Attrs, _raw: string): string {
  const attrList = ['strength', 'dexterity', 'stamina', 'charisma', 'manipulation', 'appearance', 'perception', 'intelligence', 'wits']
  const rows = attrList
    .map(a => {
      const val = parseInt(attrs[a] ?? '1', 10)
      return `<tr><td>${a.charAt(0).toUpperCase() + a.slice(1)}</td><td>${dots(val)}</td></tr>`
    })
    .join('')
  return `<div class="vtmd-attributes"><table>${rows}</table></div>`
}

function renderCharacterHeader(attrs: Attrs, _raw: string): string {
  const extra = attrs['nature']
    ? `<p>Nature: ${attrs['nature']} · Demeanor: ${attrs['demeanor'] ?? ''}</p>`
    : ''
  return `<div class="vtmd-character-header"><h2>${attrs['name'] ?? ''}</h2><p>Clan: ${attrs['clan'] ?? ''} · Generation: ${attrs['generation'] ?? ''} · Player: ${attrs['player'] ?? ''}</p>${extra}</div>`
}

function renderNpcHeader(attrs: Attrs, _raw: string): string {
  const agePart = attrs['apparent-age'] ? ` · Age: ${attrs['apparent-age']}` : ''
  const attPart = attrs['attitude'] ? ` · ${attrs['attitude']}` : ''
  return `<div class="vtmd-npc-header"><h2>${attrs['name'] ?? ''}</h2><p>Clan: ${attrs['clan'] ?? ''}${agePart}${attPart}</p></div>`
}

function renderTalents(attrs: Attrs, _raw: string): string {
  return `<div class="vtmd-talents"><table>${abilityRows(TALENTS, attrs)}</table></div>`
}

function renderSkills(attrs: Attrs, _raw: string): string {
  return `<div class="vtmd-skills"><table>${abilityRows(SKILLS, attrs)}</table></div>`
}

function renderKnowledges(attrs: Attrs, _raw: string): string {
  return `<div class="vtmd-knowledges"><table>${abilityRows(KNOWLEDGES, attrs)}</table></div>`
}

function renderBackgrounds(attrs: Attrs, _raw: string): string {
  const rows = Object.entries(attrs)
    .map(([k, v]) => `<tr><td>${toTitleCase(k)}</td><td>${dots(parseInt(v, 10))}</td></tr>`)
    .join('')
  return `<div class="vtmd-backgrounds"><table>${rows}</table></div>`
}

function renderVirtues(attrs: Attrs, _raw: string): string {
  const rows = Object.entries(attrs)
    .map(([k, v]) => `<tr><td>${toTitleCase(k)}</td><td>${dots(parseInt(v, 10))}</td></tr>`)
    .join('')
  return `<div class="vtmd-virtues"><table>${rows}</table></div>`
}

function renderMorality(attrs: Attrs, _raw: string): string {
  const rating = parseInt(attrs['rating'] ?? '0', 10)
  return `<div class="vtmd-morality"><span class="vtmd-morality-path">${attrs['path'] ?? ''}</span> <span class="vtmd-morality-dots">${dotsLarge(rating, 10)}</span></div>`
}

function renderWillpower(attrs: Attrs, _raw: string): string {
  const current = parseInt(attrs['current'] ?? '0', 10)
  const max = parseInt(attrs['max'] ?? '10', 10)
  return `<div class="vtmd-willpower"><span class="vtmd-willpower-dots">${dotsLarge(current, max)}</span> <span class="vtmd-willpower-label">(${current}/${max})</span></div>`
}

function renderHealth(attrs: Attrs, _raw: string): string {
  const agg = Math.max(0, parseInt(attrs['aggravated'] ?? '0', 10))
  const lethal = Math.max(0, parseInt(attrs['lethal'] ?? '0', 10))
  const bash = Math.max(0, parseInt(attrs['bashing'] ?? '0', 10))
  const levels = [
    { label: 'Bruised',       penalty: '—'  },
    { label: 'Hurt',          penalty: '-1' },
    { label: 'Injured',       penalty: '-1' },
    { label: 'Wounded',       penalty: '-2' },
    { label: 'Mauled',        penalty: '-2' },
    { label: 'Crippled',      penalty: '-5' },
    { label: 'Incapacitated', penalty: '☠'  },
  ]
  const rows = levels.map((level, i) => {
    let mark = '○'
    if (i < agg) mark = '✱'
    else if (i < agg + lethal) mark = '✕'
    else if (i < agg + lethal + bash) mark = '/'
    return `<tr><td>${level.label}</td><td>${level.penalty}</td><td class="vtmd-health-box">${mark}</td></tr>`
  }).join('')
  return `<div class="vtmd-health"><table>${rows}</table></div>`
}

function renderMerits(attrs: Attrs, _raw: string): string {
  const rows = Object.entries(attrs)
    .map(([k, v]) => `<tr><td>${toTitleCase(k)}</td><td>${dots(parseInt(v, 10))}</td></tr>`)
    .join('')
  return `<div class="vtmd-merits"><table>${rows}</table></div>`
}

function renderFlaws(attrs: Attrs, _raw: string): string {
  const rows = Object.entries(attrs)
    .map(([k, v]) => `<tr><td>${toTitleCase(k)}</td><td>${dots(parseInt(v, 10))}</td></tr>`)
    .join('')
  return `<div class="vtmd-flaws"><table>${rows}</table></div>`
}

function renderWeakness(_attrs: Attrs, raw: string): string {
  return `<div class="vtmd-weakness">${raw}</div>`
}

function renderExperience(attrs: Attrs, _raw: string): string {
  const total = parseInt(attrs['total'] ?? '0', 10)
  const spent = parseInt(attrs['spent'] ?? '0', 10)
  return `<div class="vtmd-experience"><span class="vtmd-xp-total">Total: ${total}</span> · <span class="vtmd-xp-spent">Spent: ${spent}</span> · <span class="vtmd-xp-available">Available: ${total - spent}</span></div>`
}

// ── Extension factories ───────────────────────────────────────────────────────

function makeBlockExt(tag: string, render: RenderFn) {
  return {
    name: `vtmd-${tag}`,
    level: 'block' as const,
    start: (src: string) => src.indexOf(`::${tag}[`),
    tokenizer(src: string) {
      const m = src.match(new RegExp(`^::${tag}\\[([^\\]]*)\\]`))
      if (m) return { type: `vtmd-${tag}`, raw: m[0]!, attrs: parseAttrs(m[1]!), rawContent: m[1]! }
    },
    renderer(token: any) { return render(token.attrs as Attrs, token.rawContent as string) },
  }
}

function makeInlineExt(tag: string, render: RenderFn) {
  return {
    name: `vtmd-${tag}-inline`,
    level: 'inline' as const,
    start: (src: string) => src.indexOf(`::${tag}[`),
    tokenizer(src: string) {
      const m = src.match(new RegExp(`^::${tag}\\[([^\\]]*)\\]`))
      if (m) return { type: `vtmd-${tag}-inline`, raw: m[0]!, attrs: parseAttrs(m[1]!), rawContent: m[1]! }
    },
    renderer(token: any) { return render(token.attrs as Attrs, token.rawContent as string) },
  }
}

// ── Service ───────────────────────────────────────────────────────────────────

export class VtmdParserService {
  private readonly marked: Marked

  constructor() {
    const blockExts = [
      makeBlockExt('scene',            renderScene),
      makeBlockExt('secret',           renderSecret),
      makeBlockExt('npc',              renderNpc),
      makeBlockExt('roll',             renderRoll),
      makeBlockExt('blood',            renderBlood),
      makeBlockExt('discipline',       renderDiscipline),
      makeBlockExt('attributes',       renderAttributes),
      makeBlockExt('character-header', renderCharacterHeader),
      makeBlockExt('npc-header',       renderNpcHeader),
      makeBlockExt('talents',          renderTalents),
      makeBlockExt('skills',           renderSkills),
      makeBlockExt('knowledges',       renderKnowledges),
      makeBlockExt('backgrounds',      renderBackgrounds),
      makeBlockExt('virtues',          renderVirtues),
      makeBlockExt('morality',         renderMorality),
      makeBlockExt('willpower',        renderWillpower),
      makeBlockExt('health',           renderHealth),
      makeBlockExt('merits',           renderMerits),
      makeBlockExt('flaws',            renderFlaws),
      makeBlockExt('weakness',         renderWeakness),
      makeBlockExt('experience',       renderExperience),
    ]

    const inlineExts = [
      makeInlineExt('discipline', renderDiscipline),
      makeInlineExt('blood',      renderBlood),
      makeInlineExt('willpower',  renderWillpower),
      makeInlineExt('morality',   renderMorality),
      makeInlineExt('roll',       renderRoll),
      makeInlineExt('npc',        renderNpc),
      makeInlineExt('secret',     renderSecret),
      makeInlineExt('weakness',   renderWeakness),
      makeInlineExt('experience', renderExperience),
    ]

    this.marked = new Marked()
    this.marked.use({ extensions: [...blockExts, ...inlineExts] })
  }

  render(markdown: string): string {
    return this.marked.parse(markdown) as string
  }
}
