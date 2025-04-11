module.exports = {
    moduleNameMapper: {
      '^react-router-dom$': '<rootDir>/node_modules/react-router-dom',
    },
    transformIgnorePatterns: [
      "/node_modules/(?!react-router-dom/)"
    ],
  };
  