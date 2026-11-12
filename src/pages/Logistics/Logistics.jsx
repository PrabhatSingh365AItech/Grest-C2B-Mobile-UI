import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { BeatLoader } from 'react-spinners'
import { IoRefresh } from 'react-icons/io5'
import { FaDownload } from 'react-icons/fa6'
import AdminNavbar from '../../components/Admin_Navbar'
import SideMenu from '../../components/SideMenu'
import WarehouseFilters from './WarehouseFilters'
import { WarehouseCards, WarehouseTable } from './WarehouseTable'
import {
  CancelModal,
  EditModal,
  BulkManualModal,
  LogisticsChoiceModal,
  ManualBookingModal,
  StatusModal,
  TrackModal,
  ViewModal,
} from './WarehouseModals'
import { BluedartBookingModal, BulkBluedartModal, openLabel } from './BluedartModals'
import { PAGE_SIZE, SHADOW } from './constants'
import {
  errorMessage,
  fetchAllPaidLeads,
  fetchFilterOptions,
  fetchPaidLeads,
  isCancelled,
} from './warehouseApi'
import { exportLogisticsToExcel } from './logisticsExport'

const EMPTY_FILTERS = {
  search: '',
  lotNo: '',
  companyIds: [],
  storeId: '',
  status: '',
  fromDate: '',
  toDate: '',
}

// Filters as sent to the API; a date range counts only when both ends are set.
const effectiveFilters = (filters) => {
  const hasRange = Boolean(filters.fromDate && filters.toDate)
  return {
    search: filters.search,
    lotNo: filters.lotNo,
    companyIds: filters.companyIds,
    storeIds: filters.storeId,
    status: filters.status,
    fromDate: hasRange ? filters.fromDate : '',
    toDate: hasRange ? filters.toDate : '',
  }
}

const MODALS = {
  view: ViewModal,
  edit: EditModal,
  manual: ManualBookingModal,
  status: StatusModal,
  cancel: CancelModal,
  bluedart: BluedartBookingModal,
  request: LogisticsChoiceModal,
  track: TrackModal,
}

const Pagination = ({ page, totalPages, setPage }) => {
  if (totalPages <= 1) {
    return null
  }
  const btn = (disabled) =>
    `px-4 py-2 rounded-lg text-sm font-medium ${
      disabled ? 'bg-gray-400 text-gray-600 cursor-not-allowed' : 'bg-primary text-white'
    }`
  return (
    <div className='flex flex-col sm:flex-row items-center justify-between gap-3 my-4'>
      <span className='text-sm text-gray-600'>
        Page {page + 1} of {totalPages}
      </span>
      <div className='flex gap-2'>
        <button disabled={page <= 0} onClick={() => setPage((p) => p - 1)} className={btn(page <= 0)}>
          Previous
        </button>
        <button
          disabled={page + 1 >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className={btn(page + 1 >= totalPages)}
        >
          Next
        </button>
      </div>
    </div>
  )
}

Pagination.propTypes = {
  page: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  setPage: PropTypes.func.isRequired,
}

// Loading, error, empty or the table/cards with pagination.
const ListContent = ({ loading, error, leads, selection, onAction, onToggleAll, page, totalPages, setPage }) => {
  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <BeatLoader color='var(--primary-color)' />
      </div>
    )
  }
  if (error) {
    return <div className='text-center py-10 text-red-500 bg-red-50 rounded-lg'>{error}</div>
  }
  if (leads.length === 0) {
    return (
      <p className='text-center py-10 text-gray-500 bg-white rounded-lg'>
        No items match the selected filters.
      </p>
    )
  }
  return (
    <>
      <WarehouseTable leads={leads} onAction={onAction} onToggleAll={onToggleAll} {...selection} />
      <WarehouseCards leads={leads} onAction={onAction} {...selection} />
      <Pagination page={page} totalPages={totalPages} setPage={setPage} />
    </>
  )
}

ListContent.propTypes = {
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string.isRequired,
  leads: PropTypes.arrayOf(PropTypes.object).isRequired,
  selection: PropTypes.shape({ selectedIds: PropTypes.array, onToggle: PropTypes.func }).isRequired,
  onAction: PropTypes.func.isRequired,
  onToggleAll: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  setPage: PropTypes.func.isRequired,
}

// Bulk flows started from the selection bar.
const BulkModals = ({ modal, leads, services, onClose, onDone, setModal }) => {
  if (modal?.type === 'bulkChoice') {
    return (
      <LogisticsChoiceModal
        count={leads.length}
        onClose={onClose}
        onChoose={(type) => setModal({ type: type === 'bluedart' ? 'bulkBluedart' : 'bulkManual' })}
      />
    )
  }
  if (modal?.type === 'bulkBluedart') {
    return <BulkBluedartModal leads={leads} services={services} onClose={onClose} onDone={onDone} />
  }
  if (modal?.type === 'bulkManual') {
    return <BulkManualModal leads={leads} onClose={onClose} onDone={onDone} />
  }
  return null
}

