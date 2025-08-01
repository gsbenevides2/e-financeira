import { basicAuth } from "@eelkevdbos/elysia-basic-auth";
import { cors } from "@elysiajs/cors";
import serverTiming from "@elysiajs/server-timing";
import staticPlugin from "@elysiajs/static";
import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import api from "./backend/api";
import App from "./frontend/App";
import { react } from "./plugins/react-builder";
import { tailwind } from "./plugins/tailwind-builder";

const app = new Elysia()
  .use(cors())
  .use(
    basicAuth({
      credentials: [
        {
          username: process.env.AUTH_USERNAME || "admin",
          password: process.env.AUTH_PASSWORD || "password123",
        },
      ],
    })
  )
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
          {
            name: "Web",
            description: "Web HTML routes",
          },
        ],
        components: {
          securitySchemes: {
            basicAuth: {
              type: "http",
              scheme: "basic",
            },
          },
        },
        security: [{ basicAuth: [] }],
      },
    })
  )
  .use(staticPlugin())
  .use(api)
  .use(
    tailwind({
      path: "/public/output.css",
      source: "./src/frontend/styles/app.css",
      config: {
        content: ["./src/frontend/**/*.{js,jsx,ts,tsx}"],
      },
      options: {
        minify: true,
        map: false,
        autoprefixer: false,
      },
    })
  )
  .use(
    react({
      entrypoint: "./src/frontend/index.tsx",
      publicDir: "./public",
      App,
    })
  )
  .listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
  });

export type App = typeof app;
