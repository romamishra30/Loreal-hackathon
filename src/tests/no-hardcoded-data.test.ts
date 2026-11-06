import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

function getFilesRecursively(dir: string, ext: string[]): string[] {
  let results: string[] = []
  const list = fs.readdirSync(dir)
  list.forEach((file) => {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)
    if (stat && stat.isDirectory()) {
      results = results.concat(getFilesRecursively(fullPath, ext))
    } else if (ext.some((e) => file.endsWith(e))) {
      results.push(fullPath)
    }
  })
  return results
}

describe('Guardrail: No Hardcoded Business Data in Views or Components', () => {
  const rootSrc = path.resolve(__dirname, '../')
  const viewsDir = path.join(rootSrc, 'views')
  const componentsDir = path.join(rootSrc, 'components')

  const filesToCheck = [
    ...getFilesRecursively(viewsDir, ['.tsx']),
    ...getFilesRecursively(componentsDir, ['.tsx']),
  ]

  it('contains no hardcoded old dates (e.g. "14 Mar 2026")', () => {
    const forbiddenDatePatterns = [
      /14\s+Mar\s+2026/i,
      /15\s+Mar\s+2026/i,
      /2026-03-14/,
    ]

    const violations: string[] = []

    filesToCheck.forEach((file) => {
      const content = fs.readFileSync(file, 'utf-8')
      forbiddenDatePatterns.forEach((pattern) => {
        if (pattern.test(content)) {
          violations.push(`${path.relative(rootSrc, file)} matches ${pattern}`)
        }
      })
    })

    expect(violations).toEqual([])
  })

  it('contains no hardcoded seed doctor names in JSX text outside seed directories', () => {
    const forbiddenNames = [
      'Dr. Ananya Rao',
      'Dr. Vikram Kelkar',
      'Dr. Rohan Sen',
    ]

    const violations: string[] = []

    filesToCheck.forEach((file) => {
      const content = fs.readFileSync(file, 'utf-8')
      forbiddenNames.forEach((name) => {
        if (content.includes(`>${name}<`) || content.includes(`"${name}"`)) {
          // Allow in test files or specific fallback definitions
          if (!file.includes('test') && !file.includes('seed')) {
            violations.push(`${path.relative(rootSrc, file)} contains hardcoded ${name}`)
          }
        }
      })
    })

    expect(violations).toEqual([])
  })

  it('does not import directly from src/data/seed inside components or views', () => {
    const violations: string[] = []

    filesToCheck.forEach((file) => {
      const content = fs.readFileSync(file, 'utf-8')
      if (content.includes("from '../../data/seed/rawGenerator'") ||
          content.includes("from '../data/seed/rawGenerator'")) {
        violations.push(`${path.relative(rootSrc, file)} directly imports seed generator`)
      }
    })

    expect(violations).toEqual([])
  })
})