BulkModals.propTypes = {
  modal: PropTypes.shape({ type: PropTypes.string }),
  leads: PropTypes.arrayOf(PropTypes.object).isRequired,
  services: PropTypes.array.isRequired,
  onClose: PropTypes.func.isRequired,
  onDone: PropTypes.func.isRequired,
  setModal: PropTypes.func.isRequired,
}

const Notice = ({ notice }) => {
  if (!notice.text) {
    return null
  }
  const tone = notice.tone === 'red' ? 'bg-red-600' : 'bg-green-600'
  return (
    <div
      role='status'
      className={`fixed top-20 right-4 z-50 max-w-sm text-white text-sm px-4 py-2 rounded-lg shadow-lg ${tone}`}
    >
      {notice.text}
    </div>
  )
}

Notice.propTypes = {
  notice: PropTypes.shape({ text: PropTypes.string, tone: PropTypes.string }).isRequired,
}

const BULK_BAR_CLASS = [
  'fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-xl',
  'bg-white border border-primary rounded-lg shadow-xl px-4 py-3',
  'flex flex-col sm:flex-row items-center justify-between gap-3',
].join(' ')

// Bar shown while rows are ticked: clear the selection or request logistics.
const BulkActionBar = ({ count, onClear, onRequest }) => {
  if (count === 0) {
    return null
  }
  return (
    <div className={BULK_BAR_CLASS}>
      <span className='text-sm text-gray-700'>
        <span className='font-semibold'>{count}</span> item
        {count === 1 ? '' : 's'} selected
      </span>
      <div className='flex gap-2'>
        <button
          type='button'
          onClick={onClear}
          className='px-3 py-1.5 rounded border border-gray-300 text-sm text-gray-700'
        >
          Clear
        </button>
        <button
          type='button'
          onClick={onRequest}
          className='px-3 py-1.5 rounded bg-primary text-white text-sm font-medium'
        >
          Request Logistics
        </button>
      </div>
    </div>
  )
}

BulkActionBar.propTypes = {
  count: PropTypes.number.isRequired,
  onClear: PropTypes.func.isRequired,
  onRequest: PropTypes.func.isRequired,
}

