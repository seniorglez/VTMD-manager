import { describe, it, expect } from 'vitest'
import { DiceRollerService } from './DiceRollerService'

function withRolls(...values: number[]): DiceRollerService {
  const iter = values[Symbol.iterator]()
  return new DiceRollerService(() => {
    const { value } = iter.next()
    // random() returns 0–0.999..., so we map value 1–10 back: (value-1)/10
    return (value - 1) / 10
  })
}

describe('DiceRollerService', () => {
  it('counts successes for dice >= difficulty', () => {
    const svc = withRolls(7, 8, 3, 2, 9)
    const r = svc.roll(5, 6, false)
    expect(r.rolls).toEqual([7, 8, 3, 2, 9])
    expect(r.successes).toBe(3)
    expect(r.ones).toBe(0)
    expect(r.net).toBe(3)
    expect(r.outcome).toBe('success')
  })

  it('botch when no successes and at least one 1', () => {
    const svc = withRolls(1, 1, 4)
    const r = svc.roll(3, 6, false)
    expect(r.successes).toBe(0)
    expect(r.ones).toBe(2)
    expect(r.outcome).toBe('botch')
  })

  it('failure when successes cancelled by ones, net = 0', () => {
    const svc = withRolls(7, 1, 4)
    const r = svc.roll(3, 6, false)
    expect(r.successes).toBe(1)
    expect(r.ones).toBe(1)
    expect(r.net).toBe(0)
    expect(r.outcome).toBe('failure')
  })

  it('success when net >= 1 despite some ones', () => {
    const svc = withRolls(7, 7, 1)
    const r = svc.roll(3, 6, false)
    expect(r.successes).toBe(2)
    expect(r.ones).toBe(1)
    expect(r.net).toBe(1)
    expect(r.outcome).toBe('success')
  })

  it('failure (not botch) when no successes and no ones', () => {
    const svc = withRolls(3, 4)
    const r = svc.roll(2, 6, false)
    expect(r.successes).toBe(0)
    expect(r.ones).toBe(0)
    expect(r.outcome).toBe('failure')
  })

  it('specialty: each 10 adds one extra success', () => {
    const svc = withRolls(10, 4, 6)
    const r = svc.roll(3, 6, true)
    // 10 >= 6 (1 success) + 1 specialty bonus = 2; 6 >= 6 (1 success) = total 3
    expect(r.successes).toBe(3)
    expect(r.outcome).toBe('success')
  })

  it('empty pool returns failure with no rolls', () => {
    const svc = new DiceRollerService()
    const r = svc.roll(0, 6, false)
    expect(r.rolls).toEqual([])
    expect(r.successes).toBe(0)
    expect(r.ones).toBe(0)
    expect(r.outcome).toBe('failure')
  })
})
