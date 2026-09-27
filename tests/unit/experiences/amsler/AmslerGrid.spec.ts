import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AmslerGrid from '../../../../src/experiences/amsler/components/AmslerGrid.vue'

describe('AmslerGrid', () => {
  it('sizes the 100 mm grid area from px per mm', () => {
    const wrapper = mount(AmslerGrid, { props: { pxPerMm: 4, showLabels: false } })
    const svg = wrapper.get('svg')
    expect(svg.attributes('width')).toBe('400')
    expect(svg.attributes('height')).toBe('400')
  })

  it('draws 21 vertical and 21 horizontal lines and a fixation dot', () => {
    const wrapper = mount(AmslerGrid, { props: { pxPerMm: 4, showLabels: false } })
    expect(wrapper.findAll('line')).toHaveLength(42)
    expect(wrapper.find('[data-testid="fixation-dot"]').exists()).toBe(true)
  })

  it('shows row and column labels only when enabled', () => {
    const off = mount(AmslerGrid, { props: { pxPerMm: 4, showLabels: false } })
    expect(off.findAll('text')).toHaveLength(0)
    const on = mount(AmslerGrid, { props: { pxPerMm: 4, showLabels: true } })
    const labels = on.findAll('text').map((t) => t.text())
    expect(labels).toHaveLength(40)
    expect(labels).toContain('A')
    expect(labels).toContain('T')
    expect(labels).toContain('1')
    expect(labels).toContain('20')
  })

  it('keeps the grid area at 100 mm when labels add a margin', () => {
    const wrapper = mount(AmslerGrid, { props: { pxPerMm: 4, showLabels: true } })
    const area = wrapper.get('[data-testid="grid-area"]')
    expect(area.attributes('width')).toBe('100')
    expect(Number(wrapper.get('svg').attributes('width'))).toBeGreaterThan(400)
  })
})

describe('AmslerGrid highlight', () => {
  it('fills the highlighted cell in cell mode without a label', () => {
    const wrapper = mount(AmslerGrid, {
      props: { pxPerMm: 4, showLabels: false, highlight: { cell: 21, color: '#ff0000', mode: 'cell' } },
    })
    const cell = wrapper.get('[data-testid="highlight-cell"]')
    expect(cell.attributes('x')).toBe('5')
    expect(cell.attributes('y')).toBe('5')
    expect(cell.attributes('fill')).toBe('#ff0000')
    expect(wrapper.find('[data-testid="highlight-label"]').exists()).toBe(false)
  })

  it('draws the coordinate text in label mode', () => {
    const wrapper = mount(AmslerGrid, {
      props: { pxPerMm: 4, showLabels: false, highlight: { cell: 21, color: '#00ff00', mode: 'label' } },
    })
    const label = wrapper.get('[data-testid="highlight-label"]')
    expect(label.text()).toBe('B2')
    expect(label.attributes('fill')).toBe('#00ff00')
    expect(wrapper.find('[data-testid="highlight-cell"]').exists()).toBe(false)
  })
})

describe('AmslerGrid highlight label size', () => {
  it('uses a smaller font for three-character labels', () => {
    const short = mount(AmslerGrid, { props: { pxPerMm: 4, showLabels: false, highlight: { cell: 0, color: 'red', mode: 'label' } } })
    const long = mount(AmslerGrid, { props: { pxPerMm: 4, showLabels: false, highlight: { cell: 399, color: 'red', mode: 'label' } } })
    expect(long.get('[data-testid="highlight-label"]').text()).toBe('T20')
    expect(Number(long.get('[data-testid="highlight-label"]').attributes('font-size'))).toBeLessThan(
      Number(short.get('[data-testid="highlight-label"]').attributes('font-size')),
    )
  })
})
