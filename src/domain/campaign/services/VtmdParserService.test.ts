import { describe, it, expect } from 'vitest'
import { VtmdParserService } from './VtmdParserService'

const parser = new VtmdParserService()

describe('VtmdParserService', () => {
  it('renders ::scene tag with name, type and mood', () => {
    const html = parser.render('::scene[name="Elysium" type="Social" mood="Threatening"]')
    expect(html).toContain('class="vtmd-scene"')
    expect(html).toContain('Elysium')
    expect(html).toContain('Social')
    expect(html).toContain('Threatening')
  })

  it('renders ::secret tag with raw content as text', () => {
    const html = parser.render('::secret[He knows his daughter is responsible.]')
    expect(html).toContain('class="vtmd-secret"')
    expect(html).toContain('He knows his daughter is responsible.')
  })

  it('renders ::roll tag with attribute label and pool/difficulty', () => {
    const html = parser.render('::roll[attribute="Per + Sub" difficulty=7 pool=5]')
    expect(html).toContain('class="vtmd-roll"')
    expect(html).toContain('Per + Sub')
    expect(html).toContain('Pool 5')
    expect(html).toContain('Difficulty 7')
  })

  it('renders ::npc tag with name and clan', () => {
    const html = parser.render('::npc[name="Marcus" clan="Ventrue" attitude="neutral" description="A man of glacial eyes."]')
    expect(html).toContain('class="vtmd-npc"')
    expect(html).toContain('Marcus')
    expect(html).toContain('Ventrue')
  })

  it('renders ::blood tag with pip display', () => {
    const html = parser.render('::blood[current=3 max=10]')
    expect(html).toContain('class="vtmd-blood"')
    expect(html).toContain('3/10')
  })

  it('renders ::discipline tag with name and dot rating', () => {
    const html = parser.render('::discipline[name="Potence" level=3]')
    expect(html).toContain('class="vtmd-discipline"')
    expect(html).toContain('Potence')
    expect(html).toContain('●●●')
  })

  it('renders ::character-header tag', () => {
    const html = parser.render('::character-header[name="Viktor" clan="Brujah" generation=9 player="Alex"]')
    expect(html).toContain('class="vtmd-character-header"')
    expect(html).toContain('Viktor')
    expect(html).toContain('Brujah')
  })

  it('renders ::npc-header tag', () => {
    const html = parser.render('::npc-header[name="Marcus" clan="Ventrue" apparent-age=50]')
    expect(html).toContain('class="vtmd-npc-header"')
    expect(html).toContain('Marcus')
  })

  it('unknown tag is passed through as text without crashing', () => {
    const html = parser.render('::unknowntag[x="1"]')
    expect(html).toContain('::unknowntag')
  })

  it('plain markdown heading is rendered as h2', () => {
    const html = parser.render('## A Heading')
    expect(html).toContain('<h2>A Heading</h2>')
  })

  it('mixed content renders both tags and markdown correctly', () => {
    const input = '## Scene\n\n::scene[name="Elysium" type="Social" mood="Calm"]\n\nNarrative text.'
    const html = parser.render(input)
    expect(html).toContain('<h2>Scene</h2>')
    expect(html).toContain('class="vtmd-scene"')
    expect(html).toContain('Narrative text')
  })
})

describe('dotsLarge helper (via blood tag)', () => {
  it('max ≤ 5: groups dots without spaces (same as dots)', () => {
    const html = parser.render('::blood[current=3 max=5]')
    expect(html).toContain('●●●○○')
    expect(html).not.toContain(' ●')
  })

  it('current=7 max=10: groups as 5+5 with space', () => {
    const html = parser.render('::blood[current=7 max=10]')
    expect(html).toContain('●●●●● ●●○○○')
    expect(html).toContain('7/10')
  })

  it('current=10 max=10: all filled in two groups', () => {
    const html = parser.render('::blood[current=10 max=10]')
    expect(html).toContain('●●●●● ●●●●●')
  })

  it('current=0 max=10: all empty in two groups', () => {
    const html = parser.render('::blood[current=0 max=10]')
    expect(html).toContain('○○○○○ ○○○○○')
  })
})

