/**
 * Field mapping for the Daily Tracker. Every assumption about API response
 * shapes lives here, so confirming them against real data means editing only
 * this file.
 *
 * Join key across all three sources: the user's email, lower-cased.
 */

// Roles that give quotes at the store counter ("FOS"). Technicians are the
// pickup role and land on the pickup dashboard, not the quoting flow.
export const FOS_ROLES = ['Sale User']

const key = (email) => String(email || '').trim().toLowerCase()

const fullName = (first, last) => [first, last].filter(Boolean).join(' ').trim()

/** /api/quoteTracking/dashboard row -> { email, name, storeName, quotes } */
export const adaptQuoteRow = (row) => ({
  email: key(row?.email || row?.userId),
  name: row?.name || row?.userName || '',
  storeName: row?.storeName || '',
  // "Total Quotes Count" on the Quote Tracking page; assumed to include
  // quick quotes, which that page also shows separately.
  quotes: Number(row?.totalQuotes) || 0,
})

/** /api/userregistry/all user -> { email, name, role, stores: [{id, name, companyId}] } */
export const adaptRegisteredUser = (user) => {
  let stores = []
  if (user?.assignedStoresData?.length) {
    stores = user.assignedStoresData
  } else if (user?.stores) {
    stores = [user.stores]
  }
  return {
    email: key(user?.email),
    name: fullName(user?.firstName, user?.lastName) || user?.email || '',
    role: user?.role || '',
    stores: stores.map((s) => ({
      id: s?._id || '',
      name: s?.storeName || '',
      companyId: s?.companyId?._id || s?.companyId || user?.companyData?._id || '',
    })),
  }
}

/** Sold prospect (already normalized) -> email of the user who converted it. */
export const convertedBy = (record) => key(record.staffEmail)
