#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pkgPath = resolve(__dirname, '../package.json')

const type = process.argv[2]
if (!['patch', 'minor', 'major'].includes(type)) {
  console.error('Usage: node scripts/bump-version.mjs <patch|minor|major>')
  process.exit(1)
}

const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
const [major, minor, patch] = pkg.version.split('.').map(Number)

const next =
  type === 'major' ? `${major + 1}.0.0` :
  type === 'minor' ? `${major}.${minor + 1}.0` :
                     `${major}.${minor}.${patch + 1}`

pkg.version = next
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
console.log(`${pkg.name}: ${major}.${minor}.${patch} → ${next}`)
