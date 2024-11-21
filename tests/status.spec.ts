import { test, expect, chromium } from "@playwright/test";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

console.log(process.env.ccpd_password);

const workOrderListFilePath = path.resolve(__dirname, "txt", "status.txt");
const workOrderListPlain = fs.readFileSync(workOrderListFilePath, "utf-8");

test("statusCheck", async () => {
  const workOrderList = workOrderListPlain
    .trim()
    .split("\n")
    .map((order) => order.trim());

  const username = process.env.ccpd_user;
  const password = process.env.ccpd_password;
  const workOrderLink =
    "https://workplace.hihonor.com/#/group/service-fr/servicecenter-fieldaccept?orderNo=";

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  const loginUrl =
    "https://workplace.hihonor.com/#/group/service-fr/servicecenter-home";
  const results: any = [];
  let resultsText = "\n";

  test.setTimeout(600000);

  // Navigate to the login page
  await page.goto(loginUrl);
  await page.waitForTimeout(2000);
  await page.locator("input#username").fill(username);
  await page.fill('input[type="password"]', password);
  await page.locator('button[type="submit"]').click();

  // Wait for the login process to complete
  await page.waitForTimeout(10000);
  let cellTexts: string = "";

  for (const workOrder of workOrderList) {
    // Navigate to the specific work order page
    await page.goto(workOrderLink + workOrder);
    await page.waitForTimeout(10000);

    // Wait for the element to be present
    await page.waitForSelector(".orange");

    // Get the text content of the element
    const text = await page.$eval(".orange", (el) => el.textContent!.trim());

    // get the spare part need
    const cellSelector = ".inItem.xui-tooltip.item";
    const cellElements = await page.$$(cellSelector);
    const cellTextsArray: string[] = [];

    for (const cellElement of cellElements) {
      const text = await cellElement.textContent();

      if (typeof text == "string") {
        const isLastLetterNewLine =
          cellTexts.substring(cellTexts.length - 1, cellTexts.length) == "\n";

        let outputText =
          text.trim().length == 0
            ? "no record"
            : text.trim().split("】")[1].substring(0, 8);

        cellTexts +=
          cellTexts == "" || isLastLetterNewLine
            ? outputText
            : "," + outputText;

        cellTextsArray.push(text.trim().split("】")[1].substring(0, 8));
      }
    }

    cellTexts = cellTexts + "\n";

    console.log(`Work Order: ${workOrder} - Status: ${text}`);
    resultsText = resultsText + text + "\n";
    results.push({ workOrder, status: text, spartPart: cellTextsArray });
  }

  await browser.close();

  console.log("Results:", results);
  console.log("\x1b[36m%s\x1b[0m", `Results: ${resultsText}`);
  console.log(cellTexts);
});