describe('::talents tag', () => {
  it('renders class and all ten talent rows', () => {
    const html = parser.render('::talents[alertness=3 athletics=2 brawl=4 dodge=2 empathy=1 expression=0 intimidation=3 leadership=1 streetwise=2 subterfuge=2]')
    expect(html).toContain('class="vtmd-talents"')
    expect(html).toContain('Alertness')
    expect(html).toContain('Brawl')
    expect(html).toContain('Subterfuge')
  })

  it('renders correct dots for specified values', () => {
    const html = parser.render('::talents[alertness=3 brawl=0]')
    expect(html).toContain('●●●○○')
    expect(html).toContain('○○○○○')
  })

  it('unspecified talents default to 0 dots', () => {
    const html = parser.render('::talents[alertness=5]')
    expect(html).toContain('Intimidation')
    expect(html).toContain('Leadership')
  })
})

describe('::skills tag', () => {
  it('renders class and skill rows with correct dots', () => {
    const html = parser.render('::skills[melee=4 stealth=2]')
    expect(html).toContain('class="vtmd-skills"')
    expect(html).toContain('Melee')
    expect(html).toContain('●●●●○')
    expect(html).toContain('Stealth')
    expect(html).toContain('●●○○○')
  })

  it('renders Animal Ken with title case', () => {
    const html = parser.render('::skills[animal-ken=3]')
    expect(html).toContain('Animal Ken')
    expect(html).toContain('●●●○○')
  })
})

describe('::knowledges tag', () => {
  it('renders class and knowledge rows with correct dots', () => {
    const html = parser.render('::knowledges[occult=3 academics=0]')
    expect(html).toContain('class="vtmd-knowledges"')
    expect(html).toContain('Occult')
    expect(html).toContain('●●●○○')
    expect(html).toContain('Academics')
  })
})

describe('::backgrounds tag', () => {
  it('renders class, names in title case, and dots', () => {
    const html = parser.render('::backgrounds[contacts=3 resources=2]')
    expect(html).toContain('class="vtmd-backgrounds"')
    expect(html).toContain('Contacts')
    expect(html).toContain('●●●○○')
    expect(html).toContain('Resources')
    expect(html).toContain('●●○○○')
  })
})

describe('::virtues tag', () => {
  it('renders class and virtue rows with correct dots', () => {
    const html = parser.render('::virtues[conscience=3 self-control=4 courage=3]')
    expect(html).toContain('class="vtmd-virtues"')
    expect(html).toContain('Conscience')
    expect(html).toContain('●●●○○')
    expect(html).toContain('Self Control')
    expect(html).toContain('●●●●○')
    expect(html).toContain('Courage')
  })
})

describe('::morality tag', () => {
  it('renders class, path name, and grouped dots for rating', () => {
    const html = parser.render('::morality[path="Humanity" rating=7]')
    expect(html).toContain('class="vtmd-morality"')
    expect(html).toContain('Humanity')
    expect(html).toContain('●●●●● ●●○○○')
  })
})

describe('::willpower tag', () => {
  it('renders class, current/max label, and grouped dots', () => {
    const html = parser.render('::willpower[current=6 max=8]')
    expect(html).toContain('class="vtmd-willpower"')
    expect(html).toContain('6/8')
    expect(html).toContain('●●●●● ●○○')
  })
})

