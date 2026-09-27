import { cellName } from './grid'

export interface ResponseSummary {
  counts: { clear: number; blurry: number; invisible: number; untested: number }
  tested: number
  blurry: string[]
  invisible: string[]
}

export function summarizeResponses(responses: string): ResponseSummary {
  const summary: ResponseSummary = {
    counts: { clear: 0, blurry: 0, invisible: 0, untested: 0 },
    tested: 0,
    blurry: [],
    invisible: [],
  }
  for (let i = 0; i < responses.length; i++) {
    const code = responses[i]
    if (code === 'c') summary.counts.clear++
    else if (code === 'b') {
      summary.counts.blurry++
      summary.blurry.push(cellName(i))
    } else if (code === 'i') {
      summary.counts.invisible++
      summary.invisible.push(cellName(i))
    } else summary.counts.untested++
  }
  summary.tested = responses.length - summary.counts.untested
  return summary
}
