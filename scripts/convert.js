import csv from 'csvtojson';
import { writeFileSync } from 'fs';

csv({ checkType: true })
  .fromFile('./src/assets/data/keys.csv')
  .then((jsonObj) => {
    writeFileSync('./src/assets/data/keys.json', JSON.stringify(jsonObj, null, 2));
  });

csv({ checkType: true, ignoreEmpty: true, trim: true,
  colParser:{
    "images":function(item){
        return item.split(",").map((image) => `/${image.trim()}`);
    },
    "images_credits":function(item){
          return item.split(",").map((credit) => credit.trim());
  }
} })
  .fromFile('./src/assets/data/data.csv')
  .then((jsonObj) => {
    writeFileSync('./src/assets/data/data.json', JSON.stringify(jsonObj, null, 2));
  });