import * as XLSX from "xlsx";
const db = require("./db/db.js");

const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, "0");
const day = String(today.getDate()).padStart(2, "0");

const wipExcelFileName = `T185736_Honor_WIP_${year}${month}${day}`;
const workOrderExcelFileName = `线下未闭环工单_原始明细全量导出 ${year}${month}${day}`;
const wipSheetName = "WIP";
const workOrderSheetName = "sheet0";

interface Wip {
  job_number: string; // SBE job number
  sn: string;
  status: string;
}

interface WorkOrder {
  work_order_id: string;
  work_order_number: string;
  status: string;
  sn: string;
  product_series: string;
  model_name: string;
  internal_name: string;
  order_created_date: string;
  wip_status: string;
  comment: string;
  customer_name: string;
}

async function importExcel(excelFileName: string, sheetName: string) {
  const workbook = XLSX.readFile(`./import/${excelFileName}.xlsx`);
  const worksheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(worksheet);
  return jsonData;
}

async function wipWriteToDb(input: Wip[]) {
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

async function workOrderWriteToDb(input: WorkOrder[]) {
  const transaction = await db.transaction();
  try {
    for (const item of input) {
      const existing = await transaction("work_order")
        .where({ work_order_id: item.work_order_id })
        .first();
      if (existing) {
        await transaction("work_order")
          .where({ work_order_id: item.work_order_id })
          .update({ status: item.status });
      } else {
        await transaction("work_order").insert(item);
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
    try {
      const wipImportExcelResult = await importExcel(
        wipExcelFileName,
        wipSheetName
      );
      const wipImportExcelResultTransform = wipImportExcelResult.map(
        (item: any) => {
          return {
            job_number: item["Job Number"],
            sn: item["Serial In"],
            status: item["Status"],
          };
        }
      );
      const wipWriteResult = await wipWriteToDb(wipImportExcelResultTransform);
      console.log(`Inserted/Updated ${wipWriteResult} rows for WIP`);
    } catch (error) {
      console.error("Error processing WIP", error);
    }

    try {
      const workOrderImportExcelResult = await importExcel(
        workOrderExcelFileName,
        workOrderSheetName
      );
      const workOrderImportExcelResultTransform =
        workOrderImportExcelResult.map((item: any) => {
          return {
            work_order_id: item[""],
            work_order_number: item[""],
            status: item[""],
            sn: item[""],
            product_series: item[""],
            model_name: item[""],
            internal_name: item[""],
            order_created_date: item[""],
            wip_status: item[""],
            comment: item[""],
            customer_name: item[""],
          };
        });
      const workOrderWriteResult = await workOrderWriteToDb(
        workOrderImportExcelResultTransform
      );
      console.log(`Inserted/Updated ${workOrderWriteResult} rows for WIP`);
    } catch (error) {
      console.error("Error processing WIP", error);
    }
  } finally {
    await db.destroy();
  }
}

main();
