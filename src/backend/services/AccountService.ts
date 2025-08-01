import { and, eq, gte, lte, sum } from "drizzle-orm";
import type { Account, AccountSummary, CreateAccountDto, Transaction, UpdateAccountDto, UUID } from "../../types";
import { AccountTypes } from "../../types";
import { db } from "../db";
import { accounts, transactions } from "../db/schema";

export class AccountService {
  // Métodos CRUD básicos
  static async create(dto: CreateAccountDto): Promise<Account> {
    const [account] = await db
      .insert(accounts)
      .values({
        name: dto.name,
        accountType: dto.accountType,
      })
      .returning();

    return {
      id: account.id,
      name: account.name,
      accountType: account.accountType as AccountTypes,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }

  static async update(dto: UpdateAccountDto): Promise<Account> {
    const [account] = await db
      .update(accounts)
      .set({
        name: dto.name,
        accountType: dto.accountType,
        updatedAt: new Date(),
      })
      .where(eq(accounts.id, dto.id))
      .returning();

    if (!account) {
      throw new Error("Conta não encontrada");
    }

    return {
      id: account.id,
      name: account.name,
      accountType: account.accountType as AccountTypes,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }

  static async delete(id: UUID): Promise<void> {
    // Verifica se há transações vinculadas
    const transactionCount = await db.select({ count: transactions.id }).from(transactions).where(eq(transactions.accountId, id));

    if (transactionCount.length > 0) {
      throw new Error("Não é possível excluir uma conta que possui transações. Mova as transações para outra conta primeiro.");
    }

    const result = await db.delete(accounts).where(eq(accounts.id, id)).returning();

    if (result.length === 0) {
      throw new Error("Conta não encontrada");
    }
  }

  static async getById(id: UUID): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(eq(accounts.id, id));

    if (!account) return undefined;

    return {
      id: account.id,
      name: account.name,
      accountType: account.accountType as AccountTypes,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }

  static async getAll(): Promise<Account[]> {
    const accountsList = await db.select().from(accounts).orderBy(accounts.name);

    return accountsList.map((account) => ({
      id: account.id,
      name: account.name,
      accountType: account.accountType as AccountTypes,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    }));
  }

  // Métodos baseados no UML - Account Class
  static async getTotalForMonth(accountId: UUID, month: number, year: number): Promise<number> {
    const account = await this.getById(accountId);
    if (!account) {
      throw new Error("Conta não encontrada");
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const result = await db
      .select({ total: sum(transactions.value) })
      .from(transactions)
      .where(and(eq(transactions.accountId, accountId), gte(transactions.dateTime, startDate), lte(transactions.dateTime, endDate)));

    return parseFloat(result[0]?.total || "0");
  }

  static async listTransactions(accountId: UUID, startDate?: Date, endDate?: Date, query?: string, minValue?: number, maxValue?: number): Promise<Transaction[]> {
    const account = await this.getById(accountId);
    if (!account) {
      throw new Error("Conta não encontrada");
    }

    let whereConditions = [eq(transactions.accountId, accountId)];

    if (startDate) {
      whereConditions.push(gte(transactions.dateTime, startDate));
    }

    if (endDate) {
      whereConditions.push(lte(transactions.dateTime, endDate));
    }

    // Note: Para implementar filtros por query, minValue e maxValue,
    // seria necessário usar SQL mais complexo ou filtrar no código
    const transactionsList = await db
      .select()
      .from(transactions)
      .where(and(...whereConditions))
      .orderBy(transactions.dateTime);

    let filteredTransactions = transactionsList.map((tx) => ({
      id: tx.id,
      dateTime: tx.dateTime,
      thirdParty: tx.thirdParty,
      value: parseFloat(tx.value),
      address: tx.address || undefined,
      description: tx.description,
      invoiceData: tx.invoiceData || undefined,
      accountId: tx.accountId,
      categoryId: tx.categoryId,
      createdAt: tx.createdAt,
      updatedAt: tx.updatedAt,
      monthReferenceId: tx.monthReferenceId,
    }));

    // Filtros adicionais no código
    if (query) {
      const queryLower = query.toLowerCase();
      filteredTransactions = filteredTransactions.filter((tx) => tx.description.toLowerCase().includes(queryLower) || tx.thirdParty.toLowerCase().includes(queryLower) || (tx.address && tx.address.toLowerCase().includes(queryLower)));
    }

    if (minValue !== undefined) {
      filteredTransactions = filteredTransactions.filter((tx) => tx.value >= minValue);
    }

    if (maxValue !== undefined) {
      filteredTransactions = filteredTransactions.filter((tx) => tx.value <= maxValue);
    }

    return filteredTransactions;
  }

  static async calculateBalance(accountId: UUID): Promise<number> {
    const account = await this.getById(accountId);
    if (!account) {
      throw new Error("Conta não encontrada");
    }

    const result = await db
      .select({ total: sum(transactions.value) })
      .from(transactions)
      .where(eq(transactions.accountId, accountId));

    const total = parseFloat(result[0]?.total || "0");

    // Para contas de débito, o saldo é negativo (saída de recursos)
    // Para contas de crédito, o saldo é positivo (entrada de recursos)
    return account.accountType === AccountTypes.DEBIT ? -total : total;
  }

  static async addTransaction(accountId: UUID, transactionId: UUID): Promise<void> {
    const account = await this.getById(accountId);
    if (!account) {
      throw new Error("Conta não encontrada");
    }

    // Atualiza a transação para ter o accountId correto
    await db
      .update(transactions)
      .set({
        accountId: accountId,
        updatedAt: new Date(),
      })
      .where(eq(transactions.id, transactionId));
  }

  static async removeTransaction(accountId: UUID, transactionId: UUID): Promise<void> {
    const account = await this.getById(accountId);
    if (!account) {
      throw new Error("Conta não encontrada");
    }

    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, transactionId)).limit(1);

    if (!transaction) {
      throw new Error("Transação não encontrada");
    }

    if (transaction.accountId !== accountId) {
      throw new Error("A transação não pertence a esta conta");
    }

    // Como accountId é obrigatório, não podemos simplesmente remover
    throw new Error("Para remover uma transação de uma conta, mova-a para outra conta ou exclua-a");
  }

  // Métodos adicionais
  static async getAccountsByType(type: AccountTypes): Promise<Account[]> {
    const accountsList = await db.select().from(accounts).where(eq(accounts.accountType, type)).orderBy(accounts.name);

    return accountsList.map((account) => ({
      id: account.id,
      name: account.name,
      accountType: account.accountType as AccountTypes,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    }));
  }

  static async getDebitAccounts(): Promise<Account[]> {
    return this.getAccountsByType(AccountTypes.DEBIT);
  }

  static async getCreditAccounts(): Promise<Account[]> {
    return this.getAccountsByType(AccountTypes.CREDIT);
  }

  static async getAccountSummary(accountId: UUID, month?: number, year?: number): Promise<AccountSummary> {
    const account = await this.getById(accountId);
    if (!account) {
      throw new Error("Conta não encontrada");
    }

    const allTransactionsCount = await db.select({ count: transactions.id }).from(transactions).where(eq(transactions.accountId, accountId));

    const currentBalance = await this.calculateBalance(accountId);

    let monthlyTotal = 0;
    if (month && year) {
      monthlyTotal = await this.getTotalForMonth(accountId, month, year);
    }

    return {
      account,
      totalTransactions: allTransactionsCount.length,
      currentBalance,
      monthlyTotal,
    };
  }

  static async getAllAccountsSummary(month?: number, year?: number): Promise<AccountSummary[]> {
    const accountsList = await this.getAll();
    const summaries: AccountSummary[] = [];

    for (const account of accountsList) {
      const summary = await this.getAccountSummary(account.id, month, year);
      summaries.push(summary);
    }

    return summaries;
  }

  // Método para validar se uma conta pode ser excluída
  static async canDelete(accountId: UUID): Promise<{ canDelete: boolean; reason?: string }> {
    const account = await this.getById(accountId);
    if (!account) {
      return { canDelete: false, reason: "Conta não encontrada" };
    }

    const transactionCount = await db.select({ count: transactions.id }).from(transactions).where(eq(transactions.accountId, accountId));

    if (transactionCount.length > 0) {
      return {
        canDelete: false,
        reason: `Esta conta possui ${transactionCount.length} transação(ões). Mova-as para outra conta antes de excluir.`,
      };
    }

    return { canDelete: true };
  }

  // Método para obter contas com saldo (útil para relatórios)
  static async getAccountsWithBalance(): Promise<Array<Account & { balance: number }>> {
    const accountsList = await this.getAll();
    const accountsWithBalance: Array<Account & { balance: number }> = [];

    for (const account of accountsList) {
      const balance = await this.calculateBalance(account.id);
      accountsWithBalance.push({
        ...account,
        balance,
      });
    }

    return accountsWithBalance;
  }
}
