# VTMD — Vampire: The Masquerade Markdown

VTMD is an extension of standard Markdown designed for managing Vampire: The Masquerade V20 campaign documents. Files use the `.vtmd` extension and must declare their document type on the first line.

## Documents

| Document | Description |
|---|---|
| [File Types](./file-types.md) | Available document types and the `# vtmd:type` declaration |
| [Custom Tags](./custom-tags.md) | Full reference of all `::tag[]` extensions |
| [Tag Validity](./tag-validity.md) | Which tags are valid in each document type |
| [Examples](./examples.md) | Annotated examples for each document type |

## Quick Reference

```
# vtmd:character    — player or NPC character sheet
# vtmd:npc          — non-player character (lightweight)
# vtmd:chapter      — chapter within a module
# vtmd:module       — a self-contained story module
# vtmd:campaign     — top-level campaign descriptor
```

Custom tags follow the syntax:

```
::tagname[attribute="value" other="value"]
```

All attributes use double-quoted strings. Order is not significant.

## Inline tags

Some tags are registered as both **block** and **inline** extensions. Block tags must occupy their own line. Inline tags can also appear inside Markdown table cells, enabling multi-column layouts:

```markdown
| Talents | Skills | Knowledges |
|---|---|---|
| ::ability[name="Alertness" level=3] | ::ability[name="Melee" level=4] | ::ability[name="Occult" level=2] |
```

Inline-capable tags: `::ability` `::discipline` `::blood` `::willpower` `::morality` `::roll` `::npc` `::secret` `::weakness` `::experience`

## Dice pool interaction

In the application, any element rendered from `::ability`, `::discipline`, or `::attributes` is **clickable**. Clicking it adds the stat's value to the active dice pool in the Dice Tray. Click multiple stats to build a combined pool before rolling.
