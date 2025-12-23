import { test, expect, chromium } from "@playwright/test";

import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const sparePartListFilePath = path.resolve(__dirname, "txt", "sparePart.txt");
const sparePartListPlain = fs.readFileSync(sparePartListFilePath, "utf-8");

test("goodStockCheck", async () => {
  //  make a unique spare part list
  const sparePartList = sparePartListPlain
    .trim()
    .split(/,|\n/)
    .map((sparePartCode) => sparePartCode.trim());

  const uniqueSparePartList = [...new Set(sparePartList)];

  const uniqueSparePartListLongString = uniqueSparePartList.join(",");
  // console.log({ uniqueSparePartListLongString });

  //  make a spare part list per pending order
  const sparePartListPerOrder = sparePartListPlain
    .trim()
    .split(/\n/)
    .map((sparePartCodeList) => sparePartCodeList.trim().split(/,/));

  // console.log(sparePartListPerOrder);

  const username = process.env.ccpd_user;
  const password = process.env.ccpd_password;
  const stockCheckLink =
    "https://workplace.hihonor.com/#/group/service/inventory-query";
  const sbeCode = "C18823001";
  const sbeGStock = "C18823001-G";

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  const loginUrl =
    "https://workplace.hihonor.com/#/group/service-fr/servicecenter-home";
  const results: any = [];
  let resultsText = "\n";

  test.setTimeout(1200000);

  // Navigate to the login page
  await page.goto(loginUrl);
  await page.waitForTimeout(2000);
  await page.locator("input#username").fill(username);
  await page.fill('input[type="password"]', password);
  await page.locator('button[type="submit"]').click();

  // Wait for the login process to complete
  await page.waitForTimeout(10000);

  // for (const sparePart of sparePartList) {
  // Navigate to the specific work order page
  await page.goto(stockCheckLink);
  await page.waitForTimeout(10000);

  const inputSelector = ".xui-input__inner";
  const inputElements = await page.$$(inputSelector);

  await inputElements[11].click();
  await page.waitForTimeout(1000);
  await inputElements[11].fill(sbeCode);
  await page.waitForTimeout(10000);
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(1000);

  await inputElements[12].click();
  await page.waitForTimeout(1000);
  await inputElements[12].fill(sbeGStock);
  await page.waitForTimeout(1000);
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");

  // Locate the textarea using a CSS selector
  const textareaSelector = "div.xui-textarea textarea.xui-textarea__inner";

  // Fill the textarea with the desired text
  await page.fill(textareaSelector, uniqueSparePartListLongString);

  // Locate the button using a CSS selector
  await page.click("text=搜索");

  await page.waitForTimeout(3000);

  const dropDownSelector = "div.xui-input.xui-input--suffix.tooltip";
  const dropDownElements = await page.$$(dropDownSelector);
  await dropDownElements[10].click();
  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("Enter");

  await page.waitForTimeout(3000);

  // for (let i = 0; i < 7; i++) {
  //   await page.keyboard.press("Tab");
  //   await page.waitForTimeout(500);
  // }

  await page.click(
    'div[role="gridcell"][aria-rowindex="1"][aria-colindex="1"]'
  );

  for (let i = 0; i < uniqueSparePartList.length + 1; i++) {
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(500);
  }

  // Locate all cells in the table and extract their text content
  await page.evaluate(() => {
    // @ts-ignore
    document.body.style.zoom = "25%";
  });
  await page.waitForTimeout(2000);

  const cellSelector = ".webix_cell";
  const cellElements = await page.$$(cellSelector);
  const cellTexts: string[] = [];

  for (const cellElement of cellElements) {
    const text = await cellElement.textContent();
    if (typeof text == "string") cellTexts.push(text.trim());
  }

  function turnArrayToMap(inputArray) {
    const wholeArrayLengthBase = 18;
    const goodStockLengthBase = 12;
    const numberOfSparePart = inputArray.length / wholeArrayLengthBase;
    const firstGoodPartIndex = goodStockLengthBase * numberOfSparePart;
    const result = new Map();

    for (let i = 0; i < numberOfSparePart; i++) {
      result.set(inputArray[i], inputArray[firstGoodPartIndex + i]);
    }

    // console.log(result);

    return result;
  }

  function checkEachOrder(inputArray, inputMap) {
    for (const inputSparePartList of inputArray) {
      let isAllSparePartAvailable = true;
      const outOfStockSparePartList: string[] = [];
      for (const inputSparePart of inputSparePartList) {
        // console.log(inputSparePart);
        // console.log(inputMap.get(inputSparePart));
        if (inputMap.get(inputSparePart) == undefined) {
          isAllSparePartAvailable = false;
          outOfStockSparePartList.push(inputSparePart);
        }
      }
      if (isAllSparePartAvailable) {
        console.log("all spare parts available");
      } else {
        console.log(`${outOfStockSparePartList.join(",")} no stock`);
      }
    }
  }

  // console.log(cellTexts);
  // const cellTextsPath = path.resolve(__dirname, "txt", "cellTexts.txt");
  // const cellTextsContent = JSON.stringify(cellTexts);

  // fs.writeFileSync(cellTextsPath, cellTextsContent, "utf-8");

  if (cellTexts.length == 0) {
    // no record for this stock
    console.log("no record for all spare parts");
  } else {
    const resultMap = turnArrayToMap(cellTexts); // Prints the array of text contents
    checkEachOrder(sparePartListPerOrder, resultMap);
  }

  await browser.close();
});
