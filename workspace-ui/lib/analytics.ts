type AccentAnalytics = (event: 'accent_changed', properties: Record<string, string | number>) => void

let reportAccentChange: AccentAnalytics | undefined

export function configureAccentAnalytics(report?: AccentAnalytics): void {
  reportAccentChange = report
}

export function track(event: 'accent_changed', properties: Record<string, string | number>): void {
  reportAccentChange?.(event, properties)
}
