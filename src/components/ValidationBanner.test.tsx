import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ValidationBanner } from './ValidationBanner'
import type { ValidationError } from '../utils/validation'

describe('ValidationBanner', () => {
  it('renders nothing when there are no errors', () => {
    const { container } = render(<ValidationBanner errors={[]} onJump={vi.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows correct error and warning counts', () => {
    const errors: ValidationError[] = [
      { blockId: '1', message: 'a', severity: 'error' },
      { blockId: '2', message: 'b', severity: 'error' },
      { blockId: '3', message: 'c', severity: 'warning' },
    ]
    render(<ValidationBanner errors={errors} onJump={vi.fn()} />)
    expect(screen.getByText('2 שגיאות')).toBeInTheDocument()
    expect(screen.getByText('1 אזהרות')).toBeInTheDocument()
  })

  it('calls onJump with the right block id when an entry is clicked', async () => {
    const user = userEvent.setup()
    const onJump = vi.fn()
    const errors: ValidationError[] = [{ blockId: 'block-42', message: 'בלוק ריק', severity: 'warning' }]
    render(<ValidationBanner errors={errors} onJump={onJump} />)
    await user.click(screen.getByText('בלוק ריק'))
    expect(onJump).toHaveBeenCalledWith('block-42')
  })
})
