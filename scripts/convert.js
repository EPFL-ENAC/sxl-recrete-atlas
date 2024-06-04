import csv from 'csvtojson';
import { writeFileSync } from 'fs';

csv({ checkType: true })
  .fromFile('./src/assets/data/keys.csv')
  .then((jsonObj) => {
    const path = './src/assets/data/keys.json';
    writeFileSync(path, JSON.stringify(jsonObj, null, 2));
    console.log(`keys.csv converted successfully to JSON in ${path}`)
  });

const arraySplitter = (item) => item.split(",").map((type) => type.trim());
csv({ checkType: true, ignoreEmpty: true, trim: true,
  colParser:{
    "receiver_coordinates":function(item){
      return item.split(",")
        .map((coordinate) => parseFloat(coordinate.trim()))
        .reverse();
    },
    "main_concrete_type": arraySplitter,
    "main_concrete_type_uncertainty": arraySplitter,
    "donor_element_type": arraySplitter,
    "receiver_element_type": arraySplitter,
    "donor_use": arraySplitter,
    "receiver_use": arraySplitter,
    "reference": arraySplitter,
    "images":function(item){
        return item.split(",").map((image) => `/images/${image.trim()}`);
    },
    "images_credits":function(item){
          return item.split(",").map((credit) => credit.trim());
  }
} })
  .fromFile('./src/assets/data/data.csv')
  .then((jsonObj) => {
    const path = './src/assets/data/data.json';
    writeFileSync(path, JSON.stringify(jsonObj, null, 2));
    console.log(`data.csv converted successfully to JSON in ${path}`)
    console.log(`images path updated from 'image.png' to '/images/image.png`)
    console.log(`receiver_coordinates path updated from 'lat, long' to '[long, lat]'`)
  });


csv({ checkType: true })
  .fromFile('./src/assets/data/project_values.csv')
  .then((jsonObj) => {
    const path = './src/assets/data/project_values.json';
    writeFileSync(path, JSON.stringify(jsonObj, null, 2));
    console.log(`project_values.csv converted successfully to JSON in ${path}`)
  });


  csv({ checkType: true })
  .fromFile('./src/assets/data/references.csv')
  .then((jsonObj) => {
    const path = './src/assets/data/references.json';
    writeFileSync(path, JSON.stringify(jsonObj, null, 2));
    console.log(`references.csv converted successfully to JSON in ${path}`)
  });


