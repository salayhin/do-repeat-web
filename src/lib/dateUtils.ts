export function getLocalDate(timezone?: string): string {
  if (!timezone || timezone === 'UTC') {
    return new Date().toISOString().split('T')[0]
  }
  try {
    // en-CA locale gives YYYY-MM-DD format
    return new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date())
  } catch {
    return new Date().toISOString().split('T')[0]
  }
}

export function formatLocalDate(date: string, options?: Intl.DateTimeFormatOptions): string {
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', options)
}
