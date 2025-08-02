import { t } from "elysia"
import { AccountTypes } from "../../../types"

export const accountResponseSchema = t.Object({
  id: t.String(),
  name: t.String(),
  accountType: t.Enum(AccountTypes),
  createdAt: t.Date(),
  updatedAt: t.Date(),
})

export const accountCreateSchema = t.Object({
  name: t.String(),
  accountType: t.Enum(AccountTypes),
})

export const accountIdSchema = t.Object({
  id: t.String(),
})

export const errorResponseSchema = t.Object({
  error: t.String(),
})

export const successResponseSchema = t.Object({
  success: t.Boolean(),
})

export const accountUpdateSchema = t.Object({
  name: t.String(),
  accountType: t.Enum(AccountTypes),
})

export const accountMonthlyReportSchema = t.Object({
  id: t.String(),
  month: t.Number(),
  year: t.Number(),
})

export const accountMonthlyReportResponseSchema = t.Object({
  account: accountResponseSchema,
  totalTransactions: t.Number(),
  currentBalance: t.Number(),
  monthlyTotal: t.Number(),
})
