import { describe, it, expect, vi } from 'vitest'
import { RollDiceUseCase } from './RollDiceUseCase'
import { DiceRollerService } from '../services/DiceRollerService'
import { RollResult } from '../models/RollResult'

describe('RollDiceUseCase', () => {
  it('delegates to DiceRollerService and returns its result', () => {
    const mockResult: RollResult = { rolls: [7, 3], successes: 1, ones: 0, net: 1, outcome: 'success' }
    const mockService = { roll: vi.fn().mockReturnValue(mockResult) } as unknown as DiceRollerService
    const useCase = new RollDiceUseCase(mockService)

    const result = useCase.execute(2, 6, false)

    expect(mockService.roll).toHaveBeenCalledWith(2, 6, false)
    expect(result).toBe(mockResult)
  })

  it('passes specialty flag through to the service', () => {
    const mockResult: RollResult = { rolls: [10], successes: 2, ones: 0, net: 2, outcome: 'success' }
    const mockService = { roll: vi.fn().mockReturnValue(mockResult) } as unknown as DiceRollerService
    const useCase = new RollDiceUseCase(mockService)

    useCase.execute(1, 6, true)

    expect(mockService.roll).toHaveBeenCalledWith(1, 6, true)
  })
})
