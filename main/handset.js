const XLSX = require("xlsx");
const { waybillList, discrepancyList } = require("../import/updateList.js");

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

  const excelFileNameModelList = `Model_name`;
  const wipSheetNameModelList = "sheet0";

  try {
    const importExcelResult = await importExcel(excelFileName, wipSheetName);
    const importExcelResultModelList = await importExcel(
      excelFileNameModelList,
      wipSheetNameModelList
    );
    const resultTransform = [];
    importExcelResult.forEach((item) => {
      if (item["物料类型"] == "整机" && item["可用数量"] != 0) {
        const code = item["物料编码"];
        const qty = item["可用数量"];
        const modelName = findModeTextLocation(item["物料描述"]);
        resultTransform.push({ code, qty, modelName });
      }
    });

    function findModeTextLocation(text) {
      const checkTextArray = text.split("-");
      if (checkTextArray[1] == "蓝牙耳机") return checkTextArray[3];
      else return checkTextArray[1];
    }

    console.log(resultTransform);
  } catch (error) {
    console.error("Error processing Import Excel", error);
  }
}
