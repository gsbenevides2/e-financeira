import { cors } from "@elysiajs/cors";
import serverTiming from "@elysiajs/server-timing";
import staticPlugin from "@elysiajs/static";
import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import api from "./backend/api";
import { coolifyHealthChecker } from "./plugins/coolify-healtcheker";
import { frontEndBuilder } from "./plugins/frontend-builder";

const app = new Elysia()
  .use(cors())
  .use(serverTiming())
  .use(
    swagger({
      documentation: {
        info: {
          title: "E-Financeira",
          version: "1.0.0",
          description: "E-Financeira - Gestão Financeira",
        },
        tags: [
          {
            name: "Accounts",
            description: "Get accounts informations",
          },
          {
            name: "Categories",
            description: "Get categories informations",
          },
          {
            name: "Month References",
            description: "Get month references informations",
          },
          {
            name: "Transactions",
            description: "Get transactions informations",
          },
        ],
      },
    })
  )
  .use(staticPlugin())
  .use(coolifyHealthChecker)
  .use(api)

  .use(
    frontEndBuilder({
      react: {
        entrypoint: "./src/frontend/index.tsx",
      },
      tailwind: {
        source: "./src/frontend/styles/app.css",
      },
    })
  )
  .listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
  });

export type App = typeof app;
