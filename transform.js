"use strict";

const fs = require("fs").promises;

// read enviroment variables from .env
const dotenv = require("dotenv");
dotenv.config();

const url = process.env.URL;
const urlObject = new URL(url);
const hostName = urlObject.hostname;

const filePath = `./data/${hostName}-data.json`;
const filePathTransform = `./data/${hostName}-data-transform.json`;

const keysString = process.env.KEYS;
if (!keysString) {
  console.error("Set KEYS variables in .env file");
  process.exit(1);
}
const keys = keysString.split(",");

const readFile = async (filePath) => {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return data;
  } catch (err) {
    console.log(err);
  }
};

const writeFile = async (filePath, data) => {
  try {
    let dataJSON = JSON.stringify(data, null, 2);
    const newData = await fs.writeFile(filePath, dataJSON);
    return newData;
  } catch (err) {
    console.log(err);
  }
};
const pick = (obj, ...keys) =>
  Object.fromEntries(
    keys.filter((key) => key in obj).map((key) => [key, obj[key]])
  );

const main = async () => {
  console.time("Execution");
  let rawdata = await readFile(filePath);
  let products = JSON.parse(rawdata);

  const newProducts = products.map((product) => {
    return pick(product, ...keys);
  });

  writeFile(filePathTransform, newProducts);
  console.timeEnd("Execution");
  console.log(`Transformed data written to ${filePathTransform}`);
};

main();
