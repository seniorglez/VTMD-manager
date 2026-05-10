import { RollResult } from '../models/RollResult'

export class DiceRollerService {
  constructor(private readonly random: () => number = Math.random) {}

  roll(pool: number, difficulty: number, specialty: boolean): RollResult {
    const rolls = Array.from({ length: pool }, () => Math.floor(this.random() * 10) + 1)

    let successes = rolls.filter(d => d >= difficulty).length
    const ones = rolls.filter(d => d === 1).length

    if (specialty) {
      successes += rolls.filter(d => d === 10).length
    }

    const net = successes - ones

    let outcome: RollResult['outcome']
    if (successes === 0 && ones > 0) outcome = 'botch'
    else if (net >= 1) outcome = 'success'
    else outcome = 'failure'

    return { rolls, successes, ones, net, outcome }
  }
}
