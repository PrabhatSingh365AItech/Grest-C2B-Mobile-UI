export const formatDateToString = (date) => {
  if (!date) {
    return null
  }
  try {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .split('T')[0]
  } catch (error) {
    console.error('Date formatting error:', error)
    return null
  }
}
