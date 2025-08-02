import antfu from "@antfu/eslint-config"
import drizzle from "eslint-plugin-drizzle"

export default antfu(
  {
    stylistic: {
      indent: 2,
      quotes: "double",
    },
  },
  {
    rules: {
      "no-alert": "off",
    },
    plugins: {
      drizzle,
    },
  },
)
