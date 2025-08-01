import { Elysia } from "elysia";
import AccountController from "./controllers/Accounts/Controller";
import CategoryController from "./controllers/Categories/Controller";
import MonthReferenceController from "./controllers/MonthReference/Controller";
import TransactionController from "./controllers/Transactions/Controller";

const api = new Elysia({
  prefix: "/api",
})
  .use(AccountController)
  .use(TransactionController)
  .use(CategoryController)
  .use(MonthReferenceController)
  .use(TransactionController);

export default api;
