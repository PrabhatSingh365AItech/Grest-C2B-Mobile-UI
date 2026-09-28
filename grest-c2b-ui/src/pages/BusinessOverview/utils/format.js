const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})
const count = new Intl.NumberFormat('en-IN')

export const formatINR = (v) => inr.format(Math.round(v || 0))

// ₹12.4 L / ₹1.2 Cr — for tiles and bar labels where space is tight.
export const formatINRCompact = (v) => {
  const n = Math.abs(v || 0)
  const sign = v < 0 ? '-' : ''
  if (n >= 1e7) {
    return `${sign}₹${(n / 1e7).toFixed(2)} Cr`
  }
  if (n >= 1e5) {
    return `${sign}₹${(n / 1e5).toFixed(1)} L`
  }
  if (n >= 1e3) {
    return `${sign}₹${(n / 1e3).toFixed(1)}K`
  }
  return formatINR(v)
}

export const formatCount = (v) => count.format(v || 0)

export const formatPct = (v) => `${(v || 0).toFixed(1)}%`

export const formatShortDate = (d) =>
  d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
