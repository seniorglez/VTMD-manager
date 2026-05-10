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

A full player character or major NPC sheet. Contains all V20 stats, disciplines, blood pool, and background.

```
# vtmd:character

::character-header[name="Viktor Kazakov" clan="Brujah" generation=9 player="Player Name"]

## Attributes

::attributes[strength=4 dexterity=3 stamina=3 charisma=2 manipulation=2 appearance=2 perception=3 intelligence=2 wits=3]

## Disciplines

::discipline[name="Potence" level=2]
::discipline[name="Celerity" level=1]
::discipline[name="Presence" level=1]

## Blood Pool

::blood[current=8 max=10]
```

---

## `vtmd:npc`

A lightweight NPC entry — simpler than a full character sheet, intended for supporting cast referenced from chapters.

```
# vtmd:npc

::npc-header[name="Marcus Valerius" clan="Ventrue" apparent-age=50 attitude="neutral"]

## Description

A man of impeccable dress and glacial eyes. Four centuries of rule have made him neither cruel nor kind — only effective.

## Story Role

Prince of Chicago. The power against which all other powers are measured.

## Secrets

::secret[He knows his ghoul daughter Elena broke the Masquerade. He is engineering a cover-up.]
```

---

## Parser Behaviour

If the first line is missing or the type is unrecognised, the parser throws a `VtmdError.UnknownType` and refuses to render the document. This is intentional — silent fallback would hide authoring errors.
