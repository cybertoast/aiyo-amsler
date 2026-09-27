import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import CardCalibrator from '../../../src/shared/components/CardCalibrator.vue'

describe('CardCalibrator', () => {
  it('starts from the given px per mm and adjusts width with the buttons', async () => {
    const wrapper = mount(CardCalibrator, { props: { initialPxPerMm: 4 } })
    const card = wrapper.get('[data-testid="card-outline"]')
    expect(card.attributes('style')).toContain('width: 342.4px')
    await wrapper.get('[data-testid="wider-10"]').trigger('click')
    await wrapper.get('[data-testid="narrower-1"]').trigger('click')
    expect(card.attributes('style')).toContain('width: 351.4px')
  })

  it('adjusts width with arrow keys', async () => {
    const wrapper = mount(CardCalibrator, { props: { initialPxPerMm: 4 } })
    const card = wrapper.get('[data-testid="card-outline"]')
    await wrapper.get('.calibrator').trigger('keydown', { key: 'ArrowRight' })
    await wrapper.get('.calibrator').trigger('keydown', { key: 'ArrowRight', shiftKey: true })
    expect(card.attributes('style')).toContain('width: 353.4px')
  })

  it('emits px per mm on save', async () => {
    const wrapper = mount(CardCalibrator, { props: { initialPxPerMm: 4 } })
    await wrapper.get('[data-testid="save-calibration"]').trigger('click')
    expect(wrapper.emitted('save')?.[0]?.[0]).toBeCloseTo(4, 6)
  })
})
