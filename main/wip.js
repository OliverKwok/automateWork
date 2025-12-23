const XLSX = require("xlsx");

const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, "0"); // Add 1 to the month since it's zero-based
const day = String(today.getDate()).padStart(2, "0"); // Ensure it's two digits

const excelFileName = `T185736_Honor_WIP_${year}${month}${day}`;
const wipSheetName = "WIP";

async function importExcel(excelFileName, sheetName) {
  const workbook = XLSX.readFile(`../import/wip/${excelFileName}.xlsx`);
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);
  return jsonData;
}

async function main() {
  try {
    const importExcelResult = await importExcel(excelFileName, wipSheetName);
    const resultTransform = new Map();
    importExcelResult.forEach((item) => {
      if (item != "") {
        const key = item["Serial In"];
        const value = item["Job Number"];
        resultTransform.set(key, value);
      }
    });

    // console.log(resultTransform);

    // Command-line argument checking
    const inputKey = process.argv[2]; // Get the key from the command-line argument

    if (!inputKey) {
      console.log("Please provide a key as a command-line argument.");
    } else {
      if (resultTransform.has(inputKey)) {
        console.log(resultTransform.get(inputKey));
      } else {
        console.log(`not found`);
      }
    }
  } catch (error) {
    console.error("Error processing Import Excel", error);
  }
}

main();
