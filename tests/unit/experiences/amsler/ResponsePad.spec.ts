import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ResponsePad from '../../../../src/experiences/amsler/components/ResponsePad.vue'

describe('ResponsePad', () => {
  it('emits the answer for each button', async () => {
    const wrapper = mount(ResponsePad, { props: { disabled: false } })
    await wrapper.get('[data-testid="answer-clear"]').trigger('click')
    await wrapper.get('[data-testid="answer-blurry"]').trigger('click')
    await wrapper.get('[data-testid="answer-invisible"]').trigger('click')
    expect(wrapper.emitted('answer')).toEqual([['clear'], ['blurry'], ['invisible']])
  })

  it('shows the key for each answer', () => {
    const wrapper = mount(ResponsePad, { props: { disabled: false } })
    expect(wrapper.get('[data-testid="answer-clear"]').text()).toContain('1')
    expect(wrapper.get('[data-testid="answer-invisible"]').text()).toContain('3')
  })

  it('disables buttons when disabled', () => {
    const wrapper = mount(ResponsePad, { props: { disabled: true } })
    expect(wrapper.get('[data-testid="answer-clear"]').attributes('disabled')).toBeDefined()
  })
})
