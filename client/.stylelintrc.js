module.exports = {
  extends: ["stylelint-config-standard-scss"],
  overrides: [
    {
      files: ["**/*.scss"],
      customSyntax: "postcss-scss"
    }
  ],
  rules: {
    //allow camelCase and kebab
    "selector-class-pattern": "^[a-z][a-zA-Z0-9-]*$"
  }
};
