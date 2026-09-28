// Per-company commission rules, applied to every purchase on the dashboard.
//
// A rule matches on platform and on a device-price band, and pays either a
// percentage of the device price (price before add-ons) or a flat amount.
// Rules are evaluated in order; the first match wins.
//
//   { platform: 'any' | 'apple' | 'android',
//     min: number | null,   // device price >= min
//     max: number | null,   // device price <  max
//     type: 'percent' | 'flat',
//     value: number }
//
// There is no backend store for these yet, so overrides are kept in this
// browser's localStorage (per browser, not shared between admins).

const STORAGE_KEY = 'businessOverview.commissionRates'

const pct = (value, extra = {}) => ({
  platform: 'any',
  min: null,
  max: null,
  type: 'percent',
  value,
  ...extra,
})

// Agreed rates. Companies are matched by name so the rules apply even though
// company ids differ between environments; edit any of them on the dashboard.
export const DEFAULT_RULE_SETS = [
  { key: 'ps3', test: /ps\s*3/i, label: 'PS3', rules: [pct(8)] },
  {
    key: 'icrest',
    test: /icrest/i,
    label: 'iCrest',
    rules: [pct(12, { max: 30000 }), pct(10, { min: 30000 })],
  },
  {
    key: 'adityavision',
    test: /aditya/i,
    label: 'Aditya Vision',
    rules: [pct(10, { platform: 'apple' }), pct(6, { platform: 'android' })],
  },
  { key: 'vijaysales', test: /vijay/i, label: 'Vijay Sales', rules: [pct(10)] },
  { key: 'sangeetha', test: /sangeetha/i, label: 'Sangeetha', rules: [pct(5.5)] },
]

export const defaultRulesFor = (companyName) =>
  DEFAULT_RULE_SETS.find((s) => s.test.test(String(companyName || '')))?.rules || []

export const loadCommissionRates = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export const saveCommissionRates = (rates) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rates))
  } catch {
    // Storage unavailable (private browsing): rates still apply for this session.
  }
}

// Apple devices (iPhone, iPad, Apple Watch) count as iOS; everything else Android.
const APPLE = /^(apple|iphone|ipad|imac|macbook)/i
export const platformOf = (record) =>
  APPLE.test(record.brand) || APPLE.test(record.model) ? 'apple' : 'android'

/** Rules in force for a company: the dashboard override, else the agreed default. */
export const rulesFor = (companyId, companyName, rates) =>
  rates[companyId]?.rules || defaultRulesFor(companyName)

const matches = (rule, platform, price) =>
  (!rule.platform || rule.platform === 'any' || rule.platform === platform) &&
  (rule.min == null || price >= rule.min) &&
  (rule.max == null || price < rule.max)

export const commissionFor = (record, rates) => {
  const rules = rulesFor(record.companyId, record.companyName, rates)
  if (!rules.length) {
    return 0
  }
  const price = Math.max(record.devicePrice, 0)
  const rule = rules.find((r) => matches(r, platformOf(record), price))
  const value = Number(rule?.value)
  if (!rule || !Number.isFinite(value) || value <= 0) {
    return 0
  }
  return rule.type === 'flat' ? value : (price * value) / 100
}

/**
 * Adds the estimated commission to a normalized record. Purchase value stays
 * what was paid to the customer; commission is reported on its own.
 */
export const applyCommission = (record, rates) => {
  const commission = commissionFor(record, rates)
  if (!commission) {
    return record
  }
  return { ...record, commission }
}

/** One-line description of a rule, for the editor and tooltips. */
export const describeRule = (rule) => {
  const amount = rule.type === 'flat' ? `₹${rule.value}` : `${rule.value}%`
  const platform =
    rule.platform && rule.platform !== 'any'
      ? ` · ${rule.platform === 'apple' ? 'Apple' : 'Android'}`
      : ''
  let band = ''
  if (rule.min != null && rule.max != null) {
    band = ` · ₹${rule.min}–₹${rule.max}`
  } else if (rule.min != null) {
    band = ` · from ₹${rule.min}`
  } else if (rule.max != null) {
    band = ` · under ₹${rule.max}`
  }
  return `${amount}${platform}${band}`
}
