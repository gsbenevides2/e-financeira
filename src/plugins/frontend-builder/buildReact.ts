import { ReactBuilderOptions } from "./types";

export const buildReact = async (options: ReactBuilderOptions) => {
  const output = await Bun.build({
    entrypoints: [options.entrypoint],
  });
  return output.outputs[0];
};
