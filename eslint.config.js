import ks from "eslint-config-ks";

export default ks(
  {
    prettier: true,
    json: true,
    yml: true,
    markdown: true,
  },
  [
    {
      rules: {
        "security/detect-object-injection": "off",
      },
    },
  ],
);
