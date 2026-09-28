import { CELL_COUNT, GRID_MM, type Region } from './grid'
import { isIsoDateTime, localDateParts, localIsoString } from '../../../shared/lib/time'
import { BP_RANGES, type BloodPressure } from '../../../shared/lib/blood-pressure'

export type { BloodPressure }

export const SESSION_VERSION = 1
export const EXPERIENCE_ID = 'amsler'

export const EYES = ['left', 'right', 'both'] as const
export const TEST_COLORS = ['mono', 'red', 'green', 'blue'] as const
export const THEMES = ['light', 'dark'] as const
export const DISPLAY_MODES = ['cell', 'label'] as const
export const ORDERS = ['sequential', 'random'] as const
export const REGIONS: readonly Region[] = ['NW', 'NE', 'SW', 'SE', 'center']

export type Eye = (typeof EYES)[number]
/** mono = black on the light theme, white on the dark theme. */
export type TestColor = (typeof TEST_COLORS)[number]
export type DisplayMode = (typeof DISPLAY_MODES)[number]
export type Order = (typeof ORDERS)[number]
export type Scope = { type: 'full' } | { type: 'region'; region: Region } | { type: 'sample'; n: number }

/** One character per cell, row-major A1..T20. */
export const RESPONSE_CODES = { clear: 'c', blurry: 'b', invisible: 'i', untested: '.' } as const
export const EMPTY_RESPONSES = RESPONSE_CODES.untested.repeat(CELL_COUNT)

export interface SessionSettings {
  eye: Eye
  color: TestColor
  theme: (typeof THEMES)[number]
  displayMode: DisplayMode
  order: Order
  scope: Scope
  /** Seeds random order and random sample selection. Required when either is used. */
  seed?: number
}

export interface Session extends SessionSettings {
  v: typeof SESSION_VERSION
  x: typeof EXPERIENCE_ID
  name: string
  startedAt: string
  completedAt?: string
  gridMm: typeof GRID_MM
  bloodPressure?: BloodPressure
  responses: string
  notes?: string
}

export const NAME_MAX = 100
export const NOTES_MAX = 2000

export function defaultSessionName(eye: Eye, color: TestColor, date: Date): string {
  const { date: d, time } = localDateParts(date)
  return `${eye}-${color}-${d}-${time}`
}

export function createSession(settings: SessionSettings, now: Date = new Date()): Session {
  return {
    v: SESSION_VERSION,
    x: EXPERIENCE_ID,
    name: defaultSessionName(settings.eye, settings.color, now),
    startedAt: localIsoString(now),
    gridMm: GRID_MM,
    ...settings,
    responses: EMPTY_RESPONSES,
  }
}

function fail(message: string): never {
  throw new Error(`Invalid session: ${message}.`)
}

function oneOf<T extends string>(value: unknown, options: readonly T[], field: string): T {
  if (typeof value !== 'string' || !options.includes(value as T)) fail(`${field} must be one of ${options.join(', ')}`)
  return value as T
}

function intInRange(value: unknown, min: number, max: number, field: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value) || value < min || value > max) {
    fail(`${field} must be a whole number from ${min} to ${max}`)
  }
  return value
}

function validateScope(value: unknown): Scope {
  if (typeof value !== 'object' || value === null) fail('scope is missing')
  const scope = value as Record<string, unknown>
  if (scope.type === 'full') return { type: 'full' }
  if (scope.type === 'region') return { type: 'region', region: oneOf(scope.region, REGIONS, 'scope.region') }
  if (scope.type === 'sample') return { type: 'sample', n: intInRange(scope.n, 1, CELL_COUNT, 'scope.n') }
  fail('scope.type must be full, region, or sample')
}

