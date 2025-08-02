import type { ReactBuilderOptions } from "./types"
import { isDevelopmentMode, isProductionMode } from "../../utils/isProductionMode"

export async function buildReact(options: ReactBuilderOptions) {
  const output = await Bun.build({
    entrypoints: [options.entrypoint],
    minify: isProductionMode(),
    sourcemap: isDevelopmentMode() ? "inline" : "none",
  })
  const js = output.outputs[0]

  return () => {
    return new Response(js, {
      headers: {
        "Content-Type": "application/javascript",
      },
    })
  }
}
