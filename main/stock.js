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

  try {
    const importExcelResult = await importExcel(excelFileName, wipSheetName);
    const resultTransform = new Map();
    importExcelResult.forEach((item) => {
      const key = item["物料编码"];
      const value = item["可用数量"];
      resultTransform.set(key, value);
    });

    // console.log(resultTransform);

    // Command-line argument checking
    const inputKey = process.argv[2]; // Get the key from the command-line argument

    if (!inputKey) {
      console.log("Please provide a key as a command-line argument.");
    } else {
      const inputArray = inputKey.split(",");
      for (const item of inputArray) {
        // check discepancy list
        const foundDiscrepancyItem = discrepancyList.find(
          (discrepancyItem) => discrepancyItem.code == item
        );

        const discrepancyText = foundDiscrepancyItem
          ? ` (discrepancy: ${foundDiscrepancyItem.qty})`
          : "";

        let isShowReplace = false;
        if (foundDiscrepancyItem) {
          if (resultTransform.get(item) <= foundDiscrepancyItem.qty)
            isShowReplace = true;
        } else if (resultTransform.get(item) == 0) isShowReplace = true;

        if (!resultTransform.has(item)) isShowReplace = true; // handle no record in the good stock list

        let replaceText = "";
        if (isShowReplace) {
          replaceText = await replace(item);

          firstReplaceSparePart = replaceText.substring(0, 8);

          let firstReplaceSparePartQty = resultTransform.get(
            firstReplaceSparePart
          );

          if (typeof firstReplaceSparePartQty === "undefined")
            firstReplaceSparePartQty = 0;

          replaceText = replaceText + " " + firstReplaceSparePartQty;

          if (firstReplaceSparePartQty > 0)
            replaceText =
              replaceText +
              ` - use ${firstReplaceSparePart} to replace ${item}`;
        }

        if (resultTransform.has(item) && resultTransform.get(item) > 0) {
          console.log(
            `${item} ${resultTransform.get(item)}` +
              `${discrepancyText}` +
              `${isShowReplace ? ` Replace: ${replaceText}` : ""}`
          );
        } else {
          console.log(`${item} 0 Replace: ${replaceText}`);
        }

        if (replaceText == "NA") {
          const applyArr = await apply(item); // slow down

          if (!Array.isArray(applyArr)) {
            console.log("no application");
          } else {
            let titles = "";
            for (const title of Object.keys(applyArr[0])) {
              titles += title + `\t` + (title == "ETA" ? `\t` : "");
            }
            console.log(titles);
            // console.log(Object.keys(applyArr[0]).join(`\t`));
            for (const item of applyArr) {
              let text = "";
              for (const key in item)
                text += item[key] == "" ? `\t` : item[key] + `\t`;
              console.log(text);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error processing Import Excel", error);
  }
}

async function replace(inputKey) {
  const excelFileName = `CompleteSubstituteExport`;
  const wipSheetName = "完全替代";

  async function importExcel(excelFileName, sheetName) {
    const workbook = XLSX.readFile(`../import/${excelFileName}.xlsx`);
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    return jsonData;
  }
  try {
    const importExcelResult = await importExcel(excelFileName, wipSheetName);
    // console.log(specialReplaceList);
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
    // const inputKey = process.argv[2]; // Get the key from the command-line argument
    if (!inputKey) {
      console.log("Please provide a key");
    } else if (!resultTransform.has(inputKey)) {
      return "NA";
    } else {
      return resultTransform.get(inputKey).join(","); // Convert array to text and output
    }
  } catch (error) {
    console.error("Error processing Import Excel", error);
  }
}

async function apply(inputKey) {
  const excelFileName = `Order_Fulfillment_Details`;
  const wipSheetName = "Order Fulfillment Details";

  async function importExcel(excelFileName, sheetName) {
    const workbook = XLSX.readFile(`../import/${excelFileName}.xlsx`);
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    return jsonData;
  }
  try {
    const importExcelResult = await importExcel(excelFileName, wipSheetName);
    const resultTransform = new Map();
    importExcelResult.forEach((item) => {
      const key = item["Application Item Code"];

      // check waybill

      const foundWaybillEta = waybillList.find(
        (i) => i.waybill == item["Waybill Number"]
      );

      function changeStatusToChi(status) {
        // Use a switch statement for clear mapping of known statuses.
        switch (status) {
          case "":
            return "未處理"; // "Untreated" or "Pending"
          case "to be received":
            return "待收貨"; // "To be received"
          case "to be dispatched":
            return "待發貨"; // "To be dispatched"
          default:
            return "others"; // For any other input not explicitly handled.
        }
      }

      const inputItem = {
        created: item["Application  Creation Time"].substring(5, 10),
        status: changeStatusToChi(item["Fulfillment Status"]), // TODO
        qty: item["Application Q’ty"], // TODO check
        pack: item["Packing Time"].substring(5, 10),
        dispatch: item["Shipping Time"].substring(5, 10) + `\t`,
        ETA:
          typeof foundWaybillEta == "undefined"
            ? `\t`
            : foundWaybillEta["date"] + `\t`,
        waybill: item["Waybill Number"],
        fulfill: item["Fulfillment Number"],
      };
      // Check if the key exists
      if (!resultTransform.has(key)) {
        // If the key doesn't exist, create the key and set the value as the first item in the array
        resultTransform.set(key, [inputItem]);
      } else {
        // If the key exists, check if the value is in the array
        const existingArray = resultTransform.get(key);
        existingArray.push(inputItem); // Push the value only if it's not already in the array
      }
    });

    // console.log(resultTransform.get(inputKey));
    return resultTransform.get(inputKey);

    // if (!inputKey) {
    //   console.log("Please provide a key");
    // } else if (!resultTransform.has(inputKey)) {
    //   return "NA";
    // } else {
    //   return resultTransform.get(inputKey).join(", "); // Convert array to text and output
    // }
  } catch (error) {
    console.error("Error processing Import Excel", error);
  }
}
