import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import ClusteringLab from '../ClusteringLab'

describe('ClusteringLab', () => {
  it('disables run controls when no points are present', () => {
    render(<ClusteringLab />)

    expect(screen.getByRole('button', { name: 'Start' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Step Once' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Reset Centroids' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Clear Plot' })).toBeDisabled()
  })

  it('enables controls and shows 12 points after clicking Load Sample', async () => {
    const user = userEvent.setup()
    render(<ClusteringLab />)

    await user.click(screen.getByRole('button', { name: 'Load Sample' }))

    expect(screen.getByRole('button', { name: 'Start' })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: 'Step Once' })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: 'Reset Centroids' })).not.toBeDisabled()
    expect(screen.getByRole('button', { name: 'Clear Plot' })).not.toBeDisabled()
    expect(screen.getByText('Points').nextElementSibling).toHaveTextContent('12')
  })

  it('increments the Iterations stat after Step Once', async () => {
    const user = userEvent.setup()
    render(<ClusteringLab />)

    await user.click(screen.getByRole('button', { name: 'Load Sample' }))

    expect(screen.getByText('Iterations').nextElementSibling).toHaveTextContent('0')

    await user.click(screen.getByRole('button', { name: 'Step Once' }))

    expect(screen.getByText('Iterations').nextElementSibling).toHaveTextContent('1')
  })

  it('resets to zero points after Clear Plot', async () => {
    const user = userEvent.setup()
    render(<ClusteringLab />)

    await user.click(screen.getByRole('button', { name: 'Load Sample' }))
    expect(screen.getByText('Points').nextElementSibling).toHaveTextContent('12')

    await user.click(screen.getByRole('button', { name: 'Clear Plot' }))

    expect(screen.getByText('Points').nextElementSibling).toHaveTextContent('0')
    expect(screen.getByRole('button', { name: 'Start' })).toBeDisabled()
  })
})
