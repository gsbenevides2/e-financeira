import { Elysia } from "elysia";

export const coolifyHealthChecker = new Elysia().get("/health", () => {
  return "OK";
});
