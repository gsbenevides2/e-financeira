import { ReactBuilderOptions } from "./types";

export const buildReact = async (options: ReactBuilderOptions) => {
  const output = await Bun.build({
    entrypoints: [options.entrypoint],
    minify: Bun.env.ENABLE_PRODUCTION_MODE === "true",
    sourcemap: Bun.env.ENABLE_PRODUCTION_MODE !== "true" ? "inline" : false,
  });
  return output.outputs[0];
};
