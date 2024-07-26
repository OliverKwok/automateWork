import * as XLSX from "xlsx";

const workbook = XLSX.readFile("./import/abc.xlsx");

// Get the specific sheet by name (e.g., "Sheet1")
const sheetName = "WIP";
const worksheet = workbook.Sheets[sheetName];

// Convert the sheet to JSON (optional)
const jsonData = XLSX.utils.sheet_to_json(worksheet);

console.log(jsonData);
