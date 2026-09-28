import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import BloodPressureForm from '../../../src/shared/components/BloodPressureForm.vue'

function mountWithParent() {
  const reading = ref<unknown>(null)
  const valid = ref(true)
  const Parent = defineComponent({
    components: { BloodPressureForm },
    setup: () => ({ reading, valid }),
    template: `<BloodPressureForm v-model="reading" v-model:valid="valid" :recent="null" />`,
  })
  return { wrapper: mount(Parent), reading, valid }
}

describe('BloodPressureForm', () => {
  it('reports a reading when the last required field makes the input valid', async () => {
    const { wrapper, reading, valid } = mountWithParent()
    await wrapper.get('[data-testid="bp-record"]').setValue(true)
    expect(valid.value).toBe(false)
    await wrapper.get('[data-testid="bp-systolic"]').setValue('131')
    await wrapper.get('[data-testid="bp-diastolic"]').setValue('84')
    await nextTick()
    expect(valid.value).toBe(true)
    expect(reading.value).toMatchObject({ systolic: 131, diastolic: 84 })
  })

  it('reports no reading and invalid input when out of range', async () => {
    const { wrapper, reading, valid } = mountWithParent()
    await wrapper.get('[data-testid="bp-record"]').setValue(true)
    await wrapper.get('[data-testid="bp-systolic"]').setValue('400')
    await wrapper.get('[data-testid="bp-diastolic"]').setValue('84')
    expect(valid.value).toBe(false)
    expect(reading.value).toBeNull()
  })

  it('reports no reading and valid input when not recording', () => {
    const { reading, valid } = mountWithParent()
    expect(valid.value).toBe(true)
    expect(reading.value).toBeNull()
  })
})
