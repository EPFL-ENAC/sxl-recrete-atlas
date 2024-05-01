import csv from 'csvtojson';
import { writeFileSync } from 'fs';

csv()
  .fromFile('./src/assets/data/keys.csv')
  .then((jsonObj) => {
    writeFileSync('./src/assets/data/keys.json', JSON.stringify(jsonObj, null, 2));
  });

csv()
  .fromFile('./src/assets/data/data.csv')
  .then((jsonObj) => {
    writeFileSync('./src/assets/data/data.json', JSON.stringify(jsonObj, null, 2));
  });