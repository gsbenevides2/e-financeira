import { t } from "elysia";

export const transactionResponseSchema = t.Object({
  id: t.String(),
  dateTime: t.Date(),
  thirdParty: t.String(),
  value: t.Number(),
  address: t.Optional(t.String()),
  description: t.String(),
  invoiceData: t.Optional(t.String()),
  accountId: t.String(),
  categoryId: t.String(),
  monthReferenceId: t.String(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export const transactionSearchFiltersSchema = t.Object({
  accountId: t.Optional(t.String()),
  categoryId: t.Optional(t.String()),
  startDate: t.Optional(t.Date()),
  endDate: t.Optional(t.Date()),
  minValue: t.Optional(t.Number()),
  maxValue: t.Optional(t.Number()),
  query: t.Optional(t.String()),
  monthReferenceId: t.Optional(t.String()),
  month: t.Optional(t.Number()),
  year: t.Optional(t.Number()),
});

export const transactionCreateSchema = t.Object({
  dateTime: t.Date(),
  thirdParty: t.String(),
  value: t.Number(),
  address: t.Optional(t.String()),
  description: t.String(),
  invoiceData: t.Optional(t.String()),
  accountId: t.String(),
  categoryId: t.String(),
  monthReferenceId: t.String(),
  relatedTransactionIds: t.Optional(t.Array(t.String())),
});

export const transactionIdSchema = t.Object({
  id: t.String(),
});

export const errorResponseSchema = t.Object({
  error: t.String(),
});

export const successResponseSchema = t.Object({
  success: t.Boolean(),
});

export const transactionUpdateSchema = t.Object({
  dateTime: t.Optional(t.Date()),
  thirdParty: t.Optional(t.String()),
  value: t.Optional(t.Number()),
  address: t.Optional(t.String()),
  description: t.Optional(t.String()),
  invoiceData: t.Optional(t.String()),
});

export const transactionLinkSchema = t.Object({
  relatedTransactionId: t.String(),
});

export const transactionMoveSchema = t.Object({
  targetAccountId: t.String(),
});

export const transactionMonthlyReportSchema = t.Object({
  year: t.Number(),
  month: t.Number(),
});

export const transactionMonthlyReportResponseSchema = t.Record(t.String(), t.Number());
