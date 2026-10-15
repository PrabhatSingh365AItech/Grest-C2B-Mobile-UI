import { useEffect } from 'react'
import store from '../store/store.jsx'
import {
  updateCoreObject,
  updateCosmeticsObject,
  updateFunctionalObject,
  updateFunctionalMajorObject,
  updateFunctionalMinorObject,
  updateDisplayObject
} from '../store/slices/QNAslice'

// Questions shared by more than one test
const MICROPHONE_NOT_WORKING = 'Microphone Not working'
const BACK_CAMERA_NOT_WORKING = 'Back Camera Is Not Working'
const SILENT_BUTTON_OR_VIBRATOR = 'Silent Button or Vibrator Not working'
const VOLUME_BUTTON_NOT_WORKING = 'volume button not working'
const YELLOW_OR_WHITE_SPOTS = 'Small yellow or white spots on screen'
const TOUCH_NOT_WORKING = 'touch not working'
const NETWORK_ISSUE = 'Having Network Issue'

// Diagnosis test -> questionnaire mapping, taken as-is from the
// "Diagnose Test" sheet (Select Tests -> Grest Questions). Only rows that
// have both a test and a question are listed; a test with no question is
// never auto-filled. LCD color has a different question in each part of the
// sheet (Screen 1 and Screen 2), so it maps to both.
const TEST_QUESTION_MAP = {
  // Audio
  'Receiver': ['Audio Receiver not working'],
  'Microphone': [MICROPHONE_NOT_WORKING],
  'Loudspeaker': ['Speaker Not working'],
  'Speaker microphone': [MICROPHONE_NOT_WORKING],
  'Speaker microphone mic': [MICROPHONE_NOT_WORKING],
  // Camera
  'Auto multi camera': [BACK_CAMERA_NOT_WORKING],
  'Back camera': [BACK_CAMERA_NOT_WORKING],
  'Rear camera flash': ['Flashlight Not working'],
  'Front camera': ['Front Camera is not working'],
  // Button
  'Action Button': [SILENT_BUTTON_OR_VIBRATOR],
  'Power button': ['Power button not working'],
  'Side button': [SILENT_BUTTON_OR_VIBRATOR],
  'Volume down button': [VOLUME_BUTTON_NOT_WORKING],
  'Volume up button': [VOLUME_BUTTON_NOT_WORKING],
  // Sensor
  'Fingerprint sensor': ['Fingerprint Scanner Not Working'],
  'Bluetooth': ['is your bluetooth not working properly?'],
  'Vibration': [SILENT_BUTTON_OR_VIBRATOR],
  'Proximity sensor': ['Proximity sensor Not workking'],
  // Battery
  'Charging': ['Charging port Not working'],
  'Battery temperature': ['Battery is draining fast'],
  // Display
  'Touch screen': [YELLOW_OR_WHITE_SPOTS],
  'Screen pixel': [YELLOW_OR_WHITE_SPOTS],
  'LCD color': [YELLOW_OR_WHITE_SPOTS, TOUCH_NOT_WORKING],
  'Multi touch': [TOUCH_NOT_WORKING],
  // Other
  'Back panel crack': ['Cracked back or Side panel'],
  'Face ID': ["is your device's face ID or Touch ID Not Working Properly?"],
  'Live call': [NETWORK_ISSUE],
  'Live call two': [NETWORK_ISSUE],
  // Network
  'Network data': [NETWORK_ISSUE],
  'WiFi': ['is your wifi not working properly?'],
}

// Raw Blancco test keys (sent as blanccoKey) for the sheet tests above, so a
// test still matches when the response carries the key instead of the name.
const BLANCCO_KEY_ALIASES = {
  'audio-earpiece': 'Receiver',
  'audio-speaker': 'Loudspeaker',
  'audio-microphone': 'Microphone',
  'audio-speaker-microphone': 'Speaker microphone mic',
  'speaker-microphone-camcorder': 'Speaker microphone mic',
  'camera-back': 'Back camera',
  'camera-front': 'Front camera',
  'camera-back-flash': 'Rear camera flash',
  'button-power': 'Power button',
  'button-volume-up': 'Volume up button',
  'button-volume-down': 'Volume down button',
  'device-vibration': 'Vibration',
  'detect-bluetooth': 'Bluetooth',
  'sensor-fingerprint': 'Fingerprint sensor',
  'sensor-proximity': 'Proximity sensor',
  'battery-charge': 'Charging',
  'display-touch': 'Touch screen',
  'display-multi-touch': 'Multi touch',
  'display-pixel': 'Screen pixel',
  'display-lcd-color': 'LCD color',
  'network-cellular': 'Network data',
  'network-wifi': 'WiFi',
  'detect-wifi': 'WiFi',
}

