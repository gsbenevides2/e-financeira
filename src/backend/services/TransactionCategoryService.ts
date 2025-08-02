import { eq } from "drizzle-orm";
import type {
	CreateTransactionCategoryDto,
	Transaction,
	TransactionCategory,
	UpdateTransactionCategoryDto,
	UUID,
} from "../../types";
import { db } from "../db";
import { transactionCategories, transactions } from "../db/schema";

export class TransactionCategoryService {
	// Métodos CRUD básicos
	static async create(
		dto: CreateTransactionCategoryDto,
	): Promise<TransactionCategory> {
		const [category] = await db
			.insert(transactionCategories)
			.values({
				name: dto.name,
			})
			.returning();

		return {
			id: category.id,
			name: category.name,
			createdAt: category.createdAt,
			updatedAt: category.updatedAt,
		};
	}

	static async update(
		dto: UpdateTransactionCategoryDto,
	): Promise<TransactionCategory> {
		const [category] = await db
			.update(transactionCategories)
			.set({
				name: dto.name,
				updatedAt: new Date(),
			})
			.where(eq(transactionCategories.id, dto.id))
			.returning();

		if (!category) {
			throw new Error("Categoria não encontrada");
		}

		return {
			id: category.id,
			name: category.name,
			createdAt: category.createdAt,
			updatedAt: category.updatedAt,
		};
	}

	static async delete(id: UUID): Promise<void> {
		const result = await db
			.delete(transactionCategories)
			.where(eq(transactionCategories.id, id))
			.returning();

		if (result.length === 0) {
			throw new Error("Categoria não encontrada");
		}
	}

	static async getById(id: UUID): Promise<TransactionCategory | undefined> {
		const [category] = await db
			.select()
			.from(transactionCategories)
			.where(eq(transactionCategories.id, id));

		if (!category) return undefined;

		return {
			id: category.id,
			name: category.name,
			createdAt: category.createdAt,
			updatedAt: category.updatedAt,
		};
	}

	static async getAll(): Promise<TransactionCategory[]> {
		const categories = await db
			.select()
			.from(transactionCategories)
			.orderBy(transactionCategories.name);

		return categories.map((category) => ({
			id: category.id,
			name: category.name,
			createdAt: category.createdAt,
			updatedAt: category.updatedAt,
		}));
	}

	// Métodos baseados no UML - TransactionCategory Class
	static async addTransaction(
		categoryId: UUID,
		transactionId: UUID,
	): Promise<void> {
		// Liga uma transação a esta categoria
		await db
			.update(transactions)
			.set({
				categoryId,
				updatedAt: new Date(),
			})
			.where(eq(transactions.id, transactionId));
	}

	static async removeTransaction(
		categoryId: UUID,
		transactionId: UUID,
	): Promise<void> {
		// Remove a associação de uma transação com esta categoria
		const transaction = await db
			.select()
			.from(transactions)
			.where(eq(transactions.id, transactionId))
			.limit(1);

		if (transaction.length === 0) {
			throw new Error("Transação não encontrada");
		}

		if (transaction[0].categoryId !== categoryId) {
			throw new Error("A transação não pertence a esta categoria");
		}

		// Note: Como categoryId é obrigatório, não podemos simplesmente remover
		// Em um cenário real, seria necessário mover para outra categoria
		throw new Error(
			"Não é possível remover a categoria de uma transação. Mova para outra categoria primeiro.",
		);
	}

	static async listTransactions(categoryId: UUID): Promise<Transaction[]> {
		// Lista todas as transações desta categoria
		const transactionsList = await db
			.select()
			.from(transactions)
			.where(eq(transactions.categoryId, categoryId))
			.orderBy(transactions.dateTime);

		return transactionsList.map((tx) => ({
			id: tx.id,
			dateTime: tx.dateTime,
			thirdParty: tx.thirdParty,
			value: Number.parseFloat(tx.value),
			address: tx.address || undefined,
			description: tx.description,
			invoiceData: tx.invoiceData || undefined,
			accountId: tx.accountId,
			categoryId: tx.categoryId,
			monthReferenceId: tx.monthReferenceId,
			createdAt: tx.createdAt,
			updatedAt: tx.updatedAt,
		}));
	}

	static async updateName(categoryId: UUID, newName: string): Promise<void> {
		// Permite renomear a categoria
		const result = await db
			.update(transactionCategories)
			.set({
				name: newName,
				updatedAt: new Date(),
			})
			.where(eq(transactionCategories.id, categoryId))
			.returning();

		if (result.length === 0) {
			throw new Error("Categoria não encontrada");
		}
	}

	// Método adicional para verificar se uma categoria pode ser excluída
	static async canDelete(
		categoryId: UUID,
	): Promise<{ canDelete: boolean; reason?: string }> {
		const transactionCount = await db
			.select({ count: transactions.id })
			.from(transactions)
			.where(eq(transactions.categoryId, categoryId));

		if (transactionCount.length > 0) {
			return {
				canDelete: false,
				reason: `Esta categoria possui transações. Mova-as para outra categoria antes de excluir.`,
			};
		}

		return { canDelete: true };
	}
}
