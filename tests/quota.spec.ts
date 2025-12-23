import { test, selectors, expect, chromium } from "@playwright/test";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const username = process.env.ccpd_user;
const password = process.env.ccpd_password;
const quotaLink =
  "https://workplace.hihonor.com/#/group/service/supplier-deposit-quota-inquiry";
const stockCheckLink =
  "https://workplace.hihonor.com/#/group/service/inventory-query";

const fonfixCode = "S10418416F001";
const fonfixDoaCode = "S10418416F001-C";
const ingramCode = "S10207587001";
const ingramDoaCode = "S10207587001-C";
const sbeCode = "C18823001";
const sbeDoaCode = "C18823001-C";

test("quotaCheck", async () => {
  const browser = await chromium.launch({ headless: false });
  let page = await browser.newPage();
  let loginUrl =
    "https://workplace.hihonor.com/#/group/service-fr/servicecenter-home";

  test.setTimeout(600000);

  await page.goto(loginUrl);
  await page.waitForTimeout(2000);
  await page.locator("input#username").fill(username);
  await page.fill('input[type="password"]', password);
  await page.locator('button[type="submit"]').click();
  await page.waitForTimeout(2000);

  await page.goto(quotaLink);
  // Wait for the tab to be visible and then click it
  await page.waitForSelector("div#tab-detail");
  await page.click("div#tab-detail");

  await page.waitForTimeout(1000);

  await page.getByRole("button", { name: "搜索" }).click();

  await page.waitForTimeout(5000);

  const cellSelector = ".webix_cell";
  const cellElements = await page.$$(cellSelector);
  const cellTexts: string[] = [];

  for (const cellElement of cellElements) {
    const text = await cellElement.textContent();
    if (typeof text == "string") cellTexts.push(text.trim());
  }

  await page.waitForSelector("div#tab-two");
  await page.click("div#tab-two");

  const cellSelector2 = ".webix_cell";
  const cellElements2 = await page.$$(cellSelector2);
  const cellTexts2: string[] = [];

  for (const cellElement of cellElements2) {
    const text = await cellElement.textContent();
    if (typeof text == "string") cellTexts2.push(text.trim());
  }

  console.log(cellTexts[3]); // fonfix
  console.log(cellTexts[4].split(" ")[0]); // ingram
  console.log(cellTexts[5].split(" ")[0]); // sbe

  console.log(cellTexts[15]); // fonfixQuota
  console.log(cellTexts[16]); // ingramQuota
  console.log(cellTexts[17]); // sbeQuota

  // console.log(cellTexts2);

  const labels = [
    "fonfixG",
    "ingramG",
    "sbeG",
    "fonfixF",
    "ingramF",
    "sbeF",
    "fonfixO",
    "ingramO",
    "sbeO",
  ];

  // console.log(cellTexts2);

  for (let i = 24; i <= 32; i++) {
    console.log(cellTexts2[i]); // logs values from cellTexts2[24] to cellTexts2[32]
  }

  // check DOA
  async function doaCheck(supplierCode, supplierDoaCode) {
    await page.goto(stockCheckLink);
    await page.waitForTimeout(10000);

    const inputSelector = ".xui-input__inner";
    const inputElements = await page.$$(inputSelector);

    await inputElements[11].click();
    await page.waitForTimeout(1000);
    await inputElements[11].fill(supplierCode);
    await page.waitForTimeout(10000);
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(1000);

    await inputElements[12].click();
    await page.waitForTimeout(1000);
    await inputElements[12].fill(supplierDoaCode);
    await page.waitForTimeout(1000);
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    // Locate the button using a CSS selector
    await page.click("text=搜索");

    await page.waitForTimeout(2000);

    // Extract the text content of the second .noColor span, which contains the total available quantity
    const doaQuantities = await page.$$(
      ".xui-second-title-left .totalNum .noColor"
    );

    // console.log(doaQuantities);
    if (doaQuantities.length == 0) {
      return "0 (no record)";
    } else {
      const doaQuantity = await doaQuantities[1].textContent();
      return doaQuantity;
    }
  }

  const fonfixDoa = await doaCheck(fonfixCode, fonfixDoaCode);
  const ingramDoa = await doaCheck(ingramCode, ingramDoaCode);
  const sbeDoa = await doaCheck(sbeCode, sbeDoaCode);

  console.log(fonfixDoa);
  console.log(ingramDoa);
  console.log(sbeDoa);

  await page.waitForTimeout(10000);

  await browser.close();
});
