/** Slices a list for the current page, clamping the page if the list shrank. */
export const paginate = (items, page, pageSize) => {
  const pageCount = Math.max(Math.ceil(items.length / pageSize), 1)
  const safePage = Math.min(page, pageCount - 1)
  return {
    pageCount,
    safePage,
    visible: items.slice(safePage * pageSize, (safePage + 1) * pageSize),
  }
}
