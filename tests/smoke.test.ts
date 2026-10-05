import { describe, expect, it } from 'vitest'

describe('project foundation', () => {
  it('runs the test runner in a jsdom environment', () => {
    expect(typeof window).toBe('object')
    expect(typeof document).toBe('object')
  })

  it('supports constructing DOM nodes for component tests', () => {
    const root = document.createElement('div')
    root.setAttribute('data-testid', 'root')
    document.body.appendChild(root)
    expect(document.querySelector('[data-testid="root"]')).not.toBeNull()
    root.remove()
  })
})
