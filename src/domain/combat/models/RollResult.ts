export interface RollResult {
  rolls: number[]
  successes: number
  ones: number
  net: number
  outcome: 'botch' | 'failure' | 'success'
}
