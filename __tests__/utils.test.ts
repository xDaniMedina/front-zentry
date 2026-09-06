import { expect, test, describe } from 'vitest'
import { getImageUrl, getInitials, cn } from '../lib/utils'

describe('Utility Functions', () => {
  test('getImageUrl should return correct URL', () => {
    const url = 'avatar.png'
    const result = getImageUrl(url)
    expect(typeof result).toBe('string')
    expect(result.endsWith('avatar.png')).toBe(true)
  })

  test('getInitials should return initials', () => {
    expect(getInitials('Daniel Medina')).toBe('DM')
    expect(getInitials('John Doe')).toBe('JD')
    expect(getInitials('Single')).toBe('S')
  })

  test('cn should merge class names correctly', () => {
    const result = cn('base-class', 'added-class', { 'conditional-class': true })
    expect(result).toContain('base-class')
    expect(result).toContain('added-class')
    expect(result).toContain('conditional-class')
  })
})
