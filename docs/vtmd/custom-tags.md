# VTMD Custom Tags

All custom tags follow this syntax:

```
::tagname[attribute="value" other="value"]
```

Attributes are always double-quoted strings. Boolean flags can be written as `flag="true"` or `flag="false"`. Order of attributes is not significant.

---

## `::scene`

Renders a visual scene header. Typically the first element in a `vtmd:chapter`.

```
::scene[name="Elysium of the Prince" type="Social" mood="Threatening"]
```

| Attribute | Required | Values |
|---|---|---|
| `name` | ✅ | Any string |
| `type` | ✅ | `Social` `Exploration` `Combat` `Investigation` `Ritual` |
| `mood` | ✅ | `Threatening` `Tense` `Calm` `Mysterious` `Violent` |

---

## `::npc`

Renders an inline NPC block. For quick references within a chapter. For full NPC documents use `vtmd:npc`.

```
::npc[name="Marcus Valerius" clan="Ventrue" attitude="neutral" description="Four centuries of rule..."]
```

| Attribute | Required | Values |
|---|---|---|
| `name` | ✅ | Any string |
| `clan` | ✅ | Any V20 clan name |
| `attitude` | ✅ | `friendly` `neutral` `hostile` `suspicious` `desperate` |
| `description` | ✅ | Any string |
| `ref` | — | Filename of a `vtmd:npc` file (loads full sheet) |

---

## `::roll`

Renders an interactive dice roll button. Clicking it rolls the pool against the difficulty using V20 rules (ones subtract successes, net negative = botch).

```
::roll[attribute="Perception + Subterfuge" difficulty=7 pool=5]
```

| Attribute | Required | Values |
|---|---|---|
| `attribute` | ✅ | Any string — displayed as the roll label |
| `difficulty` | ✅ | Integer 2–10 |
| `pool` | ✅ | Integer 1–15 |

---

## `::secret`

Renders a blurred block that the Storyteller can reveal with a click. Used for information the players should not see until the right moment.

```
::secret[Marcus knows his daughter is responsible. He is engineering a cover-up.]
```

The content of the tag is the secret text. No sub-attributes — the entire value is the secret.

| Attribute | Required | Values |
|---|---|---|
| *(content)* | ✅ | Any string — the hidden text |

---

## `::blood`

Renders an interactive blood pool tracker. Pips can be clicked during play to spend or recover blood. Dots are grouped in blocks of 5 for pools larger than 5.

```
::blood[current=8 max=10]
```

In `vtmd:chapter` requires a `ref` to identify the character:

```
::blood[ref="viktor" current=8 max=10]
```

| Attribute | Required | Values |
|---|---|---|
| `current` | ✅ | Integer 0–max |
| `max` | ✅ | Integer 1–20 |
| `ref` | — | Character ID (required in chapter context) |

---

## `::ability`

Renders a single ability entry with name and dot rating. Registers as both block and inline, so it can appear standalone or inside a Markdown table cell. Used in `vtmd:character` and `vtmd:chapter`.

```
::ability[name="Alertness" level=3]
```

| Attribute | Required | Values |
|---|---|---|
| `name` | ✅ | Any string |
| `level` | ✅ | Integer 0–5 |

---

## `::discipline`

Renders a discipline entry with dot rating. Used in `vtmd:character`.

```
::discipline[name="Potence" level=2]
```

| Attribute | Required | Values |
|---|---|---|
| `name` | ✅ | Any V20 discipline name |
| `level` | ✅ | Integer 1–5 |

---

## `::attributes`

Renders the full attribute block for a character. Used in `vtmd:character`.

```
::attributes[strength=4 dexterity=3 stamina=3 charisma=2 manipulation=2 appearance=2 perception=3 intelligence=2 wits=3]
```

All nine V20 attributes are accepted as integer values 1–5.

---

## `::character-header`

Renders the top identity block of a character sheet. Used in `vtmd:character`.

```
::character-header[name="Viktor Kazakov" clan="Brujah" generation=9 player="Player Name"]
```

| Attribute | Required | Values |
|---|---|---|
| `name` | ✅ | Any string |
| `clan` | ✅ | Any V20 clan name |
| `generation` | ✅ | Integer 4–15 |
| `player` | — | Any string |
| `nature` | — | Any archetype string |
| `demeanor` | — | Any archetype string |

---

## `::npc-header`

Renders the top identity block of an NPC sheet. Used in `vtmd:npc`.

```
::npc-header[name="Marcus Valerius" clan="Ventrue" apparent-age=50 attitude="neutral"]
```

| Attribute | Required | Values |
|---|---|---|
| `name` | ✅ | Any string |
| `clan` | ✅ | Any V20 clan name |
| `apparent-age` | — | Integer |
| `attitude` | — | `friendly` `neutral` `hostile` `suspicious` `desperate` |

