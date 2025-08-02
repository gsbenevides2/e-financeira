import tw from "@tailwindcss/postcss";
import postcss from "postcss";
import { TailwindBuilderOptions } from "./types";

export const buildCss = async (options: TailwindBuilderOptions) => {
  const { source, tailwindConfig, minify = false, map = false, autoprefixer = false } = options;
  const sourceText = await Bun.file(source).text();
  const plugins = [tw(tailwindConfig)];

  if (autoprefixer) {
    plugins.push(require("autoprefixer")());
  }

  if (minify) {
    plugins.push(require("cssnano")());
  }

  const result = await postcss(...plugins).process(sourceText, {
    from: source,
    map,
  });

  return result.css;
};
