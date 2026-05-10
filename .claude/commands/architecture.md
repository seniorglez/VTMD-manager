# Architecture Reference

## Dependency Rule

Dependencies always point inward. Never outward.

```
UI → BLC → UseCases → Services → Repositories → (Tauri / fs)
```

The UI only imports from BLC facades.
BLC never imports anything from UI.
Domain layers (usecases, services, models) never import from infrastructure.
Repositories are the only layer that touches Tauri.

---

## Directory Structure

```
src/
├── domain/
│   └── {vertical}/                  # e.g. character, combat, campaign
│       ├── models/                  # Entities, value objects, domain errors
│       │   ├── {Entity}.ts
│       │   └── {Vertical}Error.ts
│       ├── usecases/                # One file per use case
│       │   └── {Action}{Entity}UseCase.ts
│       ├── services/
│       │   └── {Vertical}Service.ts
│       └── {Vertical}BLC.ts         # Public facade — the only thing UI imports
├── infrastructure/
│   ├── repositories/
│   │   └── {Vertical}Repository.ts  # Implements repository interface from domain
│   └── tauri/
│       └── TauriClient.ts           # Raw invoke() wrappers, typed
└── ui/
    └── components/
        └── vtm-{name}.ts            # Lit components, kebab-case filenames
```

---

## Vertical Slices

Each domain vertical is self-contained. Current verticals:

| Vertical | Responsibility |
|---|---|
| `character` | Player characters, blood pool, attributes, disciplines |
| `combat` | Dice rolls, initiative, damage, wound levels |
| `campaign` | Campaign structure, modules, chapters, VTMD file loading |

---

## Models

Models are pure TypeScript — interfaces and enums only. No methods, no dependencies.

```typescript
// domain/character/models/Character.ts
export interface Character {
  id: string
  name: string
  clan: Clan
  generation: number
  bloodPool: BloodPool
  attributes: Attributes
  disciplines: Discipline[]
}

// domain/character/models/BloodPool.ts
export interface BloodPool {
  current: number
  max: number
}

// domain/character/models/CharacterError.ts
export enum CharacterError {
  NotFound            = 'CHARACTER_NOT_FOUND',
  InsufficientBlood   = 'CHARACTER_INSUFFICIENT_BLOOD',
  InvalidAttribute    = 'CHARACTER_INVALID_ATTRIBUTE',
}
```

---

## Use Cases

Each use case is a class with a single `execute()` method. Use `neverthrow` for results.

```typescript
// domain/character/usecases/SpendBloodUseCase.ts
import { Result, ok, err } from 'neverthrow'
import { CharacterService } from '../services/CharacterService'
import { Character } from '../models/Character'
import { CharacterError } from '../models/CharacterError'

export class SpendBloodUseCase {
  constructor(private readonly characterService: CharacterService) {}

  async execute(characterId: string, amount: number): Promise<Result<Character, CharacterError>> {
    const character = await this.characterService.findById(characterId)
    if (!character) return err(CharacterError.NotFound)
    if (character.bloodPool.current < amount) return err(CharacterError.InsufficientBlood)

    return this.characterService.update({
      ...character,
      bloodPool: { ...character.bloodPool, current: character.bloodPool.current - amount }
    })
  }
}
```

---

## BLC Facade

The BLC wires use cases together and is the only export visible to the UI layer.

```typescript
// domain/character/CharacterBLC.ts
export type { Character, BloodPool, Discipline } from './models/Character'
export { CharacterError } from './models/CharacterError'

export class CharacterBLC {
  constructor(
    private readonly spendBlood: SpendBloodUseCase,
    private readonly healDamage: HealDamageUseCase,
  ) {}

  spendBlood(characterId: string, amount: number) {
    return this.spendBlood.execute(characterId, amount)
  }
}
```

---

## Composition Root

All wiring happens in one place at startup. No dependency injection framework.

```typescript
// main.ts
const characterRepository = new CharacterRepository()
const characterService    = new CharacterService(characterRepository)
const spendBlood          = new SpendBloodUseCase(characterService)
const healDamage          = new HealDamageUseCase(characterService)
const characterBLC        = new CharacterBLC(spendBlood, healDamage)
```

---

## UI Components

Lit components receive BLC instances as properties. They never instantiate domain objects.

```typescript
// ui/components/vtm-blood-pool.ts
import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { CharacterBLC } from '../../domain/character/CharacterBLC'

@customElement('vtm-blood-pool')
export class VtmBloodPool extends LitElement {
  @property({ attribute: false }) blc!: CharacterBLC
  @property() characterId!: string
  @property({ type: Number }) current = 0
  @property({ type: Number }) max = 10

  async spend(amount: number) {
    const result = await this.blc.spendBlood(this.characterId, amount)
    result.match(
      (character) => { this.current = character.bloodPool.current },
      (error)     => { console.error(error) }
    )
  }
}
```

---

## VTMD Files

Campaign documents use the `.vtmd` extension. The first line declares the document type:

```
# vtmd:character | vtmd:npc | vtmd:chapter | vtmd:module | vtmd:campaign
```

See `docs/vtmd/` for the full specification.

---

## Testing Strategy

| Layer | Type | Tool |
|---|---|---|
| `models/` | Validation, value object logic | Vitest |
| `usecases/` | Unit — mock services | Vitest + vi.mock |
| `services/` | Unit — mock repositories | Vitest + vi.mock |
| `repositories/` | Integration — mock Tauri invoke | Vitest |
| `ui/` | Component — render and events | Web Test Runner |

Test files live next to source files: `SpendBloodUseCase.ts` → `SpendBloodUseCase.test.ts`
