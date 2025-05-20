module.exports = {
  env: {
    browser: true,
    es2021: true
  },

  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      extends: ["plugin:@typescript-eslint/recommended", "plugin:@typescript-eslint/recommended-requiring-type-checking"],
      parserOptions: {
        //project: ["./server/tsconfig.json", "./client/tsconfig.json"],
        tsconfigRootDir: __dirname
      },
	  ignorePatterns: ["./server/**/*.ts", "./client/**/*.ts", "./client/**/*.tsx"], 
    }
  ],

  plugins: ["@typescript-eslint"],
  rules: {
    "react/react-in-jsx-scope": "off"
  },
  globals: {
    React: true,
    adsbygoogle: true,
    window: true,
    process: true,
    JSX: true,
    module: true
  },
  parser: "@typescript-eslint/parser"
};
