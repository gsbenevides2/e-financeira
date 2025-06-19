import { relations } from "drizzle-orm";
import { decimal, integer, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Enum para tipos de conta
export const accountTypesEnum = pgEnum("account_types", ["Debit", "Credit"]);

// Tabela TransactionCategory
export const transactionCategories = pgTable("transaction_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Tabela Account
export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  accountType: accountTypesEnum("account_type").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Tabela MonthReference
export const monthReferences = pgTable("month_references", {
  id: uuid("id").primaryKey().defaultRandom(),
  month: integer("month").notNull(),
  year: integer("year").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Tabela Transaction
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  dateTime: timestamp("date_time").notNull(),
  thirdParty: text("third_party").notNull(),
  value: decimal("value", { precision: 15, scale: 2 }).notNull(),
  address: text("address"),
  description: text("description").notNull(),
  invoiceData: text("invoice_data"),
  accountId: uuid("account_id")
    .notNull()
    .references(() => accounts.id),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => transactionCategories.id),
  monthReferenceId: uuid("month_reference_id")
    .notNull()
    .references(() => monthReferences.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Tabela para auto-relação de transações (relatedTransactions e parentTransactions)
export const transactionRelations = pgTable("transaction_relations", {
  id: uuid("id").primaryKey().defaultRandom(),
  parentTransactionId: uuid("parent_transaction_id")
    .notNull()
    .references(() => transactions.id, { onDelete: "cascade" }),
  relatedTransactionId: uuid("related_transaction_id")
    .notNull()
    .references(() => transactions.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Definindo as relações
export const transactionCategoriesRelations = relations(transactionCategories, ({ many }) => ({
  transactions: many(transactions),
}));

export const accountsRelations = relations(accounts, ({ many }) => ({
  transactions: many(transactions),
}));

export const monthReferencesRelations = relations(monthReferences, ({ many }) => ({
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id],
  }),
  category: one(transactionCategories, {
    fields: [transactions.categoryId],
    references: [transactionCategories.id],
  }),
  monthReference: one(monthReferences, {
    fields: [transactions.monthReferenceId],
    references: [monthReferences.id],
  }),
  // Relações para transações relacionadas
  parentRelations: many(transactionRelations, {
    relationName: "parentTransaction",
  }),
  childRelations: many(transactionRelations, {
    relationName: "relatedTransaction",
  }),
}));

export const transactionRelationsRelations = relations(transactionRelations, ({ one }) => ({
  parentTransaction: one(transactions, {
    fields: [transactionRelations.parentTransactionId],
    references: [transactions.id],
    relationName: "parentTransaction",
  }),
  relatedTransaction: one(transactions, {
    fields: [transactionRelations.relatedTransactionId],
    references: [transactions.id],
    relationName: "relatedTransaction",
  }),
}));