---

## `::talents`

Renders the Talents section of the character sheet. All ten standard V20 talents appear in order; any omitted talent defaults to 0.

```
::talents[alertness=3 athletics=2 brawl=4 dodge=2 empathy=1 expression=0 intimidation=3 leadership=1 streetwise=2 subterfuge=2]
```

Accepted keys (all optional, default 0): `alertness` `athletics` `brawl` `dodge` `empathy` `expression` `intimidation` `leadership` `streetwise` `subterfuge`

Values: Integer 0–5.

---

## `::skills`

Renders the Skills section of the character sheet. All ten standard V20 skills appear in order; any omitted skill defaults to 0.

```
::skills[animal-ken=0 crafts=2 drive=1 etiquette=3 firearms=2 melee=4 performance=0 stealth=2 survival=1 technology=1]
```

Accepted keys (all optional, default 0): `animal-ken` `crafts` `drive` `etiquette` `firearms` `melee` `performance` `stealth` `survival` `technology`

Values: Integer 0–5.

---

## `::knowledges`

Renders the Knowledges section of the character sheet. All ten standard V20 knowledges appear in order; any omitted knowledge defaults to 0.

```
::knowledges[academics=3 computer=1 finance=0 investigation=2 law=1 linguistics=2 medicine=0 occult=3 politics=2 science=0]
```

Accepted keys (all optional, default 0): `academics` `computer` `finance` `investigation` `law` `linguistics` `medicine` `occult` `politics` `science`

Values: Integer 0–5.

---

## `::backgrounds`

Renders the Backgrounds block. Accepts any key as a background name; keys are rendered in Title Case with spaces.

```
::backgrounds[contacts=3 resources=2 status=1]
```

| Attribute | Required | Values |
|---|---|---|
| *(any key)* | — | Integer 0–5 |

---

## `::virtues`

Renders the Virtues block. Accepts the three standard virtue keys. Sabbat characters can substitute `conviction` for `conscience` and `instinct` for `self-control`.

```
::virtues[conscience=3 self-control=4 courage=3]
```

| Attribute | Required | Values |
|---|---|---|
| `conscience` or `conviction` | ✅ | Integer 1–5 |
| `self-control` or `instinct` | ✅ | Integer 1–5 |
| `courage` | ✅ | Integer 1–5 |

---

## `::morality`

Renders the Humanity or Path rating. Dots are grouped in blocks of 5.

```
::morality[path="Humanity" rating=7]
```

| Attribute | Required | Values |
|---|---|---|
| `path` | ✅ | Any string — e.g. `Humanity`, `Night`, `Bones` |
| `rating` | ✅ | Integer 0–10 |

---

## `::willpower`

Renders the Willpower tracker. Dots are grouped in blocks of 5.

```
::willpower[current=6 max=8]
```

| Attribute | Required | Values |
|---|---|---|
| `current` | ✅ | Integer 0–max |
| `max` | ✅ | Integer 1–10 |

---

## `::health`

Renders the Health track — all seven wound levels. Boxes are filled from the top with the specified damage counts. Aggravated (✱) fills first, then lethal (✕), then bashing (/); remaining boxes are empty (○).

```
::health[bashing=2 lethal=1 aggravated=0]
```

| Attribute | Required | Values |
|---|---|---|
| `aggravated` | ✅ | Integer 0–7 |
| `lethal` | ✅ | Integer 0–7 |
| `bashing` | ✅ | Integer 0–7 |

---

## `::merits`

Renders the Merits block. Accepts any key as a merit name; keys are rendered in Title Case with spaces.

```
::merits[acute-senses=2 iron-will=3]
```

| Attribute | Required | Values |
|---|---|---|
| *(any key)* | — | Integer 1–5 |

---

## `::flaws`

Renders the Flaws block. Same syntax as `::merits` but with a distinct CSS class.

```
::flaws[clan-enmity=2 dark-secret=1]
```

| Attribute | Required | Values |
|---|---|---|
| *(any key)* | — | Integer 1–5 |

---

## `::weakness`

Renders the clan weakness as a text block. The entire bracket content is the raw description text.

```
::weakness[Brujah cannot resist frenzy — all frenzy difficulties +2.]
```

| Attribute | Required | Values |
|---|---|---|
| *(content)* | ✅ | Any string — the weakness description |

---

## `::experience`

Renders the Experience Points tracker showing total, spent, and computed available points.

```
::experience[total=15 spent=12]
```

| Attribute | Required | Values |
|---|---|---|
| `total` | ✅ | Integer ≥ 0 |
| `spent` | ✅ | Integer 0–total |
