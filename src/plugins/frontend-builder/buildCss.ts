import tw from "@tailwindcss/postcss";
import postcss from "postcss";
import { TailwindBuilderOptions } from "./types";

export const buildCss = async (options: TailwindBuilderOptions) => {
  const { source, tailwindConfig } = options;
  const sourceText = await Bun.file(source).text();
  const plugins = [tw(tailwindConfig), require("autoprefixer")()];

  if (Bun.env.ENABLE_PRODUCTION_MODE === "true") {
    plugins.push(require("cssnano")());
  }
  const result = await postcss(...plugins).process(sourceText, {
    from: source,
    map: Bun.env.ENABLE_PRODUCTION_MODE !== "true",
  });

  return result.css;
};
