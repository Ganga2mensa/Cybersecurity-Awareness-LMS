import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { UserGreeting } from '@/components/shared/UserGreeting'

describe('UserGreeting', () => {
  it('renders user name when provided (Req 9.2)', () => {
    const { container } = render(<UserGreeting userName="Alice" orgName="Acme Corp" />)
    // Text is split across spans — check h1 textContent
    expect(container.querySelector('h1')?.textContent).toContain('Alice')
  })

  it('renders org name when provided (Req 10.2)', () => {
    const { container } = render(<UserGreeting userName="Alice" orgName="Acme Corp" />)
    expect(container.querySelector('p')?.textContent).toContain('Acme Corp')
  })

  it('renders fallback text when userName is null (Req 9.2)', () => {
    const { container } = render(<UserGreeting userName={null} orgName="Acme Corp" />)
    expect(container.querySelector('h1')?.textContent).toContain('User')
  })

  it('renders fallback text when orgName is null (Req 10.2)', () => {
    const { container } = render(<UserGreeting userName="Alice" orgName={null} />)
    expect(container.querySelector('p')?.textContent).toContain('Unknown Organization')
  })

  // Feature: secura-learn-platform, Property 6: Dashboard renders with user name and organization name visible
  it('Property 6: dashboard renders with user name and organization name visible (Req 9.2, 10.2)', () => {
    // **Validates: Requirements 9.2, 10.2**
    fc.assert(
      fc.property(
        fc.string({ minLength: 1 }),
        fc.string({ minLength: 1 }),
        (userName, orgName) => {
          const { container, unmount } = render(
            <UserGreeting userName={userName} orgName={orgName} />
          )
          const h1 = container.querySelector('h1')
          const p = container.querySelector('p')
          expect(h1?.textContent).toContain(userName)
          expect(p?.textContent).toContain(orgName)
          unmount()
        }
      ),
      { numRuns: 100 }
    )
  })
})
