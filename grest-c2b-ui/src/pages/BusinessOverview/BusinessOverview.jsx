import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { USER_ROLES } from '../../constants/roleConstants'
import AdminNavbar from '../../components/Admin_Navbar'
import SideMenu from '../../components/SideMenu'
import Panel from './components/Panel'
import KpiTiles from './components/KpiTiles'
import TrendChart from './components/TrendChart'
import DonutCard from './components/DonutCard'
import LeaderTable from './components/LeaderTable'
import FilterBar from './components/FilterBar'
import FocusChips from './components/FocusChips'
import DailyTracker from './components/DailyTracker'
import CommissionRates from './components/CommissionRates'
import FilteredBreakdown from './components/FilteredBreakdown'
import { useBusinessOverview } from './hooks/useBusinessOverview'
import { useDailyTracker } from './hooks/useDailyTracker'
import { formatCount, formatINR, formatPct } from './utils/format'
import { MAX_RECORDS } from './services/businessOverviewService'
import {
  breakdownRows,
  downloadReport,
  downloadSheet,
  downloadSheets,
  downloadDeviceDump,
  downloadTracker,
} from './utils/exportExcel'
import { RECENT_WINDOWS } from './utils/dailyTracker'
import { IoRefresh } from 'react-icons/io5'
import './BusinessOverview.css'

const MODEL_COLUMNS = [
  { key: 'count', label: 'Devices', format: formatCount },
  { key: 'value', label: 'Value', format: formatINR },
  { key: 'avgTicket', label: 'Avg ticket', format: formatINR },
]

const STAFF_COLUMNS = [
  { key: 'count', label: 'Devices', format: formatCount },
  { key: 'value', label: 'Value', format: formatINR },
  { key: 'stores', label: 'Stores', format: formatCount },
  { key: 'receivedPct', label: 'Received', format: formatPct },
]

const COMPANY_COLUMNS = [
  { key: 'count', label: 'Devices', format: formatCount },
  { key: 'value', label: 'Value', format: formatINR },
  { key: 'stores', label: 'Active stores', format: formatCount },
  { key: 'avgTicket', label: 'Avg ticket', format: formatINR },
  { key: 'receivedPct', label: 'Received', format: formatPct },
]

// Share cards in the Device mix frame, in display order.
const DONUT_CARDS = [
  {
    dim: 'company',
    key: 'byCompany',
    title: 'Devices by Company',
    noun: 'companies',
    sheet: 'Companies',
    sheetHeader: 'Company',
  },
  {
    dim: 'store',
    key: 'byStore',
    title: 'Devices by Store',
    noun: 'stores',
    sheet: 'Stores',
    sheetHeader: 'Store',
  },
  {
    dim: 'category',
    key: 'byCategory',
    title: 'Devices by Category',
    noun: 'categories',
    sheet: 'Categories',
    sheetHeader: 'Category',
  },
  {
    dim: 'brand',
    key: 'byBrand',
    title: 'Devices by Brand',
    noun: 'brands',
    sheet: 'Brands',
    sheetHeader: 'Brand',
  },
  {
    dim: 'grade',
    key: 'byGrade',
    title: 'Devices by Grade',
    noun: 'grades',
    sheet: 'Grades',
    sheetHeader: 'Grade',
    scale: 'ordinal',
  },
  {
    dim: 'stage',
    key: 'byStage',
    title: 'Devices by Stage',
    noun: 'stages',
    sheet: 'Stages',
    sheetHeader: 'Stage',
  },
]

const SectionTitle = ({ children }) => (
  <h2 className='text-sm font-semibold uppercase tracking-wider text-gray-500 mt-4'>{children}</h2>
)

const ALLOWED_ROLES = [
  USER_ROLES.SUPER_ADMIN,
  USER_ROLES.SUPER_ADMIN_UNICORN,
  USER_ROLES.COMPANY_ADMIN,
  USER_ROLES.ADMIN_MANAGER,
  USER_ROLES.ADMIN_MANAGER_UNICORN,
]

const BusinessOverview = () => {
  const profile = JSON.parse(sessionStorage.getItem('profile') || 'null')
  if (!profile || !ALLOWED_ROLES.includes(profile.role)) {
    return <Navigate to='/' replace />
  }
  return <BusinessOverviewPage />
}

