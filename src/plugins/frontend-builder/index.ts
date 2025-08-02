import { Elysia } from "elysia";
import { createElement } from "react";
import { renderToReadableStream } from "react-dom/server";
import { createStaticRouter, StaticRouterProvider } from "react-router";
import { AuthService } from "../../backend/services/AuthService";
import { RouteObjectWithData } from "../../frontend/router/routes";
import { staticRouterHandler } from "../../frontend/router/staticHandler";
import { buildCss } from "./buildCss";
import { buildReact } from "./buildReact";
import { FrontendBuilderOptions } from "./types";

export const frontEndBuilder = async (options: FrontendBuilderOptions) => {
  const { react, tailwind } = options;
  const reactOutput = await buildReact(react);
  const tailwindOutput = await buildCss(tailwind);

  return new Elysia({ name: "frontend-builder", seed: {} }).onRequest(async ({ request }) => {
    const urlObject = new URL(request.url);
    if (urlObject.pathname === "/styles.css") {
      return new Response(tailwindOutput, {
        headers: {
          "Content-Type": "text/css",
        },
      });
    } else if (urlObject.pathname === "/index.js") {
      return new Response(reactOutput, {
        headers: {
          "Content-Type": "application/javascript",
        },
      });
    } else if (!request.headers.get("accept")?.includes("text/html")) {
      return;
    }

    const { query, queryRoute } = staticRouterHandler;

    const context = await query(request);
    if (context instanceof Response) {
      return context;
    }
    const is404 = context.statusCode === 404;
    if (is404) {
      return;
    }

    const router = createStaticRouter(staticRouterHandler.dataRoutes, context);
    const data = context.matches
      .map((match) => {
        const route = match.route;
        if ("data" in route) {
          return (route as RouteObjectWithData).data;
        }
        return null;
      })
      .filter((data) => data !== null)[0];

    if (data?.protected) {
      const cookies = new Bun.CookieMap(request.headers.get("cookie") ?? "");
      const token = cookies.get("token");
      if (!token) {
        return new Response(null, {
          status: 302,
          headers: {
            Location: "/login",
          },
        });
      }
      const decoded = await AuthService.verify(token);
      if (!decoded) {
        return new Response(null, {
          status: 302,
          headers: {
            Location: "/login",
          },
        });
      }
    }

    const stream = await renderToReadableStream(
      createElement(StaticRouterProvider, {
        router,
        context,
      }),
      {
        bootstrapScripts: ["index.js"],
      }
    );

    return new Response(stream, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  });
};
