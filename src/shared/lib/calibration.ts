/** ISO/IEC 7810 ID-1 card (credit card) dimensions. */
export const CARD_WIDTH_MM = 85.6
export const CARD_HEIGHT_MM = 53.98
export const CARD_CORNER_MM = 3.18

/** CSS reference pixel: 96 px per inch. Used until the user calibrates. */
export const DEFAULT_PX_PER_MM = 96 / 25.4

export const MIN_PX_PER_MM = 1
export const MAX_PX_PER_MM = 20

export function pxPerMmFromCardWidth(widthPx: number): number {
  return widthPx / CARD_WIDTH_MM
}
