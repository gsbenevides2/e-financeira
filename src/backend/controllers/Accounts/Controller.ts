import { Elysia, t } from "elysia"
import { AccountService } from "../../services/AccountService"
import * as TransactionSchemas from "../Transactions/Schemas"
import * as AccountSchemas from "./Schemas"

const AccountController = new Elysia({
  prefix: "/accounts",
  detail: {
    tags: ["Accounts"],
  },
})
  .get(
    "/",
    async () => {
      const accounts = await AccountService.getAll()
      return accounts
    },
    {
      response: {
        200: t.Array(AccountSchemas.accountResponseSchema),
      },
      detail: {
        description: "Get all accounts",
      },
    },
  )
  .post(
    "/",
    async ({ body }) => {
      const account = await AccountService.create(body)
      return account
    },
    {
      body: AccountSchemas.accountCreateSchema,
      response: {
        201: AccountSchemas.accountResponseSchema,
      },
      detail: {
        description: "Create a new account",
      },
    },
  )
  .get(
    "/:id",
    async ({ params, status }) => {
      const account = await AccountService.getById(params.id)
      if (!account) {
        return status(404, {
          error: "Account not found",
        })
      }
      return account
    },
    {
      response: {
        200: AccountSchemas.accountResponseSchema,
        404: AccountSchemas.errorResponseSchema,
      },
      params: AccountSchemas.accountIdSchema,
      detail: {
        description: "Get an account by id",
      },
    },
  )
  .put(
    "/:id",
    async ({ params, body }) => {
      const account = await AccountService.update({
        id: params.id,
        ...body,
      })
      return account
    },
    {
      params: AccountSchemas.accountIdSchema,
      body: AccountSchemas.accountUpdateSchema,
      response: {
        200: AccountSchemas.accountResponseSchema,
      },
      detail: {
        description: "Update an account by id",
      },
    },
  )
  .delete(
    "/:id",
    async ({ params }) => {
      await AccountService.delete(params.id)
      return {
        success: true,
      }
    },
    {
      params: AccountSchemas.accountIdSchema,
      response: {
        200: AccountSchemas.successResponseSchema,
      },
      detail: {
        description: "Delete an account by id",
      },
    },
  )
  .get(
    "/:id/balance",
    async ({ params }) => {
      const balance = await AccountService.calculateBalance(params.id)
      return balance
    },
    {
      response: {
        200: t.Number(),
      },
      params: AccountSchemas.accountIdSchema,
      detail: {
        description: "Get the balance of an account by id",
      },
    },
  )
  .get(
    "/:id/transactions",
    async ({ params }) => {
      const transactions = await AccountService.listTransactions(params.id)
      return transactions
    },
    {
      response: {
        200: t.Array(TransactionSchemas.transactionResponseSchema),
      },
      params: AccountSchemas.accountIdSchema,
      detail: {
        description: "Get the transactions of an account by id",
      },
    },
  )
  .get(
    "/:id/monthly-report",
    async ({ params }) => {
      const monthlyReport = await AccountService.getAccountSummary(params.id, params.month, params.year)
      return monthlyReport
    },
    {
      response: {
        200: AccountSchemas.accountMonthlyReportResponseSchema,
      },
      params: AccountSchemas.accountMonthlyReportSchema,
      detail: {
        description: "Get the monthly report of an account by id",
      },
    },
  )

export default AccountController
