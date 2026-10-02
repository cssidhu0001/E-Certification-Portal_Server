const formatTitleCase = (value = "") => {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

module.exports = {
  formatTitleCase,
};