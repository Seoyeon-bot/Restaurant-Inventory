module.exports = {
  watchman: false,
  testEnvironment: "node",
  collectCoverageFrom: ["recipeValidation.js"],
  coverageReporters: ["text", "html", "lcov", "json-summary"],
  coverageThreshold: {
    [require("path").join(__dirname, "recipeValidation.js")]: { lines: 71 }
  }
};
