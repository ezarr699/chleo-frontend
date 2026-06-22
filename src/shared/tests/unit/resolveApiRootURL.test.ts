/**
 * ============================================================
 * @module      shared
 * @layer       test > unit
 * @file        resolveApiRootURL.test.ts
 * @path        src/shared/tests/unit/resolveApiRootURL.test.ts
 * @description Unit test untuk resolveApiRootURL: central domain dan
 *              tenant subdomain harus diturunkan ke origin backend yang benar.
 * @covers      src/shared/api/resolveApiRootURL.ts
 * @since       v1.0.0
 * ============================================================
 */

import { describe, it, expect } from 'vitest'
import { resolveApiRootURL } from '../../api/resolveApiRootURL'

describe('resolveApiRootURL', () => {
  it('resolves the central domain to the backend origin', () => {
    expect(resolveApiRootURL('localhost')).toBe('http://localhost:8000')
  })

  it('resolves a tenant subdomain to the matching backend origin', () => {
    expect(resolveApiRootURL('acme.localhost')).toBe('http://acme.localhost:8000')
  })

  it('resolves the demo tenant subdomain', () => {
    expect(resolveApiRootURL('demo.localhost')).toBe('http://demo.localhost:8000')
  })
})
