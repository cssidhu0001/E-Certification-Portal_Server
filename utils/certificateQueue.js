const PQueue = require("p-queue").default;

const certificateQueue = new PQueue({
  concurrency: 1,
});

module.exports = certificateQueue;