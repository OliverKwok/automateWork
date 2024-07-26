import * as XLSX from "xlsx";
const db = require("./db/db.js");
const excelFileName = "abc";
const wipSheetName = "WIP";

interface Wip {
  job_number: string;
  sn: string;
  status: string;
}

async function importExcel(sheetName: string) {
  const workbook = XLSX.readFile(`./import/${excelFileName}.xlsx`);
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);
  return jsonData;
}

async function writeWorkOrder(input: Wip[]) {
  const transaction = await db.transaction();
  try {
    for (const item of input) {
      const existing = await transaction("wip")
        .where({ job_number: item.job_number })
        .first();
      if (existing) {
        await transaction("wip")
          .where({ job_number: item.job_number })
          .update({ status: item.status });
      } else {
        await transaction("wip").insert(item);
      }
    }
    await transaction.commit();
    return input.length;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

async function main() {
  try {
    const importExcelResult = await importExcel(wipSheetName);
    const importExcelResultTransform = importExcelResult.map((item: any) => {
      return {
        job_number: item["Job Number"],
        sn: item["Serial In"],
        status: item["Status"],
      };
    });
    const writeWorkOrderResult = await writeWorkOrder(
      importExcelResultTransform
    );
    console.log(`Inserted/Updated ${writeWorkOrderResult} rows`);
  } catch (error) {
    console.error("Error processing work orders:", error);
  } finally {
    await db.destroy();
  }
}

main();