const Logistics = () => {
  const [sideMenu, setSideMenu] = useState(false)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [page, setPage] = useState(0)
  const [leads, setLeads] = useState([])
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 })
  const [options, setOptions] = useState({
    companies: [],
    stores: [],
    statuses: [],
    services: [],
    bluedartConfigured: false,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null)
  const [notice, setNotice] = useState({ text: '', tone: 'green' })
  const [exporting, setExporting] = useState(false)
  // Bulk actions apply only to the rows ticked on the current page.
  const [selectedIds, setSelectedIds] = useState([])

  // Filter lists are loaded once per visit (StrictMode would run it twice).
  const optionsRequested = useRef(false)
  useEffect(() => {
    if (optionsRequested.current) {
      return
    }
    optionsRequested.current = true
    fetchFilterOptions()
      .then(setOptions)
      .catch(() => setOptions((o) => o))
  }, [])

  // The query actually sent: a date range applies only once both ends are
  // picked, so picking one date does not refetch the same list.
  const queryKey = useMemo(
    () => JSON.stringify({ page, limit: PAGE_SIZE, ...effectiveFilters(filters) }),
    [filters, page]
  )

  // One list request at a time: the same query is never sent twice while in
  // flight, and a newer query cancels the older one so a slow response cannot
  // overwrite newer results.
  const inFlight = useRef(null)
  const load = useCallback(async (key, { force = false } = {}) => {
    if (!force && inFlight.current?.key === key) {
      return
    }
    inFlight.current?.controller.abort()
    const controller = new AbortController()
    inFlight.current = { key, controller }
    setLoading(true)
    setError('')
    try {
      const result = await fetchPaidLeads(JSON.parse(key), controller.signal)
      setLeads(result.data || [])
      setPagination(result.pagination || { total: 0, totalPages: 0 })
    } catch (err) {
      if (isCancelled(err)) {
        return
      }
      setError(errorMessage(err, 'Failed to fetch warehouse items.'))
      setLeads([])
    } finally {
      if (inFlight.current?.controller === controller) {
        inFlight.current = null
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    setSelectedIds([])
    load(queryKey)
  }, [queryKey, load])

  const refresh = useCallback(() => load(queryKey, { force: true }), [load, queryKey])

  useEffect(() => {
    if (!notice.text) {
      return undefined
    }
    const timer = setTimeout(() => setNotice({ text: '', tone: 'green' }), 5000)
    return () => clearTimeout(timer)
  }, [notice])

  // Back to page 1 only when the filters actually sent change (picking just
  // one date keeps the current page and does not refetch).
  const changeFilters = (patch) => {
    const next = { ...filters, ...patch }
    if (JSON.stringify(effectiveFilters(next)) !== JSON.stringify(effectiveFilters(filters))) {
      setPage(0)
    }
    setFilters(next)
  }

  const clearFilters = () => {
    setPage(0)
    setFilters(EMPTY_FILTERS)
  }

  const closeModal = useCallback(() => setModal(null), [])

  const actionDone = (message) => {
    setModal(null)
    setSelectedIds([])
    setNotice({ text: message || 'Saved', tone: 'green' })
    refresh()
  }

  const toggleSelected = (id) =>
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))

  const toggleAll = (ids, select) =>
    setSelectedIds((current) =>
      select ? [...new Set([...current, ...ids])] : current.filter((id) => !ids.includes(id))
    )

  const handleAction = (type, lead) => {
    if (type === 'label') {
      openLabel(lead._id, (text) => setNotice({ text, tone: 'red' }))
      return
    }
    setModal({ type, lead })
  }

  // Exports every row matching the current filters, not just the open page.
  const exportRows = async () => {
    if (exporting) {
      return
    }
    setExporting(true)
    try {
      const rows = await fetchAllPaidLeads(effectiveFilters(filters))
      if (rows.length === 0) {
        setNotice({ text: 'Nothing to export for the selected filters.', tone: 'red' })
        return
      }
      const count = exportLogisticsToExcel(rows)
      setNotice({
        text: `Exported ${count} item${count === 1 ? '' : 's'} to Excel.`,
        tone: 'green',
      })
    } catch (err) {
      setNotice({ text: errorMessage(err, 'Export failed. Please try again.'), tone: 'red' })
    } finally {
      setExporting(false)
    }
  }

  const selectedLeads = leads.filter((l) => selectedIds.includes(l._id))
  const ActiveModal = modal && MODALS[modal.type] ? MODALS[modal.type] : null

  return (
    <div className='min-h-screen pb-8 bg-[#F5F4F9]'>
      <AdminNavbar setsideMenu={setSideMenu} sideMenu={sideMenu} />
      <SideMenu setsideMenu={setSideMenu} sideMenu={sideMenu} />

      {ActiveModal && (
        <ActiveModal
          lead={modal.lead}
          onClose={closeModal}
          onDone={actionDone}
          onUseManual={() => setModal({ type: 'manual', lead: modal.lead })}
          onChoose={(type) => setModal({ type, lead: modal.lead })}
        />
      )}
      <BulkModals
        modal={modal}
        leads={selectedLeads}
        services={options.services}
        onClose={closeModal}
        onDone={actionDone}
        setModal={setModal}
      />

      <Notice notice={notice} />

      <BulkActionBar
        count={selectedIds.length}
        onClear={() => setSelectedIds([])}
        onRequest={() => setModal({ type: 'bulkChoice' })}
      />

      <div className='mx-auto max-w-[1600px] px-3 sm:px-4 md:px-6 mt-4 md:mt-8'>
        <div className='flex items-end justify-between gap-3 mb-4'>
          <div>
            <h1 className='text-2xl md:text-3xl font-bold text-gray-800'>Warehouse</h1>
            <p className='text-sm text-gray-500 mt-1'>
              Items with confirmed payment
              {pagination.total ? ` · ${pagination.total} items` : ''}
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <button
              type='button'
              onClick={exportRows}
              disabled={exporting}
              aria-label='Export warehouse items to Excel'
              title='Download every item matching the current filters as an Excel file'
              className={`flex items-center gap-2 bg-primary text-white rounded-[0.55rem] px-3 py-1.5 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed ${SHADOW}`}
            >
              {exporting ? <BeatLoader color='white' size={6} /> : <FaDownload size={16} />}
              {exporting ? 'Exporting…' : 'Export'}
            </button>
            <button
              type='button'
              onClick={refresh}
              aria-label='Refresh'
              className={`bg-primary text-white rounded-[0.55rem] p-1.5 ${SHADOW}`}
            >
              <IoRefresh size={22} />
            </button>
          </div>
        </div>

        <WarehouseFilters
          options={options}
          filters={filters}
          onChange={changeFilters}
          onClear={clearFilters}
        />

        <ListContent
          loading={loading}
          error={error}
          leads={leads}
          selection={{ selectedIds, onToggle: toggleSelected }}
          onAction={handleAction}
          onToggleAll={toggleAll}
          page={page}
          totalPages={pagination.totalPages || 0}
          setPage={setPage}
        />
      </div>
    </div>
  )
}

export default Logistics
