module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "airbnb-base",
    "plugin:@typescript-eslint/eslint-recommended"
  ],
  rules: {
    "semi": 0,
    "linebreak-style": 0,
    "no-unused-vars": 0,
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        "js": "never",
        "jsx": "never",
        "ts": "never",
        "tsx": "never"
      }
    ]
  },
  settings: {
    "import/resolver": {
      "node": {
        "extensions": ['.ts']
      }
    }
  }
};