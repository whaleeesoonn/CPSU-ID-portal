export const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

export const fmtDateTime = (iso) =>
  new Date(iso).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })

export const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase()
