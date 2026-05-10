# VTMD Examples

Annotated examples for each document type.

---

## Character Sheet

```
# vtmd:character

::character-header[name="Viktor Kazakov" clan="Brujah" generation=9 nature="Rebel" demeanor="Survivor" player="Alex"]

## Attributes

::attributes[strength=4 dexterity=3 stamina=3 charisma=2 manipulation=2 appearance=2 perception=3 intelligence=2 wits=3]

## Disciplines

::discipline[name="Potence" level=2]
::discipline[name="Celerity" level=1]
::discipline[name="Presence" level=1]

## Blood Pool

::blood[current=8 max=10]

## Background

Embraced in 1987 during the height of the Cold War. Viktor was a dissident journalist in Moscow when his sire — a Brujah elder with revolutionary sympathies — decided his rage was worth preserving.
```

---

## NPC

```
# vtmd:npc

::npc-header[name="Marcus Valerius" clan="Ventrue" apparent-age=50 attitude="neutral"]

## Description

A man of impeccable dress and glacial eyes. Four centuries of rule have made him neither cruel nor kind — only effective. He speaks rarely and never without purpose.

## Story Role

Prince of Chicago. The measure against which all other power is judged. He does not threaten — he simply reminds.

## Relationships

- **Elena Valerius** — his ghoul daughter. His only visible vulnerability.
- **Sheriff Ortega** — trusted enforcer, but not a confidant.

## Secrets

::secret[Marcus is aware Elena broke the Masquerade. He contacted the players specifically to engineer a scapegoat before the Sheriff discovers the truth.]
```

---

## Chapter

```
# vtmd:chapter

# The Prince's Summons

::scene[name="Elysium — The Palmer House" type="Social" mood="Threatening"]

*The ballroom has not changed since 1891. The chandeliers still burn with a hundred candles — electric light was never installed, by order of the Prince.*

The assembled Kindred part as you enter. You feel their eyes. You feel their judgment.

## The Prince Speaks

::npc[name="Marcus Valerius" clan="Ventrue" attitude="neutral" description="He does not rise from his chair. He does not need to."]

> *"One of our number has made us visible. I require agents of discretion — not loyalty, discretion — to locate the source before the hunters do."*

To read his true intention beneath the words:

::roll[attribute="Perception + Subterfuge" difficulty=8 pool=5]

## What They Can Learn

With a successful roll, the characters sense that Marcus is not angry — he is afraid. Something specific about this incident frightens him beyond the usual concern for the Masquerade.

::secret[He recognised the feeding pattern from the police report. It matches Elena's. He has known for 48 hours and has told no one.]

## Scene Exits

- Accept the commission → Chapter 2
- Refuse publicly → Marcus does not react. He simply looks at them for a long moment, then looks away. That is worse.
- Ask about the victim → Marcus defers to Sheriff Ortega, who is not present tonight.
```

---

## Module

```
# vtmd:module

name: "The Shape of the Lie"
act: 1
premise: "A Masquerade breach in Wicker Park. The evidence points nowhere useful. The truth points somewhere no one wants to look."

chapters:
  - cap-01-the-summons.vtmd
  - cap-02-the-scene.vtmd
  - cap-03-the-witness.vtmd
  - cap-04-the-truth.vtmd

npcs:
  - marcus-valerius.vtmd
  - elena-valerius.vtmd
  - sheriff-ortega.vtmd
  - raul-the-nosferatu.vtmd
```

---

## Campaign

```
# vtmd:campaign

name: "Shadows of Chicago"
system: V20
city: Chicago
year: 1995
storyteller: "Your Name"

modules:
  - module-01-the-shape-of-the-lie.vtmd
  - module-02-the-price-of-silence.vtmd

player-characters:
  - viktor-kazakov.vtmd
  - moira-ashford.vtmd
```
