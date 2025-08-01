import { Elysia, t } from "elysia";
import { TransactionService } from "../../services/TransactionService";
import * as TransactionSchemas from "./Schemas";

const TransactionController = new Elysia({
  prefix: "/transactions",
  detail: {
    tags: ["Transactions"],
  },
})
  .get(
    "/",
    async ({ query }) => {
      const transactions = await TransactionService.search(query);
      return transactions;
    },
    {
      response: {
        200: t.Array(TransactionSchemas.transactionResponseSchema),
      },
      detail: {
        description: "Get all transactions",
      },
      query: TransactionSchemas.transactionSearchFiltersSchema,
    }
  )
  .post(
    "/",
    async ({ body }) => {
      const transaction = await TransactionService.create(body);
      return transaction;
    },
    {
      body: TransactionSchemas.transactionCreateSchema,
      response: {
        201: TransactionSchemas.transactionResponseSchema,
      },
      detail: {
        description: "Create a new transaction",
      },
    }
  )
  .get(
    "/:id",
    async ({ params, status }) => {
      const transaction = await TransactionService.getById(params.id);
      if (!transaction) {
        return status(404, {
          error: "Transaction not found",
        });
      }
      return transaction;
    },
    {
      response: {
        200: TransactionSchemas.transactionResponseSchema,
        404: TransactionSchemas.errorResponseSchema,
      },
      params: TransactionSchemas.transactionIdSchema,
      detail: {
        description: "Get a transaction by id",
      },
    }
  )
  .put(
    "/:id",
    async ({ params, body }) => {
      const transaction = await TransactionService.update({
        id: params.id,
        ...body,
      });
      return transaction;
    },
    {
      response: {
        200: TransactionSchemas.transactionResponseSchema,
      },
      params: TransactionSchemas.transactionIdSchema,
      body: TransactionSchemas.transactionUpdateSchema,
      detail: {
        description: "Update a transaction by id",
      },
    }
  )
  .delete(
    "/:id",
    async ({ params }) => {
      await TransactionService.delete(params.id);
      return {
        success: true,
      };
    },
    {
      response: {
        200: TransactionSchemas.successResponseSchema,
      },
      params: TransactionSchemas.transactionIdSchema,
      detail: {
        description: "Delete a transaction by id",
      },
    }
  )
  .post(
    "/:id/link",
    async ({ params, body }) => {
      await TransactionService.linkTransaction(params.id, body.relatedTransactionId);
      return {
        success: true,
      };
    },
    {
      response: {
        200: TransactionSchemas.successResponseSchema,
      },
      params: TransactionSchemas.transactionIdSchema,
      body: TransactionSchemas.transactionLinkSchema,
      detail: {
        description: "Link a transaction to another transaction",
      },
    }
  )
  .post(
    "/:id/unlink",
    async ({ params, body }) => {
      await TransactionService.unlinkTransaction(params.id, body.relatedTransactionId);
      return {
        success: true,
      };
    },
    {
      response: {
        200: TransactionSchemas.successResponseSchema,
      },
      params: TransactionSchemas.transactionIdSchema,
      body: TransactionSchemas.transactionLinkSchema,
      detail: {
        description: "Unlink a transaction from another transaction",
      },
    }
  )
  .post(
    "/:id/move",
    async ({ params, body }) => {
      await TransactionService.moveToAccount(params.id, body.targetAccountId);
      return {
        success: true,
      };
    },
    {
      response: {
        200: TransactionSchemas.successResponseSchema,
      },
      params: TransactionSchemas.transactionIdSchema,
      body: TransactionSchemas.transactionMoveSchema,
      detail: {
        description: "Move a transaction to another account",
      },
    }
  )
  .get(
    "/:id/related",
    async ({ params }) => {
      const relatedTransactions = await TransactionService.getRelatedTransactions(params.id);
      return relatedTransactions;
    },
    {
      response: {
        200: t.Array(TransactionSchemas.transactionResponseSchema),
      },
      params: TransactionSchemas.transactionIdSchema,
      detail: {
        description: "Get the related transactions of a transaction by id",
      },
    }
  )
  .get(
    "/monthly-report",
    async ({ query }) => {
      const monthlyReport = await TransactionService.generateMonthlySummary(query.year, query.month);
      return monthlyReport;
    },
    {
      response: {
        200: TransactionSchemas.transactionMonthlyReportResponseSchema,
      },
      query: TransactionSchemas.transactionMonthlyReportSchema,
      detail: {
        description: "Get the monthly report of a transaction by id",
      },
    }
  );

export default TransactionController;