function validateBloodPressure(value: unknown): BloodPressure {
  if (typeof value !== 'object' || value === null) fail('bloodPressure must be an object')
  const bp = value as Record<string, unknown>
  if (!isIsoDateTime(bp.takenAt)) fail('bloodPressure.takenAt must be a date and time')
  const result: BloodPressure = {
    systolic: intInRange(bp.systolic, BP_RANGES.systolic.min, BP_RANGES.systolic.max, 'bloodPressure.systolic'),
    diastolic: intInRange(bp.diastolic, BP_RANGES.diastolic.min, BP_RANGES.diastolic.max, 'bloodPressure.diastolic'),
    takenAt: bp.takenAt,
  }
  if (bp.pulse !== undefined) result.pulse = intInRange(bp.pulse, BP_RANGES.pulse.min, BP_RANGES.pulse.max, 'bloodPressure.pulse')
  return result
}

/** Validates untrusted data (from a link or file) and returns a clean Session. */
export function validateSession(value: unknown): Session {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) fail('expected an object')
  const s = value as Record<string, unknown>
  if (s.v !== SESSION_VERSION) {
    fail(typeof s.v === 'number' && s.v > SESSION_VERSION ? 'it was saved by a newer version of fit-eyes' : 'unknown version')
  }
  if (s.x !== EXPERIENCE_ID) fail('it is not an Amsler grid session')
  if (typeof s.name !== 'string' || s.name.length === 0 || s.name.length > NAME_MAX) {
    fail(`name must be 1 to ${NAME_MAX} characters`)
  }
  if (!isIsoDateTime(s.startedAt)) fail('startedAt must be a date and time')
  if (s.completedAt !== undefined && !isIsoDateTime(s.completedAt)) fail('completedAt must be a date and time')
  if (s.gridMm !== GRID_MM) fail(`gridMm must be ${GRID_MM}`)
  if (typeof s.responses !== 'string' || !/^[cbi.]+$/.test(s.responses) || s.responses.length !== CELL_COUNT) {
    fail(`responses must be ${CELL_COUNT} characters of c, b, i, or .`)
  }
  const order = oneOf(s.order, ORDERS, 'order')
  const scope = validateScope(s.scope)
  const needsSeed = order === 'random' || scope.type === 'sample'
  if (needsSeed && s.seed === undefined) fail('seed is required for random order or sample scope')

  const session: Session = {
    v: SESSION_VERSION,
    x: EXPERIENCE_ID,
    name: s.name,
    startedAt: s.startedAt,
    gridMm: GRID_MM,
    eye: oneOf(s.eye, EYES, 'eye'),
    color: oneOf(s.color, TEST_COLORS, 'color'),
    theme: oneOf(s.theme, THEMES, 'theme'),
    displayMode: oneOf(s.displayMode, DISPLAY_MODES, 'displayMode'),
    order,
    scope,
    responses: s.responses,
  }
  if (s.seed !== undefined) session.seed = intInRange(s.seed, 0, 2 ** 32 - 1, 'seed')
  if (s.completedAt !== undefined) session.completedAt = s.completedAt as string
  if (s.bloodPressure !== undefined) session.bloodPressure = validateBloodPressure(s.bloodPressure)
  if (s.notes !== undefined) {
    if (typeof s.notes !== 'string' || s.notes.length > NOTES_MAX) fail(`notes must be at most ${NOTES_MAX} characters`)
    session.notes = s.notes
  }
  return session
}

/** Uses the local date and time recorded in startedAt, so the name is the same in every time zone. */
export function sessionFileName(session: Session): string {
  const t = session.startedAt
  const date = t.slice(0, 10).replace(/-/g, '')
  const time = t.slice(11, 13) + t.slice(14, 16)
  return `amsler-${session.eye}-${session.color}-${date}-${time}.json`
}

export function sessionToFileJson(session: Session, url: string): string {
  return JSON.stringify({ ...session, url }, null, 2) + '\n'
}

export function parseSessionFile(text: string): Session {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('This file is not a valid fit-eyes session file.')
  }
  if (typeof data === 'object' && data !== null) delete (data as Record<string, unknown>).url
  return validateSession(data)
}
