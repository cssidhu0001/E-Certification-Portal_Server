const Candidate = require("../models/Candidate");
const reportConfig = require("../config/reportConfig");
const getDatasetConfig = (dataset) => {
  const config = reportConfig[dataset];

  if (!config) {
    throw new Error("Invalid report dataset.");
  }

  return config;
};
const getFieldMap = (config) => {
  return new Map(config.fields.map((field) => [field.key, field]));
};
const buildMongoQuery = (filters = {}, config) => {
  const fieldMap = getFieldMap(config);
  const query = {};
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    const field = fieldMap.get(key);

    if (!field || !field.filterable) {
      continue;
    }

    if (field.type === "text") {
      query[field.mongo] = {
        $regex: String(value).trim(),
        $options: "i",
      };
    }

    if (field.type === "select") {
      if (!field.options.includes(value)) {
        throw new Error(`Invalid value for ${field.label}.`);
      }

      query[field.mongo] = value;
    }

    if (field.type === "date") {
      if (typeof value !== "object") {
        continue;
      }

      const dateQuery = {};

      if (value.from) {
        const from = new Date(value.from);

        if (Number.isNaN(from.getTime())) {
          throw new Error(`Invalid start date for ${field.label}.`);
        }

        dateQuery.$gte = from;
      }

      if (value.to) {
        const to = new Date(value.to);

        if (Number.isNaN(to.getTime())) {
          throw new Error(`Invalid end date for ${field.label}.`);
        }

        // Include the complete "to" 
        to.setHours(23, 59, 59, 999);

        dateQuery.$lte = to;
      }

      if (Object.keys(dateQuery).length) {
        query[field.mongo] = dateQuery;
      }
    }
  }

  return query;
};

const validateColumns = (columns, config) => {
  const fieldMap = getFieldMap(config);

  if (!Array.isArray(columns) || columns.length === 0) {
    return config.defaultColumns;
  }

  const validColumns = columns.filter((column) => {
    const field = fieldMap.get(column);
    return field && field.exportable;
  });

  if (!validColumns.length) {
    throw new Error("No valid export columns selected.");
  }

  return [...new Set(validColumns)];
};

const getCandidatesReport = async ({
  filters = {},
  columns = [],
  preview = false,
}) => {
  const config = getDatasetConfig("candidates");

  const query = buildMongoQuery(filters, config);
  const selectedColumns = validateColumns(columns, config);

  const projection = {};

  for (const column of selectedColumns) {
    const field = config.fields.find((item) => item.key === column);

    if (field) {
      projection[field.mongo] = 1;
    }
  }

  const limit = preview ? config.previewLimit : 0;

  let mongoQuery = Candidate.find(query)
    .select(projection)
    .sort({ createdAt: -1 })
    .lean();

  if (limit) {
    mongoQuery = mongoQuery.limit(limit);
  }

  const rows = await mongoQuery;

  const total = await Candidate.countDocuments(query);

  return {
    config,
    query,
    columns: selectedColumns,
    rows,
    total,
  };
};

module.exports = {
  getDatasetConfig,
  buildMongoQuery,
  validateColumns,
  getCandidatesReport,
};