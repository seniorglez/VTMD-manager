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
