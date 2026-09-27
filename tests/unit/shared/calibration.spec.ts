import { beforeEach, describe, expect, it } from 'vitest'
import {
  CARD_HEIGHT_MM,
  CARD_WIDTH_MM,
  DEFAULT_PX_PER_MM,
  pxPerMmFromCardWidth,
} from '../../../src/shared/lib/calibration'
import { useCalibration } from '../../../src/shared/composables/useCalibration'

describe('calibration math', () => {
  it('uses ID-1 card dimensions', () => {
    expect(CARD_WIDTH_MM).toBe(85.6)
    expect(CARD_HEIGHT_MM).toBe(53.98)
  })

  it('derives px per mm from the matched card width', () => {
    expect(pxPerMmFromCardWidth(342.4)).toBeCloseTo(4, 6)
  })

  it('defaults to the CSS reference pixel (96 per inch)', () => {
    expect(DEFAULT_PX_PER_MM).toBeCloseTo(96 / 25.4, 6)
  })
})

describe('useCalibration', () => {
  beforeEach(() => localStorage.clear())

  it('starts uncalibrated with the default value', () => {
    const cal = useCalibration()
    cal.reload()
    expect(cal.isCalibrated.value).toBe(false)
    expect(cal.pxPerMm.value).toBeCloseTo(DEFAULT_PX_PER_MM, 6)
  })

  it('saves and reloads a calibration', () => {
    const cal = useCalibration()
    cal.save(5)
    cal.reload()
    expect(cal.isCalibrated.value).toBe(true)
    expect(cal.pxPerMm.value).toBe(5)
  })

  it('ignores corrupt stored data', () => {
    localStorage.setItem('fit-eyes.calibration', '{bad json')
    const cal = useCalibration()
    cal.reload()
    expect(cal.isCalibrated.value).toBe(false)
  })

  it('reports a device pixel ratio change since calibration', () => {
    const cal = useCalibration()
    cal.save(5)
    const original = window.devicePixelRatio
    Object.defineProperty(window, 'devicePixelRatio', { value: original + 1, configurable: true })
    cal.reload()
    expect(cal.pixelRatioChanged.value).toBe(true)
    Object.defineProperty(window, 'devicePixelRatio', { value: original, configurable: true })
  })
})
