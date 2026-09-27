export const GRID_MM = 100
export const GRID_CELLS = 20
export const CELL_MM = GRID_MM / GRID_CELLS
export const CELL_COUNT = GRID_CELLS * GRID_CELLS
export const COLUMN_LABELS = Array.from({ length: GRID_CELLS }, (_, i) => String.fromCharCode(65 + i))
export const ROW_LABELS = Array.from({ length: GRID_CELLS }, (_, i) => String(i + 1))

export type Region = 'NW' | 'NE' | 'SW' | 'SE' | 'center'

/** Row-major index: 0 = A1, 19 = T1, 20 = A2, 399 = T20. */
export function cellName(index: number): string {
  const row = Math.floor(index / GRID_CELLS)
  const col = index % GRID_CELLS
  return `${COLUMN_LABELS[col]}${row + 1}`
}

export function cellIndex(name: string): number {
  const match = /^([A-T])([1-9]|1[0-9]|20)$/.exec(name)
  if (!match) throw new Error(`Invalid cell name: ${name}`)
  const col = match[1]!.charCodeAt(0) - 65
  const row = Number(match[2]) - 1
  return row * GRID_CELLS + col
}

const HALF = GRID_CELLS / 2
const REGION_BOUNDS: Record<Region, { rows: [number, number]; cols: [number, number] }> = {
  NW: { rows: [0, HALF], cols: [0, HALF] },
  NE: { rows: [0, HALF], cols: [HALF, GRID_CELLS] },
  SW: { rows: [HALF, GRID_CELLS], cols: [0, HALF] },
  SE: { rows: [HALF, GRID_CELLS], cols: [HALF, GRID_CELLS] },
  center: { rows: [5, 15], cols: [5, 15] },
}

export function cellsInRegion(region: Region): number[] {
  const { rows, cols } = REGION_BOUNDS[region]
  const cells: number[] = []
  for (let r = rows[0]; r < rows[1]; r++) {
    for (let c = cols[0]; c < cols[1]; c++) cells.push(r * GRID_CELLS + c)
  }
  return cells
}
