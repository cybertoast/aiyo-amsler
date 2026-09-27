import type { TestColor } from './session-schema'

/** mono uses the grid foreground: black on the light theme, white on the dark theme. */
export const TEST_COLOR_VALUES: Record<TestColor, string> = {
  mono: 'currentColor',
  red: '#ff0000',
  green: '#00c000',
  blue: '#0050ff',
}

export const TEST_COLOR_NAMES: Record<TestColor, string> = {
  mono: 'Black / white',
  red: 'Red',
  green: 'Green',
  blue: 'Blue',
}
