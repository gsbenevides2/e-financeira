import { Link, Search, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import type { Account, Transaction, TransactionCategory } from "../types";
import { formatCurrency, formatDateTime } from "../utils/formatters";
import { Button } from "./ui/button";

interface TransactionLinkFormProps {
    transaction: Transaction;
    onClose: () => void;
    onSave: () => void;
}

export const TransactionLinkForm: React.FC<TransactionLinkFormProps> = (
    { transaction, onClose, onSave },
) => {
    const [availableTransactions, setAvailableTransactions] = useState<
        Transaction[]
    >([]);
    const [linkedTransactions, setLinkedTransactions] = useState<Transaction[]>(
        [],
    );
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [categories, setCategories] = useState<TransactionCategory[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoadingData(true);
            setError(null);

            const [
                transactionsResponse,
                accountsResponse,
                categoriesResponse,
                linkedResponse,
            ] = await Promise.all([
                fetch("/api/transactions"),
                fetch("/api/accounts"),
                fetch("/api/categories"),
                fetch(`/api/transactions/${transaction.id}/related`),
            ]);

            if (
                !transactionsResponse.ok || !accountsResponse.ok ||
                !categoriesResponse.ok
            ) {
                throw new Error("Erro ao carregar dados");
            }

            const [transactionsData, accountsData, categoriesData] =
                await Promise.all([
                    transactionsResponse.json(),
                    accountsResponse.json(),
                    categoriesResponse.json(),
                ]);

            // Get linked transactions (if the endpoint exists)
            let linkedData: Transaction[] = [];
            if (linkedResponse.ok) {
                linkedData = await linkedResponse.json();
            }

            // Filter out the current transaction and already linked ones
            const linkedIds = new Set(linkedData.map((t) => t.id));
            const available = transactionsData.filter(
                (t: Transaction) =>
                    t.id !== transaction.id && !linkedIds.has(t.id),
            );

            setAvailableTransactions(available);
            setLinkedTransactions(linkedData);
            setAccounts(accountsData);
            setCategories(categoriesData);
        } catch (err) {
            setError("Erro ao carregar dados");
            console.error(err);
        } finally {
            setLoadingData(false);
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

    const handleLinkTransaction = async (relatedTransactionId: string) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(
                `/api/transactions/${transaction.id}/link`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        relatedTransactionId,
                    }),
                },
            );

            if (!response.ok) {
                throw new Error("Erro ao vincular transação");
            }

            await loadData(); // Reload to update the lists
        } catch (err) {
            setError("Erro ao vincular transação");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUnlinkTransaction = async (relatedTransactionId: string) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(
                `/api/transactions/${transaction.id}/unlink`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        relatedTransactionId,
                    }),
                },
            );

            if (!response.ok) {
                throw new Error("Erro ao desvincular transação");
            }

            await loadData(); // Reload to update the lists
        } catch (err) {
            setError("Erro ao desvincular transação");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = availableTransactions.filter((t) =>
        searchQuery === "" ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.thirdParty.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loadingData) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl mx-4 p-6 border border-gray-700">
                    <div className="flex justify-center items-center py-8">
                        <div className="text-gray-400">Carregando dados...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto border border-gray-700">
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                    <div>
                        <h2 className="text-lg font-semibold text-white">
                            Vincular Transações
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">
                            Transação: {transaction.description} -{" "}
                            {formatCurrency(transaction.value)}
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-white hover:bg-gray-700"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                <div className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-900 border border-red-800 rounded-md p-3">
                            <div className="text-red-200 text-sm">{error}</div>
                        </div>
                    )}

                    {/* Transações Vinculadas */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-200 mb-4">
                            Transações Vinculadas
                        </h3>
                        {linkedTransactions.length === 0
                            ? (
                                <div className="text-center py-8 bg-gray-800 rounded-lg border border-gray-700">
                                    <div className="text-gray-400">
                                        Nenhuma transação vinculada
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Vincule transações relacionadas usando a
                                        lista abaixo
                                    </p>
                                </div>
                            )
                            : (
                                <div className="space-y-2">
                                    {linkedTransactions.map((t) => (
                                        <div
                                            key={t.id}
                                            className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700"
                                        >
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-gray-200">
                                                        {t.description}
                                                    </span>
                                                    <span
                                                        className={`text-sm ${
                                                            t.value >= 0
                                                                ? "text-green-400"
                                                                : "text-red-400"
                                                        }`}
                                                    >
                                                        {formatCurrency(
                                                            t.value,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-400 mt-1">
                                                    {formatDateTime(t.dateTime)}
                                                    {" "}
                                                    •{" "}
                                                    {getAccountName(
                                                        t.accountId,
                                                    )} •{" "}
                                                    {getCategoryName(
                                                        t.categoryId,
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    handleUnlinkTransaction(
                                                        t.id,
                                                    )}
                                                disabled={loading}
                                                className="text-red-400 hover:text-red-300 hover:bg-red-900 border-red-600"
                                            >
                                                Desvincular
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                    </div>

                    {/* Pesquisa */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Pesquisar transações..."
                            className="w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-gray-200 placeholder-gray-400"
                        />
                    </div>

                    {/* Lista de Transações Disponíveis */}
                    <div>
                        <h3 className="text-lg font-medium text-gray-200 mb-4">
                            Transações Disponíveis
                        </h3>
                        {filteredTransactions.length === 0
                            ? (
                                <div className="text-center py-8 bg-gray-800 rounded-lg border border-gray-700">
                                    <div className="text-gray-400">
                                        Nenhuma transação encontrada
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">
                                        Tente ajustar os termos da pesquisa
                                    </p>
                                </div>
                            )
                            : (
                                <div className="space-y-2">
                                    {filteredTransactions.map((t) => (
                                        <div
                                            key={t.id}
                                            className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700"
                                        >
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-gray-200">
                                                        {t.description}
                                                    </span>
                                                    <span
                                                        className={`text-sm ${
                                                            t.value >= 0
                                                                ? "text-green-400"
                                                                : "text-red-400"
                                                        }`}
                                                    >
                                                        {formatCurrency(
                                                            t.value,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-gray-400 mt-1">
                                                    {formatDateTime(t.dateTime)}
                                                    {" "}
                                                    •{" "}
                                                    {getAccountName(
                                                        t.accountId,
                                                    )} •{" "}
                                                    {getCategoryName(
                                                        t.categoryId,
                                                    )}
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    handleLinkTransaction(t.id)}
                                                disabled={loading}
                                                className="text-blue-400 hover:text-blue-300 hover:bg-blue-900 border-blue-600"
                                            >
                                                <Link className="w-4 h-4 mr-2" />
                                                Vincular
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                    </div>
                </div>

                <div className="flex justify-end p-6 border-t border-gray-700">
                    <Button
                        onClick={onClose}
                        className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                    >
                        Concluído
                    </Button>
                </div>
            </div>
        </div>
    );
};
