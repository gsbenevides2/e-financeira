import { t } from "elysia"

export const monthReferenceCreateSchema = t.Object({
  month: t.Number(),
  year: t.Number(),
  active: t.Optional(t.Boolean()),
})

export const monthReferenceResponseSchema = t.Object({
  id: t.String(),
  month: t.Number(),
  year: t.Number(),
  active: t.Boolean(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
})

export const monthReferenceUpdateSchema = t.Object({
  month: t.Optional(t.Number()),
  year: t.Optional(t.Number()),
  active: t.Optional(t.Boolean()),
})

export const errorResponseSchema = t.Object({
  error: t.String(),
})

export const successResponseSchema = t.Object({
  success: t.Boolean(),
})

export const monthReferenceIdSchema = t.Object({
  id: t.String(),
})

export const monthReferenceFindOrCreateSchema = t.Object({
  month: t.Number(),
  year: t.Number(),
})
