import { and, eq, gte, ilike, inArray, lte, or, type SQL } from "drizzle-orm";
import type {
	Account,
	CreateTransactionDto,
	MonthlySummary,
	Transaction,
	TransactionSearchFilters,
	UpdateTransactionDto,
	UUID,
} from "../../types";
import { db } from "../db";
import {
	accounts,
	transactionCategories,
	transactionRelations,
	transactions,
} from "../db/schema";
import { MonthReferenceService } from "./MonthReferenceService";

export class TransactionService {
	// Métodos CRUD básicos
	static async create(dto: CreateTransactionDto): Promise<Transaction> {
		// Verificar se a referência mensal está ativa
		const monthReference = await MonthReferenceService.getById(
			dto.monthReferenceId,
		);
		if (!monthReference) {
			throw new Error("Referência mensal não encontrada");
		}
		if (!monthReference.active) {
			throw new Error(
				"Não é possível criar transações para referências mensais inativas",
			);
		}

		const [transaction] = await db
			.insert(transactions)
			.values({
				dateTime: dto.dateTime,
				thirdParty: dto.thirdParty,
				value: dto.value.toString(),
				address: dto.address,
				description: dto.description,
				invoiceData: dto.invoiceData,
				accountId: dto.accountId,
				categoryId: dto.categoryId,
				monthReferenceId: dto.monthReferenceId,
			})
			.returning();

		// Se há transações relacionadas, criar as relações
		if (dto.relatedTransactionIds && dto.relatedTransactionIds.length > 0) {
			for (const relatedId of dto.relatedTransactionIds) {
				await TransactionService.linkTransaction(transaction.id, relatedId);
			}
		}

		return {
			id: transaction.id,
			dateTime: transaction.dateTime,
			thirdParty: transaction.thirdParty,
			value: Number.parseFloat(transaction.value),
			address: transaction.address || undefined,
			description: transaction.description,
			invoiceData: transaction.invoiceData || undefined,
			accountId: transaction.accountId,
			categoryId: transaction.categoryId,
			monthReferenceId: transaction.monthReferenceId,
			createdAt: transaction.createdAt,
			updatedAt: transaction.updatedAt,
		};
	}

	static async update(dto: UpdateTransactionDto): Promise<Transaction> {
		const updateData: {
			dateTime?: Date;
			thirdParty?: string;
			value?: string;
			address?: string;
			description?: string;
			invoiceData?: string;
			accountId?: UUID;
			categoryId?: UUID;
			updatedAt: Date;
		} = { updatedAt: new Date() };

		if (dto.dateTime !== undefined) updateData.dateTime = dto.dateTime;
		if (dto.thirdParty !== undefined) updateData.thirdParty = dto.thirdParty;
		if (dto.value !== undefined) updateData.value = dto.value.toString();
		if (dto.address !== undefined) updateData.address = dto.address;
		if (dto.description !== undefined) updateData.description = dto.description;
		if (dto.invoiceData !== undefined) updateData.invoiceData = dto.invoiceData;
		if (dto.accountId !== undefined) updateData.accountId = dto.accountId;
		if (dto.categoryId !== undefined) updateData.categoryId = dto.categoryId;

		const [transaction] = await db
			.update(transactions)
			.set(updateData)
			.where(eq(transactions.id, dto.id))
			.returning();

		if (!transaction) {
			throw new Error("Transação não encontrada");
		}

		return {
			id: transaction.id,
			dateTime: transaction.dateTime,
			thirdParty: transaction.thirdParty,
			value: Number.parseFloat(transaction.value),
			address: transaction.address || undefined,
			description: transaction.description,
			invoiceData: transaction.invoiceData || undefined,
			accountId: transaction.accountId,
			categoryId: transaction.categoryId,
			monthReferenceId: transaction.monthReferenceId,
			createdAt: transaction.createdAt,
			updatedAt: transaction.updatedAt,
		};
	}

	static async delete(id: UUID): Promise<void> {
		// Remove todas as relações desta transação
		await db
			.delete(transactionRelations)
			.where(
				or(
					eq(transactionRelations.parentTransactionId, id),
					eq(transactionRelations.relatedTransactionId, id),
				),
			);

		// Remove a transação
		const result = await db
			.delete(transactions)
			.where(eq(transactions.id, id))
			.returning();

		if (result.length === 0) {
			throw new Error("Transação não encontrada");
		}
	}

