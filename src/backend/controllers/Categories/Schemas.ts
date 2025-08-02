import { t } from "elysia";

export const categoryResponseSchema = t.Object({
	id: t.String(),
	name: t.String(),
	createdAt: t.Date(),
	updatedAt: t.Date(),
});

export const categoryCreateSchema = t.Object({
	name: t.String(),
});

export const categoryIdSchema = t.Object({
	id: t.String(),
});

export const errorResponseSchema = t.Object({
	error: t.String(),
});

export const successResponseSchema = t.Object({
	success: t.Boolean(),
});

export const categoryUpdateSchema = t.Object({
	name: t.String(),
});
