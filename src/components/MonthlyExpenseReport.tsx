import {
    BarChart3,
    Calendar,
    Download,
    TrendingDown,
    TrendingUp,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import type { Account, Transaction, TransactionCategory } from "../types";
import { AccountTypes } from "../types";
import { formatCurrency, getCurrentMonth } from "../utils/formatters";
import { Button } from "./ui/button";

interface ExpensesByCategory {
    [categoryId: string]: {
        category: TransactionCategory;
        total: number;
        transactions: Transaction[];
    };
}

interface ExpensesByAccount {
    [accountId: string]: {
        account: Account;
        total: number;
        byCategory: ExpensesByCategory;
    };
}

export const MonthlyExpenseReport: React.FC = () => {
    const [expensesByAccount, setExpensesByAccount] = useState<
        ExpensesByAccount
    >({});
    const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [categories, setCategories] = useState<TransactionCategory[]>([]);
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const current = getCurrentMonth();
        return current.month;
    });
    const [selectedYear, setSelectedYear] = useState(() => {
        const current = getCurrentMonth();
        return current.year;
    });
    const [selectedAccountType, setSelectedAccountType] = useState<string>(
        "all",
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadData();
    }, [selectedMonth, selectedYear]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({
                year: selectedYear.toString(),
                month: selectedMonth.toString(),
            });

            const [transactionsResponse, accountsResponse, categoriesResponse] =
                await Promise.all([
                    fetch(
                        `/api/transactions?startDate=${selectedYear}-${
                            selectedMonth.toString().padStart(2, "0")
                        }-01&endDate=${selectedYear}-${
                            selectedMonth.toString().padStart(2, "0")
                        }-31`,
                    ),
                    fetch("/api/accounts"),
                    fetch("/api/categories"),
                ]);

            if (
                !transactionsResponse.ok || !accountsResponse.ok ||
                !categoriesResponse.ok
            ) {
                throw new Error("Erro ao carregar dados do relatório");
            }

            const [transactionsData, accountsData, categoriesData] =
                await Promise.all([
                    transactionsResponse.json(),
                    accountsResponse.json(),
                    categoriesResponse.json(),
                ]);

            setAllTransactions(transactionsData);
            setAccounts(accountsData);
            setCategories(categoriesData);

            // Organizar dados por conta e categoria
            const expensesByAccount: ExpensesByAccount = {};

            accountsData.forEach((account: Account) => {
                expensesByAccount[account.id] = {
                    account,
                    total: 0,
                    byCategory: {},
                };
            });

            transactionsData.forEach((transaction: Transaction) => {
                const accountExpenses =
                    expensesByAccount[transaction.accountId];
                if (!accountExpenses) return;

                accountExpenses.total += transaction.value;

                if (!accountExpenses.byCategory[transaction.categoryId]) {
                    const category = categoriesData.find((
                        c: TransactionCategory,
                    ) => c.id === transaction.categoryId);
                    accountExpenses.byCategory[transaction.categoryId] = {
                        category: category ||
                            {
                                id: transaction.categoryId,
                                name: "Categoria não encontrada",
                            },
                        total: 0,
                        transactions: [],
                    };
                }

                accountExpenses.byCategory[transaction.categoryId].total +=
                    transaction.value;
                accountExpenses.byCategory[transaction.categoryId].transactions
                    .push(transaction);
            });

            setExpensesByAccount(expensesByAccount);
        } catch (err) {
            setError("Erro ao carregar relatório");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const generateYearOptions = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let year = currentYear - 5; year <= currentYear + 1; year++) {
            years.push(year);
        }
        return years;
    };

    const monthNames = [
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro",
    ];

    const getFilteredAccounts = () => {
        if (selectedAccountType === "all") return accounts;
        return accounts.filter((account) =>
            account.accountType === selectedAccountType
        );
    };

    const getTotalsByAccountType = (accountType: AccountTypes) => {
        return Object.values(expensesByAccount)
            .filter((data) => data.account.accountType === accountType)
            .reduce((sum, data) => sum + data.total, 0);
    };

    const getGrandTotal = () => {
        return Object.values(expensesByAccount)
            .reduce((sum, data) => sum + data.total, 0);
    };

    const exportData = () => {
        const data = Object.values(expensesByAccount)
            .filter((accountData) =>
                getFilteredAccounts().some((acc) =>
                    acc.id === accountData.account.id
                )
            )
            .map((accountData) => ({
                conta: accountData.account.name,
                tipo: accountData.account.accountType,
                total: accountData.total,
                categorias: Object.values(accountData.byCategory).map(
                    (catData) => ({
                        categoria: catData.category.name,
                        total: catData.total,
                        transacoes: catData.transactions.length,
                    }),
                ),
            }));

        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `relatorio-mensal-${
            monthNames[selectedMonth - 1]
        }-${selectedYear}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="text-gray-400">Carregando relatório...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-900 border border-red-800 rounded-md p-4">
                <div className="text-red-200">{error}</div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={loadData}
                    className="mt-2 border-red-700 text-red-300 hover:bg-red-800"
                >
                    Tentar novamente
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <div>
                        <label
                            htmlFor="month"
                            className="block text-sm font-medium text-gray-300 mb-1"
                        >
                            Mês
                        </label>
                        <select
                            id="month"
                            value={selectedMonth}
                            onChange={(e) =>
                                setSelectedMonth(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-200"
                        >
                            {monthNames.map((month, index) => (
                                <option key={index + 1} value={index + 1}>
                                    {month}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label
                            htmlFor="year"
                            className="block text-sm font-medium text-gray-300 mb-1"
                        >
                            Ano
                        </label>
                        <select
                            id="year"
                            value={selectedYear}
                            onChange={(e) =>
                                setSelectedYear(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-200"
                        >
                            {generateYearOptions().map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex items-center space-x-4">
                    <div>
                        <label
                            htmlFor="accountType"
                            className="block text-sm font-medium text-gray-300 mb-1"
                        >
                            Tipo de Conta
                        </label>
                        <select
                            id="accountType"
                            value={selectedAccountType}
                            onChange={(e) =>
                                setSelectedAccountType(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-200"
                        >
                            <option value="all">Todas</option>
                            <option value={AccountTypes.DEBIT}>Débito</option>
                            <option value={AccountTypes.CREDIT}>Crédito</option>
                        </select>
                    </div>

                    <Button
                        onClick={() => exportData()}
                        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Exportar
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-400">
                                Total em Débito
                            </div>
                            <div className="text-2xl font-semibold text-red-400">
                                {formatCurrency(
                                    getTotalsByAccountType(AccountTypes.DEBIT),
                                )}
                            </div>
                        </div>
                        <div className="p-2 bg-red-900 rounded-full">
                            <TrendingDown className="w-6 h-6 text-red-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-400">
                                Total em Crédito
                            </div>
                            <div className="text-2xl font-semibold text-green-400">
                                {formatCurrency(
                                    getTotalsByAccountType(AccountTypes.CREDIT),
                                )}
                            </div>
                        </div>
                        <div className="p-2 bg-green-900 rounded-full">
                            <TrendingUp className="w-6 h-6 text-green-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-400">
                                Total Geral
                            </div>
                            <div
                                className={`text-2xl font-semibold ${
                                    getGrandTotal() >= 0
                                        ? "text-green-400"
                                        : "text-red-400"
                                }`}
                            >
                                {formatCurrency(getGrandTotal())}
                            </div>
                        </div>
                        <div className="p-2 bg-blue-900 rounded-full">
                            <BarChart3 className="w-6 h-6 text-blue-400" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-4">
                {getFilteredAccounts().map((account) => {
                    const accountData = expensesByAccount[account.id];
                    if (!accountData) return null;

                    return (
                        <div
                            key={account.id}
                            className="bg-gray-800 border border-gray-700 rounded-lg p-4"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-200">
                                        {account.name}
                                    </h3>
                                    <p className="text-sm text-gray-400">
                                        {account.accountType ===
                                                AccountTypes.CREDIT
                                            ? "Cartão de Crédito"
                                            : "Conta Débito"}
                                    </p>
                                </div>
                                <div
                                    className={`text-xl font-semibold ${
                                        accountData.total >= 0
                                            ? "text-green-400"
                                            : "text-red-400"
                                    }`}
                                >
                                    {formatCurrency(accountData.total)}
                                </div>
                            </div>

                            <div className="space-y-3">
                                {Object.values(accountData.byCategory)
                                    .sort((a, b) =>
                                        Math.abs(b.total) - Math.abs(a.total)
                                    )
                                    .map((categoryData) => (
                                        <div
                                            key={categoryData.category.id}
                                            className="flex items-center justify-between py-2 border-t border-gray-700"
                                        >
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                                                <span className="text-gray-300">
                                                    {categoryData.category.name}
                                                </span>
                                            </div>
                                            <div
                                                className={`font-medium ${
                                                    categoryData.total >= 0
                                                        ? "text-green-400"
                                                        : "text-red-400"
                                                }`}
                                            >
                                                {formatCurrency(
                                                    categoryData.total,
                                                )}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
