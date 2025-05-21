import csv from 'csvtojson'
import { writeFileSync } from 'fs'
import { toWebp512 } from '../src/utils/image.js'

// Helper function to sanitize the value.
const sanitizeValue = (value) => value.replace(/^"+|"+$/g, '')
// Update the arraySplitter to sanitize the value before splitting.
const arraySplitter = (item) =>
  sanitizeValue(item)
    .split(',')
    .map((type) => type.trim())

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
      return sanitizeValue(item)
        .split(',')
        .map((coordinate) => parseFloat(coordinate.trim()))
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
        .map(toWebp512)
    },
    images_credits: function (item) {
      return sanitizeValue(item)
        .split(',')
        .map((credit) => credit.trim())
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
