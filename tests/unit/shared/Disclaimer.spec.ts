import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Disclaimer from '../../../src/shared/components/Disclaimer.vue'

describe('Disclaimer', () => {
  it('states that the site is not a medical device', () => {
    const wrapper = mount(Disclaimer)
    expect(wrapper.text()).toContain('It is not a medical device')
    expect(wrapper.attributes('role')).toBe('note')
  })
})
