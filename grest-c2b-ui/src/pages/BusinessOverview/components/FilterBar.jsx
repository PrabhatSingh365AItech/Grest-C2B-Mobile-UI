import React from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { IoRefresh } from 'react-icons/io5'
import { FaDownload } from 'react-icons/fa'
import { MultiSelect } from 'react-multi-select-component'
import { DATE_PRESETS } from '../utils/dateRange'

// Maps between the id arrays kept in state and the {label, value} options
// the multi-select expects.
const FilterSelect = ({ label, allLabel, options, selectedIds, onChange }) => {
  const selected = options.filter((o) => selectedIds.includes(o.value))
  return (
    <div className='bo-multiselect w-full sm:w-[220px] text-sm' title={label}>
      <MultiSelect
        labelledBy={label}
        options={options}
        value={selected}
        onChange={(list) => onChange(list.map((o) => o.value))}
        hasSelectAll
        overrideStrings={{
          selectSomeItems: allLabel,
          allItemsAreSelected: allLabel,
          selectAll: 'Select all',
          search: `Search ${label.toLowerCase()}…`,
          noOptions: 'No options',
        }}
        valueRenderer={(sel) => {
          if (!sel.length || sel.length === options.length) {
            return allLabel
          }
          return sel.length === 1 ? sel[0].label : `${sel.length} ${label.toLowerCase()} selected`
        }}
      />
    </div>
  )
}

const Segmented = ({ options, value, onChange, ariaLabel }) => (
  <div
    role='group'
    aria-label={ariaLabel}
    className='inline-flex flex-wrap rounded-md border border-gray-300 bg-white overflow-hidden'
  >
    {options.map((o) => (
      <button
        key={o.key}
        type='button'
        onClick={() => onChange(o.key)}
        aria-pressed={value === o.key}
        className={`px-3 py-1.5 text-sm border-r last:border-r-0 border-gray-200 transition-colors ${
          value === o.key
            ? 'bg-primary text-white'
            : 'text-gray-700 hover:bg-gray-50'
        }`}
      >
        {o.label}
      </button>
    ))}
  </div>
)

const FilterBar = ({
  preset,
  setPreset,
  customRange,
  setCustomRange,
  canPickCompany,
  companies,
  companyIds,
  setCompanyIds,
  categories,
  categoryCodes,
  setCategoryCodes,
  storeOptions,
  storeIds,
  setStoreIds,
  metric,
  setMetric,
  onRefresh,
  onDownload,
  onDownloadDump,
  canDownload,
  isLoading,
  lastUpdated,
}) => (
  <div className='flex flex-col gap-3'>
    <div className='flex flex-wrap items-center gap-2'>
      <Segmented
        ariaLabel='Date range'
        options={DATE_PRESETS}
        value={preset}
        onChange={setPreset}
      />
      {preset === 'custom' && (
        <div className='flex flex-wrap items-center gap-2'>
          <DatePicker
            selected={customRange.from}
            onChange={(d) => setCustomRange((r) => ({ ...r, from: d }))}
            selectsStart
            startDate={customRange.from}
            endDate={customRange.to}
            maxDate={customRange.to || new Date()}
            dateFormat='dd MMM yyyy'
            placeholderText='From'
            className='p-[6px] w-[140px] border border-gray-300 rounded-md'
          />
          <DatePicker
            selected={customRange.to}
            onChange={(d) => setCustomRange((r) => ({ ...r, to: d }))}
            selectsEnd
            startDate={customRange.from}
            endDate={customRange.to}
            minDate={customRange.from}
            maxDate={new Date()}
            dateFormat='dd MMM yyyy'
            placeholderText='To'
            className='p-[6px] w-[140px] border border-gray-300 rounded-md'
          />
        </div>
      )}
    </div>

    <div className='flex flex-wrap items-center gap-2'>
      {canPickCompany && (
        <FilterSelect
          label='Companies'
          allLabel='All companies'
          options={companies.map((c) => ({
            value: c._id,
            label: c.companyCode ? `${c.name} (${c.companyCode})` : c.name,
          }))}
          selectedIds={companyIds}
          onChange={setCompanyIds}
        />
      )}
      <FilterSelect
        label='Stores'
        allLabel={companyIds.length ? 'All stores of selection' : 'All stores'}
        options={storeOptions.map((s) => ({
          value: s._id,
          label: s.region ? `${s.storeName} · ${s.region}` : s.storeName,
        }))}
        selectedIds={storeIds}
        onChange={setStoreIds}
      />
      <FilterSelect
        label='Categories'
        allLabel='All categories'
        options={categories.map((c) => ({ value: c.categoryCode, label: c.categoryName }))}
        selectedIds={categoryCodes}
        onChange={setCategoryCodes}
      />

      <Segmented
        ariaLabel='Rank by'
        options={[
          { key: 'count', label: 'By devices' },
          { key: 'value', label: 'By value' },
        ]}
        value={metric}
        onChange={setMetric}
      />

      <div className='flex items-center gap-3 ml-auto'>
        {lastUpdated && (
          <span className='text-xs text-gray-500'>
            Updated{' '}
            {lastUpdated.toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )}
        <button
          type='button'
          onClick={onDownload}
          disabled={!canDownload}
          className='flex items-center gap-1.5 text-sm px-3 py-2 rounded-md bg-primary text-white hover:opacity-90 disabled:opacity-40'
        >
          <FaDownload size={13} />
          Download report
        </button>
        <button
          type='button'
          onClick={onDownloadDump}
          disabled={!canDownload}
          title='One row per purchased device: customer, pricing and IMEI'
          className='flex items-center gap-1.5 text-sm px-3 py-2 rounded-md border border-primary text-primary bg-white hover:bg-red-50 disabled:opacity-40'
        >
          <FaDownload size={13} />
          Device dump
        </button>
        <button
          type='button'
          onClick={onRefresh}
          disabled={isLoading}
          className='flex items-center gap-1.5 text-sm px-3 py-2 rounded-md border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50'
        >
          <IoRefresh className={isLoading ? 'animate-spin' : ''} size={16} />
          Refresh
        </button>
      </div>
    </div>
  </div>
)

export default FilterBar