const ISSUE_RESULTS = new Set(['FAILED', 'INDETERMINATE'])

// Case, spacing, punctuation and doubled letters ("workking") are ignored so
// the sheet text matches the questionnaire text.
const normalize = (text) =>
  String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/(.)\1+/g, '$1')

const NORMALIZED_TEST_MAP = Object.fromEntries(
  Object.entries(TEST_QUESTION_MAP).map(([test, questions]) => [
    normalize(test),
    questions.map(normalize),
  ]),
)

const NORMALIZED_KEY_ALIASES = Object.fromEntries(
  Object.entries(BLANCCO_KEY_ALIASES).map(([key, test]) => [
    normalize(key),
    normalize(test),
  ]),
)

const getMappedQuestions = (test) => {
  const byName = NORMALIZED_TEST_MAP[normalize(test.name)]
  if (byName) {
    return byName
  }
  const aliasTest = NORMALIZED_KEY_ALIASES[normalize(test.blanccoKey)]
  return (aliasTest && NORMALIZED_TEST_MAP[aliasTest]) || []
}

// Normalized texts of every question that at least one failed /
// indeterminate test points to.
const buildIssueQuestionSet = (tests) => {
  const issues = new Set()
  tests.forEach((test) => {
    if (ISSUE_RESULTS.has(test.result)) {
      getMappedQuestions(test).forEach((question) => issues.add(question))
    }
  })
  return issues
}

// Functional is a plain yes/no group: mark the question as an issue.
const processStandardGroup = (groupData, updateAction, issueQuestions) => {
  if (!groupData || !groupData.length) {
    return
  }
  groupData.forEach((question, index) => {
    if (!issueQuestions.has(normalize(question.quetion))) {
      return
    }
    if (question.key !== 'yes') {
      store.dispatch(updateAction({ index, newAnswer: question.yes, newKey: 'yes' }))
    }
  })
}

// Option groups: tick the matching option (the reducer toggles, so only
// dispatch when it isn't ticked yet).
const processOptionGroup = (groupData, updateAction, issueQuestions) => {
  if (!groupData || !groupData.length) {
    return
  }
  groupData.forEach((question, questionIndex) => {
    if (!question.options || question.options.length === 0) {
      return
    }
    question.options.forEach((option, optionIndex) => {
      if (!issueQuestions.has(normalize(option.caption))) {
        return
      }
      const alreadySelected = question.selected && question.selected[optionIndex]
      if (!alreadySelected) {
        store.dispatch(updateAction({
          index: questionIndex,
          yesKey: question.yes,
          noKey: question.no,
          selectedIndex: optionIndex
        }))
      }
    })
  })
}

const useDiagnosisAutoFill = (
  diagnosisResults,
  { Core, Cosmetics, Functional, FunctionalMajor, FunctionalMinor, Display },
) => {
  useEffect(() => {
    if (!diagnosisResults?.tests?.length) {
      return
    }

    const hasGroupData = Core?.length || Cosmetics?.length || Functional?.length
      || FunctionalMajor?.length || FunctionalMinor?.length || Display?.length
    if (!hasGroupData) {
      return
    }

    const issueQuestions = buildIssueQuestionSet(diagnosisResults.tests)
    if (issueQuestions.size === 0) {
      return
    }

    processStandardGroup(Functional, updateFunctionalObject, issueQuestions)
    processOptionGroup(Core, updateCoreObject, issueQuestions)
    processOptionGroup(Cosmetics, updateCosmeticsObject, issueQuestions)
    processOptionGroup(Display, updateDisplayObject, issueQuestions)
    processOptionGroup(FunctionalMajor, updateFunctionalMajorObject, issueQuestions)
    processOptionGroup(FunctionalMinor, updateFunctionalMinorObject, issueQuestions)

  }, [Core, Cosmetics, Functional, FunctionalMajor, FunctionalMinor, Display, diagnosisResults])
}

export default useDiagnosisAutoFill