	static async getById(id: UUID): Promise<Transaction | undefined> {
		const [transaction] = await db
			.select()
			.from(transactions)
			.where(eq(transactions.id, id));

		if (!transaction) return undefined;

		return {
			id: transaction.id,
			dateTime: transaction.dateTime,
			thirdParty: transaction.thirdParty,
			value: Number.parseFloat(transaction.value),
			address: transaction.address || undefined,
			description: transaction.description,
			invoiceData: transaction.invoiceData || undefined,
			accountId: transaction.accountId,
			categoryId: transaction.categoryId,
			monthReferenceId: transaction.monthReferenceId,
			createdAt: transaction.createdAt,
			updatedAt: transaction.updatedAt,
		};
	}

	static async getAll(): Promise<Transaction[]> {
		const transactionsList = await db
			.select()
			.from(transactions)
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

	// Métodos baseados no UML - Transaction Class
	static async linkTransaction(
		transactionId: UUID,
		relatedTransactionId: UUID,
	): Promise<void> {
		// Verifica se as transações existem
		const transaction = await TransactionService.getById(transactionId);
		const relatedTransaction =
			await TransactionService.getById(relatedTransactionId);

		if (!transaction || !relatedTransaction) {
			throw new Error("Uma das transações não foi encontrada");
		}

		// Verifica se a relação já existe
		const [existingRelation] = await db
			.select()
			.from(transactionRelations)
			.where(
				and(
					eq(transactionRelations.parentTransactionId, transactionId),
					eq(transactionRelations.relatedTransactionId, relatedTransactionId),
				),
			);

		if (!existingRelation) {
			await db.insert(transactionRelations).values({
				parentTransactionId: transactionId,
				relatedTransactionId,
			});
		}

		// Cria relação bidirecional
		const [existingReverseRelation] = await db
			.select()
			.from(transactionRelations)
			.where(
				and(
					eq(transactionRelations.parentTransactionId, relatedTransactionId),
					eq(transactionRelations.relatedTransactionId, transactionId),
				),
			);

		if (!existingReverseRelation) {
			await db.insert(transactionRelations).values({
				parentTransactionId: relatedTransactionId,
				relatedTransactionId: transactionId,
			});
		}
	}

	static async unlinkTransaction(
		transactionId: UUID,
		relatedTransactionId: UUID,
	): Promise<void> {
		// Remove relação de ambos os lados
		await db
			.delete(transactionRelations)
			.where(
				and(
					eq(transactionRelations.parentTransactionId, transactionId),
					eq(transactionRelations.relatedTransactionId, relatedTransactionId),
				),
			);

		await db
			.delete(transactionRelations)
			.where(
				and(
					eq(transactionRelations.parentTransactionId, relatedTransactionId),
					eq(transactionRelations.relatedTransactionId, transactionId),
				),
			);
	}

	static async getRelatedTransactions(
		transactionId: UUID,
	): Promise<Transaction[]> {
		// Busca todas as transações relacionadas
		const relations = await db
			.select({
				relatedId: transactionRelations.relatedTransactionId,
			})
			.from(transactionRelations)
			.where(eq(transactionRelations.parentTransactionId, transactionId));

		if (relations.length === 0) return [];

		const relatedIds = relations.map((r) => r.relatedId);
		const relatedTransactions = await db
			.select()
			.from(transactions)
			.where(inArray(transactions.id, relatedIds));

		return relatedTransactions.map((tx) => ({
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

	static async moveToAccount(
		transactionId: UUID,
		targetAccountId: UUID,
	): Promise<void> {
		const transaction = await TransactionService.getById(transactionId);
		if (!transaction) {
			throw new Error("Transação não encontrada");
		}

		// Verifica se a conta de destino existe
		const [account] = await db
			.select()
			.from(accounts)
			.where(eq(accounts.id, targetAccountId));

		if (!account) {
			throw new Error("Conta de destino não encontrada");
		}

		await TransactionService.update({
			id: transactionId,
			accountId: targetAccountId,
		});
	}

	static async updateCategory(
		transactionId: UUID,
		categoryId: UUID,
	): Promise<void> {
		const transaction = await TransactionService.getById(transactionId);
		if (!transaction) {
			throw new Error("Transação não encontrada");
		}

		// Verifica se a categoria existe
		const [category] = await db
			.select()
			.from(transactionCategories)
			.where(eq(transactionCategories.id, categoryId));

		if (!category) {
			throw new Error("Categoria não encontrada");
		}

		await TransactionService.update({ id: transactionId, categoryId });
	}

	// Método de busca avançada baseado no UML
	static async search(
		filters: TransactionSearchFilters,
	): Promise<Transaction[]> {
		const whereConditions: SQL<unknown>[] = [];

		// Filtro por conta
		if (filters.accountId) {
			whereConditions.push(eq(transactions.accountId, filters.accountId));
		}

		// Filtro por categoria
		if (filters.categoryId) {
			whereConditions.push(eq(transactions.categoryId, filters.categoryId));
		}

		// Filtro por mês/ano de referência
		if (filters.monthReferenceId) {
			whereConditions.push(
				eq(transactions.monthReferenceId, filters.monthReferenceId),
			);
		} else if (filters.month && filters.year) {
			const monthReference = await MonthReferenceService.findByMonthAndYear(
				filters.month,
				filters.year,
			);
			if (monthReference) {
				whereConditions.push(
					eq(transactions.monthReferenceId, monthReference.id),
				);
			}
		}

		// Filtro por data
		if (filters.startDate) {
			whereConditions.push(gte(transactions.dateTime, filters.startDate));
		}

		if (filters.endDate) {
			whereConditions.push(lte(transactions.dateTime, filters.endDate));
		}

		if (filters.query) {
			const orConditions = or(
				ilike(transactions.description, `%${filters.query}%`),
				ilike(transactions.thirdParty, `%${filters.query}%`),
				ilike(transactions.address, `%${filters.query}%`),
			);
			if (orConditions) whereConditions.push(orConditions);
		}

		if (whereConditions.length === 0) {
			return [];
		}

		const transactionsList =
			whereConditions.length > 0
				? await db
						.select()
						.from(transactions)
						.where(and(...whereConditions))
						.orderBy(transactions.dateTime)
				: await db.select().from(transactions).orderBy(transactions.dateTime);

		// Conversão para o tipo Transaction
		let filteredTransactions = transactionsList.map((tx) => ({
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

		// Filtros adicionais no código (para casos mais complexos)
		if (filters.query) {
			const queryLower = filters.query.toLowerCase();
			filteredTransactions = filteredTransactions.filter(
				(tx) =>
					tx.description.toLowerCase().includes(queryLower) ||
					tx.thirdParty.toLowerCase().includes(queryLower) ||
					(tx.address ? tx.address.toLowerCase().includes(queryLower) : false),
			);
		}

		if (filters.minValue !== undefined) {
			filteredTransactions = filteredTransactions.filter(
				(tx) => tx.value >= (filters.minValue ?? 0),
			);
		}

		if (filters.maxValue !== undefined) {
			filteredTransactions = filteredTransactions.filter(
				(tx) => tx.value <= (filters.maxValue ?? 0),
			);
		}

		if (filters.thirdParty) {
			const thirdPartyLower = filters.thirdParty.toLowerCase();
			filteredTransactions = filteredTransactions.filter((tx) =>
				tx.thirdParty.toLowerCase().includes(thirdPartyLower),
			);
		}

		return filteredTransactions;
	}

	// Método do UML - matchesSearch
	static async matchesSearch(
		transactionId: UUID,
		query?: string,
		startDate?: Date,
		endDate?: Date,
		minValue?: number,
		maxValue?: number,
	): Promise<boolean> {
		const results = await TransactionService.search({
			query,
			startDate,
			endDate,
			minValue,
			maxValue,
		});

		return results.some((t) => t.id === transactionId);
	}

	// Métodos adicionais baseados no UML - TransactionService Class
	static async searchTransactions(
		account: Account,
		query: string,
		startDate: Date,
		endDate: Date,
		minValue: number,
		maxValue: number,
	): Promise<Transaction[]> {
		return TransactionService.search({
			accountId: account.id,
			query,
			startDate,
			endDate,
			minValue,
			maxValue,
		});
	}

	static async generateMonthlySummary(
		year: number,
		month: number,
	): Promise<MonthlySummary> {
		const monthReference = await MonthReferenceService.findByMonthAndYear(
			month,
			year,
		);

		if (!monthReference) {
			return {};
		}

		const monthlyTransactions = await db
			.select({
				accountId: transactions.accountId,
				value: transactions.value,
			})
			.from(transactions)
			.where(eq(transactions.monthReferenceId, monthReference.id));

		const summary: MonthlySummary = {};

		for (const tx of monthlyTransactions) {
			if (!summary[tx.accountId]) {
				summary[tx.accountId] = 0;
			}
			summary[tx.accountId] += Number.parseFloat(tx.value);
		}

		return summary;
	}

	// Métodos auxiliares para relatórios
	static async getTransactionsByAccount(
		accountId: UUID,
	): Promise<Transaction[]> {
		return TransactionService.search({ accountId });
	}

	static async getTransactionsByCategory(
		categoryId: UUID,
	): Promise<Transaction[]> {
		return TransactionService.search({ categoryId });
	}

	static async getTransactionsByDateRange(
		startDate: Date,
		endDate: Date,
	): Promise<Transaction[]> {
		return TransactionService.search({ startDate, endDate });
	}
}
