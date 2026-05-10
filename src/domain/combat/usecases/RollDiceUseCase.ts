import { DiceRollerService } from '../services/DiceRollerService'
import { RollResult } from '../models/RollResult'

export class RollDiceUseCase {
  constructor(private readonly diceRollerService: DiceRollerService) {}

  execute(pool: number, difficulty: number, specialty: boolean): RollResult {
    return this.diceRollerService.roll(pool, difficulty, specialty)
  }
}
