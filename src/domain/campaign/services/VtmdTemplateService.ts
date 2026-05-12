import { VtmdType } from '../models/VtmdType'

export class VtmdTemplateService {
  getTemplate(type: VtmdType): string {
    switch (type) {
      case VtmdType.Character:
        return CHARACTER_TEMPLATE
      case VtmdType.Npc:
        return NPC_TEMPLATE
      case VtmdType.Chapter:
        return `# vtmd:chapter\n\n`
      case VtmdType.Module:
        return `# vtmd:module\n\n`
      case VtmdType.Campaign:
        return `# vtmd:campaign\n\n`
    }
  }
}

const NPC_TEMPLATE = `# vtmd:npc

::npc-header[name="Nuevo NPC" clan="—" generation=13 apparent-age=30 attitude="neutral"]

## Attributes

::attributes[strength=1 dexterity=1 stamina=1 charisma=1 manipulation=1 appearance=1 perception=1 intelligence=1 wits=1]

## Abilities

| Talents | Skills | Knowledges |
|---|---|---|
| ::ability[name="Alertness" level=0] | ::ability[name="Animal Ken" level=0] | ::ability[name="Academics" level=0] |
| ::ability[name="Athletics" level=0] | ::ability[name="Crafts" level=0] | ::ability[name="Computer" level=0] |
| ::ability[name="Awareness" level=0] | ::ability[name="Drive" level=0] | ::ability[name="Finance" level=0] |
| ::ability[name="Brawl" level=0] | ::ability[name="Etiquette" level=0] | ::ability[name="Investigation" level=0] |
| ::ability[name="Empathy" level=0] | ::ability[name="Firearms" level=0] | ::ability[name="Law" level=0] |
| ::ability[name="Expression" level=0] | ::ability[name="Larceny" level=0] | ::ability[name="Medicine" level=0] |
| ::ability[name="Intimidation" level=0] | ::ability[name="Melee" level=0] | ::ability[name="Occult" level=0] |
| ::ability[name="Leadership" level=0] | ::ability[name="Performance" level=0] | ::ability[name="Politics" level=0] |
| ::ability[name="Streetwise" level=0] | ::ability[name="Stealth" level=0] | ::ability[name="Science" level=0] |
| ::ability[name="Subterfuge" level=0] | ::ability[name="Survival" level=0] | ::ability[name="Technology" level=0] |

## Advantages

| Disciplines | Backgrounds | | Virtues | |
|---|---|---|---|---|
| ::discipline[name="—" level=0] | — | ○○○○○ | Conscience | ●●●○○ |
| ::discipline[name="—" level=0] | — | ○○○○○ | Self-Control | ●●●○○ |
| ::discipline[name="—" level=0] | — | ○○○○○ | Courage | ●●●○○ |

## Trackers

| Blood Pool | Willpower | Humanity |
|---|---|---|
| ::blood[current=10 max=10] | ::willpower[current=3 max=3] | ::morality[path="Humanity" rating=7] |

## Health

::health[bashing=0 lethal=0 aggravated=0]
`

const CHARACTER_TEMPLATE = `# vtmd:character

::character-header[name="Nuevo Personaje" clan="Brujah" generation=13 player=""]

## Attributes

::attributes[strength=1 dexterity=1 stamina=1 charisma=1 manipulation=1 appearance=1 perception=1 intelligence=1 wits=1]

## Abilities

| Talents | Skills | Knowledges |
|---|---|---|
| ::ability[name="Alertness" level=0] | ::ability[name="Animal Ken" level=0] | ::ability[name="Academics" level=0] |
| ::ability[name="Athletics" level=0] | ::ability[name="Crafts" level=0] | ::ability[name="Computer" level=0] |
| ::ability[name="Awareness" level=0] | ::ability[name="Drive" level=0] | ::ability[name="Finance" level=0] |
| ::ability[name="Brawl" level=0] | ::ability[name="Etiquette" level=0] | ::ability[name="Investigation" level=0] |
| ::ability[name="Empathy" level=0] | ::ability[name="Firearms" level=0] | ::ability[name="Law" level=0] |
| ::ability[name="Expression" level=0] | ::ability[name="Larceny" level=0] | ::ability[name="Medicine" level=0] |
| ::ability[name="Intimidation" level=0] | ::ability[name="Melee" level=0] | ::ability[name="Occult" level=0] |
| ::ability[name="Leadership" level=0] | ::ability[name="Performance" level=0] | ::ability[name="Politics" level=0] |
| ::ability[name="Streetwise" level=0] | ::ability[name="Stealth" level=0] | ::ability[name="Science" level=0] |
| ::ability[name="Subterfuge" level=0] | ::ability[name="Survival" level=0] | ::ability[name="Technology" level=0] |

## Advantages

| Disciplines | Backgrounds | | Virtues | |
|---|---|---|---|---|
| ::discipline[name="—" level=0] | — | ○○○○○ | Conscience | ●●●○○ |
| ::discipline[name="—" level=0] | — | ○○○○○ | Self-Control | ●●●○○ |
| ::discipline[name="—" level=0] | — | ○○○○○ | Courage | ●●●○○ |

## Trackers

| Blood Pool | Willpower | Humanity |
|---|---|---|
| ::blood[current=10 max=10] | ::willpower[current=3 max=3] | ::morality[path="Humanity" rating=7] |

## Health

::health[bashing=0 lethal=0 aggravated=0]

## Experience

::experience[total=0 spent=0]
`