describe('::health tag', () => {
  it('renders correct marks for mixed damage', () => {
    const html = parser.render('::health[bashing=2 lethal=1 aggravated=0]')
    expect(html).toContain('class="vtmd-health"')
    const aggCount = (html.match(/✱/g) ?? []).length
    const lethalCount = (html.match(/✕/g) ?? []).length
    const bashCount = (html.match(/vtmd-health-box">\//g) ?? []).length
    const emptyCount = (html.match(/○/g) ?? []).length
    expect(aggCount).toBe(0)
    expect(lethalCount).toBe(1)
    expect(bashCount).toBe(2)
    expect(emptyCount).toBe(4)
  })

  it('renders 7 aggravated marks when full aggravated', () => {
    const html = parser.render('::health[aggravated=7 lethal=0 bashing=0]')
    const aggCount = (html.match(/✱/g) ?? []).length
    expect(aggCount).toBe(7)
    expect(html).not.toContain('○')
  })

  it('renders all empty when no damage', () => {
    const html = parser.render('::health[bashing=0 lethal=0 aggravated=0]')
    const emptyCount = (html.match(/○/g) ?? []).length
    expect(emptyCount).toBe(7)
    expect(html).not.toContain('✱')
    expect(html).not.toContain('✕')
  })
})

describe('::merits tag', () => {
  it('renders class, title-cased names, and dots', () => {
    const html = parser.render('::merits[iron-will=3]')
    expect(html).toContain('class="vtmd-merits"')
    expect(html).toContain('Iron Will')
    expect(html).toContain('●●●○○')
  })
})

describe('::flaws tag', () => {
  it('renders class, title-cased names, and dots', () => {
    const html = parser.render('::flaws[clan-enmity=2]')
    expect(html).toContain('class="vtmd-flaws"')
    expect(html).toContain('Clan Enmity')
    expect(html).toContain('●●○○○')
  })
})

describe('::weakness tag', () => {
  it('renders class and raw text content', () => {
    const html = parser.render('::weakness[Brujah cannot resist frenzy.]')
    expect(html).toContain('class="vtmd-weakness"')
    expect(html).toContain('Brujah cannot resist frenzy.')
  })
})

describe('::experience tag', () => {
  it('renders total, spent, and computed available', () => {
    const html = parser.render('::experience[total=15 spent=12]')
    expect(html).toContain('class="vtmd-experience"')
    expect(html).toContain('15')
    expect(html).toContain('12')
    expect(html).toContain('3')
  })
})

describe('::ability tag', () => {
  it('renders class, name and dots standalone', () => {
    const html = parser.render('::ability[name="Alertness" level=3]')
    expect(html).toContain('class="vtmd-ability"')
    expect(html).toContain('Alertness')
    expect(html).toContain('●●●○○')
  })

  it('level=0 renders five empty dots', () => {
    const html = parser.render('::ability[name="Brawl" level=0]')
    expect(html).toContain('○○○○○')
  })

  it('level=5 renders five filled dots', () => {
    const html = parser.render('::ability[name="Expression" level=5]')
    expect(html).toContain('●●●●●')
  })

  it('renders inline inside a table cell', () => {
    const html = parser.render('| H |\n|---|\n| ::ability[name="Alertness" level=3] |')
    expect(html).toContain('<td>')
    expect(html).toContain('class="vtmd-ability"')
    expect(html).toContain('Alertness')
  })

  it('coexists with ::discipline in the same table without interference', () => {
    const input = '| A | B |\n|---|---|\n| ::ability[name="Brawl" level=2] | ::discipline[name="Potence" level=3] |'
    const html = parser.render(input)
    expect(html).toContain('class="vtmd-ability"')
    expect(html).toContain('Brawl')
    expect(html).toContain('class="vtmd-discipline"')
    expect(html).toContain('Potence')
  })
})

describe('inline tags in table cells', () => {
  const inTable = (cell: string) => `| Header |\n|---|\n| ${cell} |`

  it('::discipline inline renders inside a table cell', () => {
    const html = parser.render(inTable('::discipline[name="Potence" level=3]'))
    expect(html).toContain('<td>')
    expect(html).toContain('class="vtmd-discipline"')
    expect(html).toContain('Potence')
    expect(html).toContain('●●●')
  })

  it('::blood inline renders inside a table cell', () => {
    const html = parser.render(inTable('::blood[current=7 max=10]'))
    expect(html).toContain('<td>')
    expect(html).toContain('class="vtmd-blood"')
    expect(html).toContain('7/10')
  })

  it('::willpower inline renders inside a table cell', () => {
    const html = parser.render(inTable('::willpower[current=6 max=8]'))
    expect(html).toContain('<td>')
    expect(html).toContain('class="vtmd-willpower"')
    expect(html).toContain('6/8')
  })

  it('::morality inline renders inside a table cell', () => {
    const html = parser.render(inTable('::morality[path="Humanity" rating=7]'))
    expect(html).toContain('<td>')
    expect(html).toContain('class="vtmd-morality"')
    expect(html).toContain('Humanity')
  })

  it('::roll inline renders inside a table cell', () => {
    const html = parser.render(inTable('::roll[attribute="Per + Sub" difficulty=7 pool=5]'))
    expect(html).toContain('<td>')
    expect(html).toContain('class="vtmd-roll"')
    expect(html).toContain('Pool 5')
  })

  it('::secret inline renders inside a table cell', () => {
    const html = parser.render(inTable('::secret[Hidden info]'))
    expect(html).toContain('<td>')
    expect(html).toContain('class="vtmd-secret"')
    expect(html).toContain('Hidden info')
  })

  it('unknown tag is passed through as text without crashing', () => {
    const html = parser.render('::unknowntag[x="1"]')
    expect(html).toContain('::unknowntag')
  })
})
