import { describe, expect, it } from 'vitest'
import { isAllowedSignInEmail } from './allowedEmail'

describe('isAllowedSignInEmail', () => {
  it('matches the allowed email regardless of case or surrounding whitespace', () => {
    expect(isAllowedSignInEmail('martin.constantineau@dutiva.ca')).toBe(true)
    expect(isAllowedSignInEmail('Martin.Constantineau@Dutiva.ca')).toBe(true)
    expect(isAllowedSignInEmail('  martin.constantineau@dutiva.ca  ')).toBe(true)
  })

  it('rejects every other email, including other @dutiva.ca accounts', () => {
    expect(isAllowedSignInEmail('riley@dutiva.ca')).toBe(false)
    expect(isAllowedSignInEmail('someone@gmail.com')).toBe(false)
    expect(isAllowedSignInEmail('')).toBe(false)
  })
})
