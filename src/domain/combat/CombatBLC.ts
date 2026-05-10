import { RollDiceUseCase } from './usecases/RollDiceUseCase'

export type { RollResult } from './models/RollResult'

export class CombatBLC {
  constructor(private readonly rollDiceUseCase: RollDiceUseCase) {}

  roll(pool: number, difficulty: number, specialty: boolean) {
    return this.rollDiceUseCase.execute(pool, difficulty, specialty)
  }
}
