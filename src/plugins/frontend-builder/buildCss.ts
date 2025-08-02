import tw from "@tailwindcss/postcss";
import postcss from "postcss";
import { isDevelopmentMode, isProductionMode } from "../../utils/isProductionMode";
import { TailwindBuilderOptions } from "./types";

export const buildCss = async (options: TailwindBuilderOptions) => {
  const { source, tailwindConfig } = options;
  const sourceText = await Bun.file(source).text();
  const plugins = [tw(tailwindConfig), require("autoprefixer")()];

  if (isProductionMode()) {
    plugins.push(require("cssnano")());
  }
  const result = await postcss(...plugins).process(sourceText, {
    from: source,
    map: isDevelopmentMode(),
  });
  const css = result.css;

  return () => {
    return new Response(css, {
      headers: {
        "Content-Type": "text/css",
      },
    });
  };
};
