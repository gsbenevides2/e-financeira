import { Edit, Filter, Link, Search, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import type {
    Account,
    MonthReference,
    Transaction,
    TransactionCategory,
} from "../types";
import {
    formatCurrency,
    formatDateTime,
    getCurrentMonth,
} from "../utils/formatters";
import { TransactionDetailsModal } from "./TransactionDetailsModal";
import { TransactionEditForm } from "./TransactionEditForm";
import { TransactionLinkForm } from "./TransactionLinkForm";
import { Button } from "./ui/button";

export const TransactionList: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [categories, setCategories] = useState<TransactionCategory[]>([]);
    const [monthReferences, setMonthReferences] = useState<MonthReference[]>(
        [],
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedAccount, setSelectedAccount] = useState<string>("");
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [selectedMonthReference, setSelectedMonthReference] = useState<
        string
    >("");
    const [editingTransaction, setEditingTransaction] = useState<
        Transaction | null
    >(null);
    const [linkingTransaction, setLinkingTransaction] = useState<
        Transaction | null
    >(null);
    const [selectedTransaction, setSelectedTransaction] = useState<
        Transaction | null
    >(null);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        const setCurrentMonthReference = async () => {
            if (monthReferences.length > 0 && !selectedMonthReference) {
                const current = getCurrentMonth();
                const currentRef = monthReferences.find(
                    (ref) =>
                        ref.month === current.month &&
                        ref.year === current.year,
                );
                if (currentRef) {
                    setSelectedMonthReference(currentRef.id);
                }
            }
        };
        setCurrentMonthReference();
    }, [monthReferences]);

    useEffect(() => {
        if (selectedMonthReference) {
            loadData();
        }
    }, [
        selectedMonthReference,
        selectedAccount,
        selectedCategory,
        searchQuery,
    ]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();

            if (searchQuery) params.append("searchText", searchQuery);
            if (selectedAccount) params.append("accountId", selectedAccount);
            if (selectedCategory) params.append("categoryId", selectedCategory);
            if (selectedMonthReference) {
                params.append("monthReferenceId", selectedMonthReference);
            }

            const [
                transactionsResponse,
                accountsResponse,
                categoriesResponse,
                monthReferencesResponse,
            ] = await Promise.all([
                fetch(`/api/transactions?${params.toString()}`),
                fetch("/api/accounts"),
                fetch("/api/categories"),
                fetch("/api/month-references"),
            ]);

            if (
                !transactionsResponse.ok ||
                !accountsResponse.ok ||
                !categoriesResponse.ok ||
                !monthReferencesResponse.ok
            ) {
                throw new Error("Erro ao carregar dados");
            }

            const [
                transactionsData,
                accountsData,
                categoriesData,
                monthReferencesData,
            ] = await Promise.all([
                transactionsResponse.json(),
                accountsResponse.json(),
                categoriesResponse.json(),
                monthReferencesResponse.json(),
            ]);

            setTransactions(transactionsData);
            setAccounts(accountsData);
            setCategories(categoriesData);
            setMonthReferences(monthReferencesData);
        } catch (err) {
            setError("Erro ao carregar dados");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta transação?")) {
            return;
        }

        try {
            const response = await fetch(`/api/transactions/${id}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                throw new Error("Erro ao excluir transação");
            }
            await loadData();
        } catch (err) {
            setError("Erro ao excluir transação");
            console.error(err);
        }
    };

    const getAccountName = (accountId: string) => {
        const account = accounts.find((a) => a.id === accountId);
        return account?.name || "Conta não encontrada";
    };

    const getCategoryName = (categoryId: string) => {
        const category = categories.find((c) => c.id === categoryId);
        return category?.name || "Categoria não encontrada";
    };

    const handleSearch = async () => {
        await loadData();
    };

    const clearFilters = async () => {
        setSearchQuery("");
        setSelectedAccount("");
        setSelectedCategory("");
        const current = getCurrentMonth();
        const currentRef = monthReferences.find(
            (ref) => ref.month === current.month && ref.year === current.year,
        );
        setSelectedMonthReference(currentRef?.id || "");
        await loadData();
    };

    const handleEditTransaction = (transaction: Transaction) => {
        setEditingTransaction(transaction);
    };

    const handleLinkTransaction = (transaction: Transaction) => {
        setLinkingTransaction(transaction);
    };

    const handleCloseEditForm = () => {
        setEditingTransaction(null);
    };

    const handleCloseLinkForm = () => {
        setLinkingTransaction(null);
    };

    const handleSaveTransaction = () => {
        loadData(); // Recarrega os dados após salvar
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

    if (loading && transactions.length === 0) {
        return (
            <div className="flex justify-center items-center py-8">
                <div className="text-gray-400">Carregando transações...</div>
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
        <div className="space-y-4">
            {/* Filtros */}
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Busca */}
                    <div>
                        <label
                            htmlFor="search"
                            className="block text-sm font-medium text-gray-300 mb-1"
                        >
                            Buscar
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                id="search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar por terceiro..."
                                className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-200 placeholder-gray-400"
                            />
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSearch}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                            >
                                <Search className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Conta */}
                    <div>
                        <label
                            htmlFor="account"
                            className="block text-sm font-medium text-gray-300 mb-1"
                        >
                            Conta
                        </label>
                        <select
                            id="account"
                            value={selectedAccount}
                            onChange={(e) => setSelectedAccount(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-200"
                        >
                            <option value="">Todas as contas</option>
                            {accounts.map((account) => (
                                <option key={account.id} value={account.id}>
                                    {account.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Categoria */}
                    <div>
                        <label
                            htmlFor="category"
                            className="block text-sm font-medium text-gray-300 mb-1"
                        >
                            Categoria
                        </label>
                        <select
                            id="category"
                            value={selectedCategory}
                            onChange={(e) =>
                                setSelectedCategory(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-200"
                        >
                            <option value="">Todas as categorias</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Mês de Referência */}
                    <div>
                        <label
                            htmlFor="monthReference"
                            className="block text-sm font-medium text-gray-300 mb-1"
                        >
                            Mês de Referência
                        </label>
                        <select
                            id="monthReference"
                            value={selectedMonthReference}
                            onChange={(e) =>
                                setSelectedMonthReference(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-200"
                        >
                            <option value="">Todos os meses</option>
                            {monthReferences.map((ref) => (
                                <option key={ref.id} value={ref.id}>
                                    {`${monthNames[ref.month - 1]}/${ref.year}`}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Botão Limpar Filtros */}
                <div className="mt-4 flex justify-end">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={clearFilters}
                        className="text-gray-300 border-gray-600 hover:bg-gray-700"
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        Limpar Filtros
                    </Button>
                </div>
            </div>

            {/* Lista de Transações */}
            <div className="bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-700">
                {error && (
                    <div className="bg-red-900 border-b border-red-800 p-4">
                        <div className="text-red-200">{error}</div>
                    </div>
                )}

                {loading
                    ? (
                        <div className="flex justify-center items-center p-8">
                            <div className="text-gray-300">
                                Carregando transações...
                            </div>
                        </div>
                    )
                    : transactions.length === 0
                    ? (
                        <div className="text-center py-8">
                            <div className="text-gray-300 mb-2">
                                Nenhuma transação encontrada
                            </div>
                            <p className="text-sm text-gray-400">
                                Tente ajustar os filtros ou adicione uma nova
                                transação.
                            </p>
                        </div>
                    )
                    : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead className="bg-gray-900">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                                        >
                                            Data/Hora
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                                        >
                                            Terceiro
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                                        >
                                            Valor
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                                        >
                                            Conta
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                                        >
                                            Categoria
                                        </th>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                                        >
                                            Descrição
                                        </th>
                                        <th
                                            scope="col"
                                            className="relative px-6 py-3"
                                        >
                                            <span className="sr-only">
                                                Ações
                                            </span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-gray-800 divide-y divide-gray-700">
                                    {transactions.map((transaction) => (
                                        <tr
                                            key={transaction.id}
                                            className="hover:bg-gray-700 transition-colors cursor-pointer"
                                            onClick={() =>
                                                setSelectedTransaction(
                                                    transaction,
                                                )}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                                                {formatDateTime(
                                                    transaction.dateTime,
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                                                {transaction.thirdParty}
                                            </td>
                                            <td
                                                className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                                                    transaction.value >= 0
                                                        ? "text-green-400"
                                                        : "text-red-400"
                                                }`}
                                            >
                                                {formatCurrency(
                                                    transaction.value,
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                                                {getAccountName(
                                                    transaction.accountId,
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                                                {getCategoryName(
                                                    transaction.categoryId,
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-200 max-w-xs">
                                                <div className="truncate">
                                                    {transaction.description ||
                                                        "-"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                                                <div
                                                    className="flex items-center space-x-2"
                                                    onClick={(e) =>
                                                        e.stopPropagation()}
                                                >
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleEditTransaction(
                                                                transaction,
                                                            )}
                                                        className="text-blue-400 hover:text-blue-300 hover:bg-gray-700"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleLinkTransaction(
                                                                transaction,
                                                            )}
                                                        className="text-purple-400 hover:text-purple-300 hover:bg-gray-700"
                                                    >
                                                        <Link className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleDelete(
                                                                transaction.id,
                                                            )}
                                                        className="text-red-400 hover:text-red-300 hover:bg-gray-700"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
            </div>

            {editingTransaction && (
                <TransactionEditForm
                    transaction={editingTransaction}
                    onClose={handleCloseEditForm}
                    onSave={handleSaveTransaction}
                />
            )}

            {linkingTransaction && (
                <TransactionLinkForm
                    transaction={linkingTransaction}
                    onClose={handleCloseLinkForm}
                    onSave={handleSaveTransaction}
                />
            )}

            {selectedTransaction && (
                <TransactionDetailsModal
                    transaction={selectedTransaction}
                    onClose={() => setSelectedTransaction(null)}
                />
            )}
        </div>
    );
};
