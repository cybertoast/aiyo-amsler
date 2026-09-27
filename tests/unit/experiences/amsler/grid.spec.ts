import { describe, expect, it } from 'vitest'
import {
  CELL_COUNT,
  COLUMN_LABELS,
  GRID_CELLS,
  cellIndex,
  cellName,
  cellsInRegion,
} from '../../../../src/experiences/amsler/lib/grid'

describe('grid', () => {
  it('has 20 columns A-T and 400 cells', () => {
    expect(COLUMN_LABELS.join('')).toBe('ABCDEFGHIJKLMNOPQRST')
    expect(GRID_CELLS).toBe(20)
    expect(CELL_COUNT).toBe(400)
  })

  it('names cells column + row in row-major order', () => {
    expect(cellName(0)).toBe('A1')
    expect(cellName(19)).toBe('T1')
    expect(cellName(20)).toBe('A2')
    expect(cellName(399)).toBe('T20')
  })

  it('converts names back to indices', () => {
    for (let i = 0; i < CELL_COUNT; i++) expect(cellIndex(cellName(i))).toBe(i)
    expect(() => cellIndex('U1')).toThrow()
    expect(() => cellIndex('A21')).toThrow()
  })

  it('returns 100 cells for each region', () => {
    for (const region of ['NW', 'NE', 'SW', 'SE', 'center'] as const) {
      expect(cellsInRegion(region)).toHaveLength(100)
    }
  })

  it('defines quadrants and center by row and column', () => {
    expect(cellsInRegion('NW').map(cellName)).toContain('J10')
    expect(cellsInRegion('NE').map(cellName)).toContain('K1')
    expect(cellsInRegion('SW').map(cellName)).toContain('A11')
    expect(cellsInRegion('SE').map(cellName)).toContain('T20')
    const center = cellsInRegion('center').map(cellName)
    expect(center).toContain('F6')
    expect(center).toContain('O15')
    expect(center).not.toContain('E6')
    expect(center).not.toContain('P15')
  })
})
