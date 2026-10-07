const XlsxPopulate = require("xlsx-populate");
const crypto = require("crypto");

const generatePassword = () => {
  return crypto.randomBytes(5).toString("base64url");
};

const columnLetter = (number) => {
  let result = "";

  while (number > 0) {
    const remainder = (number - 1) % 26;

    result =
      String.fromCharCode(65 + remainder) + result;

    number = Math.floor((number - 1) / 26);
  }

  return result;
};

const formatCellValue = (value, field) => {
  if (value === null || value === undefined) {
    return "";
  }

  if (field.type === "date") {
    const date = new Date(value);

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleString("en-IN");
    }
  }

  return String(value);
};

const generateExcelReport = async ({
  title,
  columns,
  fields,
  rows,
  filters = {},
}) => {
  const password = generatePassword();

  const workbook = await XlsxPopulate.fromBlankAsync();

  const sheet = workbook.sheet(0);

  sheet.name("Registrations");

  /*
  ==========================================
  TITLE
  ==========================================
  */

  const lastColumn = columnLetter(columns.length);

  sheet.range(`A1:${lastColumn}1`).merged(true);

  sheet.cell("A1").value(title);

  sheet.cell("A1").style({
    bold: true,
    fontSize: 16,
    horizontalAlignment: "center",
    verticalAlignment: "center",
  });

  sheet.row(1).height(30);

  /*
  ==========================================
  GENERATED INFO
  ==========================================
  */

  sheet.cell("A2").value("Generated At");

  sheet.cell("B2").value(
    new Date().toLocaleString("en-IN")
  );

  sheet.cell("A3").value("Total Records");

  sheet.cell("B3").value(rows.length);

  /*
  ==========================================
  FILTER SUMMARY
  ==========================================
  */

  const filterEntries = Object.entries(filters).filter(
    ([, value]) => {
      if (
        value === undefined ||
        value === null ||
        value === ""
      ) {
        return false;
      }

      if (
        typeof value === "object" &&
        Object.keys(value).length === 0
      ) {
        return false;
      }

      return true;
    }
  );

  if (filterEntries.length > 0) {
    sheet.cell("A4").value("Applied Filters");

    const filterText = filterEntries
      .map(([key, value]) => {
        if (typeof value === "object") {
          return `${key}: ${JSON.stringify(value)}`;
        }

        return `${key}: ${value}`;
      })
      .join(" | ");

    sheet.cell("B4").value(filterText);
  }

  /*
  ==========================================
  HEADER
  ==========================================
  */

  const headerRow = 6;

  const headerValues = columns.map((column) => {
    const field = fields.find(
      (item) => item.key === column
    );

    return field ? field.label : column;
  });

  /*
   * IMPORTANT:
   * Array ko direct cell.value() me nahi daalna.
   * Horizontal row ke liye range().value([[...]]) use karna hai.
   */

  sheet
    .range(
      `A${headerRow}:${lastColumn}${headerRow}`
    )
    .value([headerValues]);

  sheet
    .range(
      `A${headerRow}:${lastColumn}${headerRow}`
    )
    .style({
      bold: true,
      horizontalAlignment: "center",
      verticalAlignment: "center",
      wrapText: true,
    });

  sheet.row(headerRow).height(28);

  /*
  ==========================================
  DATA
  ==========================================
  */

  rows.forEach((row, rowIndex) => {
    const excelRow = headerRow + rowIndex + 1;

    columns.forEach((column, columnIndex) => {
      const field = fields.find(
        (item) => item.key === column
      );

      if (!field) {
        return;
      }

      const value = formatCellValue(
        row[field.mongo],
        field
      );

      sheet
        .cell(excelRow, columnIndex + 1)
        .value(value);
    });
  });

  /*
  ==========================================
  COLUMN WIDTH
  ==========================================
  */

  columns.forEach((column, index) => {
    const field = fields.find(
      (item) => item.key === column
    );

    let maxLength =
      field?.label?.length || 10;

    rows.forEach((row) => {
      const value = row[field.mongo];

      if (
        value !== undefined &&
        value !== null
      ) {
        maxLength = Math.max(
          maxLength,
          String(value).length
        );
      }
    });

    /*
     * Keep Excel readable but don't make
     * columns insanely wide.
     */

    const width = Math.min(
      Math.max(maxLength + 3, 14),
      40
    );

    sheet
      .column(index + 1)
      .width(width);
  });

  /*
  ==========================================
  FREEZE HEADER
  ==========================================
  */

  sheet.freezePanes(
    headerRow + 1,
    1
  );

  /*
  ==========================================
  BORDERS
  ==========================================
  */

  const lastRow = Math.max(
    headerRow,
    headerRow + rows.length
  );

  sheet
    .range(
      `A${headerRow}:${lastColumn}${lastRow}`
    )
    .style({
      border: {
        top: {
          style: "thin",
          color: "D1D5DB",
        },
        bottom: {
          style: "thin",
          color: "D1D5DB",
        },
        left: {
          style: "thin",
          color: "D1D5DB",
        },
        right: {
          style: "thin",
          color: "D1D5DB",
        },
      },
    });

  /*
  ==========================================
  PASSWORD PROTECTED XLSX
  ==========================================
  */

  const buffer = await workbook.outputAsync({
    password,
  });

  return {
    buffer,
    password,
  };
};

module.exports = {
  generateExcelReport,
};