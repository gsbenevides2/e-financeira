import { Elysia, t } from "elysia";
import { MonthReferenceService } from "../../services/MonthReferenceService";
import { TransactionService } from "../../services/TransactionService";
import * as TransactionSchemas from "../Transactions/Schemas";
import * as MonthReferenceSchemas from "./Schemas";

const MonthReferenceController = new Elysia({
	prefix: "/month-references",
	detail: {
		tags: ["Month References"],
	},
})
	.get(
		"/",
		async () => {
			const monthReferences = await MonthReferenceService.getAll();
			return monthReferences;
		},
		{
			response: {
				200: t.Array(MonthReferenceSchemas.monthReferenceResponseSchema),
			},
			detail: {
				description: "Get all month references",
			},
		},
	)
	.post(
		"/",
		async ({ body }) => {
			const monthReference = await MonthReferenceService.create(body);
			return monthReference;
		},
		{
			body: MonthReferenceSchemas.monthReferenceCreateSchema,
			response: {
				201: MonthReferenceSchemas.monthReferenceResponseSchema,
			},
			detail: {
				description: "Create a new month reference",
			},
		},
	)
	.get(
		"/:id",
		async ({ params, status }) => {
			const monthReference = await MonthReferenceService.getById(params.id);
			if (!monthReference) {
				return status(404, {
					error: "Month reference not found",
				});
			}
			return monthReference;
		},
		{
			response: {
				404: MonthReferenceSchemas.errorResponseSchema,
				200: MonthReferenceSchemas.monthReferenceResponseSchema,
			},
			params: MonthReferenceSchemas.monthReferenceIdSchema,
			detail: {
				description: "Get a month reference by id",
			},
		},
	)
	.put(
		"/:id",
		async ({ params, body }) => {
			const monthReference = await MonthReferenceService.update({
				id: params.id,
				month: body.month,
				year: body.year,
				active: body.active,
			});
			return monthReference;
		},
		{
			params: MonthReferenceSchemas.monthReferenceIdSchema,
			body: MonthReferenceSchemas.monthReferenceUpdateSchema,
			detail: {
				description: "Update a month reference by id",
			},
		},
	)
	.delete(
		"/:id",
		async ({ params, status }) => {
			const success = await MonthReferenceService.delete(params.id);
			if (!success) {
				return status(404, {
					error: "Month reference not found",
				});
			}
			return status(200, {
				success: true,
			});
		},
		{
			params: MonthReferenceSchemas.monthReferenceIdSchema,
			response: {
				200: MonthReferenceSchemas.successResponseSchema,
				404: MonthReferenceSchemas.errorResponseSchema,
			},
			detail: {
				description: "Delete a month reference by id",
			},
		},
	)
	.get(
		"/find",
		async ({ query, status }) => {
			const monthReference = await MonthReferenceService.findByMonthAndYear(
				query.month,
				query.year,
			);
			if (!monthReference) {
				return status(404, {
					error: "Month reference not found",
				});
			}
			return monthReference;
		},
		{
			query: MonthReferenceSchemas.monthReferenceFindOrCreateSchema,
			response: {
				200: MonthReferenceSchemas.monthReferenceResponseSchema,
				404: MonthReferenceSchemas.errorResponseSchema,
			},
			detail: {
				description: "Find or create a month reference",
			},
		},
	)
	.get(
		"/:id/transactions",
		async ({ params }) => {
			const transactions = await TransactionService.search({
				monthReferenceId: params.id,
			});
			return transactions;
		},
		{
			response: {
				200: t.Array(TransactionSchemas.transactionResponseSchema),
			},
			detail: {
				description: "Get the transactions of a month reference by id",
			},
		},
	)
	.put(
		"/:id/toggle-active",
		async ({ params, status }) => {
			const monthReference = await MonthReferenceService.toggleActive(
				params.id,
			);
			if (!monthReference) {
				return status(404, {
					error: "Month reference not found",
				});
			}
			return monthReference;
		},
		{
			response: {
				200: MonthReferenceSchemas.monthReferenceResponseSchema,
				404: MonthReferenceSchemas.errorResponseSchema,
			},
			params: MonthReferenceSchemas.monthReferenceIdSchema,
			detail: {
				description: "Toggle the active status of a month reference by id",
			},
		},
	);

export default MonthReferenceController;
