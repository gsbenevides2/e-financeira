import { BarChart3, TrendingDown, TrendingUp } from "lucide-react";
import React, { useEffect, useState } from "react";
import type { Account, MonthlySummary as MonthlySummaryType } from "../types";
import { AccountTypes } from "../types";
import { formatCurrency, getCurrentMonth } from "../utils/formatters";
import { Button } from "./ui/button";

export const MonthlySummary: React.FC = () => {
    const [summary, setSummary] = useState<MonthlySummaryType>({});
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const current = getCurrentMonth();
        return current.month;
    });
    const [selectedYear, setSelectedYear] = useState(() => {
        const current = getCurrentMonth();
        return current.year;
    });
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
                month: selectedMonth.toString(),
                year: selectedYear.toString(),
            });

            const [summaryResponse, accountsResponse] = await Promise.all([
                fetch(`/api/transactions/monthly-report?${params.toString()}`),
                fetch("/api/accounts"),
            ]);

            if (!summaryResponse.ok || !accountsResponse.ok) {
                throw new Error("Erro ao carregar relatório mensal");
            }

            const [summaryData, accountsData] = await Promise.all([
                summaryResponse.json(),
                accountsResponse.json(),
            ]);

            setSummary(summaryData);
            setAccounts(accountsData);
        } catch (err) {
            setError("Erro ao carregar relatório mensal");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getAccountName = (accountId: string) => {
        const account = accounts.find((a) => a.id === accountId);
        return account?.name || "Conta não encontrada";
    };

    const getAccountType = (accountId: string) => {
        const account = accounts.find((a) => a.id === accountId);
        return account?.accountType || "Desconhecido";
    };

    const getTotalByType = (type: AccountTypes) => {
        return Object.entries(summary).reduce((total, [accountId, value]) => {
            const account = accounts.find((a) => a.id === accountId);
            if (account?.accountType === type) {
                return total + value;
            }
            return total;
        }, 0);
    };

    const getGrandTotal = () => {
        return Object.values(summary).reduce(
            (total, value) => total + value,
            0,
        );
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
            {/* Filtros de Data */}
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
                            className="cursor-pointer w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-200"
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
                            className="cursor-pointer w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-200"
                        >
                            {generateYearOptions().map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Button
                        onClick={loadData}
                        disabled={loading}
                        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Atualizar
                    </Button>
                </div>
            </div>

            {/* Resumo Geral */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-gray-400">
                                Total em Débito
                            </div>
                            <div className="text-2xl font-semibold text-red-400">
                                {formatCurrency(
                                    getTotalByType(AccountTypes.DEBIT),
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
                                    getTotalByType(AccountTypes.CREDIT),
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

            {/* Detalhes por Conta */}
            <div className="grid gap-4">
                {accounts.map((account) => {
                    const balance = summary[account.id] || 0;
                    return (
                        <div
                            key={account.id}
                            className="bg-gray-800 border border-gray-700 rounded-lg p-4"
                        >
                            <div className="flex items-center justify-between">
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
                                        balance >= 0
                                            ? "text-green-400"
                                            : "text-red-400"
                                    }`}
                                >
                                    {formatCurrency(balance)}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
