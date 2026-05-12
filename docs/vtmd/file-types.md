# VTMD File Types

Every `.vtmd` file must declare its type on the first line using a magic comment:

```
# vtmd:{type}
```

This declaration tells the parser which schema to apply, which tags are valid, and how to render the document.

---

## `vtmd:campaign`

Top-level descriptor for an entire campaign. Contains metadata, a list of modules, and global lore references.

```
# vtmd:campaign

name: "Las Sombras de Chicago"
system: V20
city: Chicago
storyteller: "Your Name"
```

---

## `vtmd:module`

A self-contained story arc within a campaign, composed of one or more chapters.

```
# vtmd:module

name: "La Llamada en la Oscuridad"
act: 1
chapters:
  - cap-01-prologo.vtmd
  - cap-02-la-pista.vtmd
```

---

## `vtmd:chapter`

A single chapter or scene within a module. This is the primary storytelling document — it contains narrative text, scene headers, NPC references, roll prompts, and secrets.

```
# vtmd:chapter

# El Salón del Príncipe

::scene[name="Elysium" type="Social" mood="Threatening"]

*The night settles over Chicago like a shroud...*

::npc[ref="marcus-valerius"]

::roll[attribute="Perception + Subterfuge" difficulty=7 pool=5]
```

---

## `vtmd:character`

A full player character sheet. Supports the complete V20 stat block: attributes, abilities (talents/skills/knowledges), disciplines, backgrounds, virtues, morality, willpower, health, blood pool, merits, flaws, clan weakness, and experience.

Abilities are best laid out using Markdown tables with `::ability` inline tags, which also enables clicking on any stat to add it to the Dice Tray.

```
# vtmd:character

::character-header[name="Viktor Kazakov" clan="Brujah" generation=9 player="Player Name"]

## Attributes

::attributes[strength=4 dexterity=3 stamina=3 charisma=2 manipulation=2 appearance=2 perception=3 intelligence=2 wits=3]

## Abilities

| Talents | Skills | Knowledges |
|---|---|---|
| ::ability[name="Alertness" level=2] | ::ability[name="Firearms" level=1] | ::ability[name="Law" level=0] |
| ::ability[name="Brawl" level=4] | ::ability[name="Melee" level=3] | ::ability[name="Occult" level=1] |
| ::ability[name="Intimidation" level=3] | ::ability[name="Stealth" level=2] | ::ability[name="Politics" level=1] |

## Advantages

| Disciplines | Backgrounds | | Virtues | |
|---|---|---|---|---|
| ::discipline[name="Potence" level=2] | Contacts | ●●○○○ | Conscience | ●●●○○ |
| ::discipline[name="Celerity" level=1] | Resources | ●●●○○ | Self-Control | ●●●○○ |
| ::discipline[name="Presence" level=1] | Status | ●○○○○ | Courage | ●●●●○ |

## Trackers

| Blood Pool | Willpower | Humanity |
|---|---|---|
| ::blood[current=8 max=10] | ::willpower[current=7 max=7] | ::morality[path="Humanity" rating=6] |

## Health

::health[bashing=0 lethal=0 aggravated=0]

## Merits & Flaws

::merits[iron-will=3]
::flaws[dark-secret=2]

## Weakness

::weakness[Brujah cannot resist frenzy — all frenzy roll difficulties are increased by 2.]

## Experience

::experience[total=30 spent=27]
```

---

## `vtmd:npc`

A full NPC stat block. Identical structure to `vtmd:character` but uses `::npc-header` instead of `::character-header` and omits the experience section — NPCs don't accumulate XP.

```
# vtmd:npc

::npc-header[name="Marcus Valerius" clan="Ventrue" generation=7 apparent-age=50 attitude="neutral"]

## Attributes

::attributes[strength=2 dexterity=3 stamina=2 charisma=5 manipulation=5 appearance=4 perception=4 intelligence=4 wits=4]

## Abilities

| Talents | Skills | Knowledges |
|---|---|---|
| ::ability[name="Alertness" level=2] | ::ability[name="Etiquette" level=5] | ::ability[name="Finance" level=3] |
| ::ability[name="Leadership" level=4] | ::ability[name="Melee" level=3] | ::ability[name="Law" level=4] |
| ::ability[name="Subterfuge" level=4] | ::ability[name="Stealth" level=2] | ::ability[name="Politics" level=5] |

## Advantages

| Disciplines | Backgrounds | | Virtues | |
|---|---|---|---|---|
| ::discipline[name="Dominate" level=5] | Influence | ●●●●● | Conscience | ●●●●○ |
| ::discipline[name="Fortitude" level=3] | Resources | ●●●●● | Self-Control | ●●●●● |
| ::discipline[name="Presence" level=4] | Status | ●●●●● | Courage | ●●●○○ |

## Trackers

| Blood Pool | Willpower | Humanity |
|---|---|---|
| ::blood[current=20 max=20] | ::willpower[current=8 max=8] | ::morality[path="Humanity" rating=5] |

## Health

::health[bashing=0 lethal=0 aggravated=0]
```

---

## Parser Behaviour

If the first line is missing or the type is unrecognised, the parser throws a `VtmdError.UnknownType` and refuses to render the document. This is intentional — silent fallback would hide authoring errors.