const BusinessOverviewPage = () => {
  const [sideMenu, setsideMenu] = useState(false)
  const [metric, setMetric] = useState('count')
  const [showRates, setShowRates] = useState(false)
  const o = useBusinessOverview()
  const { view, focus, toggleFocus } = o
  const tracker = useDailyTracker({
    categories: o.categories,
    companyKey: o.companyKey,
    storeOptions: o.storeOptions,
    storeIds: o.storeIds,
    companies: o.companies,
  })
  const refreshAll = () => {
    o.fetchData()
    tracker.refresh()
  }
  // Title follows the company selection, like "Vijay Sales Daily Tracker".
  const selectedCompanyNames = o.companies
    .filter((c) => o.companyIds.includes(c._id))
    .map((c) => c.name)
  const trackerTitle =
    selectedCompanyNames.length === 1 ? `${selectedCompanyNames[0]} Daily Tracker` : 'Daily Tracker'
  const trackerAsOf = tracker.windows.now.toLocaleDateString('en-GB')
  const trackerExport = {
    rows: tracker.rows,
    totals: tracker.totals,
    title: trackerTitle,
    asOf: trackerAsOf,
    recentLabel: tracker.windows.recentLabel,
    recentReady: tracker.recentReady,
    monthReady: tracker.monthReady,
  }

  const rangeLabel = `${o.range.from.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })} – ${o.range.to.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })}`

  const panelProps = (dimension) => ({
    metric,
    focusId: focus[dimension]?.id,
    onSelect: (row) => toggleFocus(dimension, row),
  })

  // Card download: the full breakdown behind the card, not just the visible page.
  const download = (name, rows, labelHeader, extraHeader) => () =>
    downloadSheet(name, breakdownRows(rows, labelHeader, extraHeader), o.range)

  const namesOf = (ids, list, idKey, nameKey) =>
    ids.length
      ? list
          .filter((x) => ids.includes(x[idKey]))
          .map((x) => x[nameKey])
          .join(', ')
      : 'All'

  const handleDownloadReport = () => {
    const filterSummary = [
      ...(o.canPickCompany
        ? [['Companies', namesOf(o.companyIds, o.companies, '_id', 'name')]]
        : []),
      ['Stores', namesOf(o.storeIds, o.storeOptions, '_id', 'storeName')],
      ['Categories', namesOf(o.categoryCodes, o.categories, 'categoryCode', 'categoryName')],
      ...Object.entries(focus)
        .filter(([, f]) => f)
        .map(([dim, f]) => [`Focused ${dim}`, f.label]),
    ]
    downloadReport({
      view,
      records: view.records,
      range: o.range,
      filterSummary,
      tracker: trackerExport,
    })
  }

  const awaitingCustomDates = o.preset === 'custom' && (!o.customRange.from || !o.customRange.to)
  // First load shows a skeleton; later reloads dim the stale view instead.
  const ready = !awaitingCustomDates && !(o.isLoading && !o.hasData)
  const dimWhileLoading = o.isLoading ? 'opacity-50 pointer-events-none' : ''

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='navbar'>
        <AdminNavbar setsideMenu={setsideMenu} sideMenu={sideMenu} />
        <SideMenu setsideMenu={setsideMenu} sideMenu={sideMenu} />
      </div>

      <main className='max-w-[1440px] mx-auto px-4 md:px-6 py-5 flex flex-col gap-4'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h1 className='text-2xl font-semibold text-gray-900'>Business Overview</h1>
            <p className='text-sm text-gray-500'>Purchased devices · {rangeLabel}</p>
          </div>
        </div>

        <div className='bg-white rounded-xl border border-gray-200 shadow-sm p-3 md:p-4 flex flex-col gap-3'>
          <FilterBar
            {...o}
            metric={metric}
            setMetric={setMetric}
            onRefresh={refreshAll}
            onDownload={handleDownloadReport}
            onDownloadDump={() =>
              downloadDeviceDump(
                view.records,
                o.range,
                JSON.parse(sessionStorage.getItem('profile') || '{}')?.role
              )
            }
            canDownload={!o.isLoading && view.kpis.count > 0}
          />
          <FocusChips focus={focus} onClear={o.clearFocus} />
        </div>

        {o.error && (
          <div className='rounded-md border border-red-200 bg-red-50 text-red-800 text-sm px-4 py-3'>
            {o.error}
          </div>
        )}
        {o.truncated && (
          <div className='rounded-md border border-amber-200 bg-amber-50 text-amber-900 text-sm px-4 py-3'>
            This range has more than {formatCount(MAX_RECORDS)} purchases, so only the first{' '}
            {formatCount(MAX_RECORDS)} are included. Narrow the date range or pick a company for
            exact numbers.
          </div>
        )}
        {o.partial && (
          <div className='rounded-md border border-amber-200 bg-amber-50 text-amber-900 text-sm px-4 py-3'>
            {o.partial.count} chunk(s) of data could not be loaded after retries
            {o.partial.reason ? ` (${o.partial.reason})` : ''}, so figures may be slightly
            understated. Use Refresh to try again.
          </div>
        )}
        {o.gaps > 0 && (
          <div className='rounded-md border border-amber-200 bg-amber-50 text-amber-900 text-sm px-4 py-3'>
            The server reported {formatCount(o.gaps)} more record(s) than it returned while paging
            (its result order isn&apos;t stable), so figures may be slightly understated. Duplicates
            it returned have been removed. Refresh may recover them.
          </div>
        )}
        {awaitingCustomDates && (
          <div className='rounded-md border border-gray-200 bg-white text-gray-600 text-sm px-4 py-3'>
            Pick both a from and a to date to load the custom range.
          </div>
        )}

        {awaitingCustomDates ? null : !ready ? (
          <>
            {o.progress.total > 0 && (
              <p className='text-xs text-gray-500'>
                Loading purchases… {formatCount(o.progress.loaded)} of{' '}
                {formatCount(o.progress.total)} records
              </p>
            )}
            <LoadingSkeleton />
          </>
        ) : (
          <div className={`flex flex-col gap-4 transition-opacity ${dimWhileLoading}`}>
            <KpiTiles
              kpis={view.kpis}
              totalStores={view.totalStores}
              commissionRows={view.commissionByCompany}
              commissionRates={o.commissionRates}
              onEditRates={() => setShowRates(true)}
            />

            <SectionTitle>Device mix</SectionTitle>
            <Panel
              title='Device mix'
              subtitle='Share of purchases · click a slice or row to focus the dashboard'
              onDownload={() =>
                downloadSheets(
                  'Device mix',
                  DONUT_CARDS.map((c) => ({
                    name: c.sheet,
                    rows: breakdownRows(view[c.key], c.sheetHeader),
                  })),
                  o.range,
                )
              }
            >
              <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
                {DONUT_CARDS.map((c) => (
                  <DonutCard
                    // Re-mount when the page-level metric changes so cards follow it.
                    key={`${c.dim}-${metric}`}
                    title={c.title}
                    rows={view[c.key]}
                    noun={c.noun}
                    scale={c.scale}
                    defaultMetric={metric}
                    focusId={focus[c.dim]?.id}
                    onSelect={(row) => toggleFocus(c.dim, row)}
                  />
                ))}
              </div>
            </Panel>

            <Panel
              title={
                metric === 'value' ? 'Purchase value over time' : 'Devices purchased over time'
              }
              subtitle={
                { hour: 'Hourly', week: 'Weekly' }[view.trend.granularity] || 'Daily'
              }
              onDownload={() =>
                downloadSheet(
                  'Trend',
                  view.trend.buckets.map((b) => ({
                    [{ hour: 'Hour', week: 'Week starting' }[view.trend.granularity] ||
                    'Date']: b.key,
                    Devices: b.count,
                    'Value (INR)': Math.round(b.value),
                  })),
                  o.range,
                )
              }
            >
              <TrendChart
                buckets={view.trend.buckets}
                granularity={view.trend.granularity}
                metric={metric}
              />
            </Panel>

            <SectionTitle>Companies</SectionTitle>
            <Panel title='By company' onDownload={download('Companies', view.byCompany, 'Company')}>
              <LeaderTable
                rows={view.byCompany}
                labelHeader='Company'
                columns={COMPANY_COLUMNS}
                searchPlaceholder='Search company…'
                {...panelProps('company')}
              />
            </Panel>

            <SectionTitle>Stores</SectionTitle>
            <Panel
              title='Store leaderboard'
              subtitle={`${formatCount(view.kpis.activeStores)} stores purchased at least one device`}
              onDownload={download('Stores', view.byStore, 'Store', 'Region')}
            >
              <LeaderTable
                rows={view.byStore}
                labelHeader='Store'
                extraHeader='Region'
                searchPlaceholder='Search store or region…'
                {...panelProps('store')}
              />
            </Panel>
          </div>
        )}

        {/* Renders as soon as FOS + quotes arrive; conversions fill in later. */}
        <Panel
          title={trackerTitle}
          subtitle={`As of ${trackerAsOf} · short window: ${tracker.windows.recentLabel.toLowerCase()} · last 1 month = ${tracker.windows.monthFrom.toLocaleDateString('en-GB')} to today · all categories`}
          action={
            <div className='flex flex-wrap items-center justify-end gap-2'>
              <div
                role='group'
                aria-label='Tracker window'
                className='inline-flex rounded-md border border-gray-300 bg-white overflow-hidden'
              >
                {Object.entries(RECENT_WINDOWS).map(([key, w]) => (
                  <button
                    key={key}
                    type='button'
                    onClick={() => tracker.setRecentKey(key)}
                    aria-pressed={tracker.recentKey === key}
                    className={`px-2.5 py-1.5 text-xs border-r last:border-r-0 border-gray-200 ${
                      tracker.recentKey === key
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
              <button
                type='button'
                onClick={tracker.refresh}
                disabled={tracker.isLoading}
                title='Reload tracker'
                className='flex items-center gap-1.5 text-xs font-medium text-gray-600 px-2.5 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50'
              >
                <IoRefresh
                  className={tracker.isLoading || !tracker.monthReady ? 'animate-spin' : ''}
                  size={13}
                />
                Refresh
              </button>
            </div>
          }
          onDownload={tracker.rows.length ? () => downloadTracker(trackerExport) : undefined}
        >
          <DailyTracker
            rows={tracker.rows}
            totals={tracker.totals}
            recentLabel={tracker.windows.recentLabel}
            isLoading={tracker.isLoading}
            recentReady={tracker.recentReady}
            monthReady={tracker.monthReady}
            recentProgress={tracker.recentProgress}
            monthProgress={tracker.monthProgress}
            error={tracker.error}
            conversionsError={tracker.conversionsError}
          />
        </Panel>

        {ready && (
          <div className={`flex flex-col gap-4 transition-opacity ${dimWhileLoading}`}>
            <SectionTitle>Models & staff</SectionTitle>
            <div className='grid grid-cols-1 xl:grid-cols-2 gap-4'>
              <FilteredBreakdown
                title='Top models'
                sheetName='Models'
                records={view.records}
                dimension='model'
                labelHeader='Model'
                extraHeader='Brand'
                columns={MODEL_COLUMNS}
                searchPlaceholder='Search model…'
                range={o.range}
                categories={o.categories}
                companyKey={o.companyKey}
                scopeRecords={o.scopeRecords}
              />
              <FilteredBreakdown
                title='Staff leaderboard'
                sheetName='Staff'
                records={view.records}
                dimension='staff'
                labelHeader='Staff'
                extraHeader='Store'
                columns={STAFF_COLUMNS}
                searchPlaceholder='Search staff or store…'
                range={o.range}
                categories={o.categories}
                companyKey={o.companyKey}
                scopeRecords={o.scopeRecords}
              />
            </div>
          </div>
        )}
      </main>

      {showRates && (
        <CommissionRates
          companies={o.companies.length ? o.companies : o.companiesInData}
          rates={o.commissionRates}
          onSave={o.setCommissionRates}
          onClose={() => setShowRates(false)}
        />
      )}
    </div>
  )
}

const LoadingSkeleton = () => (
  <div className='flex flex-col gap-4 animate-pulse'>
    <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3'>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className='h-[92px] bg-white border border-gray-200 rounded-xl' />
      ))}
    </div>
    <div className='h-[280px] bg-white border border-gray-200 rounded-xl' />
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
      <div className='h-[320px] bg-white border border-gray-200 rounded-xl lg:col-span-2' />
      <div className='h-[320px] bg-white border border-gray-200 rounded-xl' />
    </div>
  </div>
)

export default BusinessOverview
