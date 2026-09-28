// Chart palettes, validated against the white card surface with the data-viz
// validator (adjacent-pair CVD separation, normal-vision floor, contrast).
// Slots are assigned in fixed order and never cycled - a 9th category folds
// into "Other" instead.
export const CATEGORICAL = [
  '#2a78d6', // blue
  '#eb6834', // orange
  '#1baf7a', // aqua
  '#eda100', // yellow
  '#e87ba4', // magenta
  '#008300', // green
  '#4a3aa7', // violet
  '#e34948', // red
]

// Ordered dimensions (grades) use a single-hue ramp, light -> dark.
export const ORDINAL = ['#86b6ef', '#3987e5', '#256abf', '#184f95', '#0d366b']

export const OTHER_COLOR = '#898781'

export const MAX_SLICES = CATEGORICAL.length

export const colorFor = (index, scale = 'categorical') => {
  const ramp = scale === 'ordinal' ? ORDINAL : CATEGORICAL
  return ramp[index % ramp.length]
}
