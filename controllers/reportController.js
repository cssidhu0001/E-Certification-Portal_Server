const {
  getDatasetConfig,
  getCandidatesReport,
} = require("../services/reportService");

const {
  generateExcelReport,
} = require("../services/excelExportService");

// GET REPORT CONFIG
const getReportConfig = async (req, res) => {
  try {
    const candidates = getDatasetConfig("candidates");

    return res.status(200).json({
      success: true,
      datasets: {
        candidates: {
          label: candidates.label,
          fields: candidates.fields,
          defaultColumns: candidates.defaultColumns,
          previewLimit: candidates.previewLimit,
        },
      },
    });
  } catch (error) {
    console.error("Report Config Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load report configuration.",
    });
  }
};

// PREVIEW REPORT
const previewReport = async (req, res) => {
  try {
    const {
      dataset = "candidates",
      filters = {},
      columns = [],
    } = req.body;

    if (dataset !== "candidates") {
      return res.status(400).json({
        success: false,
        message: "Invalid report dataset.",
      });
    }

    const report = await getCandidatesReport({
      filters,
      columns,
      preview: true,
    });

    const fields = report.config.fields;

    const previewRows = report.rows.map((row) => {
      const result = {};

      report.columns.forEach((column) => {
        const field = fields.find(
          (item) => item.key === column
        );

        if (!field) return;

        result[column] = row[field.mongo] ?? "";
      });

      return result;
    });

    return res.status(200).json({
      success: true,
      columns: report.columns,
      rows: previewRows,
      total: report.total,
      previewCount: previewRows.length,
    });
  } catch (error) {
    console.error("Report Preview Error:", error);

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Unable to generate report preview.",
    });
  }
};

// EXPORT REPORT
const exportReport = async (req, res) => {
  try {
    const {
      dataset = "candidates",
      filters = {},
      columns = [],
    } = req.body;

    if (dataset !== "candidates") {
      return res.status(400).json({
        success: false,
        message: "Invalid report dataset.",
      });
    }

    const report = await getCandidatesReport({
      filters,
      columns,
      preview: false,
    });

    const excel = await generateExcelReport({
      title: report.config.label,
      columns: report.columns,
      fields: report.config.fields,
      rows: report.rows,
      filters,
    });

    const now = new Date();

    const datePart = now
      .toLocaleDateString("en-GB")
      .replace(/\//g, "-");

    const filename =
      `IANETL-2026-Export-${datePart}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );

    res.setHeader(
      "X-Export-Password",
      excel.password
    );

    res.setHeader(
      "X-Export-Filename",
      filename
    );

    return res.status(200).send(excel.buffer);
  } catch (error) {
    console.error("Report Export Error:", error);

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        "Unable to export report.",
    });
  }
};

module.exports = {
  getReportConfig,
  previewReport,
  exportReport,
};