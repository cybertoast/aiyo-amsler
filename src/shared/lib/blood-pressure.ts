export interface BloodPressure {
  systolic: number
  diastolic: number
  pulse?: number
  takenAt: string
}

/** Accepted input ranges (plausibility checks only, not clinical thresholds). */
export const BP_RANGES = {
  systolic: { min: 60, max: 260 },
  diastolic: { min: 30, max: 160 },
  pulse: { min: 20, max: 250 },
} as const

export function formatBloodPressure(bp: BloodPressure): string {
  const pulse = bp.pulse === undefined ? '' : `, pulse ${bp.pulse}`
  return `${bp.systolic}/${bp.diastolic} mmHg${pulse}`
}
