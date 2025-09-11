import csv from 'csvtojson'
import { writeFileSync } from 'fs'
import { toWebp1920 } from '../src/utils/image.js'

// Helper function to sanitize the value.
const sanitizeValue = (value) => {
  // Return non-string values as-is
  if (typeof value !== 'string') return value

  // Handle null or undefined values
  if (value === null || value === undefined) return ''

  // Deep sanitize to handle various edge cases
  let sanitized = value

  // Remove surrounding quotes (both single and double)
  sanitized = sanitized.replace(/^(["'])+|(["'])+$/g, '')

  // Unescape escaped quotes
  sanitized = sanitized.replace(/\\"/g, '"')
  sanitized = sanitized.replace(/\\'/g, "'")

  // Trim whitespace
  sanitized = sanitized.trim()

  // Handle special case of empty quoted strings
  if (sanitized === '' && value.length > 0) {
    sanitized = ''
  }

  return sanitized
}

// Improved arraySplitter function to handle edge cases
const arraySplitter = (item) => {
  // Handle null, undefined or empty values
  if (!item || item === '') return []

  const sanitized = sanitizeValue(item)

  // Handle empty sanitized values
  if (sanitized === '') return []

  // Split by comma and process each item
  return sanitized
    .split(',')
    .map((type) => type.trim())
    .filter((type) => type.length > 0) // Remove empty items
}

csv({ checkType: true })
  .fromFile('./src/assets/data/keys.csv')
  .then((jsonObj) => {
    const path = './src/assets/data/keys.json'
    writeFileSync(path, JSON.stringify(jsonObj, null, 2))
    console.log(`keys.csv converted successfully to JSON in ${path}`)
  })

csv({
  checkType: true,
  ignoreEmpty: true,
  trim: true,
  colParser: {
    receiver_coordinates: function (item) {
      const sanitized = sanitizeValue(item)
      if (!sanitized || sanitized === '') return []

      return sanitized
        .split(',')
        .map((coordinate) => {
          const trimmed = coordinate.trim()
          // Handle empty coordinates
          if (trimmed === '') return null
          // Parse float or return 0 if invalid
          const parsed = parseFloat(trimmed)
          return isNaN(parsed) ? 0 : parsed
        })
        .filter((coord) => coord !== null)
        .reverse()
    },
    main_concrete_type: arraySplitter,
    main_concrete_type_uncertainty: arraySplitter,
    donor_element_type: arraySplitter,
    receiver_element_type: arraySplitter,
    donor_use: arraySplitter,
    receiver_use: arraySplitter,
    reference: arraySplitter,
    actors: arraySplitter,
    fact_sheet_contibutors: arraySplitter,
    images: function (item) {
      return sanitizeValue(item)
        .split(',')
        .map((image) => toWebp1920(`/images/${image.trim()}`))
    },
    images_credits: function (item) {
      return sanitizeValue(item)
        .split(',')
        .map((credit) => credit.trim())
    },
    description_en: function (item) {
      return sanitizeValue(item)
    },
    description_fr: function (item) {
      return sanitizeValue(item)
    }
  }
})
  .fromFile('./src/assets/data/data.csv')
  .then((jsonObj) => {
    const path = './src/assets/data/data.json'
    writeFileSync(path, JSON.stringify(jsonObj, null, 2))
    console.log(`data.csv converted successfully to JSON in ${path}`)
    console.log(`images path updated from 'image.png' to '/images/image.png'`)
    console.log(`receiver_coordinates path updated from 'lat, long' to '[long, lat]'`)
  })

csv({ checkType: true })
  .fromFile('./src/assets/data/project_values.csv')
  .then((jsonObj) => {
    const path = './src/assets/data/project_values.json'
    writeFileSync(path, JSON.stringify(jsonObj, null, 2))
    console.log(`project_values.csv converted successfully to JSON in ${path}`)
  })

// Add sanitizing logic for references.csv as well.
csv({
  checkType: true,
  ignoreEmpty: true,
  trim: true,
  colParser: {
    reference: arraySplitter
  }
})
  .fromFile('./src/assets/data/references.csv')
  .then((jsonObj) => {
    const path = './src/assets/data/references.json'
    writeFileSync(path, JSON.stringify(jsonObj, null, 2))
    console.log(`references.csv converted successfully to JSON in ${path}`)
  })
