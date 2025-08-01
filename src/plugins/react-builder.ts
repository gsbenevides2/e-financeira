import { Elysia } from "elysia";
import path from "path";
import { createElement } from "react";
import { renderToReadableStream } from "react-dom/server";

interface ReactBuilderOptions {
  entrypoint: string;
  publicDir: string;
  App: any;
}

export const react = async (options: ReactBuilderOptions) => {
  await Bun.build({
    entrypoints: [options.entrypoint],
    outdir: options.publicDir,
  });

  return new Elysia({ name: "react", seed: {} }).get(
    "/",
    async () => {
      let bootstrapScript = path.join(options.publicDir, "index.js").replace("./", "/");
      if (!bootstrapScript.startsWith("/")) {
        bootstrapScript = "/" + bootstrapScript;
      }
      const stream = await renderToReadableStream(createElement(options.App), {
        bootstrapScripts: [bootstrapScript],
      });

      // output the stream as the response
      return new Response(stream, {
        headers: { "Content-Type": "text/html" },
      });
    },
    {
      detail: {
        tags: ["Web"],
        description: "Get the home page",
      },
    }
  );
};
