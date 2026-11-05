import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { IoMdSearch } from 'react-icons/io'
import { FaAngleDown } from 'react-icons/fa6'
import { SHADOW } from './constants'

const CLEAR_BUTTON = [
  'h-9 w-full rounded-[0.55rem] border border-primary text-primary text-sm font-medium',
  'hover:bg-primary hover:text-white transition-colors',
  'disabled:border-gray-300 disabled:text-gray-400 disabled:hover:bg-transparent disabled:cursor-not-allowed',
].join(' ')

const FIELD = `h-9 bg-white rounded-[0.55rem] px-3 text-sm outline-none border border-transparent focus:border-primary ${SHADOW}`

const CompanyMultiSelect = ({ companies, selected, onChange }) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false)
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const toggle = (id) =>
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id])

  const visible = query.trim()
    ? companies.filter((c) => String(c.name).toLowerCase().includes(query.trim().toLowerCase()))
    : companies
  const allSelected = selected.length === 0

  let label = 'All companies'
  if (selected.length === 1) {
    label = companies.find((c) => c._id === selected[0])?.name || '1 company'
  } else if (selected.length > 1) {
    label = `${selected.length} companies`
  }

  return (
    <div ref={ref} className='relative w-full'>
      <button
        type='button'
        onClick={() => setOpen(!open)}
        className={`${FIELD} w-full flex items-center justify-between gap-2 text-left`}
        aria-haspopup='listbox'
        aria-expanded={open}
      >
        <span className='truncate'>{label}</span>
        <FaAngleDown className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className='absolute z-20 mt-1 w-full min-w-[220px] bg-white rounded-lg border border-gray-200 shadow-lg'>
          {companies.length > 8 && (
            <div className='p-2 border-b border-gray-100'>
              <input
                type='text'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Search company'
                aria-label='Search company'
                className='w-full h-8 rounded border border-gray-300 px-2 text-sm outline-none focus:border-primary'
              />
            </div>
          )}
          <ul role='listbox' aria-multiselectable='true' className='max-h-60 overflow-y-auto py-1'>
            {!query.trim() && (
              <li className='border-b border-gray-100'>
                <label className='flex items-center gap-2 px-3 py-2 text-sm font-semibold cursor-pointer hover:bg-rose-50'>
                  <input
                    type='checkbox'
                    checked={allSelected}
                    onChange={() => onChange([])}
                    className='accent-[var(--primary-color)]'
                  />
                  <span>All companies</span>
                </label>
              </li>
            )}
            {visible.length === 0 && (
              <li className='px-3 py-2 text-sm text-gray-500'>No companies found</li>
            )}
            {visible.map((company) => (
              <li key={company._id}>
                <label className='flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-rose-50'>
                  <input
                    type='checkbox'
                    checked={selected.includes(company._id)}
                    onChange={() => toggle(company._id)}
                    className='accent-[var(--primary-color)]'
                  />
                  <span className='truncate'>{company.name}</span>
                  {company.status === 'inactive' && (
                    <span className='ml-auto shrink-0 text-xs text-gray-400'>inactive</span>
                  )}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

CompanyMultiSelect.propTypes = {
  companies: PropTypes.arrayOf(
    PropTypes.shape({ _id: PropTypes.string, name: PropTypes.string, status: PropTypes.string })
  ).isRequired,
  selected: PropTypes.arrayOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
}

const Labeled = ({ label, children }) => (
  <label className='flex flex-col gap-1 min-w-0'>
    <span className='text-xs font-semibold text-gray-600'>{label}</span>
    {children}
  </label>
)

Labeled.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node,
}

const WarehouseFilters = ({ options, filters, onChange, onClear }) => {
  const [searchInput, setSearchInput] = useState(filters.search)
  const [lotInput, setLotInput] = useState(filters.lotNo)

  // Keep the text boxes in step when filters are cleared from outside.
  useEffect(() => setSearchInput(filters.search), [filters.search])
  useEffect(() => setLotInput(filters.lotNo), [filters.lotNo])

  // Store options narrow to the selected companies.
  const stores = filters.companyIds.length
    ? options.stores.filter((s) => filters.companyIds.includes(s.companyId))
    : options.stores

  const setCompanies = (companyIds) => {
    const storeStillValid =
      !filters.storeId ||
      !companyIds.length ||
      options.stores.some(
        (s) => s._id === filters.storeId && companyIds.includes(s.companyId)
      )
    onChange({ companyIds, storeId: storeStillValid ? filters.storeId : '' })
  }

  const submitText = (e) => {
    e.preventDefault()
    onChange({ search: searchInput.trim(), lotNo: lotInput.trim() })
  }

  const hasFilters =
    filters.search ||
    filters.lotNo ||
    filters.companyIds.length ||
    filters.storeId ||
    filters.status ||
    filters.fromDate ||
    filters.toDate

  return (
    <form
      onSubmit={submitText}
      className={`bg-white rounded-lg p-3 md:p-4 mb-4 ${SHADOW}`}
    >
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
        <Labeled label='Search'>
          <div className={`${FIELD} flex items-center pr-0 overflow-hidden`}>
            <input
              type='text'
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder='IMEI, Unique ID or AWB'
              className='w-full outline-none bg-transparent'
            />
            <button
              type='submit'
              aria-label='Search'
              className='h-full px-2 text-primary hover:bg-primary hover:text-white transition-colors'
            >
              <IoMdSearch size={20} />
            </button>
          </div>
        </Labeled>

        <Labeled label='Company'>
          <CompanyMultiSelect
            companies={options.companies}
            selected={filters.companyIds}
            onChange={setCompanies}
          />
        </Labeled>

        <Labeled label='Store'>
          <select
            value={filters.storeId}
            onChange={(e) => onChange({ storeId: e.target.value })}
            className={FIELD}
          >
            <option value=''>All stores</option>
            {stores.map((store) => (
              <option key={store._id} value={store._id}>
                {store.storeName}
                {store.region ? ` - ${store.region}` : ''}
              </option>
            ))}
          </select>
        </Labeled>

        <Labeled label='Logistics Status'>
          <select
            value={filters.status}
            onChange={(e) => onChange({ status: e.target.value })}
            className={FIELD}
          >
            <option value=''>All statuses</option>
            {options.statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </Labeled>

        <Labeled label='Lot No.'>
          <input
            type='text'
            value={lotInput}
            onChange={(e) => setLotInput(e.target.value)}
            onBlur={() => lotInput.trim() !== filters.lotNo && onChange({ lotNo: lotInput.trim() })}
            placeholder='LOT-…'
            className={FIELD}
          />
        </Labeled>

        <Labeled label='From date'>
          <input
            type='date'
            value={filters.fromDate}
            max={filters.toDate || undefined}
            onChange={(e) => onChange({ fromDate: e.target.value })}
            className={FIELD}
          />
        </Labeled>

        <Labeled label='To date'>
          <input
            type='date'
            value={filters.toDate}
            min={filters.fromDate || undefined}
            onChange={(e) => onChange({ toDate: e.target.value })}
            className={FIELD}
          />
        </Labeled>

        <div className='flex items-end'>
          <button
            type='button'
            onClick={onClear}
            disabled={!hasFilters}
            className={CLEAR_BUTTON}
          >
            Clear all filters
          </button>
        </div>
      </div>
      {(filters.fromDate && !filters.toDate) || (!filters.fromDate && filters.toDate) ? (
        <p className='text-xs text-gray-500 mt-2'>
          Pick both dates to filter by date range.
        </p>
      ) : null}
    </form>
  )
}

WarehouseFilters.propTypes = {
  options: PropTypes.shape({
    companies: PropTypes.array,
    stores: PropTypes.array,
    statuses: PropTypes.array,
  }).isRequired,
  filters: PropTypes.shape({
    search: PropTypes.string,
    lotNo: PropTypes.string,
    companyIds: PropTypes.arrayOf(PropTypes.string),
    storeId: PropTypes.string,
    status: PropTypes.string,
    fromDate: PropTypes.string,
    toDate: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
}

export default WarehouseFilters
