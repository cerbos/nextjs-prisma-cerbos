import next from "eslint-config-next";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = [
  ...next,
  prettier,
  {
    ignores: [".next/**", "node_modules/**"],
  },
];

export default eslintConfig;
