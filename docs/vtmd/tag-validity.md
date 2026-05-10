# VTMD Tag Validity

Not all tags are valid in all document types. The parser will raise a `VtmdError.InvalidTagForType` if a tag is used in the wrong context.

## Validity Matrix

| Tag | `campaign` | `module` | `chapter` | `character` | `npc` |
|---|:---:|:---:|:---:|:---:|:---:|
| `::scene` | — | — | ✅ | — | — |
| `::npc` | — | — | ✅ | — | — |
| `::npc-header` | — | — | — | — | ✅ |
| `::roll` | — | — | ✅ | — | — |
| `::secret` | — | — | ✅ | — | ✅ |
| `::blood` | — | — | ✅ | ✅ | — |
| `::ability` | — | — | ✅ | ✅ | — |
| `::discipline` | — | — | — | ✅ | — |
| `::attributes` | — | — | — | ✅ | — |
| `::character-header` | — | — | — | ✅ | — |
| `::talents` | — | — | — | ✅ | — |
| `::skills` | — | — | — | ✅ | — |
| `::knowledges` | — | — | — | ✅ | — |
| `::backgrounds` | — | — | — | ✅ | — |
| `::virtues` | — | — | — | ✅ | — |
| `::morality` | — | — | — | ✅ | — |
| `::willpower` | — | — | ✅ | ✅ | — |
| `::health` | — | — | ✅ | ✅ | — |
| `::merits` | — | — | — | ✅ | — |
| `::flaws` | — | — | — | ✅ | — |
| `::weakness` | — | — | — | ✅ | — |
| `::experience` | — | — | — | ✅ | — |

## Rationale

**`vtmd:campaign` and `vtmd:module`** are structural documents — they describe the shape of the campaign, not its content. Interactive tags like `::roll` or `::blood` have no meaning here.

**`vtmd:chapter`** is the primary play document. It supports everything needed at the table: scene framing, NPC references, roll prompts, and secrets. `::willpower` and `::health` are also valid here so that Storytellers can embed quick trackers mid-chapter.

**`vtmd:character`** is a stat sheet. It supports the full V20 character sheet: attributes, abilities (talents/skills/knowledges), backgrounds, disciplines, virtues, morality, willpower, health, blood pool, merits, flaws, weakness, and experience.

**`vtmd:npc`** is a lightweight character reference. It supports secrets (Storyteller notes) and an identity header, but not full stat blocks.
