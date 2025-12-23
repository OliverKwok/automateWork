const XLSX = require("xlsx");

const excelFileName = `CompleteSubstituteExport`;
const wipSheetName = "完全替代";

async function importExcel(excelFileName, sheetName) {
  const workbook = XLSX.readFile(`../import/${excelFileName}.xlsx`);
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);
  return jsonData;
}

async function replace() {
  try {
    const importExcelResult = await importExcel(excelFileName, wipSheetName);
    const resultTransform = new Map();
    importExcelResult.forEach((item) => {
      const key = item["原物料编码"];
      const value = item["替代物料编码"];
      // Check if the key exists
      if (!resultTransform.has(key)) {
        // If the key doesn't exist, create the key and set the value as the first item in the array
        resultTransform.set(key, [value]);
      } else {
        // If the key exists, check if the value is in the array
        const existingArray = resultTransform.get(key);
        if (!existingArray.includes(value)) {
          existingArray.push(value); // Push the value only if it's not already in the array
        }
      }
      // Reverse mapping logic
      if (!resultTransform.has(value)) {
        resultTransform.set(value, [key]);
      } else {
        const existingArray = resultTransform.get(value);
        if (!existingArray.includes(key)) {
          existingArray.push(key); // Push the reverse key only if it's not already in the array
        }
      }
    });
    // Command-line argument checking
    const inputKey = process.argv[2]; // Get the key from the command-line argument
    if (!inputKey) {
      console.log("Please provide a key");
    } else if (!resultTransform.has(inputKey)) {
      console.log("no replacement");
    } else {
      console.log(resultTransform.get(inputKey).join(", ")); // Convert array to text and output
    }
  } catch (error) {
    console.error("Error processing Import Excel", error);
  }
}

replace();
