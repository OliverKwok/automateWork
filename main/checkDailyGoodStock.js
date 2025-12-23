const XLSX = require("xlsx");
const {
  waybillList,
  discrepancyList,
  alwaysUsedList,
} = require("../import/updateList.js");

stock();

async function stock() {
  const excelFileName = `Inventory_Lists`;
  const wipSheetName = "库存列表";

  async function importExcel(excelFileName, sheetName) {
    const workbook = XLSX.readFile(`../import/${excelFileName}.xlsx`);
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    return jsonData;
  }

  try {
    const importExcelResult = await importExcel(excelFileName, wipSheetName);
    const resultTransform = [];
    let excelContenError = false;
    importExcelResult.forEach((item) => {
      const key = item["库存组织"];
      const value = item["子库"];
      if (key != "C18823001") excelContenError = true;
      if (value != "C18823001-G") excelContenError = true;
    });
    if (excelContenError) {
      console.log("XXXXX need to export the excel again");
    } else {
      console.log("pass!");
    }

    const resultTransformCheckAlwaysUsed = new Map();
    importExcelResult.forEach((item) => {
      const key = item["物料编码"];
      const value = item["可用数量"];
      resultTransformCheckAlwaysUsed.set(key, value);
    });

    if (!alwaysUsedList) {
      console.log("Please provide the always used list for checking");
    } else {
      for (const item of alwaysUsedList) {
        // check discepancy list
        const foundDiscrepancyItem = discrepancyList.find(
          (discrepancyItem) => discrepancyItem.code == item
        );
        let discepancyText = "";
        if (foundDiscrepancyItem) {
          discepancyText = ` (discrepancy: ${foundDiscrepancyItem.qty})`;
        }
        console.log(
          `${item} ${resultTransformCheckAlwaysUsed.get(
            item
          )} ${discepancyText}`
        );
      }
    }
  } catch (error) {
    console.error("Error processing Import Excel", error);
  }
}
