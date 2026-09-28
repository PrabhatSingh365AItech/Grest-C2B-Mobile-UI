// Warranty uplift configuration
export const WARRANTY_UPLIFTS = {
  '0_3_months': 0.08, // 8%
  '3_6_months': 0.03, // 3%
  '6_11_months': 0.0, // 0%
  above_11_months: 0.0, //
  out_of_warranty: 0,
}

// Accessories deduction configuration
export const ACCESSORIES_DEDUCTIONS = {
  mobile: {
    thresholds: {
      tierA: 30000, // Below 30k
      tierB: 30000, // 30k and above
    },
    deductions: {
      // [box_missing, cable_missing] -> deduction amount
      tierA: {
        present_present: 0,
        missing_present: 350,
        present_missing: 350,
        missing_missing: 700,
      },
      tierB: {
        present_present: 0,
        missing_present: 500,
        present_missing: 500,
        missing_missing: 1000,
      },
    },
  },
  ipad: {
    threshold: 10000, // Rs. 10,000
    deductions: {
      present_present: 0,
      missing_present: 500,
      present_missing: 500,
      missing_missing: 1000,
    },
  },
  watch: {
    threshold: 5000, // Rs. 5,000
    deductions: {
      // One missing (any of Box/Cable/Strap)
      one_missing: 500,
      // Two missing (any pair)
      two_missing: 1000,
      // All three missing
      all_missing: 1500,
      // All present
      all_present: 0,
    },
  },
}

export const calculateWarrantyUplift = (devicePrice, warrantyRange) => {
  const upliftPercentage = WARRANTY_UPLIFTS[warrantyRange] || 0
  return devicePrice * upliftPercentage
}

export const calculateMobileAccessoriesDeduction = (
  devicePrice,
  boxMissing,
  cableMissing
) => {
  const config = ACCESSORIES_DEDUCTIONS.mobile
  const tier = devicePrice >= config.thresholds.tierB ? 'tierB' : 'tierA'

  let deductionKey
  if (!boxMissing && !cableMissing) {
    deductionKey = 'present_present'
  } else if (boxMissing && !cableMissing) {
    deductionKey = 'missing_present'
  } else if (!boxMissing && cableMissing) {
    deductionKey = 'present_missing'
  } else {
    deductionKey = 'missing_missing'
  }

  return config.deductions[tier][deductionKey]
}

export const calculateIPadAccessoriesDeduction = (
  devicePrice,
  boxMissing,
  cableMissing
) => {
  const config = ACCESSORIES_DEDUCTIONS.ipad

  // If price is below threshold, no deduction
  if (devicePrice < config.threshold) {
    return 0
  }

  let deductionKey
  if (!boxMissing && !cableMissing) {
    deductionKey = 'present_present'
  } else if (boxMissing && !cableMissing) {
    deductionKey = 'missing_present'
  } else if (!boxMissing && cableMissing) {
    deductionKey = 'present_missing'
  } else {
    deductionKey = 'missing_missing'
  }

  return config.deductions[deductionKey]
}

export const calculateWatchAccessoriesDeduction = (
  devicePrice,
  boxMissing,
  cableMissing,
  strapMissing
) => {
  const config = ACCESSORIES_DEDUCTIONS.watch

  // If price is below threshold, no deduction
  if (devicePrice <= config.threshold) {
    return 0
  }

  const missingCount = [boxMissing, cableMissing, strapMissing].filter(
    Boolean
  ).length

  if (missingCount === 0) {
    return config.deductions.all_present
  } else if (missingCount === 1) {
    return config.deductions.one_missing
  } else if (missingCount === 2) {
    return config.deductions.two_missing
  } else {
    return config.deductions.all_missing
  }
}

export const calculateFinalPrice = (
  aPlusPrice,
  devicePrice,
  deviceType,
  warrantyRange,
  accessories
) => {
  const warrantyUplift = calculateWarrantyUplift(devicePrice, warrantyRange)

  let accessoriesDeduction = 0

  switch (deviceType.toLowerCase()) {
    case 'mobile':
    case 'phone':
      accessoriesDeduction = calculateMobileAccessoriesDeduction(
        aPlusPrice,
        accessories.boxMissing,
        accessories.cableMissing
      )
      break
    case 'ipad':
    case 'tablet':
      accessoriesDeduction = calculateIPadAccessoriesDeduction(
        aPlusPrice,
        accessories.boxMissing,
        accessories.cableMissing
      )
      break
    case 'watch':
      accessoriesDeduction = calculateWatchAccessoriesDeduction(
        aPlusPrice,
        accessories.boxMissing,
        accessories.cableMissing,
        accessories.strapMissing
      )
      break
  }

  const priceAfterWarranty = devicePrice + warrantyUplift
  const finalPrice = priceAfterWarranty - accessoriesDeduction

  return {
    devicePrice,
    warrantyUplift,
    accessoriesDeduction,
    priceAfterWarranty,
    finalPrice: Math.max(finalPrice, 0),
  }
}

export const getDeviceType = () => {
  const deviceType = sessionStorage.getItem('DeviceType')
  if (deviceType === 'CTG1') {
    return 'mobile'
  }
  if (deviceType === 'CTG2') {
    return 'watch'
  }
  if (deviceType === 'CTG5') {
    return 'ipad'
  }
  return 'mobile' // default
}

export const isBillAvailable = (accessoriesData) => {
  const billItem = accessoriesData?.find(
    (item) => item.quetion && item.quetion.toLowerCase().includes('bill')
  )
  return billItem ? billItem.key === 'no' : false
}
